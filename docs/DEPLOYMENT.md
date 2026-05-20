# Deployment Guide

## Supported Targets

The Atlas is designed for static-first deployment.

Primary targets:

- GitHub Pages
- Cloudflare Pages

The generated site and API do not require a persistent application server.

---

## Build Prerequisites

Required locally and in CI:

- Node.js 20+
- npm

Install dependencies:

```bash
npm ci
```

---

## Local Validation Before Deploy

Recommended sequence:

```bash
SKIP_GITHUB_ENRICHMENT=true npm run ingest
npm run validate:data
npm run build
```

This path validates:

- manual data loading
- processed dataset generation
- schema and semantic validation
- Astro static build output

---

## GitHub Pages

This repository already includes a deployment workflow:

- [deploy.yml](../.github/workflows/deploy.yml)

Current behavior:

- builds on pushes to `main`
- can also deploy after the monthly data update workflow completes
- uploads the `dist/` artifact to GitHub Pages

Required repository settings:

- enable GitHub Pages
- source should be GitHub Actions
- ensure workflow permissions allow Pages deployment

---

## Monthly Data Publishing

The monthly update workflow is defined in:

- [monthly-update.yml](../.github/workflows/monthly-update.yml)

Current behavior:

- runs on a monthly cron schedule
- supports manual dispatch
- runs the ingestion pipeline
- validates the dataset
- commits updated processed data and API files

If GitHub API enrichment is needed, provide:

- `ATLAS_GITHUB_TOKEN`

Fallback behavior:

- builds can still proceed with `SKIP_GITHUB_ENRICHMENT=true`

---

## Cloudflare Pages

The site can also be deployed as a static Astro output on Cloudflare Pages.

Suggested settings:

- build command: `npm run build`
- output directory: `dist`
- Node version: `20`

If you want pre-generation during the build step, use:

```bash
SKIP_GITHUB_ENRICHMENT=true npm run ingest && npm run build
```

---

## Deployment Artifacts

Important outputs:

- `dist/` — static website
- `data/processed/atlas.json` — canonical processed dataset
- `public/api/` — published API exports

---

## Operational Notes

For stable public-interest hosting:

- prefer immutable caching for hashed assets
- keep API exports cacheable at the CDN edge
- avoid runtime secrets in the frontend
- schedule enrichment in CI rather than on request
- review monthly update logs for API failures and partial refreshes

---

## Troubleshooting

### Validation fails before build

Run:

```bash
npm run validate:data
```

Check:

- relationship targets exist
- deployment project IDs resolve
- manual YAML is parseable

### GitHub Pages build succeeds but no data updates appear

Check whether the monthly update workflow committed new `data/processed/` and `public/api/` outputs.

### GitHub enrichment fails

Use:

```bash
SKIP_GITHUB_ENRICHMENT=true npm run ingest
```

Then investigate token scope or rate limiting separately.
