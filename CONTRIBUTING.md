# Contributing to the DPI Ecosystem Atlas

Thank you for your interest in contributing to the Digital Public Infrastructure Ecosystem Atlas.

---

## Ways to Contribute

### 1. Add or update a project

Edit the manual source files in `data/manual/` and submit a pull request.

Do not edit `data/processed/atlas.json` directly unless you are debugging the pipeline. It is a generated artifact.

All projects must pass schema validation (`npm run validate:data`).
See [docs/SCHEMA.md](docs/SCHEMA.md) for field definitions.

If you are adding a new project, include at minimum:

- `id`, `name`, `description`
- `category`, `project_type`
- `licenses`
- `repository_urls` (if open source)
- `deployment_countries`
- `maturity_level`, `sdgs`

The usual manual source files are:

- `data/manual/projects.yml`
- `data/manual/organizations.yml`
- `data/manual/deployments.yml`
- `data/manual/relationships.yml`

### 2. Add or correct organization data

Organizations should be added in `data/manual/organizations.yml`.
If you have verified `coordinates` for an organization, include them — they drive the map.

### 3. Curate GovStack software

GovStack software is currently curated manually rather than ingested from a stable marketplace API.

Use [docs/GOVSTACK_INTAKE.md](docs/GOVSTACK_INTAKE.md) for the full workflow. The short version is:

- verify the canonical project site and upstream repository
- confirm the license posture before setting `license_model`
- add `licensing_concerns` when a listing is mixed, proprietary, or unclear
- map the software to one or more `govstack_building_blocks`
- add or update the steward organization record if needed
- regenerate the dataset and published API files before opening a PR

### 4. Fix accessibility issues

Open an issue tagged `accessibility`. Include:

- WCAG criterion violated (e.g., "1.4.3 Contrast")
- Browser and assistive technology combination
- Steps to reproduce

### 5. Improve ingestion scripts

Scripts live in `scripts/`. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for design intent.

### 6. Improve the frontend

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

To run a full ingestion cycle:

```bash
SKIP_GITHUB_ENRICHMENT=true npm run ingest
```

If you are working on GitHub metadata enrichment, provide `GITHUB_TOKEN` or `ATLAS_GITHUB_TOKEN` and run the same ingest command without `SKIP_GITHUB_ENRICHMENT=true`.

---

## Code Standards

- TypeScript strict mode
- Prettier formatting (`npm run format`)
- Run the smallest relevant validation for your change, then rerun `npm run check` before opening a PR
- No new runtime dependencies without discussion — keep the bundle small

---

## Pull Request Process

1. Fork the repository
2. Create a branch: `git checkout -b feat/your-feature`
3. Make changes in manual sources, scripts, or frontend files as appropriate
4. Regenerate artifacts when data changes: `SKIP_GITHUB_ENRICHMENT=true npm run ingest`
5. Run validation: `npm run validate:data && npm run check && npm run build`
4. Open a pull request with a clear description
5. A maintainer will review within 5 business days

---

## Data Governance

- Curated project data in `data/manual/*.yml` takes precedence over automatically ingested values
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
