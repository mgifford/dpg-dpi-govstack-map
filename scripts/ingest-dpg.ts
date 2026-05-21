/**
 * Ingest Digital Public Goods Registry
 * Fetches from the live app API and normalizes registry entries to the Atlas schema.
 */

import {
  organizationSchema,
  projectSchema,
  type Organization,
  type Project
} from "../src/lib/schema.js";
import { fetchJsonWithCache } from "./lib/fetch.js";
import { normalizeCountry, normalizeLicense, slugify } from "./lib/normalize.js";

const DPG_API = "https://app.digitalpublicgoods.net/api/v1/dpgs";

interface DpgApiItem {
  dpgId?: string;
  name: string;
  slug?: string;
  description?: string;
  category?: string;
  solutionType?: string[];
  features?: string[];
  websiteURL?: string;
  sourceURL?: string;
  otherSources?: Record<string, string[] | string | null> | null;
  publicURL?: string;
  solutionDocs?: Record<string, string[] | string | null> | null;
  ownerName?: string;
  ownerType?: string[];
  originCountry?: string;
  sdgs?: Array<{ number?: string | number }>;
  deploymentCountries?: string[];
  openLicense?: string[];
  openStandards?: string[];
  githubMetrics?: Record<
    string,
    {
      issueCount?: number;
      contributorCount?: number;
      commitActivityData?: number[];
    }
  > | null;
  status?: string;
}

export async function fetchDpgProjects(): Promise<Project[]> {
  const dataset = await fetchDpgDataset();
  return dataset.projects;
}

export async function fetchDpgDataset(): Promise<{
  projects: Project[];
  organizations: Organization[];
}> {
  const raw = await fetchJsonWithCache<DpgApiItem[]>(DPG_API, {
    cacheKey: "dpg/registry",
    timeoutMs: 30_000
  });

  if (!raw) {
    console.warn("[ingest-dpg] Fetch failed and no cache was available. Using empty list.");
    return { projects: [], organizations: [] };
  }

  const projects = raw.map((item) => mapDpgItem(item));
  const organizations = buildDpgOrganizations(raw, projects);

  return { projects, organizations };
}

function mapDpgItem(item: DpgApiItem): Project {
  const id = item.slug ?? item.dpgId?.toLowerCase() ?? slugify(item.name);
  const licenses = (item.openLicense ?? []).filter(Boolean).map(normalizeLicense);
  const countries = (item.deploymentCountries ?? []).map(normalizeCountry);
  const sdgs = (item.sdgs ?? [])
    .map((s) => `SDG-${String(s.number ?? "").padStart(2, "0")}`)
    .filter((s) => s !== "SDG-undefined");
  const orgs = item.ownerName ? [slugify(item.ownerName)] : [];
  const sourceUrls = collectSourceUrls(item);
  const repoUrls = sourceUrls.filter(isRepositoryUrl);
  const documentationUrls = [
    ...collectDocumentationUrls(item),
    ...sourceUrls.filter((url) => !isRepositoryUrl(url))
  ];
  const metrics = summarizeGithubMetrics(item.githubMetrics);
  const retrievedAt = new Date().toISOString();
  const category = item.category?.trim() || "DPG";
  const subcategory = (item.solutionType ?? []).join(", ");
  const governanceModel = slugify((item.ownerType ?? ["unknown"])[0] ?? "unknown").replace(
    /-/g,
    " "
  );
  const tags = [...(item.solutionType ?? []), ...(item.features ?? [])]
    .map((t) => t.toLowerCase().replace(/\s+/g, "-"))
    .filter(Boolean);
  const standardsAlignment = (item.openStandards ?? []).filter(Boolean);

  return projectSchema.parse({
    id,
    name: item.name,
    description: item.description ?? "",
    category,
    subcategory,
    project_type: "DPG",
    categories: [category],
    subcategories: subcategory ? [subcategory] : [],
    project_types: ["DPG"],
    tags,
    website: cleanUrl(item.websiteURL),
    project_page: cleanUrl(item.publicURL) || `https://app.digitalpublicgoods.net/r/${id}`,
    repository_urls: repoUrls,
    documentation_urls: documentationUrls,
    licenses,
    governance_model: governanceModel,
    funding_model: "unknown",
    standards_alignment: standardsAlignment,
    interoperability_frameworks: [],
    deployment_countries: countries,
    steward_organizations: orgs,
    maintainers: [],
    related_projects: [],
    sdgs,
    dpi_domains: [],
    maturity_level: mapStage(item.status),
    sustainability_score: calculateSustainabilityScore(item, orgs, countries),
    activity_score: calculateActivityScore(metrics),
    ecosystem_score: calculateEcosystemScore(item, countries, standardsAlignment),
    accessibility_score: 0,
    community_health: {
      commits_last_12_months: metrics.commitsLast12Months,
      contributors_last_12_months: metrics.contributorCount,
      issue_closure_rate: metrics.issueCount > 0 ? 0.65 : 0,
      median_issue_response_hours: 0,
      releases_last_12_months: 0,
      contributor_diversity_index:
        metrics.contributorCount > 20 ? 0.55 : metrics.contributorCount > 5 ? 0.4 : 0.2,
      governance_maturity: item.ownerType?.length ? 70 : 50,
      documentation_quality: documentationUrls.length > 0 ? 72 : 45,
      onboarding_quality: documentationUrls.length > 0 ? 68 : 40,
      dependency_freshness: metrics.commitsLast12Months > 0 ? 65 : 35,
      security_advisories_open: metrics.issueCount,
      openssf_scorecard: null
    },
    provenance: {
      description: [
        {
          source: "DPG API",
          retrieved_at: retrievedAt,
          confidence: 0.95,
          kind: "scraped",
          note: "Imported from the Digital Public Goods Registry API."
        }
      ],
      licenses:
        licenses.length > 0
          ? [
              {
                source: "DPG API",
                retrieved_at: retrievedAt,
                confidence: 0.92,
                kind: "declared",
                note: "License values normalized from registry metadata."
              }
            ]
          : [],
      deployment_countries:
        countries.length > 0
          ? [
              {
                source: "DPG API",
                retrieved_at: retrievedAt,
                confidence: 0.75,
                kind: "declared",
                note: "Deployment countries may be incomplete relative to actual public deployments."
              }
            ]
          : [],
      repository_urls:
        repoUrls.length > 0
          ? [
              {
                source: "DPG API",
                retrieved_at: retrievedAt,
                confidence: 0.9,
                kind: "declared",
                note: "Repository URL supplied by the DPG record."
              }
            ]
          : [],
      steward_organizations:
        orgs.length > 0
          ? [
              {
                source: "DPG API",
                retrieved_at: retrievedAt,
                confidence: 0.8,
                kind: "declared",
                note: "Organizations copied from the registry record without local normalization."
              }
            ]
          : []
    },
    last_updated: retrievedAt
  });
}

function buildDpgOrganizations(items: DpgApiItem[], projects: Project[]): Organization[] {
  const byId = new Map<string, Organization>();

  items.forEach((item, index) => {
    if (!item.ownerName) return;

    const id = slugify(item.ownerName);
    const existing = byId.get(id);
    const associatedProject = projects[index]?.id;
    const nextAssociatedProjects = Array.from(
      new Set([
        ...(existing?.associated_projects ?? []),
        ...(associatedProject ? [associatedProject] : [])
      ])
    );

    byId.set(
      id,
      organizationSchema.parse({
        id,
        name: item.ownerName,
        type: slugify((item.ownerType ?? ["unknown"])[0] ?? "unknown").replace(/-/g, " "),
        website: "",
        country: normalizeCountry(item.originCountry ?? "Unknown"),
        city: "",
        coordinates: null,
        associated_projects: nextAssociatedProjects,
        partnerships: existing?.partnerships ?? [],
        funders: existing?.funders ?? [],
        staff: existing?.staff ?? [],
        github_org: extractGithubOrg(item.sourceURL),
        linkedin: "",
        governance_role: "steward",
        provenance: {
          associated_projects: [
            {
              source: "DPG API",
              retrieved_at: new Date().toISOString(),
              confidence: 0.8,
              kind: "declared",
              note: "Organization generated from DPG owner metadata."
            }
          ]
        }
      })
    );
  });

  return Array.from(byId.values());
}

function mapStage(stage?: string): Project["maturity_level"] {
  const s = (stage ?? "").toLowerCase();
  if (s === "dpg") return "mature";
  if (s === "nominee") return "emerging";
  return "emerging";
}

function collectSourceUrls(item: DpgApiItem): string[] {
  const otherSourceValues = Object.values(item.otherSources ?? {}).flatMap((value) => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  });

  return Array.from(new Set([item.sourceURL, ...otherSourceValues].filter(isHttpUrl)));
}

function collectDocumentationUrls(item: DpgApiItem): string[] {
  return Array.from(
    new Set(
      Object.values(item.solutionDocs ?? {})
        .flatMap((value) => {
          if (!value) return [];
          return Array.isArray(value) ? value : [value];
        })
        .filter(isHttpUrl)
    )
  );
}

function isHttpUrl(value: string | undefined | null): value is string {
  return Boolean(cleanUrl(value));
}

function cleanUrl(value: string | undefined | null): string {
  if (!value) return "";

  try {
    return new URL(value).toString();
  } catch {
    return "";
  }
}

function isRepositoryUrl(url: string): boolean {
  return /(github|gitlab|bitbucket|codeberg|sourcehut|git\.)/i.test(url);
}

function extractGithubOrg(url?: string): string {
  if (!url) return "";

  try {
    const parsed = new URL(url);
    if (!/github\.com$/i.test(parsed.hostname)) return "";
    return parsed.pathname.split("/").filter(Boolean)[0] ?? "";
  } catch {
    return "";
  }
}

function summarizeGithubMetrics(metrics: DpgApiItem["githubMetrics"]) {
  const repos = Object.values(metrics ?? {});
  return repos.reduce<{
    commitsLast12Months: number;
    contributorCount: number;
    issueCount: number;
  }>(
    (summary, repo) => ({
      commitsLast12Months:
        summary.commitsLast12Months +
        (repo.commitActivityData ?? []).reduce((sum, week) => sum + week, 0),
      contributorCount: summary.contributorCount + (repo.contributorCount ?? 0),
      issueCount: summary.issueCount + (repo.issueCount ?? 0)
    }),
    { commitsLast12Months: 0, contributorCount: 0, issueCount: 0 }
  );
}

function calculateActivityScore(metrics: {
  commitsLast12Months: number;
  contributorCount: number;
}): number {
  return Math.min(
    100,
    Math.round(metrics.commitsLast12Months / 40 + metrics.contributorCount * 1.5)
  );
}

function calculateSustainabilityScore(
  item: DpgApiItem,
  orgs: string[],
  countries: string[]
): number {
  return Math.min(
    100,
    35 + orgs.length * 10 + countries.length * 2 + (item.ownerType?.length ?? 0) * 5
  );
}

function calculateEcosystemScore(
  item: DpgApiItem,
  countries: string[],
  standardsAlignment: string[]
): number {
  return Math.min(
    100,
    25 + countries.length * 2 + standardsAlignment.length * 4 + (item.features?.length ?? 0) * 2
  );
}
