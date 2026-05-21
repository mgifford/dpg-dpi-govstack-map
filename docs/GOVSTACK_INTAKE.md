# GovStack Intake Workflow

## Purpose

GovStack software should be added to the Atlas through a documented curation workflow before any future importer is introduced.

This keeps three things explicit:

1. whether a marketplace listing is actually backed by public source code
2. how the software maps to GovStack building-block language used in the Atlas
3. what procurement or licensing caveats need to be visible to governments and implementers

For now, GovStack is treated as a curated layer on top of the Atlas dataset, while the Digital Public Goods registry is the only large-scale automated import.

## Current Approach

The current GovStack workflow is intentionally conservative.

- Use the GovStack software marketplace as a discovery source, not as the sole source of truth.
- Verify each listing against upstream project websites and public source repositories.
- Only mark a project as `govstack_listed: true` when there is concrete evidence that the software appears on the marketplace.
- Track licensing posture separately from raw SPDX licenses using `license_model`.
- Add `licensing_concerns` whenever a listing includes commercial tiers, enterprise packaging, source-available terms, or unclear redistribution rights.
- Prefer manual curation over speculative import when marketplace metadata is incomplete or inconsistent.

## Data Fields To Update

GovStack curation normally touches these project fields in [src/lib/schema.ts](../src/lib/schema.ts):

- `govstack_building_blocks`
- `govstack_listed`
- `govstack_compliance_level`
- `govstack_notes`
- `license_model`
- `licensing_concerns`
- `repository_urls`
- `documentation_urls`
- `steward_organizations`
- `provenance`

If the steward does not already exist, add a matching organization record in the manual organizations dataset.

## Evidence Standard

Before adding or updating a GovStack listing, collect enough evidence to answer four questions:

1. What is the canonical project name used by the marketplace and by the upstream project?
2. Is there a public source repository, and does it identify a license?
3. Which GovStack building block or blocks does the software actually implement?
4. Does the project require a procurement warning because of mixed or unclear licensing?

Preferred sources, in order:

1. official project website
2. official source repository metadata
3. GovStack marketplace listing
4. public technical documentation

Do not infer open-source status from marketing language alone.

## Classification Rules

Use these rules consistently when setting `license_model`:

- `open-source`: public source repository with a recognized open license and no immediate evidence that the listed product is primarily gated behind proprietary packaging
- `mixed`: open-source core exists, but the marketed GovStack offering clearly includes enterprise-only tiers, commercial packaging, or procurement ambiguity
- `source-available`: source is public but the license is not an OSI-style open-source license
- `proprietary`: no public source repository or licensing terms indicate closed distribution
- `unknown`: evidence is incomplete and should not be guessed

When in doubt, keep the record in the Atlas only if it is useful for ecosystem visibility, but make the uncertainty explicit in `licensing_concerns` and `govstack_notes`.

## Intake Steps

### 1. Discover candidate listings

- Review the GovStack software marketplace.
- Note software already present in the Atlas but missing `govstack_listed: true`.
- Identify genuinely new software that is not yet in the manual project dataset.

### 2. Verify upstream identity

- Confirm the project website.
- Confirm the main repository or organization.
- Prefer canonical upstream URLs over aggregator or mirror links.

### 3. Assess license posture

- Capture SPDX-style license values when available.
- Set `license_model` based on the real procurement posture, not just the repo license.
- Add `licensing_concerns` if there is enterprise packaging, commercial support dependency, or unclear reuse rights.

### 4. Map GovStack function

- Assign one or more `govstack_building_blocks` from the controlled schema enum.
- Use `govstack_notes` to explain whether the project is marketplace-listed or only functionally mapped.
- Set `govstack_compliance_level` only when there is a defensible basis for doing so.

### 5. Add or update steward organization

- Ensure each curated project has a valid `steward_organizations` reference.
- Add the steward organization to the manual organizations dataset if it is missing.
- Keep the organization type pragmatic: `nonprofit`, `government`, `company`, `consortium`, `public-enterprise`, and similar existing patterns are acceptable.

### 6. Record provenance

- Add provenance entries when the source materially supports the GovStack classification or license posture.
- Use provenance notes to explain why a project is marked `mixed`, `proprietary`, or `unknown`.

### 7. Regenerate and validate

Run:

```bash
SKIP_GITHUB_ENRICHMENT=true npm run ingest
npm run validate:data
npm run format
npm run check
npm run build
```

This ensures the curated GovStack changes survive schema validation, semantic validation, formatting checks, and the Astro build.

## Files Usually Touched

- [data/manual/projects.yml](../data/manual/projects.yml)
- [data/manual/organizations.yml](../data/manual/organizations.yml)
- [data/processed/atlas.json](../data/processed/atlas.json)
- [public/api/atlas.json](../public/api/atlas.json)
- [public/api/projects.json](../public/api/projects.json)
- [public/api/organizations.json](../public/api/organizations.json)
- [public/api/search-index.json](../public/api/search-index.json)

Depending on the project metadata, other generated API artifacts may change too.

## When To Build An Importer

A GovStack importer becomes worth building only if the marketplace exposes stable structured metadata for:

- canonical project names
- project URLs
- repository URLs
- declared licenses
- building-block mappings
- listing status and versioning

Until then, manual curation is safer because it prevents the Atlas from overstating open-source availability or hiding procurement risks.

## Review Checklist

Before merging a GovStack curation pass, confirm all of the following:

- every new project has a valid steward organization
- every new URL passes schema validation
- `license_model` matches the real procurement posture
- `licensing_concerns` is populated when the software is not straightforward open-source
- `govstack_notes` explains whether the record is marketplace-listed or only functionally mapped
- generated data and static API files were regenerated
- `npm run validate:data`, `npm run check`, and `npm run build` pass
