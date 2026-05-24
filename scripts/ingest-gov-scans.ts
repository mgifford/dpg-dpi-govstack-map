/**
 * Ingest government website technology scan feeds.
 *
 * Reads the list of scan sources from data/manual/gov-scan-sources.yml,
 * fetches each enabled endpoint, filters for OSI-approved tools, and
 * normalises the results to the Atlas Project / Organization schema.
 *
 * New sources can be added by editing the YAML file without touching this
 * script.
 *
 * Expected JSON envelope from each endpoint:
 *
 *   {
 *     "records": [
 *       {
 *         "technology":   string,          // required – display name
 *         "osi_approved": "yes" | "no",    // required – OSI licence flag
 *         "license":      string?,         // SPDX identifier or plain name
 *         "website":      string?,         // project homepage
 *         "repo_url":     string?,         // source repository
 *         "category":     string?,         // e.g. "CMS", "Analytics"
 *         "description":  string?,
 *         "domain_count": number?,         // # government domains using it
 *         "first_seen":   string?,         // ISO-8601 date
 *         "last_seen":    string?          // ISO-8601 date
 *       }
 *     ],
 *     "generated_at": string?              // ISO-8601 timestamp
 *   }
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import { projectSchema, organizationSchema, type Project, type Organization } from "../src/lib/schema.js";
import { fetchJsonWithCache } from "./lib/fetch.js";
import { normalizeLicense, slugify } from "./lib/normalize.js";

// ── Config types ──────────────────────────────────────────────────────────────

export interface GovScanSource {
  name: string;
  url: string;
  label: string;
  description?: string;
  enabled?: boolean;
}

interface GovScanConfig {
  sources: GovScanSource[];
}

// ── API record shape ──────────────────────────────────────────────────────────

export interface GovScanRecord {
  technology: string;
  osi_approved?: string;
  license?: string;
  website?: string;
  repo_url?: string;
  category?: string;
  description?: string;
  domain_count?: number;
  first_seen?: string;
  last_seen?: string;
  domains?: string[];
}

export interface GovScanData {
  records: GovScanRecord[];
  generated_at?: string;
}

// ── Config loading ────────────────────────────────────────────────────────────

const CONFIG_PATH = path.resolve("data/manual/gov-scan-sources.yml");

export async function loadGovScanSources(): Promise<GovScanSource[]> {
  const raw = await readFile(CONFIG_PATH, "utf8");
  const config = YAML.parse(raw) as GovScanConfig;
  return (config.sources ?? []).filter((s) => s.enabled !== false);
}

// ── Ingest ────────────────────────────────────────────────────────────────────

export async function fetchGovScanDataset(): Promise<{
  projects: Project[];
  organizations: Organization[];
}> {
  const sources = await loadGovScanSources();
  if (sources.length === 0) {
    console.warn("[ingest-gov-scans] No enabled sources found in gov-scan-sources.yml");
    return { projects: [], organizations: [] };
  }

  const allProjects: Project[] = [];
  const allOrgs: Organization[] = [];

  for (const source of sources) {
    console.log(`      → fetching ${source.name} (${source.label})`);
    const data = await fetchJsonWithCache<GovScanData>(source.url, {
      cacheKey: `gov-scans/${source.label}`,
      timeoutMs: 30_000
    });

    if (!data) {
      console.warn(`[ingest-gov-scans] Could not fetch ${source.label}; skipping.`);
      continue;
    }

    const records = (data.records ?? []).filter(isOsiApproved);
    console.log(`         ${records.length} OSI-approved tools from ${source.label}`);

    for (const record of records) {
      const project = mapScanRecord(record, source, data.generated_at);
      if (project) allProjects.push(project);
    }

    const orgs = buildOrganizations(records, allProjects, source);
    allOrgs.push(...orgs);
  }

  return { projects: allProjects, organizations: allOrgs };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isOsiApproved(record: GovScanRecord): boolean {
  return (record.osi_approved ?? "").toLowerCase() === "yes";
}

export function mapScanRecord(
  record: GovScanRecord,
  source: GovScanSource,
  feedGeneratedAt?: string
): Project | null {
  if (!record.technology?.trim()) return null;

  const id = `gov-scan-${slugify(record.technology)}`;
  const retrievedAt = new Date().toISOString();
  const licenses = record.license ? [normalizeLicense(record.license)] : [];
  const repoUrls = record.repo_url ? [record.repo_url].filter(isValidUrl) : [];
  const website = record.website && isValidUrl(record.website) ? record.website : "";
  const category = record.category?.trim() || "Government OSS";
  const domainCount = record.domain_count ?? 0;

  const tags = buildTags(record, source);
  const ecosystemScore = calculateEcosystemScore(domainCount);
  const sustainabilityScore = calculateSustainabilityScore(domainCount, licenses);

  return projectSchema.parse({
    id,
    name: record.technology.trim(),
    description: record.description?.trim() ?? "",
    category,
    subcategory: "",
    project_type: "Government OSS",
    categories: [category],
    subcategories: [],
    project_types: ["Government OSS"],
    tags,
    website,
    project_page: website,
    repository_urls: repoUrls,
    documentation_urls: [],
    licenses,
    governance_model: "unknown",
    funding_model: "unknown",
    standards_alignment: [],
    interoperability_frameworks: [],
    deployment_countries: [],
    steward_organizations: [],
    maintainers: [],
    related_projects: [],
    sdgs: [],
    dpi_domains: [],
    maturity_level: "emerging",
    sustainability_score: sustainabilityScore,
    activity_score: 0,
    ecosystem_score: ecosystemScore,
    accessibility_score: 0,
    community_health: {
      commits_last_12_months: 0,
      contributors_last_12_months: 0,
      issue_closure_rate: 0,
      median_issue_response_hours: 0,
      releases_last_12_months: 0,
      contributor_diversity_index: 0.2,
      governance_maturity: 30,
      documentation_quality: 30,
      onboarding_quality: 30,
      dependency_freshness: 30,
      security_advisories_open: 0,
      openssf_scorecard: null
    },
    provenance: buildProvenance(source, retrievedAt, feedGeneratedAt, record),
    last_updated: retrievedAt
  });
}

function buildTags(record: GovScanRecord, source: GovScanSource): string[] {
  const tags: string[] = ["government", "detected-in-production"];
  if (source.label) tags.push(source.label);
  if (record.category) tags.push(record.category.toLowerCase().replace(/\s+/g, "-"));
  return [...new Set(tags)];
}

function buildProvenance(
  source: GovScanSource,
  retrievedAt: string,
  feedGeneratedAt: string | undefined,
  record: GovScanRecord
): Record<string, Array<{ source: string; retrieved_at: string; confidence: number; kind: "scraped"; note: string }>> {
  const note = [
    `Detected on government websites via ${source.name}.`,
    record.domain_count != null ? `Seen on ${record.domain_count} domain(s).` : "",
    record.first_seen ? `First seen: ${record.first_seen}.` : "",
    record.last_seen ? `Last seen: ${record.last_seen}.` : "",
    feedGeneratedAt ? `Feed generated at: ${feedGeneratedAt}.` : ""
  ]
    .filter(Boolean)
    .join(" ");

  const entry = {
    source: source.name,
    retrieved_at: retrievedAt,
    confidence: 0.7,
    kind: "scraped" as const,
    note
  };

  return {
    description: [entry],
    ...(record.license ? { licenses: [{ ...entry, confidence: 0.75 }] } : {}),
    ...(record.repo_url ? { repository_urls: [{ ...entry, confidence: 0.8 }] } : {})
  };
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function calculateEcosystemScore(domainCount: number): number {
  // Scale: 1 domain → ~10 pts, 10 domains → ~40 pts, 50+ → ~80 pts
  return Math.min(100, Math.round(10 + domainCount * 1.4));
}

function calculateSustainabilityScore(domainCount: number, licenses: string[]): number {
  return Math.min(
    100,
    20 + (licenses.length > 0 ? 15 : 0) + Math.min(domainCount * 2, 30)
  );
}

function buildOrganizations(
  records: GovScanRecord[],
  projects: Project[],
  source: GovScanSource
): Organization[] {
  // Gov scan data doesn't carry organisation information; we synthesise a
  // single placeholder org representing the scan source itself so the
  // provenance chain is traceable in the dataset.
  const id = `gov-scan-source-${slugify(source.label)}`;
  const associatedProjects = projects
    .filter((p) => p.tags.includes(source.label))
    .map((p) => p.id);

  if (associatedProjects.length === 0) return [];

  return [
    organizationSchema.parse({
      id,
      name: source.name,
      type: "scan-source",
      website: source.url,
      country: "Unknown",
      city: "",
      coordinates: null,
      associated_projects: associatedProjects,
      partnerships: [],
      funders: [],
      staff: [],
      github_org: "",
      linkedin: "",
      governance_role: "data-provider",
      provenance: {
        associated_projects: [
          {
            source: source.name,
            retrieved_at: new Date().toISOString(),
            confidence: 0.7,
            kind: "scraped",
            note: `Organisation generated from gov-scan source "${source.label}".`
          }
        ]
      }
    })
  ];
}
