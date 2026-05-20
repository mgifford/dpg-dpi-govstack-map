/**
 * Validate processed Atlas dataset against Zod schemas.
 * Exits with code 1 if validation fails (used in CI and pre-build).
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { atlasDatasetSchema } from "../src/lib/schema.js";

const DATASET_PATH = path.resolve("data/processed/atlas.json");

async function main(): Promise<void> {
  let raw: string;
  try {
    raw = await readFile(DATASET_PATH, "utf8");
  } catch {
    console.error(`[validate-data] Cannot read ${DATASET_PATH}`);
    process.exit(1);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error("[validate-data] Invalid JSON:", (err as Error).message);
    process.exit(1);
  }

  const result = atlasDatasetSchema.safeParse(parsed);

  if (!result.success) {
    console.error("[validate-data] Schema validation failed:");
    for (const issue of result.error.issues) {
      console.error(`  ${issue.path.join(".")} — ${issue.message}`);
    }
    process.exit(1);
  }

  const dataset = result.data;
  console.log(`[validate-data] ✓ Atlas dataset valid`);
  console.log(`  Projects:      ${dataset.projects.length}`);
  console.log(`  Organizations: ${dataset.organizations.length}`);
  console.log(`  Deployments:   ${dataset.deployments.length}`);
  console.log(`  Relationships: ${dataset.relationships.length}`);
  console.log(`  Generated at:  ${dataset.generated_at}`);

  // Additional semantic checks
  const errors: string[] = [];
  const projectIds = new Set(dataset.projects.map((p) => p.id));
  const orgIds = new Set(dataset.organizations.map((o) => o.id));
  const personIds = new Set(dataset.people.map((p) => p.id));
  const standardIds = new Set(dataset.standards.map((s) => s.id));

  for (const rel of dataset.relationships) {
    const sourceInProjects = projectIds.has(rel.source);
    const sourceInOrgs = orgIds.has(rel.source);
    const sourceInPeople = personIds.has(rel.source);
    const sourceInStandards = standardIds.has(rel.source);
    const targetInProjects = projectIds.has(rel.target);
    const targetInOrgs = orgIds.has(rel.target);
    const targetInPeople = personIds.has(rel.target);
    const targetInStandards = standardIds.has(rel.target);

    if (!sourceInProjects && !sourceInOrgs && !sourceInPeople && !sourceInStandards) {
      errors.push(
        `Relationship source "${rel.source}" not found in projects, organizations, people, or standards`
      );
    }
    if (!targetInProjects && !targetInOrgs && !targetInPeople && !targetInStandards) {
      errors.push(
        `Relationship target "${rel.target}" not found in projects, organizations, people, or standards`
      );
    }
  }

  for (const dep of dataset.deployments) {
    if (!projectIds.has(dep.project)) {
      errors.push(`Deployment references unknown project "${dep.project}"`);
    }
  }

  for (const project of dataset.projects) {
    for (const relatedProjectId of project.related_projects) {
      if (!projectIds.has(relatedProjectId)) {
        errors.push(
          `Project "${project.id}" references unknown related project "${relatedProjectId}"`
        );
      }
    }

    for (const stewardOrgId of project.steward_organizations) {
      if (!orgIds.has(stewardOrgId)) {
        errors.push(
          `Project "${project.id}" references unknown steward organization "${stewardOrgId}"`
        );
      }
    }
  }

  for (const organization of dataset.organizations) {
    for (const associatedProjectId of organization.associated_projects) {
      if (!projectIds.has(associatedProjectId)) {
        errors.push(
          `Organization "${organization.id}" references unknown associated project "${associatedProjectId}"`
        );
      }
    }

    for (const partnerOrgId of organization.partnerships) {
      if (!orgIds.has(partnerOrgId)) {
        errors.push(
          `Organization "${organization.id}" references unknown partner organization "${partnerOrgId}"`
        );
      }
    }
  }

  for (const standard of dataset.standards) {
    for (const relatedProjectId of standard.related_projects) {
      if (!projectIds.has(relatedProjectId)) {
        errors.push(
          `Standard "${standard.id}" references unknown related project "${relatedProjectId}"`
        );
      }
    }

    for (const stewardOrgId of standard.steward_organizations) {
      if (!orgIds.has(stewardOrgId)) {
        errors.push(
          `Standard "${standard.id}" references unknown steward organization "${stewardOrgId}"`
        );
      }
    }
  }

  if (errors.length > 0) {
    console.error("\n[validate-data] Semantic errors:");
    for (const e of errors) {
      console.error(`  ✗ ${e}`);
    }
    process.exit(1);
  }

  console.log("[validate-data] ✓ Semantic validation passed");
}

main().catch((err) => {
  console.error("[validate-data] Unexpected error:", err);
  process.exit(1);
});
