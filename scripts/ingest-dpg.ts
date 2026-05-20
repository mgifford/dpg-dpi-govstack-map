/**
 * Ingest Digital Public Goods Registry
 * Fetches from https://api.digitalpublicgoods.net/dpgs and normalises to Atlas schema.
 */

import type { Project } from "../src/lib/schema.js";
import { normalizeCountry, normalizeLicense, slugify } from "./lib/normalize.js";

const DPG_API = "https://api.digitalpublicgoods.net/dpgs";
const TIMEOUT_MS = 30_000;

interface DpgApiItem {
  id?: string;
  name: string;
  description?: string;
  type?: string[];
  repositoryURL?: string;
  organizations?: Array<{ name: string; org_type?: string }>;
  sdgs?: Array<{ SDGNumber?: string | number }>;
  deploymentCountries?: string[];
  license?: Array<{ spdxIdentifier?: string; licenseURL?: string }>;
  stage?: string;
  website?: string;
}

export async function fetchDpgProjects(): Promise<Project[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let raw: DpgApiItem[] = [];

  try {
    const res = await fetch(DPG_API, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`DPG API returned ${res.status}`);
    }
    raw = (await res.json()) as DpgApiItem[];
  } catch (err) {
    console.warn(`[ingest-dpg] Fetch failed: ${(err as Error).message}. Using empty list.`);
    return [];
  } finally {
    clearTimeout(timer);
  }

  return raw.map((item) => mapDpgItem(item));
}

function mapDpgItem(item: DpgApiItem): Project {
  const id = item.id ?? slugify(item.name);
  const licenses = (item.license ?? [])
    .map((l) => l.spdxIdentifier ?? "")
    .filter(Boolean)
    .map(normalizeLicense);
  const countries = (item.deploymentCountries ?? []).map(normalizeCountry);
  const sdgs = (item.sdgs ?? [])
    .map((s) => `SDG-${s.SDGNumber}`)
    .filter((s) => s !== "SDG-undefined");
  const orgs = (item.organizations ?? []).map((o) => o.name);
  const repoUrls = item.repositoryURL
    ? [item.repositoryURL].filter((u) => u.startsWith("http"))
    : [];

  return {
    id,
    name: item.name,
    description: item.description ?? "",
    category: "DPG",
    subcategory: (item.type ?? []).join(", "),
    project_type: "DPG",
    tags: (item.type ?? []).map((t) => t.toLowerCase().replace(/\s+/g, "-")),
    website: item.website ?? "",
    project_page: `https://digitalpublicgoods.net/r/${id}`,
    repository_urls: repoUrls,
    documentation_urls: [],
    licenses,
    governance_model: "unknown",
    funding_model: "unknown",
    standards_alignment: [],
    interoperability_frameworks: [],
    deployment_countries: countries,
    steward_organizations: orgs,
    maintainers: [],
    related_projects: [],
    sdgs,
    dpi_domains: [],
    maturity_level: mapStage(item.stage),
    sustainability_score: 0,
    activity_score: 0,
    ecosystem_score: 0,
    accessibility_score: 0,
    community_health: {
      commits_last_12_months: 0,
      contributors_last_12_months: 0,
      issue_closure_rate: 0,
      median_issue_response_hours: 0,
      releases_last_12_months: 0,
      contributor_diversity_index: 0,
      governance_maturity: 0,
      documentation_quality: 0,
      onboarding_quality: 0,
      dependency_freshness: 0,
      security_advisories_open: 0,
      openssf_scorecard: null
    },
    last_updated: new Date().toISOString()
  };
}

function mapStage(stage?: string): Project["maturity_level"] {
  const s = (stage ?? "").toLowerCase();
  if (s === "dpg") return "mature";
  if (s === "nominee") return "emerging";
  return "emerging";
}
