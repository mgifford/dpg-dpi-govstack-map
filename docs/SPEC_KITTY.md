# Spec-Kitty Workflow

This repository is moving to spec-driven development for non-trivial changes.

The goal is simple: write and review the specification before implementation, then use that specification to drive planning, tasking, implementation, review, and merge.

Primary documentation:

- https://docs.spec-kitty.ai/
- https://docs.spec-kitty.ai/how-to/install-spec-kitty.html
- https://docs.spec-kitty.ai/explanation/spec-driven-development.html

## Why this repo is adopting Spec-Kitty

This Atlas already has a few characteristics that benefit from spec-first work:

- data model changes can ripple through ingestion, validation, generated artifacts, and UI pages
- accessibility changes need explicit acceptance criteria rather than vague visual intent
- ecosystem intake work often combines policy decisions, source evaluation, and code changes
- AI-assisted implementation works better when the requirements are explicit and reviewable

For those reasons, new feature work should start with a written spec instead of jumping straight to code.

## Install Spec-Kitty

The recommended install path from the Spec-Kitty docs is:

```bash
pipx install spec-kitty-cli
pipx ensurepath
spec-kitty --version
```

Alternative install paths are documented at https://docs.spec-kitty.ai/how-to/install-spec-kitty.html.

## Add Spec-Kitty to this repository

From the repository root:

```bash
spec-kitty init . --ai copilot
```

That scaffolds the local `.kittify/` workflow assets for this repository without rewriting Git history.

Review any ignore-file changes after init, especially if agent-specific directories are added.

## Default workflow for new work

Use this flow for feature work, architectural changes, accessibility fixes that affect multiple pages, ingestion changes, and schema changes.

### 1. Specify

Create the feature spec first.

Use the Spec-Kitty specify command from your agent environment.

The spec should include:

- problem statement
- scope and non-goals
- acceptance criteria
- affected data files, scripts, pages, and generated outputs
- validation steps such as `npm run validate:data`, `npm run check`, `npm run build`, or targeted audits

### 2. Plan

Generate an implementation plan from the approved spec.

The plan should identify:

- data model changes
- ingestion or enrichment changes
- generated artifact changes
- frontend and accessibility impact
- validation and rollout steps

### 3. Tasks

Break the plan into work packages.

Prefer work packages that are independently reviewable, for example:

- schema and validation updates
- ingestion or enrichment updates
- generated dataset updates
- frontend rendering or accessibility fixes
- documentation and workflow updates

### 4. Implement

Run the implementation loop against the approved mission and work packages.

Keep each implementation slice tied back to the original spec and its acceptance criteria.

### 5. Review and accept

Before merging, confirm that the delivered work still matches the spec and that validation passed.

This repo's normal acceptance checks usually include some combination of:

- `npm run validate:data`
- `npm run check`
- `npm run build`
- `npm test`
- `npm run audit:axe`

## What should use Spec-Kitty here

Use Spec-Kitty by default for:

- new ingestion sources
- schema changes
- accessibility remediation across shared layouts or components
- new pages or navigation changes
- major data curation workflows
- CI or deployment workflow changes

You can skip the full spec cycle for:

- obvious typo fixes
- isolated copy edits
- narrow one-line bug fixes with clear local behavior
- generated-file refreshes that do not change behavior

## Repository-specific guidance

- Treat `data/manual/*.yml` as the authoritative curated source for manual records.
- Treat `data/processed/atlas.json` and `public/api/*` as generated outputs unless the task is explicitly about debugging generated artifacts.
- Put accessibility acceptance criteria directly into the spec when touching `src/components/`, `src/pages/`, or `src/layouts/`.
- Put data validation and regeneration steps directly into the plan when touching `scripts/`, `data/manual/`, or `src/lib/schema.ts`.
- Keep the spec honest about whether GitHub or GitLab enrichment is expected to run live during validation.

## Minimum spec template for this repo

Use at least this structure:

```md
# Change Title

## Problem

## Scope

## Non-goals

## Acceptance criteria

## Affected files and systems

## Validation
```

That is enough to make the implementation auditable and easier to hand off across contributors or AI agents.
