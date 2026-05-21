# OpenHIE Intake Workflow

## Purpose

This document describes how the Atlas should handle OpenHIE-aligned software and related digital health interoperability relationships.

OpenHIE is not a single product catalogue. It is a health information exchange community and architectural framework. That means the Atlas should model OpenHIE as an ecosystem reference point and connect projects to it only when that alignment is defensible.

This workflow also helps keep OpenHIE distinct from adjacent standards and communities such as openEHR, FHIR, and HL7.

## Current Model

The Atlas currently treats OpenHIE as a framework or standards-layer node rather than as a project.

That is the right default because OpenHIE is most useful here as:

- a way to group related digital health infrastructure projects
- a graph anchor for health interoperability patterns
- an architectural context for national digital health stacks

Projects should connect to OpenHIE when they are commonly used within OpenHIE-style architectures or explicitly position themselves that way in documentation, implementation guidance, or ecosystem materials.

## What Counts As OpenHIE Alignment

A project is a good OpenHIE candidate when one or more of the following is true:

- it explicitly references OpenHIE in documentation or implementation guidance
- it is widely deployed as part of national or regional OpenHIE-style health architectures
- it occupies a recognizable functional role in OpenHIE reference patterns such as clinical records, HMIS, LMIS, laboratory, frontline workflows, interoperability, or messaging

Do not attach projects to OpenHIE merely because they are health-related.

## Relationship To OpenEHR

OpenEHR is related but not interchangeable with OpenHIE.

- OpenHIE is a community and architecture layer for health information exchange
- openEHR is a standards and modeling community focused on computable electronic health records

In the Atlas, these should usually be modeled as separate framework or standards nodes.

Use a relationship between them only when you want to show architectural compatibility or adjacent ecosystem relevance. Do not assume every OpenHIE-aligned project is therefore openEHR-aligned.

## Open-Source Filter

The Atlas should continue to highlight open-source digital health infrastructure.

Use these rules:

- prefer projects with a public repository and recognizable open license
- classify mixed or unclear offerings conservatively
- avoid treating proprietary digital health products as normal OpenHIE ecosystem entries
- add caveats when source visibility or procurement posture is unclear

## Evidence Sources

Preferred evidence, in order:

1. official project documentation
2. official implementation guidance or architecture materials
3. official project repository and metadata
4. recognized OpenHIE ecosystem references
5. public deployment evidence from ministries, programmes, or implementation partners

Do not infer OpenHIE participation from generic health interoperability claims alone.

## Intake Steps

### 1. Confirm project identity

- verify the canonical project name
- verify the project website and repository
- verify that the project already exists in the Atlas or should be added first through DPG or broader DPI intake

### 2. Confirm OpenHIE alignment

- check whether the project explicitly references OpenHIE or clearly occupies an OpenHIE-style role
- use existing interoperability metadata where possible
- prefer conservative `participates_in` or `aligned_with` edges over stronger claims unless evidence is unusually clear

### 3. Keep standards separate

- use OpenHIE as a framework node
- use FHIR, HL7, and openEHR as separate standards or framework nodes when needed
- avoid collapsing architecture frameworks and standards into the same concept

### 4. Add relationships carefully

Common safe relationship types include:

- `participates_in` from a project to `openhie`
- `aligned_with` between related frameworks or standards nodes
- project-to-project `integrates_with` or `aligned_with` edges when the deployment or architectural relationship is already established

### 5. Regenerate and validate

Run:

```bash
SKIP_GITHUB_ENRICHMENT=true npm run ingest
npm run validate:data
npm run format
npm run check
npm run build
```

## Files Usually Touched

- [data/manual/standards.yml](../data/manual/standards.yml)
- [data/manual/organizations.yml](../data/manual/organizations.yml)
- [data/manual/relationships.yml](../data/manual/relationships.yml)
- [data/manual/projects.yml](../data/manual/projects.yml)
- [data/processed/atlas.json](../data/processed/atlas.json)
- [public/api/graph.json](../public/api/graph.json)
- [public/api/relationships.json](../public/api/relationships.json)

## When To Build More Automation

An OpenHIE-specific importer only makes sense if there is a stable, structured, public project catalogue that clearly distinguishes:

- project identity
- public source repositories
- licensing
- ecosystem role

Until then, manual curation is the safer choice.

## Review Checklist

Before merging OpenHIE intake work, confirm all of the following:

- the project has defensible OpenHIE alignment, not just generic health relevance
- repository and license evidence are acceptable for open-source inclusion
- OpenHIE and openEHR are modeled separately unless there is a clear reason to connect them
- framework and standards nodes resolve cleanly in semantic validation
- `npm run validate:data`, `npm run check`, and `npm run build` pass
