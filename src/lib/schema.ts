import { z } from "zod";

export const linkSchema = z.string().url();

export const provenanceEntrySchema = z.object({
  source: z.string(),
  retrieved_at: z.string(),
  confidence: z.number().min(0).max(1).default(1),
  kind: z.enum(["declared", "inferred", "manual", "scraped"]).default("manual"),
  note: z.string().default("")
});

export const provenanceMapSchema = z.record(z.array(provenanceEntrySchema)).default({});

export const maturityDimensionSchema = z.object({
  score: z.number().min(0).max(100),
  rationale: z.string().default("")
});

export const maturityScoresSchema = z.object({
  code: maturityDimensionSchema,
  governance: maturityDimensionSchema,
  stewardship: maturityDimensionSchema,
  public_sector: maturityDimensionSchema,
  accessibility: maturityDimensionSchema,
  sustainability: maturityDimensionSchema,
  security: maturityDimensionSchema,
  interoperability: maturityDimensionSchema,
  procurement: maturityDimensionSchema,
  community: maturityDimensionSchema,
  documentation: maturityDimensionSchema
});

export const maturityBandSchema = z.enum(["nascent", "emerging", "growing", "mature", "leading"]);

export const govstackBuildingBlockSchema = z.enum([
  "Cloud Infrastructure",
  "Consent",
  "Digital Registries",
  "Digital Registries APIs",
  "E-Marketplace",
  "GIS",
  "Identity",
  "Information Mediator",
  "Messaging",
  "Payment",
  "Registration",
  "Workflow"
]);

export const licenseModelSchema = z.enum([
  "open-source",
  "source-available",
  "mixed",
  "proprietary",
  "unknown"
]);

export const projectSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    category: z.string(),
    subcategory: z.string().optional().default(""),
    project_type: z.string(),
    categories: z.array(z.string()).default([]),
    subcategories: z.array(z.string()).default([]),
    project_types: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    website: z.string().url().optional().or(z.literal("")),
    project_page: z.string().url().optional().or(z.literal("")),
    repository_urls: z.array(linkSchema).default([]),
    documentation_urls: z.array(linkSchema).default([]),
    licenses: z.array(z.string()).default([]),
    license_model: licenseModelSchema.optional(),
    licensing_concerns: z.string().default(""),
    governance_model: z.string().default("unknown"),
    funding_model: z.string().default("unknown"),
    standards_alignment: z.array(z.string()).default([]),
    interoperability_frameworks: z.array(z.string()).default([]),
    govstack_building_blocks: z.array(govstackBuildingBlockSchema).default([]),
    govstack_listed: z.boolean().default(false),
    govstack_compliance_level: z.number().min(1).max(2).optional().nullable(),
    govstack_notes: z.string().default(""),
    deployment_countries: z.array(z.string()).default([]),
    steward_organizations: z.array(z.string()).default([]),
    maintainers: z.array(z.string()).default([]),
    related_projects: z.array(z.string()).default([]),
    sdgs: z.array(z.string()).default([]),
    dpi_domains: z.array(z.string()).default([]),
    maturity_level: z.enum(["emerging", "growing", "mature", "stagnant", "abandoned"]),
    sustainability_score: z.number().min(0).max(100),
    activity_score: z.number().min(0).max(100),
    ecosystem_score: z.number().min(0).max(100),
    accessibility_score: z.number().min(0).max(100),
    community_health: z.object({
      commits_last_12_months: z.number().min(0),
      contributors_last_12_months: z.number().min(0),
      issue_closure_rate: z.number().min(0).max(1),
      median_issue_response_hours: z.number().min(0),
      releases_last_12_months: z.number().min(0),
      contributor_diversity_index: z.number().min(0).max(1),
      governance_maturity: z.number().min(0).max(100),
      documentation_quality: z.number().min(0).max(100),
      onboarding_quality: z.number().min(0).max(100),
      dependency_freshness: z.number().min(0).max(100),
      security_advisories_open: z.number().min(0),
      openssf_scorecard: z.number().min(0).max(10).optional().nullable()
    }),
    maturity_scores: maturityScoresSchema.optional(),
    accessibility_maturity: maturityBandSchema.optional(),
    sustainability_maturity: maturityBandSchema.optional(),
    procurement_readiness: maturityBandSchema.optional(),
    provenance: provenanceMapSchema,
    last_updated: z.string()
  })
  .transform((project) => ({
    ...project,
    categories: project.categories.length > 0 ? project.categories : [project.category],
    subcategories:
      project.subcategories.length > 0
        ? project.subcategories
        : project.subcategory
          ? [project.subcategory]
          : [],
    project_types:
      project.project_types.length > 0 ? project.project_types : [project.project_type],
    license_model:
      project.license_model ?? (project.licenses.length > 0 ? "open-source" : "unknown"),
    maturity_scores: project.maturity_scores ?? {
      code: { score: project.activity_score, rationale: "Derived from activity metrics." },
      governance: {
        score: project.community_health.governance_maturity,
        rationale: "Derived from governance transparency indicators."
      },
      stewardship: {
        score: project.sustainability_score,
        rationale: "Derived from sustainability inputs until manual stewardship data is added."
      },
      public_sector: {
        score: Math.min(100, project.deployment_countries.length * 12),
        rationale: "Estimated from known deployments."
      },
      accessibility: {
        score: project.accessibility_score,
        rationale: "Derived from current accessibility score."
      },
      sustainability: {
        score: project.sustainability_score,
        rationale: "Derived from sustainability score."
      },
      security: {
        score: Math.max(0, 100 - project.community_health.security_advisories_open * 15),
        rationale: "Derived from open security advisories."
      },
      interoperability: {
        score: Math.min(
          100,
          project.standards_alignment.length * 20 + project.interoperability_frameworks.length * 20
        ),
        rationale: "Estimated from standards and interoperability frameworks."
      },
      procurement: {
        score: Math.min(
          100,
          project.deployment_countries.length * 10 + (project.licenses.length > 0 ? 20 : 0)
        ),
        rationale: "Estimated from deployments and licensing clarity."
      },
      community: {
        score: Math.round(project.community_health.issue_closure_rate * 100),
        rationale: "Derived from closure rate and contributor health."
      },
      documentation: {
        score: project.community_health.documentation_quality,
        rationale: "Derived from documentation quality."
      }
    },
    accessibility_maturity:
      project.accessibility_maturity ??
      (project.accessibility_score >= 80
        ? "leading"
        : project.accessibility_score >= 65
          ? "mature"
          : project.accessibility_score >= 45
            ? "growing"
            : project.accessibility_score >= 25
              ? "emerging"
              : "nascent"),
    sustainability_maturity:
      project.sustainability_maturity ??
      (project.sustainability_score >= 80
        ? "leading"
        : project.sustainability_score >= 65
          ? "mature"
          : project.sustainability_score >= 45
            ? "growing"
            : project.sustainability_score >= 25
              ? "emerging"
              : "nascent"),
    procurement_readiness:
      project.procurement_readiness ??
      (project.deployment_countries.length >= 8
        ? "leading"
        : project.deployment_countries.length >= 4
          ? "mature"
          : project.deployment_countries.length >= 2
            ? "growing"
            : project.deployment_countries.length >= 1
              ? "emerging"
              : "nascent")
  }));

export const organizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  website: z.string().url().optional().or(z.literal("")),
  country: z.string(),
  city: z.string().optional().default(""),
  coordinates: z
    .object({
      lat: z.number(),
      lon: z.number()
    })
    .nullable(),
  associated_projects: z.array(z.string()).default([]),
  partnerships: z.array(z.string()).default([]),
  funders: z.array(z.string()).default([]),
  staff: z.array(z.string()).default([]),
  github_org: z.string().optional().default(""),
  linkedin: z.string().optional().default(""),
  governance_role: z.string().optional().default(""),
  provenance: provenanceMapSchema
});

export const personSchema = z.object({
  id: z.string(),
  name: z.string(),
  organization: z.string(),
  role: z.string(),
  public_profiles: z.array(z.string()).default([]),
  project_affiliations: z.array(z.string()).default([]),
  location: z.string().default(""),
  conference_connections: z.array(z.string()).default([]),
  standards_groups: z.array(z.string()).default([]),
  notes: z.string().default(""),
  relationship_strength: z.number().min(0).max(1),
  provenance: provenanceMapSchema
});

export const deploymentSchema = z.object({
  country: z.string(),
  government: z.string(),
  ministry: z.string(),
  project: z.string(),
  deployment_type: z.string(),
  implementation_partner: z.string(),
  deployment_status: z.enum(["planned", "pilot", "active", "retired"]),
  confidence: z.number().min(0).max(1).default(1),
  source: z.string().default("manual"),
  provenance: provenanceMapSchema
});

export const repositorySchema = z.object({
  platform: z.enum(["github", "gitlab"]),
  url: z.string().url(),
  license: z.string().default(""),
  stars: z.number().min(0),
  forks: z.number().min(0),
  watchers: z.number().min(0),
  contributors: z.number().min(0),
  open_issues: z.number().min(0),
  closed_issues: z.number().min(0),
  releases: z.number().min(0),
  latest_release: z.string().nullable(),
  latest_commit: z.string().nullable(),
  commit_frequency: z.number().min(0),
  release_frequency: z.number().min(0).default(0),
  bus_factor: z.number().min(0),
  governance_files: z.array(z.string()).default([]),
  code_of_conduct: z.boolean(),
  contributing_guidelines: z.boolean(),
  security_policy: z.boolean(),
  dependency_health: z.number().min(0).max(100).default(0),
  openssf_score: z.number().min(0).max(10).nullable().default(null),
  provenance: provenanceMapSchema
});

export const standardSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  website: z.string().url().optional().or(z.literal("")),
  steward_organizations: z.array(z.string()).default([]),
  related_projects: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  provenance: provenanceMapSchema
});

export const relationshipSchema = z.object({
  source: z.string(),
  target: z.string(),
  type: z.enum([
    "funded_by",
    "integrates_with",
    "implements",
    "aligned_with",
    "governed_by",
    "maintained_by",
    "deployed_in",
    "used_by",
    "sponsored_by",
    "participates_in"
  ]),
  strength: z.number().min(0).max(1).default(0.5),
  evidence: z.string().optional().default(""),
  confidence: z.number().min(0).max(1).default(0.8),
  provenance: provenanceMapSchema
});

export const atlasDatasetSchema = z.object({
  generated_at: z.string(),
  version: z.string(),
  sources: z.array(z.string()),
  projects: z.array(projectSchema),
  organizations: z.array(organizationSchema),
  people: z.array(personSchema),
  deployments: z.array(deploymentSchema),
  repositories: z.array(repositorySchema),
  relationships: z.array(relationshipSchema),
  standards: z.array(standardSchema).default([])
});

export const emptyAtlasDataset: AtlasDataset = {
  generated_at: "",
  version: "0.2.0",
  sources: [],
  projects: [],
  organizations: [],
  people: [],
  deployments: [],
  repositories: [],
  relationships: [],
  standards: []
};

export type Project = z.infer<typeof projectSchema>;
export type Organization = z.infer<typeof organizationSchema>;
export type Person = z.infer<typeof personSchema>;
export type Deployment = z.infer<typeof deploymentSchema>;
export type Repository = z.infer<typeof repositorySchema>;
export type Standard = z.infer<typeof standardSchema>;
export type Relationship = z.infer<typeof relationshipSchema>;
export type AtlasDataset = z.infer<typeof atlasDatasetSchema>;
