# Accessibility Statement

## Commitment

The Digital Public Infrastructure Ecosystem Atlas is designed as an accessibility-first public-interest platform.

Target conformance:

- WCAG 2.2 AA minimum
- AAA where feasible for content and interaction design

Accessibility is treated as a platform requirement, not a polish task.

---

## Design Principles

The Atlas prioritizes:

- keyboard-first interaction
- semantic HTML before ARIA
- table and list alternatives for every visualization
- progressive enhancement over JavaScript dependence
- reduced-motion support
- support for high contrast and dark mode
- readable layouts at 400% zoom
- avoiding hover-only and map-only workflows

---

## Current Accessibility Patterns

Implemented patterns in the current codebase include:

- skip link in the base layout
- semantic landmark structure in the site shell
- visible focus styles
- reduced-motion support in global styles
- dark mode and forced-colors support in global styles
- map page backed by tabular deployment data
- compare page backed by plain HTML tables
- organization, project, and deployment pages rendered as server-generated content

Relevant implementation files:

- [src/layouts/Base.astro](../src/layouts/Base.astro)
- [src/styles/global.css](../src/styles/global.css)
- [src/pages/map.astro](../src/pages/map.astro)
- [src/pages/compare.astro](../src/pages/compare.astro)

---

## Map Accessibility

The map is not the primary interface.

Every map workflow should also be available through:

- structured tables
- linked lists
- search-first navigation
- keyboard-accessible page routes
- downloadable data

Current approach:

- map view for exploration
- deployment and organization tables as non-visual alternatives
- semantic link-based drill-down to projects and organizations

Future hardening work:

- explicit keyboard panning and zoom shortcuts
- more robust marker navigation patterns
- richer accessible summaries for filtered map states

---

## Testing Strategy

Accessibility testing should combine automated and manual checks.

### Automated

Planned/required automated coverage:

- axe-core checks against key routes
- pa11y checks against built pages
- Lighthouse accessibility audits
- build-time validation to ensure accessible fallbacks remain published

### Manual

Manual review should include:

- keyboard-only navigation across all primary routes
- screen reader review with NVDA, VoiceOver, or Orca where available
- zoom testing to 200% and 400%
- reduced-motion verification
- high contrast and forced-colors review
- mobile touch testing

---

## Recommended Manual Test Routes

Run manual checks on at least:

- `/`
- `/projects/`
- `/projects/[id]`
- `/organizations/`
- `/compare/`
- `/map/`
- `/graph/`
- `/deployments/`
- `/standards/`
- `/accessibility/`

---

## Keyboard Testing Guidance

Verify that users can:

- reach the skip link immediately on page load
- navigate primary navigation and footer links
- activate filters and links without pointer input
- read comparison tables cell by cell
- reach map alternatives without entering the map widget
- complete core discovery tasks from search/list/table views alone

---

## Screen Reader Testing Guidance

Verify that:

- page titles are descriptive
- heading hierarchy is coherent
- tables have meaningful headers
- meters and score bars expose readable values
- links make sense out of context
- dynamic UI does not hide essential content from assistive technology

---

## Reporting Accessibility Issues

When filing an issue, include:

- affected page or route
- browser and operating system
- assistive technology, if relevant
- exact steps to reproduce
- expected behavior
- observed behavior
- WCAG success criterion if known

Accessibility issues should be treated as product defects, not enhancements.
