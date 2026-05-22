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

### 4. Curate DPG or DPGA software

Digital Public Goods intake is a mix of automated import and manual review.

Use [docs/DPG_INTAKE.md](docs/DPG_INTAKE.md) for the full workflow. The short version is:

- treat the live DPG registry as the primary discovery source
- require public source and license evidence before treating a project as straightforward open-source
- keep clearly proprietary entries out of the Atlas unless there is an explicit reason to track them for comparison
- use manual curation for DPI-adjacent ecosystem software that is not already covered by the registry importer
- regenerate the dataset after any manual corrections or additions

### 5. Curate broader DPI software

Broader DPI intake is cross-ecosystem and should not assume there is one complete source list.

Use [docs/DPI_INTAKE.md](docs/DPI_INTAKE.md) for the full workflow. The short version is:

- start from trusted ecosystem lists such as DPG, GovStack, MOSIP, Mojaloop, OpenHIE-related projects, and other public-interest software catalogues
- require public repository and license evidence before treating a tool as open-source DPI
- avoid pulling in proprietary software as normal Atlas entries
- use manual curation first, and only build a dedicated importer when a source is stable and structured enough to trust
- regenerate the dataset after changes

### 6. Curate OpenHIE-aligned software

OpenHIE intake is a focused health interoperability workflow rather than a bulk import.

Use [docs/OPENHIE_INTAKE.md](docs/OPENHIE_INTAKE.md) for the full workflow. The short version is:

- treat OpenHIE as a framework and community node, not as a single product
- only connect projects that have defensible OpenHIE architectural alignment
- keep OpenEHR related but separate unless a project clearly participates in both communities
- require public repository and license evidence before promoting a project as open-source digital health infrastructure
- regenerate the dataset after changes

### 7. Fix accessibility issues

Open an issue tagged `accessibility`. Include:

- WCAG criterion violated (e.g., "1.4.3 Contrast")
- Browser and assistive technology combination
- Steps to reproduce

### 8. Improve ingestion scripts

Scripts live in `scripts/`. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for design intent.

### 9. Improve the frontend

Components are in `src/components/`, pages in `src/pages/`.
All changes must maintain WCAG 2.2 AA conformance.
Run `npm run build` before submitting to catch type errors.

---

## Spec-Kitty Workflow

This repository is moving to Spec-Kitty-driven development for non-trivial changes.

Start here:

- https://docs.spec-kitty.ai/
- https://docs.spec-kitty.ai/how-to/install-spec-kitty.html
- https://docs.spec-kitty.ai/explanation/spec-driven-development.html
- [docs/SPEC_KITTY.md](docs/SPEC_KITTY.md)

Recommended local setup:

```bash
pipx install spec-kitty-cli
pipx ensurepath
spec-kitty --version
spec-kitty init . --ai copilot
```

Use the full Spec-Kitty cycle by default when the change touches more than one layer of the system, especially for:

- schema changes
- ingestion or enrichment changes
- accessibility fixes across shared components or multiple pages
- new intake workflows or governance rules
- CI, deployment, or audit workflow changes

For those changes, the expected order is:

1. Specify the change and acceptance criteria.
2. Generate the implementation plan.
3. Generate work packages.
4. Implement against the approved plan.
5. Review and accept against the original spec before merge.

Trivial typo fixes and narrow one-line fixes do not need the full spec cycle.

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
3. For non-trivial changes, start with the Spec-Kitty workflow in [docs/SPEC_KITTY.md](docs/SPEC_KITTY.md)
4. Make changes in manual sources, scripts, or frontend files as appropriate
5. Regenerate artifacts when data changes: `SKIP_GITHUB_ENRICHMENT=true npm run ingest`
6. Run validation: `npm run validate:data && npm run check && npm run build`
7. Open a pull request with a clear description and reference the accepted spec when one exists
8. A maintainer will review within 5 business days

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
