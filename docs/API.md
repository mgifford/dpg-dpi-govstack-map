# API Reference

## Overview

The Digital Public Infrastructure Ecosystem Atlas exposes a static public API generated at build time and published under `public/api/`.

Characteristics:

- No authentication required
- Static JSON, GeoJSON, and CSV outputs
- Designed for GitHub Pages and CDN-style hosting
- Updated by the monthly data workflow or manual regeneration
- Suited for low-cost public-interest hosting

The canonical API surface is also documented in the site UI at `/api/`.

---

## Generation Flow

Static API artifacts are generated from the processed Atlas dataset:

1. `data/manual/*.yml` and external sources are merged into `data/processed/atlas.json`
2. `scripts/generate-datasets.ts` emits API-ready files into `public/api/`
3. `scripts/generate-search-index.ts` emits `public/api/search-index.json`
4. Astro builds pages that consume the same processed dataset at build time

---

## Endpoints

### `GET /api/atlas.json`

Canonical Atlas dataset containing:

- metadata
- projects
- organizations
- people
- deployments
- repositories
- relationships
- standards

Use this endpoint when you want the full graph-aware dataset in one request.

### `GET /api/projects.json`

Project registry entries including:

- categories and project types
- governance and funding metadata
- deployment countries
- maturity dimensions
- accessibility and sustainability maturity bands
- provenance

### `GET /api/organizations.json`

Organization records including:

- type and governance role
- country and city
- coordinates
- associated projects
- partnerships and funders

### `GET /api/deployments.json`

Deployment records including:

- country
- ministry and government context
- project
- implementation partner
- confidence and source metadata

### `GET /api/relationships.json`

Directional relationship edges between entities such as:

- `funded_by`
- `integrates_with`
- `implements`
- `aligned_with`
- `governed_by`
- `maintained_by`
- `deployed_in`
- `used_by`
- `sponsored_by`
- `participates_in`

### `GET /api/map.geojson`

GeoJSON FeatureCollection for map rendering. Current output emphasizes organization locations and can be extended later for deployments and relationship overlays.

### `GET /api/graph.json`

Graph-friendly node and edge data intended for relationship exploration and downstream analysis.

### `GET /api/projects.csv`

Flat project export for spreadsheet and procurement-style review workflows.

### `GET /api/search-index.json`

Serialized Lunr.js search index used by the static frontend search experience.

---

## Data Model

Primary schema definitions live in [src/lib/schema.ts](../src/lib/schema.ts).

Detailed schema reference:

- [docs/SCHEMA.md](./SCHEMA.md)

Important model characteristics:

- multi-dimensional maturity instead of one overall score
- provenance metadata for important fields
- explicit standards and relationship support
- phase-one manual curation with room for later enrichment

---

## Example Usage

### JavaScript

```js
const response = await fetch("/api/projects.json");
const data = await response.json();
console.log(data.length);
```

### GeoJSON

```js
const response = await fetch("/api/map.geojson");
const geojson = await response.json();
```

### CSV

```bash
curl -O https://dpiatlas.example.org/api/projects.csv
```

---

## Compatibility and Stability

This API is static-first, not version-negotiated. Current dataset versioning is stored inside `atlas.json` as a metadata field.

Compatibility guidance:

- prefer tolerant readers
- treat new fields as additive
- do not assume ordering is stable
- use entity IDs rather than display names for joins

---

## Provenance

The Atlas distinguishes between:

- manual facts
- declared facts
- inferred facts
- scraped or API-derived facts

Consumers should use provenance metadata when making policy, procurement, or research claims from the dataset.

---

## Regeneration

Typical local workflow:

```bash
npm run ingest
npm run validate:data
npm run build
```

For CI-safe local runs that skip GitHub enrichment:

```bash
SKIP_GITHUB_ENRICHMENT=true npm run ingest
npm run validate:data
npm run build
```
