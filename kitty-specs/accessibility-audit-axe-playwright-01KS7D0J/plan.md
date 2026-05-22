# Implementation Plan: Accessibility Audit: Axe + Playwright Only

**Branch**: `main` | **Date**: 2026-05-22 | **Spec**: `kitty-specs/accessibility-audit-axe-playwright-01KS7D0J/spec.md`
**Input**: Feature specification from `/kitty-specs/accessibility-audit-axe-playwright-01KS7D0J/spec.md`

## Summary

Replace the mixed accessibility audit path with a single Playwright axe workflow, run that audit against the selected public pages, and fix any accessibility regressions it identifies in the responsible workflow, layout, page, or component layer.

## Technical Context

**Language/Version**: TypeScript, Astro 6, Node 22  
**Primary Dependencies**: Astro, Playwright, `@axe-core/playwright`, start-server-and-test  
**Storage**: N/A  
**Testing**: `npm run check`, `npm run build`, `npm run audit:axe`, targeted workflow validation  
**Target Platform**: Static website built in CI on Linux and used locally on Linux/macOS  
**Project Type**: Static web application  
**Performance Goals**: Keep the audit focused on a small explicit route set and avoid introducing heavier browser-test overhead than the current Playwright axe scan  
**Constraints**: Minimal diff, preserve existing public site behavior, keep accessibility checks reviewable in CI, do not commit `data/raw/`  
**Scale/Scope**: One audit workflow, one audit script, and the core public routes currently listed in `scripts/audit/axe.mjs`

## Charter Check

- Charter exists and is generated.
- Testing approach is project-declared via repo commands rather than external defaults.
- Quality gate remains focused on explicit repo validations before merge.
- No charter violations identified for this mission.

## Implementation slices

1. Audit workflow alignment
   Update `.github/workflows/audits.yml` and `package.json` so Playwright axe is the only accessibility scan path and `audit:site` no longer invokes `pa11y`.

2. Axe scan validation
   Run the Playwright axe scan against the built preview site and capture the actual failing routes and rule IDs.

3. Local remediation
   Fix accessibility issues in the responsible `src/layouts/`, `src/components/`, or `src/pages/` files rather than weakening the audit.

4. Final validation
   Re-run `npm run check`, `npm run build`, and `npm run audit:axe` to confirm the new audit path and the targeted fixes hold together.

## Project Structure

### Documentation (this feature)

```
kitty-specs/accessibility-audit-axe-playwright-01KS7D0J/
├── spec.md
├── plan.md
├── meta.json
└── tasks/
```

### Source Code (repository root)

```
.github/workflows/
└── audits.yml

scripts/audit/
└── axe.mjs

src/
├── layouts/
├── components/
└── pages/

package.json
```

**Structure Decision**: This mission is a single static-web repo change centered on one workflow file, one audit script, package scripts, and any directly affected Astro UI files.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| None      | N/A        | N/A                                  |
