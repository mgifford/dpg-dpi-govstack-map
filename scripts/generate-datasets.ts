/**
 * Generate static output artifacts from the merged Atlas dataset:
 *   - public/api/projects.json
 *   - public/api/atlas.json
 *   - public/api/organizations.json
 *   - public/api/relationships.json
 *   - public/api/map.geojson
 *   - public/api/projects.csv
 */

import path from "node:path";
import { writeFile, mkdir } from "node:fs/promises";
import type { AtlasDataset, Project, Organization } from "../src/lib/schema.js";

const OUT_DIR = path.resolve("public/api");

async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

function toJson(data: unknown): string {
  return `${JSON.stringify(data, null, 2)}\n`;
}

// ── GeoJSON ────────────────────────────────────────────────────────────────

function buildGeoJson(projects: Project[], orgs: Organization[]): object {
  const features: object[] = [];

  for (const org of orgs) {
    if (!org.coordinates) continue;
    const projectNames = org.associated_projects
      .map((id) => projects.find((p) => p.id === id)?.name ?? id)
      .join(", ");
    features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [org.coordinates.lon, org.coordinates.lat]
      },
      properties: {
        id: org.id,
        name: org.name,
        entity_type: "organization",
        org_type: org.type,
        country: org.country,
        city: org.city,
        associated_projects: org.associated_projects,
        popup_label: `${org.name} — ${org.city}, ${org.country}`,
        popup_detail: `Projects: ${projectNames}`
      }
    });
  }

  return {
    type: "FeatureCollection",
    features
  };
}

// ── CSV ───────────────────────────────────────────────────────────────────

function escape(v: unknown): string {
  const s = String(v ?? "").replace(/"/g, '""');
  return `"${s}"`;
}

function buildCsv(projects: Project[]): string {
  const headers = [
    "id", "name", "category", "project_type", "maturity_level",
    "activity_score", "sustainability_score", "ecosystem_score", "accessibility_score",
    "deployment_countries", "licenses", "sdgs", "dpi_domains",
    "governance_model", "website", "last_updated"
  ];

  const rows = projects.map((p) =>
    [
      p.id, p.name, p.category, p.project_type, p.maturity_level,
      p.activity_score, p.sustainability_score, p.ecosystem_score, p.accessibility_score,
      p.deployment_countries.join("; "), p.licenses.join("; "),
      p.sdgs.join("; "), p.dpi_domains.join("; "),
      p.governance_model, p.website, p.last_updated
    ].map(escape).join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

// ── Graph data ─────────────────────────────────────────────────────────────

function buildGraphData(dataset: AtlasDataset): object {
  const nodes = [
    ...dataset.projects.map((p) => ({
      id: p.id,
      label: p.name,
      type: "project",
      category: p.category,
      maturity: p.maturity_level,
      activity: p.activity_score
    })),
    ...dataset.organizations.map((o) => ({
      id: o.id,
      label: o.name,
      type: "organization",
      org_type: o.type,
      country: o.country
    }))
  ];

  const edges = dataset.relationships.map((r) => ({
    source: r.source,
    target: r.target,
    type: r.type,
    strength: r.strength
  }));

  return { nodes, edges };
}

// ── Main ───────────────────────────────────────────────────────────────────

export async function generateDatasets(dataset: AtlasDataset): Promise<void> {
  await ensureDir(OUT_DIR);

  const writes: Promise<void>[] = [
    // Full atlas
    writeFile(path.join(OUT_DIR, "atlas.json"), toJson(dataset)),

    // Sliced endpoints
    writeFile(path.join(OUT_DIR, "projects.json"), toJson({
      generated_at: dataset.generated_at,
      count: dataset.projects.length,
      projects: dataset.projects
    })),
    writeFile(path.join(OUT_DIR, "organizations.json"), toJson({
      generated_at: dataset.generated_at,
      count: dataset.organizations.length,
      organizations: dataset.organizations
    })),
    writeFile(path.join(OUT_DIR, "relationships.json"), toJson({
      generated_at: dataset.generated_at,
      count: dataset.relationships.length,
      relationships: dataset.relationships
    })),
    writeFile(path.join(OUT_DIR, "deployments.json"), toJson({
      generated_at: dataset.generated_at,
      count: dataset.deployments.length,
      deployments: dataset.deployments
    })),

    // GeoJSON
    writeFile(
      path.join(OUT_DIR, "map.geojson"),
      toJson(buildGeoJson(dataset.projects, dataset.organizations))
    ),

    // CSV
    writeFile(path.join(OUT_DIR, "projects.csv"), buildCsv(dataset.projects)),

    // Graph
    writeFile(path.join(OUT_DIR, "graph.json"), toJson(buildGraphData(dataset)))
  ];

  await Promise.all(writes);

  console.log(`[generate-datasets] Wrote ${writes.length} files to ${OUT_DIR}`);
}
