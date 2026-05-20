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

  for (const rel of dataset.relationships) {
    const sourceInProjects = projectIds.has(rel.source);
    const sourceInOrgs = orgIds.has(rel.source);
    const targetInProjects = projectIds.has(rel.target);
    const targetInOrgs = orgIds.has(rel.target);

    if (!sourceInProjects && !sourceInOrgs) {
      errors.push(`Relationship source "${rel.source}" not found in projects or organizations`);
    }
    if (!targetInProjects && !targetInOrgs) {
      errors.push(`Relationship target "${rel.target}" not found in projects or organizations`);
    }
  }

  for (const dep of dataset.deployments) {
    if (!projectIds.has(dep.project)) {
      errors.push(`Deployment references unknown project "${dep.project}"`);
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
