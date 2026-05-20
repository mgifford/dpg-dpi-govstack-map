# Contributing to the DPI Ecosystem Atlas

Thank you for your interest in contributing to the Digital Public Infrastructure Ecosystem Atlas.

---

## Ways to Contribute

### 1. Add or update a project

Edit `data/processed/atlas.json` and submit a pull request.

All projects must pass schema validation (`npm run validate:data`).
See [docs/SCHEMA.md](docs/SCHEMA.md) for field definitions.

If you are adding a new project, include at minimum:

- `id`, `name`, `description`
- `category`, `project_type`
- `licenses`
- `repository_urls` (if open source)
- `deployment_countries`
- `maturity_level`, `sdgs`

### 2. Add or correct organization data

Organizations live under the `organizations` array in `atlas.json`.
If you have verified `coordinates` for an organization, include them — they drive the map.

### 3. Fix accessibility issues

Open an issue tagged `accessibility`. Include:

- WCAG criterion violated (e.g., "1.4.3 Contrast")
- Browser and assistive technology combination
- Steps to reproduce

### 4. Improve ingestion scripts

Scripts live in `scripts/`. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for design intent.

### 5. Improve the frontend

Components are in `src/components/`, pages in `src/pages/`.
All changes must maintain WCAG 2.2 AA conformance.
Run `npm run build` before submitting to catch type errors.

---

## Development Setup

```bash
git clone https://github.com/mgifford/dpg-dpi-govstack-map
cd dpg-dpi-govstack-map
npm install
npm run dev          # start dev server at localhost:4321
npm test             # run unit tests
npm run validate:data # validate the Atlas dataset
```

To run a full ingestion cycle (requires `GITHUB_TOKEN` for enrichment):

```bash
GITHUB_TOKEN=your_token npm run ingest
```

---

## Code Standards

- TypeScript strict mode
- Prettier formatting (`npm run format:fix`)
- ESLint (`npm run lint`)
- No new runtime dependencies without discussion — keep the bundle small

---

## Pull Request Process

1. Fork the repository
2. Create a branch: `git checkout -b feat/your-feature`
3. Make changes; run `npm test && npm run validate:data && npm run build`
4. Open a pull request with a clear description
5. A maintainer will review within 5 business days

---

## Data Governance

- Curated project data (seed values in `atlas.json`) takes precedence over automatically ingested values
- Automatically enriched scores (activity, sustainability, maturity) are recalculated each month and should not be manually edited
- Person records (`people` array) are opt-in and publicly attributed only; private contact details must never be committed
- The dataset is published under CC BY 4.0

---

## Accessibility Requirements for Contributions

All UI contributions must:

- Work without a mouse (keyboard only)
- Provide text alternatives for non-text content
- Not introduce color-only information encoding
- Not disable focus outlines
- Not add `role` or `aria-*` attributes without a clear need

---

## Governance

This project is maintained by its contributors with no formal governance body at this stage.
Decisions are made by consensus in pull request discussion.
Major changes (data model breaking changes, new external dependencies) require discussion in an issue first.
