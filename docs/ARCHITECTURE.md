# Architecture

## Digital Public Infrastructure Ecosystem Atlas

### Overview

The Atlas is a statically-generated, open source web platform that ingests, enriches, and presents data about Digital Public Infrastructure (DPI), Digital Public Goods (DPG), GovTech, and civic technology projects globally.

It is designed for long-term stewardship: no databases to operate, no servers to manage. All data is version-controlled structured JSON; the frontend builds to a folder of static HTML/CSS/JS deployable to GitHub Pages or any CDN.

---

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  Data Sources                                                    │
│  DPG Registry API · GovStack GitHub · Manual Curation           │
└───────────────────────┬──────────────────────────────────────────┘
                        │ (monthly via GitHub Actions)
                        ▼
┌──────────────────────────────────────────────────────────────────┐
│  Ingestion & Enrichment Pipeline (Node.js / TypeScript)         │
│  scripts/ingest-dpg.ts                                          │
│  scripts/enrich-github.ts                                       │
│  scripts/generate-datasets.ts                                   │
│  scripts/generate-search-index.ts                               │
│  scripts/run-monthly-update.ts  ← orchestrator                  │
└───────────────────────┬──────────────────────────────────────────┘
                        │ writes validated JSON
                        ▼
┌──────────────────────────────────────────────────────────────────┐
│  Structured Data Store (version-controlled flat files)          │
│  data/processed/atlas.json  ← canonical source of truth        │
│  public/api/*.json / *.csv / *.geojson  ← static API           │
└───────────────────────┬──────────────────────────────────────────┘
                        │ read at build time
                        ▼
┌──────────────────────────────────────────────────────────────────┐
│  Static Site Builder (Astro 4 · TypeScript)                     │
│  src/pages/index.astro     Home + stats                         │
│  src/pages/projects/       Project list + detail pages          │
│  src/pages/map.astro       Accessible Leaflet map               │
│  src/pages/graph.astro     Cytoscape.js relationship graph      │
│  src/pages/api/            API documentation page               │
└───────────────────────┬──────────────────────────────────────────┘
                        │ outputs ./dist/
                        ▼
┌──────────────────────────────────────────────────────────────────┐
│  Deployment Target                                               │
│  GitHub Pages  or  Cloudflare Pages  (static file hosting)      │
└──────────────────────────────────────────────────────────────────┘
```

---

### Directory Structure

```
.
├── .github/
│   └── workflows/
│       ├── ci.yml              # Lint / type-check / test / build on every PR
│       ├── monthly-update.yml  # Monthly data refresh (cron: 1st of month 02:00 UTC)
│       └── deploy.yml          # Deploy to GitHub Pages on push to main
│
├── data/
│   ├── raw/                    # Cached raw API responses (gitignored blobs)
│   └── processed/
│       └── atlas.json          # Canonical Atlas dataset (Zod-validated)
│
├── public/
│   └── api/                    # Static API output (committed, served as-is)
│       ├── atlas.json
│       ├── projects.json
│       ├── organizations.json
│       ├── relationships.json
│       ├── deployments.json
│       ├── map.geojson
│       ├── projects.csv
│       ├── graph.json
│       └── search-index.json
│
├── scripts/
│   ├── lib/
│   │   ├── io.ts               # JSON read/write helpers
│   │   ├── normalize.ts        # Country/license normalisation
│   │   └── score.ts            # Activity, sustainability, maturity scoring
│   ├── ingest-dpg.ts           # DPG Registry ingestion
│   ├── enrich-github.ts        # GitHub API enrichment
│   ├── generate-datasets.ts    # Static API file generation
│   ├── generate-search-index.ts # Lunr.js index generation
│   ├── run-monthly-update.ts   # Orchestrator
│   └── validate-data.ts        # Schema + semantic validation
│
├── src/
│   ├── components/
│   │   ├── AtlasMap.astro      # Accessible Leaflet map + list toggle
│   │   ├── FilterPanel.astro   # Live filter controls (progressive enhancement)
│   │   ├── ProjectCard.astro   # Project summary card
│   │   └── ProjectGraph.astro  # Cytoscape.js graph + table fallback
│   ├── layouts/
│   │   └── Base.astro          # Base layout (skip nav, landmarks, dark mode)
│   ├── lib/
│   │   ├── filters.ts          # Filter state logic + deriveFilterOptions
│   │   └── schema.ts           # Zod schemas + TypeScript types
│   ├── pages/
│   │   ├── index.astro         # Home
│   │   ├── about.astro         # About
│   │   ├── accessibility.astro # Accessibility statement
│   │   ├── map.astro           # Map page
│   │   ├── graph.astro         # Graph page
│   │   ├── projects/
│   │   │   ├── index.astro     # Projects list
│   │   │   └── [id].astro      # Project detail (static paths from atlas.json)
│   │   └── api/
│   │       └── index.astro     # API documentation page
│   └── styles/
│       └── global.css          # Design tokens, dark mode, accessibility, layout
│
├── tests/
│   ├── schema.test.ts          # Zod schema validation
│   ├── score.test.ts           # Scoring algorithm tests
│   ├── normalize.test.ts       # Normalisation tests
│   └── filters.test.ts         # Filter logic tests
│
├── docs/
│   ├── ARCHITECTURE.md         # This file
│   ├── SCHEMA.md               # Data schema reference
│   └── CONTRIBUTING.md         # Contributor guide
│
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

### Data Flow: Monthly Update

```
1. GitHub Actions triggers monthly-update.yml (cron: first of month)
2. scripts/run-monthly-update.ts orchestrates:
   a. Load existing data/processed/atlas.json (seed)
   b. Fetch DPG Registry → scripts/ingest-dpg.ts
   c. Merge: seed wins (curated data preserved); new projects appended
   d. Enrich each project with GitHub repo metadata → scripts/enrich-github.ts
      - stars, forks, commit frequency, contributor count, releases
      - recalculate activity_score, sustainability_score, maturity_level
   e. Persist updated atlas.json
   f. Generate static API outputs → scripts/generate-datasets.ts
      - public/api/projects.json, atlas.json, organizations.json,
        relationships.json, deployments.json, map.geojson, projects.csv, graph.json
   g. Build Lunr search index → scripts/generate-search-index.ts
3. Commit changed data files to main branch
4. Commit triggers deploy.yml → Astro build → GitHub Pages
```

---

### Frontend Architecture

The frontend is built with **Astro** in fully static (`output: "static"`) mode.

**Key design decisions:**

- **Zero client-side hydration by default.** Pages are pure HTML.
- **Progressive enhancement for filters.** The filter form works without JS (GET parameters); JS adds live filtering without page reload.
- **Accessibility-first components.** Map and graph both have synchronized list/table alternatives. All dynamic content uses ARIA live regions.
- **Dark mode via CSS custom properties.** Toggled by a data attribute; persisted in `localStorage`.
- **No bundled charting framework on most pages.** Leaflet and Cytoscape.js are loaded lazily from CDN only on pages that need them.

---

### Scoring Model

#### Activity Score (0–100)

Derived from GitHub repository data:

| Factor                                      | Weight |
| ------------------------------------------- | ------ |
| Commit frequency × 12 months (capped at 50) | 50%    |
| Releases in last 12 months (capped at 25)   | 25%    |
| Issue closure rate                          | 25%    |

#### Sustainability Score (0–100)

Derived from community health metadata:

| Factor                                                    | Weight |
| --------------------------------------------------------- | ------ |
| Governance maturity                                       | 25%    |
| Documentation quality                                     | 20%    |
| Onboarding quality                                        | 20%    |
| Dependency freshness                                      | 20%    |
| Security advisory penalty (−4 per open advisory, max −20) | –20%   |

#### Maturity Classification

| Composite Score | Classification |
| --------------- | -------------- |
| > 75            | mature         |
| > 55            | growing        |
| > 35            | emerging       |
| > 20            | stagnant       |
| ≤ 20            | abandoned      |

---

### Accessibility Architecture

The platform is designed to **WCAG 2.2 Level AA** with Level AAA targets where achievable.

Core accessibility features:

- Skip navigation on every page
- Proper HTML landmark regions (`<header>`, `<nav>`, `<main>`, `<footer>`)
- Map: `<div>` with `role`, accessible markers, keyboard navigation, ARIA live region for zoom, synchronized list view
- Graph: Cytoscape canvas with keyboard node navigation (Tab/arrows), ARIA live region for selection, relationship table fallback
- Filters: all controls are standard HTML form elements with explicit `<label>` associations; `aria-controls` links controls to the list they affect; `aria-live` announces result count changes
- Dark mode, high contrast, reduced-motion support via CSS media queries and custom properties
- No color-only indicators (badges use both color and text; graph uses shapes and labels)

---

### Security

- **No server-side code** — attack surface is minimal (static files only)
- **CSP headers** — configured at the CDN/Pages level
- **Dependency scanning** — GitHub Dependabot enabled
- **No authentication data** — the platform is fully public-read
- **API rate limiting** — the monthly update script processes in batches and adds delays between GitHub API calls
- **No cookies or tracking** — no analytics, no third-party cookies
- **GITHUB_TOKEN scoped minimally** — `contents: write` only for the data-update job; `contents: read` for CI and build

---

### Deployment

#### GitHub Pages

```yaml
# astro.config.mjs
site: "https://<owner>.github.io/<repo>"
base: "/<repo>" # if not at root
```

Push to `main` → deploy.yml builds and deploys automatically.

#### Cloudflare Pages

Connect repository → set build command `npm run build` → output directory `dist`.

#### Environment variables

| Variable                               | Used in            | Purpose                                          |
| -------------------------------------- | ------------------ | ------------------------------------------------ |
| `GITHUB_TOKEN` or `ATLAS_GITHUB_TOKEN` | monthly-update job | Higher GitHub API rate limits (5000/hr vs 60/hr) |
| `SKIP_GITHUB_ENRICHMENT`               | any ingest run     | Set to `true` to skip GitHub API calls (dry run) |
