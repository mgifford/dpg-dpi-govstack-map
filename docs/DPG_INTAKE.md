# DPG Intake Workflow

## Purpose

This document describes how the Atlas handles Digital Public Goods intake, including projects associated with the Digital Public Goods Registry and the broader Digital Public Goods Alliance ecosystem.

The current model is different from GovStack:

- the DPG registry has a live API that can be imported automatically
- the imported data still requires review because registry metadata can be incomplete or uneven
- there is no single comprehensive, authoritative list of all open-source DPI software beyond the DPG registry and selected ecosystem-specific sources

This means the Atlas should treat the DPG registry as the primary intake source, not as the only source of truth.

## Current Intake Model

The Atlas currently uses a two-layer DPG intake process.

### Layer 1: automated registry intake

The script in [scripts/ingest-dpg.ts](../scripts/ingest-dpg.ts) imports the live DPG registry API and maps it into Atlas projects and steward organizations.

This gives the project a scalable baseline for:

- canonical project names
- registry URLs
- source URLs
- declared open licenses
- deployment countries
- declared standards
- owner metadata

### Layer 2: manual curation

Manual curation is still required because the registry data can contain:

- incomplete or missing repository URLs
- inconsistent documentation links
- owner names that need normalization
- weak deployment evidence
- limited or missing interoperability and procurement context
- entries that may be open in principle but still need local review before being treated as strong open-source exemplars

Manual curation is also how the Atlas captures DPI-adjacent software that matters to the ecosystem but is not part of the live DPG registry import.

## Source Hierarchy

There is no single master list of all software associated with DPI that the Atlas can rely on.

The practical source hierarchy is:

1. Digital Public Goods Registry API for baseline DPG discovery
2. official project website
3. official public source repository or organization
4. official technical documentation
5. ecosystem-specific software lists and project catalogues such as GovStack, MOSIP, Mojaloop, OpenHIE-related project lists, and other well-scoped domain registries
6. manual contributor research when the above are incomplete

The Atlas should not treat broad marketing pages or vendor directories as authoritative evidence of open-source status.

## Open-Source Filter

The Atlas is intentionally biased toward open-source DPI software.

Use these rules:

- include projects with public source repositories and recognizable open licenses
- keep `license_model` aligned with the real procurement posture, not just one metadata field
- be conservative when the source exists but the marketed product is heavily commercialized or partly closed
- avoid adding clearly proprietary tools as first-class Atlas entries unless there is a specific comparison reason and the licensing caveat is explicit

In practice, that means the DPG registry is useful because it already signals public-good intent, but the Atlas should still verify that a project is genuinely usable as open-source public infrastructure.

## Classification Rules

Use the same `license_model` values defined in [src/lib/schema.ts](../src/lib/schema.ts):

- `open-source`: public repository plus a recognizable open license with no immediate evidence that the usable product is primarily closed
- `mixed`: open-source core exists, but important platform tiers, support dependencies, or distribution constraints create procurement ambiguity
- `source-available`: source is public but the license is not a conventional open-source license
- `proprietary`: no public source or licensing terms clearly indicate closed distribution
- `unknown`: evidence is too weak to classify safely

When the goal is to highlight open-source tools, prefer omission over overclaiming.

## Intake Steps

### 1. Start with the DPG registry

- use the live registry import as the baseline
- inspect the imported record before making manual changes
- prefer fixing importer logic if the issue affects many DPG entries

### 2. Verify source and license evidence

- confirm the upstream project website
- confirm the public repository URL or organization
- normalize declared licenses where possible
- downgrade the effective `license_model` when procurement reality is less open than the raw registry metadata suggests

### 3. Review whether the project belongs in the Atlas

- keep projects that are clearly open-source and relevant to DPI or supporting public digital infrastructure
- consider excluding or down-ranking entries that are weakly documented, unclear, or effectively proprietary
- record caveats in provenance or licensing notes rather than silently treating uncertain records as clean open-source infrastructure

### 4. Add missing context manually

Use the manual datasets when you need to add:

- steward organization normalization
- related projects
- deployments
- ecosystem relationships
- GovStack building-block mappings
- procurement notes
- licensing concerns

### 5. Use ecosystem-specific lists carefully

If you need DPI software outside the DPG registry, use targeted ecosystem lists rather than a generic DPI software sweep.

Good candidates include:

- GovStack software marketplace
- MOSIP ecosystem references
- Mojaloop ecosystem references
- OpenHIE-related project lists
- curated public-sector open-source programme lists

Each candidate still needs source and license verification before inclusion.

### 6. Regenerate and validate

Run:

```bash
SKIP_GITHUB_ENRICHMENT=true npm run ingest
npm run validate:data
npm run format
npm run check
npm run build
```

If the issue is broad and importer-related, update the ingest logic first. If it is record-specific, update the manual data layer.

## Files Usually Touched

- [scripts/ingest-dpg.ts](../scripts/ingest-dpg.ts)
- [scripts/run-monthly-update.ts](../scripts/run-monthly-update.ts)
- [data/manual/projects.yml](../data/manual/projects.yml)
- [data/manual/organizations.yml](../data/manual/organizations.yml)
- [data/manual/relationships.yml](../data/manual/relationships.yml)
- [data/processed/atlas.json](../data/processed/atlas.json)
- [public/api/atlas.json](../public/api/atlas.json)
- [public/api/projects.json](../public/api/projects.json)

## Practical Answer To "What List Can We Lean On?"

Right now, the best list to lean on is the Digital Public Goods Registry for DPG discovery.

Beyond that, there is no single definitive list of all DPI-associated software that is both broad and reliably open-source.

The safer operating model is:

1. use the DPG registry as the default source of candidates
2. use domain-specific ecosystem lists to fill known gaps
3. verify public source and licensing before inclusion
4. avoid treating proprietary or weakly evidenced tools as equivalent to open-source DPI building blocks

## Review Checklist

Before merging DPG intake work, confirm all of the following:

- importer changes are used only when the problem affects many DPG records
- manual data is used for record-specific fixes and additions
- every retained project has acceptable source and license evidence
- clearly proprietary tools are excluded or explicitly caveated
- steward organizations resolve correctly in semantic validation
- `npm run validate:data`, `npm run check`, and `npm run build` pass
