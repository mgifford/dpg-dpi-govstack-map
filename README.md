# Digital Public Infrastructure Ecosystem Atlas

A production-quality, continuously updated, globally searchable and mappable registry of Digital Public Infrastructure (DPI), Digital Public Goods (DPG), GovTech projects, and open standards initiatives.

The Atlas is a public-interest research platform designed for **researchers, governments, NGOs, standards bodies, funders, implementers, procurement teams, and ecosystem builders** to discover, map, and understand the global open source digital infrastructure ecosystem.

---

## Vision

The Digital Public Infrastructure Ecosystem Atlas aims to create a single source of truth for the rapidly fragmented landscape of public-interest technology. It:

- **Automatically ingests and continuously updates** project data from DPG Registry, GovStack, MOSIP, Mojaloop, DHIS2, and 30+ other key ecosystems
- **Maps geographic deployments, relationships, and dependencies** to understand how public digital infrastructure is interconnected globally
- **Tracks community health, sustainability, and maturity** using sophisticated metrics (not just GitHub stars)
- **Enables discovery** through full-text search, faceted filtering, relationship graphs, and accessible interactive maps
- **Prioritizes accessibility (WCAG 2.2 AA+)**, sustainability, and performance** as core requirements, not afterthoughts
- **Supports long-term stewardship** through open governance, transparent data, and clean architecture

---

## Key Features

### 🗺️ Intelligent Mapping & Visualization

- **Interactive geographic map** of project deployments, organization headquarters, and standards participation
- **Relationship graph visualization** showing how projects, organizations, and standards interconnect
- **Heatmaps** of deployment density, community activity, and ecosystem maturity
- **List view alternative** to map for keyboard navigation and screen reader support
- **Clustering and filtering** with zero-JavaScript fallbacks

### 🔍 Powerful Search & Discovery

- **Full-text search** across project metadata, descriptions, documentation
- **Faceted filtering** by country, region, project type, DPI domain, governance model, license, maturity, accessibility score, sustainability score, and more
- **Relationship discovery** (e.g., "projects integrated with Mojaloop," "standards aligned with W3C")
- **"Similar projects"** and **"related organizations"** recommendations
- **Ecosystem navigation** (e.g., "all GovStack projects," "all OpenSDGs initiatives")
- **Accessibility-first search workflows** that don't require pointer interaction

### 📊 Community Health Analytics

Projects are ranked using sophisticated, multidimensional metrics:

- **Commits and contributors** in last 12 months
- **Issue closure rate** and median response time
- **Release frequency** and stability
- **Contributor diversity index**
- **Governance maturity** (presence of CoC, contributing guidelines, RFC process)
- **Documentation quality** and onboarding experience
- **Dependency freshness** and security advisories
- **OpenSSF scorecard** integration where available

This enables distinction between **mature ecosystems**, **emerging projects**, **stagnant code**, and **abandoned repos**.

### 📋 Rich Data Model

The Atlas tracks:

- **Projects**: name, description, category, repository URLs, licenses, governance model, funding, standards alignment, deployment countries, maturity level, community health
- **Organizations**: name, type, website, country, partnerships, funding, governance role
- **People**: name, role, organization, public profiles, project affiliations, conference connections, standards groups
- **Deployments**: country, government, ministry, implementation partner, deployment status
- **Repositories**: platform, stats (stars, forks, contributors), commit frequency, bus factor, governance files, security policies
- **Relationships**: "funded_by", "integrates_with", "implements", "aligned_with", "governed_by", "maintained_by", "deployed_in", "used_by", "sponsored_by", "participates_in"

### ♿ Accessibility-First Design

**WCAG 2.2 AA compliant minimum** (AAA where feasible):

- Fully keyboard operable
- All map functionality exposed in non-map views
- Synchronized list + map interface
- Accessible popups and modals with semantic HTML
- Support for reduced motion, high contrast, dark mode
- Screen reader compatible with proper ARIA
- Touch and mobile accessible
- 400% zoom support
- No hover-only interactions
- Text alternatives for all visualizations
- Downloadable structured data for analysis

### 🌱 Sustainability & Performance

- **Lighthouse 90+ scores**
- **Minimal JavaScript** — prefer static generation
- **Aggressive caching** of API responses
- **Offline viewing** for downloaded datasets
- **Low-bandwidth support**
- **Green hosting** compatible
- **Estimated page weight** measurement and reporting
- **Sustainable web design practices** throughout

### 🔄 Automatic Monthly Updates

GitHub Actions workflow:

1. Fetches latest DPG Registry data
2. Fetches GovStack repository metadata
3. Fetches GitHub health metrics for all projects
4. Calculates community health scores
5. Enriches data with Wikidata, OpenAlex, ORCID, OpenSSF
6. Rebuilds static datasets and search indexes
7. Regenerates map layers and relationship graphs
8. Commits and deploys automatically

### 📡 Public API

Expose project data via:

- **JSON API** endpoints for projects, organizations, deployments
- **GeoJSON** for geographic data
- **CSV export** for analysis
- **Graph endpoints** for relationship data
- Comprehensive API documentation

### 🔒 Privacy & Security

- Content Security Policy (CSP) headers
- Dependency and secret scanning
- Secure CI/CD pipeline
- API rate limiting
- Privacy-preserving analytics (no invasive tracking)
- Optional encrypted personal relationship layer (local storage only)

---

## Data Sources

The Atlas ingests from:

- **Digital Public Goods Registry** (https://www.digitalpublicgoods.net/registry)
- **GovStack** (https://govstack.global/)
- **GitHub APIs** (repository metadata, community health)
- **MOSIP, Mojaloop, DHIS2, OpenMRS, CKAN, DKAN, Drupal, OpenSPP, OpenG2P, X-Road, OpenCRVS, Mifos, Ushahidi, Open Referral, Open311, OpenFisca, GNU Health, ODK, KoboToolbox, FOLIO, Wagtail, Decidim, Matrix, Mastodon, ActivityPub ecosystem**
- **W3C standards projects**
- **Open government platforms** (GovUK, GovZero, etc.)
- **Open procurement, civic participation, and interoperability systems**

Data enrichment via:
- Wikidata
- OpenAlex
- ORCID
- OpenSSF
- Libraries.io
- Ecosyste.ms
- OpenCollective
- Public package registries

---

## Tech Stack

**Frontend:**
- **Astro** for static site generation
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Accessible HTML** with semantic structure

**Backend & Automation:**
- **Node.js** ingestion scripts
- **GitHub Actions** for monthly CI/CD
- **SQLite** for lightweight data processing (optional PostgreSQL + PostGIS for advanced deployments)

**Visualization:**
- **MapLibre GL JS** for accessible maps
- **Leaflet** as fallback
- **D3.js** for ecosystem graphs
- **Observable Plot** for data-dense visualizations
- **Cytoscape.js** for relationship graphs

**Search:**
- **Lunr.js** for static full-text search (no backend required)
- **Typesense** optional for advanced deployments

**Deployment:**
- **GitHub Pages** or **Cloudflare Pages**
- Automatic via GitHub Actions

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

```bash
git clone https://github.com/mgifford/dpg-dpi-govstack-map.git
cd dpg-dpi-govstack-map
npm install
```

### Development

```bash
# Start dev server (with hot reload)
npm run dev

# Open http://localhost:3000
```

### Build

```bash
# Build static site
npm run build

# Preview production build
npm run preview
```

### Generate Datasets

```bash
# Ingest DPG Registry, GovStack, and GitHub metadata
npm run generate-datasets

# Enrich with GitHub community health metrics
npm run enrich-github

# Generate search index
npm run generate-search-index

# Validate all data against schema
npm run validate
```

### Monthly Update (Manual)

```bash
npm run monthly-update
```

This runs the complete pipeline: ingest → enrich → generate → validate → build.

---

## Project Structure

```
.
├── src/
│   ├── lib/
│   │   ├── schema.ts          # Zod schemas for all entity types
│   │   ├── filters.ts         # Faceted filtering logic
│   │   └── filters.test.ts
│   ├── components/            # Astro components
│   │   ├── AtlasMap.astro     # Main interactive map
│   │   ├── FilterPanel.astro  # Faceted filter UI
│   │   ├── ProjectCard.astro  # Project card component
│   │   └── ProjectGraph.astro # Relationship graph
│   ├── layouts/
│   │   └── Base.astro         # Main layout (WCAG compliant)
│   ├── pages/                 # Astro pages
│   │   ├── index.astro        # Home
│   │   ├── map.astro          # Map explorer
│   │   ├── graph.astro        # Relationship graph explorer
│   │   ├── about.astro        # About page
│   │   ├── accessibility.astro # Accessibility statement
│   │   ├── api/               # API routes
│   │   │   └── index.astro    # API documentation
│   │   └── projects/
│   │       ├── index.astro    # Projects list
│   │       └── [id].astro     # Project detail page
│   └── styles/
│       └── global.css         # Global styles + accessibility utilities
├── scripts/
│   ├── lib/
│   │   ├── io.ts              # File I/O utilities
│   │   ├── normalize.ts       # Data normalization
│   │   └── score.ts           # Community health scoring
│   ├── ingest-dpg.ts          # Fetch DPG Registry
│   ├── enrich-github.ts       # Fetch GitHub metrics
│   ├── generate-datasets.ts   # Orchestrate data generation
│   ├── generate-search-index.ts # Build search index
│   ├── validate-data.ts       # Validate against schema
│   └── run-monthly-update.ts  # Monthly update orchestrator
├── data/
│   ├── processed/
│   │   └── atlas.json         # Generated dataset
│   └── raw/
│       └── [sources]/         # Raw ingested data
├── docs/
│   ├── ARCHITECTURE.md        # System architecture
│   ├── SCHEMA.md              # Data model documentation
│   ├── API.md                 # API documentation
│   └── ACCESSIBILITY.md       # Accessibility statement
├── tests/
│   ├── filters.test.ts
│   ├── normalize.test.ts
│   ├── schema.test.ts
│   └── score.test.ts
├── .github/workflows/
│   ├── ci.yml                 # Test on push
│   ├── monthly-update.yml     # Data refresh cron
│   └── deploy.yml             # Deploy to Pages
└── [config files]
```

---

## API

The Atlas exposes a public API for programmatic access:

### Endpoints

**Projects**
```
GET /api/projects                    # List all projects
GET /api/projects?country=KE&type=mobile  # Filter projects
GET /api/projects/:id               # Get project detail
```

**Organizations**
```
GET /api/organizations
GET /api/organizations/:id
```

**Search**
```
GET /api/search?q=digital%20identity&limit=20
```

**Map Data**
```
GET /api/map/deployments.geojson   # Deployment locations
GET /api/map/organizations.geojson # Organization HQs
GET /api/map/relationships.geojson # Ecosystem relationships
```

**Graph**
```
GET /api/graph/projects.json        # Project relationship graph
GET /api/graph/organizations.json   # Organization network
```

**Bulk Export**
```
GET /api/export/projects.csv
GET /api/export/organizations.json
GET /api/export/all.tar.gz          # Full dataset snapshot
```

### Example Usage

```javascript
// Fetch all projects in Kenya
const res = await fetch('/api/projects?country=KE');
const projects = await res.json();

// Search for digital identity projects
const search = await fetch('/api/search?q=digital%20identity&limit=50');
const results = await search.json();

// Download complete dataset
const export = await fetch('/api/export/all.tar.gz');
```

---

## Contributing

We welcome contributions from researchers, developers, data wranglers, accessibility specialists, and ecosystem builders.

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on:
- How to add new data sources
- How to improve community health metrics
- How to enhance accessibility
- How to optimize performance
- Code style and testing requirements

---

## Governance

This project is maintained as a **open source public good**.

- **Code**: MIT License
- **Data**: CC0 (public domain)
- **Community**: Governed by the maintainers and contributors in transparent decision-making

See [GOVERNANCE.md](docs/GOVERNANCE.md) for details.

---

## Accessibility

This platform is committed to **WCAG 2.2 AA compliance** as a core requirement.

See [ACCESSIBILITY.md](docs/ACCESSIBILITY.md) for:
- Detailed accessibility statement
- Testing procedures
- How to report accessibility issues

---

## Sustainability

The Atlas is designed to minimize environmental impact:

- Static site generation reduces server load
- Aggressive caching and minimal JavaScript
- Carbon-aware hosting-compatible architecture
- Downloadable datasets support offline use
- Green web practices throughout

See [SUSTAINABILITY.md](docs/SUSTAINABILITY.md) for metrics and practices.

---

## Troubleshooting

### "ENOENT: no such file or directory, open 'data/processed/atlas.json'"

Generate datasets first:
```bash
npm run generate-datasets
npm run build
```

### Map not appearing on localhost

Ensure MapLibre GL and Leaflet CSS are loaded. Check browser console for CORS errors.

### Tests failing with validation errors

Regenerate and validate datasets:
```bash
npm run generate-datasets
npm run validate
```

---

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — System design and data flow
- [Schema](docs/SCHEMA.md) — Complete data model reference
- [API](docs/API.md) — API endpoints and examples
- [Contributing](CONTRIBUTING.md) — How to contribute code and data
- [Accessibility](docs/ACCESSIBILITY.md) — Accessibility practices
- [Sustainability](docs/SUSTAINABILITY.md) — Environmental impact
- [Deployment](docs/DEPLOYMENT.md) — How to self-host

---

## Community

- **Issues & Discussions**: [GitHub Issues](https://github.com/mgifford/dpg-dpi-govstack-map/issues)
- **News & Updates**: [GitHub Discussions](https://github.com/mgifford/dpg-dpi-govstack-map/discussions)
- **Want to help?** See [CONTRIBUTING.md](CONTRIBUTING.md)

---

## License

- **Code**: MIT License
- **Data**: CC0 (Public Domain)
- **Documentation**: CC-BY-4.0

---

## Funding & Support

This project is maintained as a public good. We welcome support from:
- Foundations focused on digital infrastructure
- Government digital transformation programs
- Research institutions
- Individual donors

For partnership inquiries, please open a discussion on GitHub.

---

## Acknowledgments

Built with:
- [Astro](https://astro.build)
- [MapLibre GL JS](https://maplibre.org)
- [Zod](https://zod.dev)
- [Vitest](https://vitest.dev)
- The broader open source ecosystem

Special thanks to the DPG, GovStack, and broader digital public infrastructure communities for inspiring this work.