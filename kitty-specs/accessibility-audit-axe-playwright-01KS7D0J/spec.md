# Accessibility Audit: Axe + Playwright Only

## Problem

The repository still runs an accessibility workflow that combines Playwright axe scans with `pa11y`, even though the project already has a Playwright-based axe audit script and the intended direction is to scan the small set of site pages with axe rather than `pa11y`.

That mismatch creates two problems:

- the workflow does not match the current preferred audit method
- accessibility failures remain harder to triage because the repo is splitting responsibility between two different tools

The next change should make Playwright axe the single accessibility scan path for the selected pages and then address any real violations that scan reports.

## Scope

This mission covers:

- removing `pa11y` from the accessibility workflow and aggregate audit command
- keeping or refining the Playwright axe scan as the canonical accessibility audit path
- running the axe scan against the current set of key pages
- fixing accessibility issues reported by that scan in the affected pages, layouts, or components
- keeping validation and CI aligned with the new audit path

## Non-goals

This mission does not include:

- replacing Lighthouse or link checks
- broad visual redesign work unrelated to accessibility failures
- unrelated data ingestion, schema, or enrichment changes
- introducing a larger end-to-end browser test suite beyond the focused axe scan already used here

## Acceptance criteria

1. The accessibility GitHub Actions workflow no longer runs `pa11y` and instead relies on the Playwright axe scan for page-level accessibility testing.
2. The aggregate local audit workflow no longer depends on `audit:pa11y`.
3. The repo keeps a clear, reviewable list of pages scanned by Playwright axe.
4. Running the local axe audit against the built site succeeds for the selected page set, or any remaining failures are resolved within this mission.
5. Any accessibility fixes made to satisfy the axe scan preserve existing page behavior and keep the site build green.

## Affected files and systems

- `.github/workflows/audits.yml`
- `package.json`
- `scripts/audit/axe.mjs`
- `src/layouts/`
- `src/components/`
- `src/pages/`
- any small supporting documentation updates if the audit workflow description changes

## Constraints

- Prefer the smallest change that makes axe + Playwright the single accessibility scan path.
- Keep the audit focused on the current small set of public pages rather than attempting exhaustive route crawling.
- Fix issues at the responsible component or layout layer when possible instead of papering over them in the audit script.
- Do not commit `data/raw/` cache artifacts.

## Validation

- `npm run format`
- `npm run check`
- `npm run build`
- `npm run audit:axe`

## Open questions

- Whether `audit:pa11y` should be removed entirely from `package.json` dependencies in this mission or only disconnected from workflows.
- Whether the current route list in `scripts/audit/axe.mjs` needs adjustment after the first local scan.
