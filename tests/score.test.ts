import { describe, it, expect } from "vitest";
import {
  calculateActivityScore,
  calculateSustainabilityScore,
  classifyMaturity
} from "../scripts/lib/score";
import type { Repository } from "../src/lib/schema";

const baseRepo: Repository = {
  platform: "github",
  url: "https://github.com/test/repo",
  stars: 500,
  forks: 80,
  watchers: 30,
  contributors: 25,
  open_issues: 15,
  closed_issues: 85,
  releases: 4,
  latest_release: "v1.0.0",
  latest_commit: "2026-04-01T00:00:00Z",
  commit_frequency: 10, // per week
  bus_factor: 3,
  governance_files: [],
  code_of_conduct: true,
  contributing_guidelines: true,
  security_policy: false
};

describe("calculateActivityScore", () => {
  it("returns a number between 0 and 100", () => {
    const score = calculateActivityScore(baseRepo);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("increases with higher commit frequency", () => {
    const low = calculateActivityScore({ ...baseRepo, commit_frequency: 1 });
    const high = calculateActivityScore({ ...baseRepo, commit_frequency: 20 });
    expect(high).toBeGreaterThan(low);
  });

  it("returns 0 for completely inactive repo", () => {
    const score = calculateActivityScore({
      ...baseRepo,
      commit_frequency: 0,
      releases: 0,
      open_issues: 0,
      closed_issues: 0
    });
    expect(score).toBe(0);
  });

  it("caps at 100 for very active repo", () => {
    const score = calculateActivityScore({
      ...baseRepo,
      commit_frequency: 1000,
      releases: 100,
      closed_issues: 10000,
      open_issues: 10
    });
    expect(score).toBeLessThanOrEqual(100);
  });

  it("accounts for issue closure rate", () => {
    const allClosed = calculateActivityScore({ ...baseRepo, closed_issues: 100, open_issues: 0 });
    const allOpen = calculateActivityScore({ ...baseRepo, closed_issues: 0, open_issues: 100 });
    expect(allClosed).toBeGreaterThan(allOpen);
  });
});

describe("calculateSustainabilityScore", () => {
  const baseProject = {
    id: "test",
    name: "Test",
    description: "Test",
    category: "DPG",
    subcategory: "",
    project_type: "DPG" as const,
    tags: [],
    website: "",
    project_page: "",
    repository_urls: [],
    documentation_urls: [],
    licenses: [],
    governance_model: "foundation",
    funding_model: "grant",
    standards_alignment: [],
    interoperability_frameworks: [],
    deployment_countries: [],
    steward_organizations: [],
    maintainers: [],
    related_projects: [],
    sdgs: [],
    dpi_domains: [],
    maturity_level: "mature" as const,
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
      governance_maturity: 80,
      documentation_quality: 75,
      onboarding_quality: 70,
      dependency_freshness: 80,
      security_advisories_open: 0,
      openssf_scorecard: null
    },
    last_updated: new Date().toISOString()
  };

  it("returns a number between 0 and 100", () => {
    const score = calculateSustainabilityScore(baseProject);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("penalises open security advisories", () => {
    const noAdvisories = calculateSustainabilityScore(baseProject);
    const withAdvisories = calculateSustainabilityScore({
      ...baseProject,
      community_health: { ...baseProject.community_health, security_advisories_open: 5 }
    });
    expect(noAdvisories).toBeGreaterThan(withAdvisories);
  });

  it("rewards better governance", () => {
    const low = calculateSustainabilityScore({
      ...baseProject,
      community_health: { ...baseProject.community_health, governance_maturity: 20 }
    });
    const high = calculateSustainabilityScore({
      ...baseProject,
      community_health: { ...baseProject.community_health, governance_maturity: 95 }
    });
    expect(high).toBeGreaterThan(low);
  });
});

describe("classifyMaturity", () => {
  it("returns 'mature' for high composite scores", () => {
    expect(classifyMaturity(85, 90)).toBe("mature");
  });

  it("returns 'growing' for medium-high composite", () => {
    expect(classifyMaturity(60, 60)).toBe("growing");
  });

  it("returns 'emerging' for medium composite", () => {
    expect(classifyMaturity(40, 40)).toBe("emerging");
  });

  it("returns 'stagnant' for low composite", () => {
    expect(classifyMaturity(25, 25)).toBe("stagnant");
  });

  it("returns 'abandoned' for very low composite", () => {
    expect(classifyMaturity(10, 10)).toBe("abandoned");
  });

  it("returns consistent results across symmetrical inputs", () => {
    expect(classifyMaturity(80, 80)).toBe(classifyMaturity(80, 80));
  });
});
