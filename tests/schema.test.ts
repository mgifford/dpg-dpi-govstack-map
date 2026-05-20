import { describe, it, expect } from "vitest";
import {
  projectSchema,
  organizationSchema,
  deploymentSchema,
  repositorySchema,
  relationshipSchema,
  atlasDatasetSchema
} from "../src/lib/schema";

// ── Project schema ─────────────────────────────────────────────────────────

describe("projectSchema", () => {
  const validProject = {
    id: "test-project",
    name: "Test Project",
    description: "A test project description.",
    category: "DPG",
    subcategory: "",
    project_type: "DPG",
    tags: ["test"],
    website: "https://example.com",
    project_page: "",
    repository_urls: ["https://github.com/example/test"],
    documentation_urls: [],
    licenses: ["MIT"],
    governance_model: "foundation",
    funding_model: "grant",
    standards_alignment: [],
    interoperability_frameworks: [],
    deployment_countries: ["Kenya"],
    steward_organizations: ["Test Org"],
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
      openssf_scorecard: 7.0
    },
    last_updated: new Date().toISOString()
  };

  it("accepts a valid project", () => {
    expect(() => projectSchema.parse(validProject)).not.toThrow();
  });

  it("requires id", () => {
    const rest = { ...validProject };
    delete (rest as { id?: string }).id;
    expect(() => projectSchema.parse(rest)).toThrow();
  });

  it("requires name", () => {
    const rest = { ...validProject };
    delete (rest as { name?: string }).name;
    expect(() => projectSchema.parse(rest)).toThrow();
  });

  it("rejects invalid maturity_level", () => {
    expect(() => projectSchema.parse({ ...validProject, maturity_level: "excellent" })).toThrow();
  });

  it("rejects scores outside 0-100", () => {
    expect(() => projectSchema.parse({ ...validProject, activity_score: 150 })).toThrow();
    expect(() => projectSchema.parse({ ...validProject, sustainability_score: -1 })).toThrow();
  });

  it("accepts missing optional fields with defaults", () => {
    const minimal = { ...validProject, subcategory: undefined, tags: undefined };
    const result = projectSchema.parse(minimal);
    expect(result.subcategory).toBe("");
    expect(result.tags).toEqual([]);
  });

  it("accepts null openssf_scorecard", () => {
    const result = projectSchema.parse({
      ...validProject,
      community_health: { ...validProject.community_health, openssf_scorecard: null }
    });
    expect(result.community_health.openssf_scorecard).toBeNull();
  });

  it("validates all valid maturity levels", () => {
    for (const level of ["emerging", "growing", "mature", "stagnant", "abandoned"] as const) {
      expect(() => projectSchema.parse({ ...validProject, maturity_level: level })).not.toThrow();
    }
  });
});

// ── Organization schema ────────────────────────────────────────────────────

describe("organizationSchema", () => {
  const validOrg = {
    id: "test-org",
    name: "Test Organization",
    type: "ngo",
    website: "https://example.org",
    country: "Kenya",
    city: "Nairobi",
    coordinates: { lat: -1.286, lon: 36.817 },
    associated_projects: ["test-project"],
    partnerships: [],
    funders: [],
    staff: [],
    github_org: "test-org",
    linkedin: "",
    governance_role: "steward"
  };

  it("accepts a valid organization", () => {
    expect(() => organizationSchema.parse(validOrg)).not.toThrow();
  });

  it("accepts null coordinates", () => {
    const result = organizationSchema.parse({ ...validOrg, coordinates: null });
    expect(result.coordinates).toBeNull();
  });

  it("rejects missing required fields", () => {
    const rest = { ...validOrg };
    delete (rest as { name?: string }).name;
    expect(() => organizationSchema.parse(rest)).toThrow();
  });
});

// ── Deployment schema ──────────────────────────────────────────────────────

describe("deploymentSchema", () => {
  const validDeployment = {
    country: "Kenya",
    government: "Government of Kenya",
    ministry: "Ministry of Health",
    project: "dhis2",
    deployment_type: "national",
    implementation_partner: "University of Oslo",
    deployment_status: "active"
  };

  it("accepts valid deployment", () => {
    expect(() => deploymentSchema.parse(validDeployment)).not.toThrow();
  });

  it("rejects invalid deployment_status", () => {
    expect(() => deploymentSchema.parse({ ...validDeployment, deployment_status: "unknown" })).toThrow();
  });
});

// ── Repository schema ──────────────────────────────────────────────────────

describe("repositorySchema", () => {
  const validRepo = {
    platform: "github",
    url: "https://github.com/test/repo",
    stars: 1200,
    forks: 300,
    watchers: 80,
    contributors: 45,
    open_issues: 22,
    closed_issues: 180,
    releases: 5,
    latest_release: "v2.1.0",
    latest_commit: "2026-04-01T10:00:00Z",
    commit_frequency: 12.5,
    bus_factor: 3,
    governance_files: ["GOVERNANCE.md"],
    code_of_conduct: true,
    contributing_guidelines: true,
    security_policy: false
  };

  it("accepts valid repository", () => {
    expect(() => repositorySchema.parse(validRepo)).not.toThrow();
  });

  it("rejects negative star count", () => {
    expect(() => repositorySchema.parse({ ...validRepo, stars: -1 })).toThrow();
  });
});

// ── Relationship schema ────────────────────────────────────────────────────

describe("relationshipSchema", () => {
  it("accepts all valid relationship types", () => {
    const types = [
      "funded_by", "integrates_with", "implements",
      "aligned_with", "governed_by", "maintained_by",
      "deployed_in", "used_by", "sponsored_by", "participates_in"
    ] as const;
    for (const type of types) {
      expect(() =>
        relationshipSchema.parse({ source: "a", target: "b", type, strength: 0.8 })
      ).not.toThrow();
    }
  });

  it("rejects unknown relationship type", () => {
    expect(() =>
      relationshipSchema.parse({ source: "a", target: "b", type: "hates", strength: 0.5 })
    ).toThrow();
  });
});

// ── AtlasDataset schema ────────────────────────────────────────────────────

describe("atlasDatasetSchema", () => {
  it("accepts a valid empty dataset", () => {
    const dataset = {
      generated_at: new Date().toISOString(),
      version: "0.1.0",
      sources: ["dpg-registry"],
      projects: [],
      organizations: [],
      people: [],
      deployments: [],
      repositories: [],
      relationships: []
    };
    expect(() => atlasDatasetSchema.parse(dataset)).not.toThrow();
  });
});
