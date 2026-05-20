/**
 * Monthly update orchestrator.
 * Runs: fetch DPG → enrich GitHub → merge seed → generate datasets → search index
 *
 * Usage:
 *   npm run ingest
 *   GITHUB_TOKEN=xxx npm run ingest
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AtlasDataset } from "../src/lib/schema.js";
import { atlasDatasetSchema } from "../src/lib/schema.js";
import { fetchDpgProjects } from "./ingest-dpg.js";
import { enrichProjectsBatch } from "./enrich-github.js";
import { generateDatasets } from "./generate-datasets.js";
import { generateSearchIndex } from "./generate-search-index.js";

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
      relationships: []
    };
  }
}

function mergeProjects(seed: AtlasDataset["projects"], incoming: AtlasDataset["projects"]): AtlasDataset["projects"] {
  const map = new Map(seed.map((p) => [p.id, p]));
  for (const p of incoming) {
    if (!map.has(p.id)) {
      // Only add truly new projects; don't overwrite curated seed data
      map.set(p.id, p);
    }
  }
  return Array.from(map.values());
}

async function main(): Promise<void> {
  console.log("=== Digital Public Infrastructure Ecosystem Atlas — Monthly Update ===");
  const startTime = Date.now();

  // 1. Load existing seed data
  console.log("[1/6] Loading seed dataset…");
  const seed = await loadSeed();

  // 2. Fetch DPG Registry
  console.log("[2/6] Fetching DPG Registry…");
  const dpgProjects = await fetchDpgProjects();
  console.log(`      → ${dpgProjects.length} DPG projects fetched`);

  // 3. Merge new with seed (seed wins to preserve curated data)
  console.log("[3/6] Merging datasets…");
  const mergedProjects = mergeProjects(seed.projects, dpgProjects);
  console.log(`      → ${mergedProjects.length} projects total`);

  // 4. Enrich with GitHub metadata
  console.log("[4/6] Enriching with GitHub metadata…");
  const enrichedProjects = process.env.SKIP_GITHUB_ENRICHMENT === "true"
    ? mergedProjects
    : await enrichProjectsBatch(mergedProjects);

  // 5. Build final dataset
  const dataset: AtlasDataset = {
    generated_at: new Date().toISOString(),
    version: seed.version,
    sources: ["dpg-registry", "github-api", "manual-seed"],
    projects: enrichedProjects,
    organizations: seed.organizations,
    people: seed.people,
    deployments: seed.deployments,
    repositories: seed.repositories,
    relationships: seed.relationships
  };

  // 6. Persist updated dataset
  console.log("[5/6] Persisting dataset…");
  await writeFile(OUT_PATH, `${JSON.stringify(dataset, null, 2)}\n`);

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
