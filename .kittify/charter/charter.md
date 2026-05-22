# Project DPG-DPI-GovStack Charter

Effective: 2026-05-22
Last Updated: 2026-05-22

## What is Project DPG-DPI-GovStack?

The Digital Public Infrastructure Ecosystem Atlas is a public-interest, open source registry and research platform for Digital Public Infrastructure, Digital Public Goods, GovStack-aligned systems, and related open standards ecosystems.

It exists to help governments, implementers, researchers, funders, standards bodies, and ecosystem stewards discover and evaluate open-source public-interest technology through accessible interfaces, structured data, and transparent curation workflows.

## Vision

Create a durable, accessible, and evidence-based atlas of public-interest digital infrastructure that helps people understand how open-source DPI ecosystems relate to one another, where they are deployed, how they are governed, and how sustainable they appear to be over time.

## Mission

- publish a trustworthy, reviewable, and openly reusable atlas of DPI, DPG, GovStack, and adjacent ecosystems
- prioritize verifiable open-source tools over proprietary marketplace noise
- make discovery accessible through searchable, navigable, WCAG-aligned interfaces and static public datasets
- support long-term stewardship with documented intake workflows, transparent enrichment logic, and reproducible builds
- use spec-driven development for non-trivial changes so requirements, plans, tasks, implementation, and review stay aligned

## Primary Stakeholders

| Stakeholder                      | Role                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------- |
| Public-interest researchers      | Use the atlas for ecosystem analysis, benchmarking, and evidence gathering                  |
| Governments and implementers     | Discover and compare open-source DPI options for procurement and deployment                 |
| Standards and ecosystem stewards | Understand interoperability, participation, and adjacent software landscapes                |
| Contributors and maintainers     | Curate data, improve ingestion, strengthen accessibility, and maintain publishing workflows |
| Funders and policy actors        | Review ecosystem maturity, sustainability, and governance signals                           |

## Constitution v1 (Normative)

This constitution defines the non-negotiable engineering and governance principles for specs, features, data changes, workflows, and operational updates in this repository.

Reference implementation method: https://docs.spec-kitty.ai/

### 1) Focused Scope and Mission Boundaries

- Every spec must declare what is in scope and out of scope.
- Changes should strengthen the atlas as a public-interest DPI/DPG/GovStack/OpenHIE registry rather than adding unrelated product goals.
- Work that only increases record count without improving evidence, usability, or stewardship value should be challenged.

### 2) Accessibility by Default

- User-facing pages, audit workflows, documentation, and data access paths must preserve WCAG-oriented accessibility expectations.
- Map-only or pointer-only workflows are not acceptable without equivalent accessible alternatives.
- Any accessibility regression requires a documented exception, rationale, owner, and expiry condition.

### 3) Evidence-Based Data Stewardship

- Claims about projects, organizations, relationships, standards, and deployments must be grounded in public evidence or explicit curation rationale.
- Manual source files are authoritative for curated records and generated artifacts must be reproducible from the documented pipeline.
- Proprietary or weakly evidenced software should not be normalized as open-source DPI without clear justification.

### 4) Self-Correcting Delivery

- Every non-trivial change must include concrete validation signals such as schema checks, build checks, targeted tests, or audit results.
- Regressions should feed back into the relevant spec, workflow, documentation, or validation step.
- Specs, plans, tasks, implementation, and review artifacts must remain consistent.

### 5) Sustainable and Maintainable Operation

- Prefer maintainable designs, clear source hierarchies, and explicit data provenance over one-off shortcuts.
- Generated files should stay generated, manual files should stay curated, and responsibilities between them must remain visible.
- New dependencies, new ingestion sources, and new workflow complexity require a clear maintenance case.

### 6) Performance and Static-Site Discipline

- Prefer static generation, low-JavaScript delivery, and bounded audit scope.
- Expensive enrichment or audit work should be justified by measurable ecosystem or accessibility benefit.
- The project should favor predictable CI and local workflows over fragile or over-broad automation.

### 7) Open and Reviewable Governance

- Major changes should be reviewable in pull requests with transparent rationale.
- Governance should remain maintainer-led but contributor-visible, with documented workflows for intake, audit, and schema evolution.
- Exceptions to normal policy must be explicit and temporary.

## Testing Standards

- Data changes must validate with `npm run validate:data` when they touch the atlas dataset, schema, or manual sources.
- UI and build changes must validate with `npm run check` and `npm run build`.
- Accessibility workflow changes should validate with `npm run audit:axe` when applicable.
- Use the smallest relevant validation first, then rerun the broader required checks before merge.

## Quality Gates

- Required formatting: `npm run format`
- Required Astro/type validation for application changes: `npm run check`
- Required build validation for shipped behavior changes: `npm run build`
- Required data validation for curation, schema, ingestion, or generated dataset changes: `npm run validate:data`
- Required accessibility validation for relevant UI and audit workflow changes: `npm run audit:axe`
- At least one focused reviewer should approve before merge.

## Performance Benchmarks

- CLI and validation commands should remain practical for normal contributor workflows.
- Audit coverage should stay focused on the explicit public page set rather than uncontrolled crawling.
- Static builds and publishing workflows should favor determinism and reproducibility over maximal runtime dynamism.

## Branch Strategy

- Planning artifacts may begin on `main`, but completed feature changes must remain reviewable and merge cleanly back to `main`.
- Non-trivial changes should start with the Spec-Kitty workflow and preserve clear linkage between spec, plan, tasks, and implementation.
- Developer workflows must remain usable on Linux and macOS environments.

## Governance Activation

```yaml
mission: software-dev
selected_paradigms: []
selected_directives: []
available_tools: [git, spec-kitty]
template_set: software-dev-default
```

## Repository Roles

- Maintainers: review and merge changes, curate governance direction, and keep workflows operational.
- Contributors: propose specs, improve code and data, and supply evidence-backed curation changes.
- Reviewers: check charter alignment, validation quality, accessibility impact, and stewardship risk.

## Atlas-Specific Use Cases

- Should a candidate project be included as open-source DPI, tracked as mixed, or excluded as proprietary?
- How should a project relate to GovStack, DPG, OpenHIE, openEHR, or standards nodes in the graph?
- What validation should accompany a schema, ingestion, or enrichment change?
- How should accessibility regressions be detected and fixed in the static site and audit workflows?
- When should a curated ecosystem source remain manual versus becoming a dedicated importer?

## Policy Summary

- Intent: Deliver an accessible, evidence-based, and maintainable atlas of public-interest digital infrastructure.
- Languages/Frameworks: Use the repository's declared Node, Astro, TypeScript, and supporting toolchain unless explicitly changed by spec.
- Testing: Run the repo validations appropriate to the change, with explicit emphasis on data validation, build health, and accessibility audits.
- Quality Gates: Formatting, validation, build, and accessibility checks are part of the normal merge path when relevant.
- Review Policy: At least one focused reviewer approves before merge.
- Performance Targets: Keep static generation, audit scope, and contributor workflows practical.
- Deployment Constraints: Changes must continue to work in Linux/macOS developer environments and the existing GitHub-based publishing flow.

## Project Directives

1. Keep specification, plan, tasks, implementation, and review artifacts consistent.
2. Prefer open-source, evidence-backed inclusion criteria over marketplace-style breadth.
3. Treat `data/manual/*.yml` as curated authority and generated outputs as reproducible artifacts.
4. Preserve accessible alternatives for all primary user-facing workflows.

## Reference Index

| Reference ID                        | Kind         | Summary                                                                            | Local Doc                                       |
| ----------------------------------- | ------------ | ---------------------------------------------------------------------------------- | ----------------------------------------------- |
| `USER:PROJECT_PROFILE`              | user_profile | Project-specific interview answers captured for charter compilation.               | `_LIBRARY/user-project-profile.md`              |
| `TEMPLATE_SET:software-dev-default` | template_set | Build high-quality software with structured workflows and test-driven development. | `_LIBRARY/template-set-software-dev-default.md` |

## Amendment Process

Amendments are proposed by pull request, reviewed in the open, and adopted when maintainers agree the updated charter better reflects the repo's actual governance and delivery rules.

## Exception Policy

Exceptions must include rationale, risk, owner, and expiry criteria.
