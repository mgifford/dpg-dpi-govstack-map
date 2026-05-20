# Maturity Model Alignment

This project is being built in response to and in conversation with Johan Linaker and Sachiko Muto's paper, "Advancing Digital Government: Integrating Open Source Software Enablement Indicators in Maturity Indexes."

The Atlas does not treat maturity as a single popularity proxy. Instead, it builds on the paper's argument that digital government maturity assessments should include open source software enablement indicators alongside broader public-sector digital capability signals.

## Reference Point

The relevant reference is:

- Johan Linaker and Sachiko Muto, "Advancing Digital Government: Integrating Open Source Software Enablement Indicators in Maturity Indexes"
- ResearchGate publication: https://www.researchgate.net/publication/396250702_Advancing_Digital_Government_Integrating_Open_Source_Software_Enablement_Indicators_in_Maturity_Indexes
- arXiv preprint context: `arXiv:2510.04603v1 [cs.SE]`

The important point for this repository is not the identifier by itself. It is the paper's core claim that digital maturity frameworks should better account for policy, institutional support, software reuse, and OSS ecosystem enablement in government.

## Working Interpretation

We use that paper as a directional framework for evaluating whether a digital public infrastructure project is adoptable, governable, sustainable, and operable in real public-sector settings.

That means the Atlas emphasizes:

- evidence over opinion
- multiple maturity dimensions instead of one score
- provenance and confidence for each important claim
- public-interest adoption readiness, not just repository activity
- phased implementation so the data model matures before the automation layer expands

## How The Atlas Applies The Model

The paper examines OSS policy formation, implementation support, and institutional enablers such as Open Source Program Offices, then proposes indicators across 14 areas covering policy incentives, policy design, implementation, and support.

The Atlas translates that orientation into an operational project and ecosystem data model.

The current schema and workflows operationalize maturity through eleven dimensions:

- `code`
- `governance`
- `stewardship`
- `public_sector`
- `accessibility`
- `sustainability`
- `security`
- `interoperability`
- `procurement`
- `community`
- `documentation`

These dimensions are stored in `maturity_scores` and then surfaced alongside supporting indicators such as:

- deployment countries
- governance model
- steward organizations
- repository health
- standards alignment
- accessibility score
- sustainability score
- procurement readiness

This is intentional. A project can be technically active while still be weak in governance, documentation, accessibility, interoperability, or procurement readiness. The Atlas is designed to make those differences visible in a way that is useful for governments, implementers, funders, and policy teams.

The Atlas is therefore not claiming to reproduce the paper's maturity index verbatim. It is building on that research to create a practical evidence system for DPI and DPG discovery, comparison, and stewardship.

## Evidence Model

The maturity model only works if the supporting evidence is inspectable.

For that reason, the Atlas stores provenance metadata for important fields and distinguishes between:

- manual curation
- declared information from project sources
- inferred relationships
- scraped or API-derived facts

Each record can also carry confidence, source, retrieval date, and notes. This keeps the maturity view falsifiable rather than impressionistic.

## Phased Delivery Strategy

The product roadmap is also organized around maturity.

## Phase 1

Build a trustworthy core dataset first.

- manually curated cohort
- explicit provenance
- accessible project and organization pages
- comparison, map, and graph views
- semantic validation

## Phase 2

Add repeatable enrichment without weakening traceability.

- cached raw-source ingestion
- GitHub repository enrichment
- DPG registry ingestion
- repository-level evidence for governance, release, and dependency health
- monthly automation with preserved source lineage

## Phase 3+

Expand relationship intelligence and ecosystem coverage.

- standards bodies
- funders and implementation partners
- deployment evidence
- stronger interoperability and procurement signals

The sequencing matters. We do not want broad automation before the maturity model, provenance structure, and validation rules are stable enough to absorb it.

## Practical Rules For Contributors

When adding or changing data, pages, or automation, contributors should prefer changes that strengthen one or more of these qualities:

- clearer maturity evidence
- better OSS enablement signals for public-sector reuse and collaboration
- better provenance
- stronger accessibility
- more actionable public-sector adoption signals
- less ambiguity in stewardship and governance

Changes that only make the Atlas look richer while weakening evidence quality should be treated as regressions.

## Current Implementation Surfaces

The maturity-model approach currently appears in:

- `src/lib/schema.ts` through `maturity_scores`, maturity bands, and provenance
- `data/manual/projects.yml` through manually curated maturity inputs
- `scripts/enrich-github.ts` through repository-level evidence collection
- `scripts/run-monthly-update.ts` through phased enrichment orchestration
- `src/pages/compare.astro` and `src/pages/sustainability.astro` through multidimensional presentation rather than rank-only display
- `docs/SUSTAINABILITY.md` and `src/pages/methodology.astro` through public explanation of evaluation criteria

## Summary

The Atlas is not being built as a generic software directory. It is being built as an evidence-backed maturity atlas for digital public infrastructure, informed by Linaker and Muto's work on integrating OSS enablement indicators into digital government maturity models.