# DPI Intake Workflow

## Purpose

This document describes how the Atlas should bring broader DPI software into the dataset.

Unlike the DPG registry, there is no single comprehensive and trustworthy master list of all software associated with digital public infrastructure. That means DPI intake must be multi-source, conservative, and biased toward verifiable open-source tools.

The goal is not to import every tool that claims a DPI connection. The goal is to identify software that is relevant to public digital infrastructure and can be defended as open-source, public-interest, or at least transparently caveated.

## Practical Answer

Yes, there is a way to bring DPI software into the Atlas, but it should be done through a layered intake model rather than a single bulk import.

The recommended operating model is:

1. use the DPG registry as the default baseline for open digital public goods
2. use ecosystem-specific lists to find additional DPI-relevant software
3. verify public source and license evidence before inclusion
4. use manual curation first
5. only build importers for sources that expose stable, structured metadata

## Why There Is No Single DPI List To Trust

DPI is a broader category than DPG.

That creates two problems:

- many software lists mix open-source, source-available, and proprietary tools without making the distinction reliable enough for automated intake
- different DPI domains use separate ecosystem catalogues, not one canonical registry

In practice, the Atlas should treat DPI discovery as a federation problem, not a single-source import problem.

## Preferred Source Hierarchy

Use this source hierarchy when bringing DPI software into the Atlas:

1. Digital Public Goods Registry for baseline open-source public-good candidates
2. GovStack software marketplace for building-block aligned software
3. official ecosystem lists from major DPI-adjacent communities such as MOSIP, Mojaloop, OpenHIE, DHIS2-related ecosystems, and similar public-interest software programmes
4. official project websites
5. official public source repositories and repository metadata
6. official technical documentation
7. manual contributor research when other evidence is incomplete

Do not treat generic vendor directories or marketing pages as authoritative proof of open-source status.

## Open-Source-First Filter

The Atlas should highlight open-source DPI software, not proprietary offerings.

Use these rules:

- include projects with a public repository and a recognizable open license whenever possible
- downgrade projects to `mixed`, `source-available`, `proprietary`, or `unknown` when the procurement posture is less open than the repo metadata suggests
- avoid importing proprietary tools into the normal Atlas project layer unless there is a clear comparative reason and the caveat is explicit
- prefer omission over overclaiming when evidence is weak

If a source list mixes open and proprietary tools, the importer or curator should filter aggressively.

## Intake Modes

### Mode 1: automated intake

Use automated intake only when a source provides stable structured metadata for:

- canonical project names
- stable URLs
- repository URLs
- declared licenses
- organization or steward metadata
- enough consistency to survive schema validation without guesswork

This is the current model for the DPG registry.

### Mode 2: curated intake

Use curated intake when:

- a source list is incomplete or inconsistently structured
- license posture requires human review
- the source mixes open and proprietary software
- the ecosystem is important enough to track, but not reliable enough to import wholesale

This is the safer default for broader DPI discovery.

## Intake Steps

### 1. Start with a scoped source

- choose one ecosystem source at a time
- avoid trying to ingest "all DPI software" in one pass
- prefer sources that are already meaningful to the Atlas, such as DPG and GovStack

### 2. Verify project identity

- confirm the canonical project name
- confirm the main website
- confirm the main repository or organization
- reject duplicate or mirror links when a canonical upstream exists

### 3. Verify open-source evidence

- capture repository URLs
- capture SPDX-style licenses where possible
- check whether the marketed offering is substantially more closed than the repository suggests
- set `license_model` to match the real procurement posture

### 4. Decide whether the project belongs in the Atlas

Keep projects that are:

- clearly relevant to public digital infrastructure
- openly licensed or at least clearly classifiable
- useful for ecosystem mapping and public-interest comparison

Avoid or caveat projects that are:

- clearly proprietary
- too weakly evidenced to classify safely
- only adjacent in a generic enterprise-software sense rather than part of public digital infrastructure

### 5. Add context in manual data

Use manual datasets to add:

- project records
- steward organizations
- ecosystem relationships
- deployments
- procurement notes
- interoperability and standards context

### 6. Decide whether to build an importer

Only build a source-specific importer when the source is stable enough that automation improves accuracy instead of reducing it.

The threshold is high. A bad importer creates more cleanup work than manual curation.

## Candidate Ecosystem Lists

Useful sources for broader DPI discovery may include:

- Digital Public Goods Registry
- GovStack software marketplace
- MOSIP ecosystem references
- Mojaloop ecosystem references
- OpenHIE-related project lists
- public-sector open-source programme catalogues
- major public-interest interoperability, payments, identity, health, and social-protection communities with transparent project listings

Each source still needs filtering and verification.

## Files Usually Touched

- [data/manual/projects.yml](../data/manual/projects.yml)
- [data/manual/organizations.yml](../data/manual/organizations.yml)
- [data/manual/relationships.yml](../data/manual/relationships.yml)
- [data/manual/deployments.yml](../data/manual/deployments.yml)
- [data/processed/atlas.json](../data/processed/atlas.json)
- [public/api/atlas.json](../public/api/atlas.json)
- [public/api/projects.json](../public/api/projects.json)

If a new source proves stable enough for automation, the intake may later expand to a dedicated script under [scripts](../scripts).

## Validation

Run:

```bash
SKIP_GITHUB_ENRICHMENT=true npm run ingest
npm run validate:data
npm run format
npm run check
npm run build
```

## Review Checklist

Before merging broader DPI intake work, confirm all of the following:

- the source list is documented clearly enough for review
- every retained project has public source and license evidence or an explicit caveat
- clearly proprietary tools are excluded from the normal open-source DPI layer
- steward organizations and relationships resolve correctly
- generated artifacts were regenerated when data changed
- `npm run validate:data`, `npm run check`, and `npm run build` pass
