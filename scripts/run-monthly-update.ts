/**
 * Monthly update orchestrator.
 * Runs: fetch DPG → enrich GitHub → merge seed → generate datasets → search index
 *
 * Usage:
 *   npm run ingest
 *   GITHUB_TOKEN=xxx npm run ingest
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import type { AtlasDataset } from "../src/lib/schema.js";
import { atlasDatasetSchema } from "../src/lib/schema.js";
import { fetchDpgDataset } from "./ingest-dpg.js";
import { enrichProjectsBatch } from "./enrich-github.js";
import { generateDatasets } from "./generate-datasets.js";
import { generateSearchIndex } from "./generate-search-index.js";
import { writeJsonFile } from "./lib/io.js";
import { loadManualDataset } from "./lib/manual.js";

const SEED_PATH = path.resolve("data/processed/atlas.json");
const OUT_PATH = path.resolve("data/processed/atlas.json");

async function loadSeed(): Promise<AtlasDataset> {
  try {
    const raw = await readFile(SEED_PATH, "utf8");
    return atlasDatasetSchema.parse(JSON.parse(raw));
  } catch {
    console.warn("[run-monthly-update] Could not load seed; starting fresh.");
    return {
      generated_at: new Date().toISOString(),
      version: "0.1.0",
      sources: [],
      projects: [],
      organizations: [],
      people: [],
      deployments: [],
      repositories: [],
      relationships: [],
      standards: []
    };
  }
}

function mergeProjects(
  seed: AtlasDataset["projects"],
  incoming: AtlasDataset["projects"]
): AtlasDataset["projects"] {
  const map = new Map(seed.map((p) => [p.id, p]));
  for (const p of incoming) {
    if (!map.has(p.id)) {
      // Only add truly new projects; don't overwrite curated seed data
      map.set(p.id, p);
    }
  }
  return Array.from(map.values());
}

function mergeOrganizations(
  seed: AtlasDataset["organizations"],
  incoming: AtlasDataset["organizations"]
): AtlasDataset["organizations"] {
  const map = new Map(seed.map((organization) => [organization.id, organization]));

  for (const organization of incoming) {
    const existing = map.get(organization.id);
    if (!existing) {
      map.set(organization.id, organization);
      continue;
    }

    map.set(organization.id, {
      ...existing,
      associated_projects: Array.from(
        new Set([...existing.associated_projects, ...organization.associated_projects])
      )
    });
  }

  return Array.from(map.values());
}

async function main(): Promise<void> {
  console.log("=== Digital Public Infrastructure Ecosystem Atlas — Monthly Update ===");
  const startTime = Date.now();

  // 1. Load curated manual dataset, with processed data as a fallback
  console.log("[1/6] Loading manual phase-one dataset…");
  let seed: AtlasDataset;
  try {
    seed = await loadManualDataset();
  } catch (error) {
    console.warn(`[run-monthly-update] Could not load manual dataset: ${(error as Error).message}`);
    seed = await loadSeed();
  }

  // 2. Fetch DPG Registry
  console.log("[2/6] Fetching DPG Registry…");
  const dpgDataset = await fetchDpgDataset();
  console.log(`      → ${dpgDataset.projects.length} DPG projects fetched`);

  // 3. Merge new with seed (seed wins to preserve curated data)
  console.log("[3/6] Merging datasets…");
  const mergedProjects = mergeProjects(seed.projects, dpgDataset.projects);
  const mergedOrganizations = mergeOrganizations(seed.organizations, dpgDataset.organizations);
  console.log(`      → ${mergedProjects.length} projects total`);

  // 4. Enrich with GitHub metadata
  console.log("[4/6] Enriching with GitHub metadata…");
  const githubEnrichment =
    process.env.SKIP_GITHUB_ENRICHMENT === "true"
      ? { projects: mergedProjects, repositories: seed.repositories }
      : await enrichProjectsBatch(mergedProjects);

  // 5. Build final dataset
  const activeSources = ["manual-seed", "dpg-registry"];
  if (process.env.SKIP_GITHUB_ENRICHMENT !== "true") {
    activeSources.push("github-api");
  }

  const dataset: AtlasDataset = {
    generated_at: new Date().toISOString(),
    version: seed.version,
    sources: activeSources,
    projects: githubEnrichment.projects,
    organizations: mergedOrganizations,
    people: seed.people,
    deployments: seed.deployments,
    repositories: githubEnrichment.repositories,
    relationships: seed.relationships,
    standards: seed.standards
  };

  // 6. Persist updated dataset
  console.log("[5/6] Persisting dataset…");
  await writeJsonFile(OUT_PATH, dataset);

  // 7. Generate static API outputs
  console.log("[6/6] Generating static API outputs and search index…");
  await generateDatasets(dataset);
  await generateSearchIndex(dataset);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✓ Monthly update complete in ${elapsed}s`);
  console.log(`  Projects: ${dataset.projects.length}`);
  console.log(`  Organizations: ${dataset.organizations.length}`);
  console.log(`  Relationships: ${dataset.relationships.length}`);
}

main().catch((err) => {
  console.error("[run-monthly-update] Fatal error:", err);
  process.exit(1);
});
