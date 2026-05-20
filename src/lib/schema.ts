import { z } from "zod";

export const linkSchema = z.string().url();

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  subcategory: z.string().optional().default(""),
  project_type: z.string(),
  tags: z.array(z.string()).default([]),
  website: z.string().url().optional().or(z.literal("")),
  project_page: z.string().url().optional().or(z.literal("")),
  repository_urls: z.array(linkSchema).default([]),
  documentation_urls: z.array(linkSchema).default([]),
  licenses: z.array(z.string()).default([]),
  governance_model: z.string().default("unknown"),
  funding_model: z.string().default("unknown"),
  standards_alignment: z.array(z.string()).default([]),
  interoperability_frameworks: z.array(z.string()).default([]),
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
  last_updated: z.string()
});

export const organizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  website: z.string().url().optional().or(z.literal("")),
  country: z.string(),
  city: z.string().optional().default(""),
  coordinates: z.object({
    lat: z.number(),
    lon: z.number()
  }).nullable(),
  associated_projects: z.array(z.string()).default([]),
  partnerships: z.array(z.string()).default([]),
  funders: z.array(z.string()).default([]),
  staff: z.array(z.string()).default([]),
  github_org: z.string().optional().default(""),
  linkedin: z.string().optional().default(""),
  governance_role: z.string().optional().default("")
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
  relationship_strength: z.number().min(0).max(1)
});

export const deploymentSchema = z.object({
  country: z.string(),
  government: z.string(),
  ministry: z.string(),
  project: z.string(),
  deployment_type: z.string(),
  implementation_partner: z.string(),
  deployment_status: z.enum(["planned", "pilot", "active", "retired"])
});

export const repositorySchema = z.object({
  platform: z.literal("github"),
  url: z.string().url(),
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
  bus_factor: z.number().min(0),
  governance_files: z.array(z.string()).default([]),
  code_of_conduct: z.boolean(),
  contributing_guidelines: z.boolean(),
  security_policy: z.boolean()
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
  evidence: z.string().optional().default("")
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
  relationships: z.array(relationshipSchema)
});

export type Project = z.infer<typeof projectSchema>;
export type Organization = z.infer<typeof organizationSchema>;
export type Person = z.infer<typeof personSchema>;
export type Deployment = z.infer<typeof deploymentSchema>;
export type Repository = z.infer<typeof repositorySchema>;
export type Relationship = z.infer<typeof relationshipSchema>;
export type AtlasDataset = z.infer<typeof atlasDatasetSchema>;
