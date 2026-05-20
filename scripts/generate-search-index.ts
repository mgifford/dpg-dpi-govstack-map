/**
 * Generate Lunr.js search index from the Atlas dataset.
 * Outputs: public/api/search-index.json
 */

import path from "node:path";
import { writeFile, mkdir } from "node:fs/promises";
import lunr from "lunr";
import type { AtlasDataset } from "../src/lib/schema.js";

const OUT_PATH = path.resolve("public/api/search-index.json");

export async function generateSearchIndex(dataset: AtlasDataset): Promise<void> {
  await mkdir(path.dirname(OUT_PATH), { recursive: true });

  // Build a flat document list for Lunr
  const documents = dataset.projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    tags: p.tags.join(" "),
    category: p.category,
    project_type: p.project_type,
    countries: p.deployment_countries.join(" "),
    licenses: p.licenses.join(" "),
    sdgs: p.sdgs.join(" "),
    dpi_domains: p.dpi_domains.join(" "),
    standards: p.standards_alignment.join(" "),
    governance: p.governance_model,
    orgs: p.steward_organizations.join(" ")
  }));

  const index = lunr(function () {
    this.ref("id");
    this.field("name", { boost: 10 });
    this.field("description", { boost: 5 });
    this.field("tags", { boost: 4 });
    this.field("category", { boost: 3 });
    this.field("project_type", { boost: 3 });
    this.field("countries", { boost: 2 });
    this.field("sdgs", { boost: 2 });
    this.field("dpi_domains", { boost: 2 });
    this.field("standards");
    this.field("governance");
    this.field("orgs");
    this.field("licenses");

    documents.forEach((doc) => this.add(doc));
  });

  // Also store a metadata map for display after search
  const meta: Record<
    string,
    { name: string; category: string; project_type: string; maturity_level: string }
  > = {};
  for (const p of dataset.projects) {
    meta[p.id] = {
      name: p.name,
      category: p.category,
      project_type: p.project_type,
      maturity_level: p.maturity_level
    };
  }

  await writeFile(OUT_PATH, `${JSON.stringify({ index: index.toJSON(), meta }, null, 2)}\n`);

  console.log(`[generate-search-index] Wrote search index for ${documents.length} projects`);
}
