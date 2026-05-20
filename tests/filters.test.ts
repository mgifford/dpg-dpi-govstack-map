import { describe, it, expect } from "vitest";
import {
  applyProjectFilters,
  deriveFilterOptions,
  defaultFilterState,
  type ProjectFilterState
} from "../src/lib/filters";
import type { AtlasDataset, Project } from "../src/lib/schema";

const makeProject = (overrides: Partial<Project>): Project => ({
  id: "test",
  name: "Test Project",
  description: "A description",
  category: "DPG",
  subcategory: "",
  project_type: "DPG",
  tags: ["health", "open-source"],
  website: "",
  project_page: "",
  repository_urls: [],
  documentation_urls: [],
  licenses: ["MIT"],
  governance_model: "foundation",
  funding_model: "grant",
  standards_alignment: [],
  interoperability_frameworks: [],
  deployment_countries: ["Kenya", "Uganda"],
  steward_organizations: [],
  maintainers: [],
  related_projects: [],
  sdgs: ["SDG-3"],
  dpi_domains: ["health"],
  maturity_level: "mature",
  sustainability_score: 75,
  activity_score: 80,
  ecosystem_score: 70,
  accessibility_score: 60,
  community_health: {
    commits_last_12_months: 500,
    contributors_last_12_months: 20,
    issue_closure_rate: 0.7,
    median_issue_response_hours: 24,
    releases_last_12_months: 4,
    contributor_diversity_index: 0.6,
    governance_maturity: 75,
    documentation_quality: 80,
    onboarding_quality: 70,
    dependency_freshness: 72,
    security_advisories_open: 0,
    openssf_scorecard: null
  },
  last_updated: new Date().toISOString(),
  ...overrides
});

const projects: Project[] = [
  makeProject({ id: "dhis2", name: "DHIS2", project_type: "DPG", licenses: ["BSD-3-Clause"], deployment_countries: ["Kenya", "Tanzania"], maturity_level: "mature" }),
  makeProject({ id: "decidim", name: "Decidim", project_type: "GovTech", licenses: ["AGPL-3.0"], deployment_countries: ["Spain", "France"], maturity_level: "mature" }),
  makeProject({ id: "opencrvs", name: "OpenCRVS", project_type: "DPG", licenses: ["MPL-2.0"], deployment_countries: ["Bangladesh"], maturity_level: "growing" }),
];

const state: ProjectFilterState = { ...defaultFilterState };

describe("applyProjectFilters", () => {
  it("returns all projects with default state", () => {
    expect(applyProjectFilters(projects, state)).toHaveLength(3);
  });

  it("filters by text query (name match)", () => {
    const result = applyProjectFilters(projects, { ...state, query: "dhis" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("dhis2");
  });

  it("filters by country", () => {
    const result = applyProjectFilters(projects, { ...state, country: "Spain" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("decidim");
  });

  it("filters by project type", () => {
    const dpg = applyProjectFilters(projects, { ...state, projectType: "DPG" });
    expect(dpg).toHaveLength(2);
    const govtech = applyProjectFilters(projects, { ...state, projectType: "GovTech" });
    expect(govtech).toHaveLength(1);
  });

  it("filters by maturity level", () => {
    const result = applyProjectFilters(projects, { ...state, maturity: "growing" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("opencrvs");
  });

  it("filters by license", () => {
    const result = applyProjectFilters(projects, { ...state, license: "AGPL-3.0" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("decidim");
  });

  it("returns empty array when no projects match", () => {
    const result = applyProjectFilters(projects, { ...state, country: "Antarctica" });
    expect(result).toHaveLength(0);
  });

  it("combines multiple filters (AND logic)", () => {
    const result = applyProjectFilters(projects, {
      ...state,
      projectType: "DPG",
      country: "Kenya"
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("dhis2");
  });

  it("is case-insensitive for text query", () => {
    const result = applyProjectFilters(projects, { ...state, query: "OPENCRVS" });
    expect(result).toHaveLength(1);
  });
});

describe("deriveFilterOptions", () => {
  const dataset: AtlasDataset = {
    generated_at: new Date().toISOString(),
    version: "0.1.0",
    sources: [],
    projects,
    organizations: [],
    people: [],
    deployments: [],
    repositories: [],
    relationships: []
  };

  it("includes 'all' as first option for each filter", () => {
    const opts = deriveFilterOptions(dataset);
    expect(opts.countries[0]).toBe("all");
    expect(opts.projectTypes[0]).toBe("all");
    expect(opts.maturities[0]).toBe("all");
    expect(opts.licenses[0]).toBe("all");
    expect(opts.governanceModels[0]).toBe("all");
  });

  it("deduplicates values", () => {
    const opts = deriveFilterOptions(dataset);
    // Both DHIS2 and OpenCRVS have 'DPG' — should appear only once
    const typeCount = opts.projectTypes.filter((t) => t === "DPG").length;
    expect(typeCount).toBe(1);
  });

  it("includes all unique countries", () => {
    const opts = deriveFilterOptions(dataset);
    expect(opts.countries).toContain("Kenya");
    expect(opts.countries).toContain("Spain");
    expect(opts.countries).toContain("Bangladesh");
  });
});
