# Sustainability Statement

## Position

The Digital Public Infrastructure Ecosystem Atlas is designed for long-term stewardship on modest infrastructure.

This project treats sustainability in two ways:
- sustainability of the platform itself
- sustainability maturity of the ecosystems it documents

---

## Platform Sustainability Practices

The current implementation favors:
- static site generation with Astro
- version-controlled structured data
- pre-generated API artifacts in `public/api/`
- minimal runtime JavaScript for core content
- progressive enhancement instead of SPA-style client dependence
- hosting on low-overhead static platforms such as GitHub Pages and Cloudflare Pages

These choices reduce:
- server complexity
- background compute usage
- operational cost
- long-term maintenance risk

---

## Data Pipeline Sustainability

The Atlas pipeline is designed to push work out of the request path and into scheduled generation.

Current practices:
- monthly batch updates rather than live scraping on page load
- build-time search index generation
- build-time dataset generation
- static data export for offline or low-bandwidth use
- optional skipping of GitHub enrichment in CI and local runs

---

## Frontend Sustainability

The frontend aims to minimize waste by:
- rendering core content as HTML at build time
- using tables and lists as primary interfaces
- limiting expensive visualizations to targeted pages
- avoiding autoplay media and unnecessary third-party scripts
- allowing content discovery without JavaScript where feasible

---

## Sustainability Maturity in the Dataset

The Atlas also scores projects for sustainability maturity.

This is intentionally broader than popularity or stars. It should consider:
- steward capacity
- maintainer resilience
- funding continuity
- support ecosystem depth
- documentation quality
- procurement viability
- institutional backing

Current model support exists in:
- `maturity_scores.sustainability`
- `maturity_scores.stewardship`
- `sustainability_maturity`
- `procurement_readiness`

---

## Future Sustainability Work

Planned improvements include:
- explicit page-weight measurement in CI
- automated Lighthouse performance and accessibility budgets
- clearer documentation of visualization loading strategies
- more rigorous dependency footprint review
- optional offline packaging guidance for public-sector research use

---

## Operational Guidance

Preferred deployment characteristics:
- static hosting
- CDN caching
- compressed text assets
- image optimization where applicable
- no unnecessary telemetry or tracking scripts

The project should remain usable for:
- low-bandwidth environments
- older institutional hardware
- constrained government hosting environments
- archival and offline research workflows
