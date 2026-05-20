# Schema Reference

All data types are defined as Zod schemas in [`src/lib/schema.ts`](../src/lib/schema.ts) and exported as TypeScript types.

---

## AtlasDataset

The top-level data container, stored at `data/processed/atlas.json`.

| Field | Type | Description |
|---|---|---|
| `generated_at` | `string` (ISO 8601) | When this dataset was last generated |
| `version` | `string` | Dataset schema version |
| `sources` | `string[]` | List of data sources used in this build |
| `projects` | `Project[]` | All projects |
| `organizations` | `Organization[]` | All organizations |
| `people` | `Person[]` | Public persons (curated only) |
| `deployments` | `Deployment[]` | Known country deployments |
| `repositories` | `Repository[]` | Raw GitHub repository metadata snapshots |
| `relationships` | `Relationship[]` | Directional relationships between entities |

---

## Project

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique slug identifier |
| `name` | `string` | Display name |
| `description` | `string` | Plain-text description |
| `category` | `string` | Primary category (e.g., "Digital Identity", "Health") |
| `subcategory` | `string` | Secondary category |
| `project_type` | `string` | e.g., "DPG", "GovTech", "Civic Tech" |
| `tags` | `string[]` | Free-form tags |
| `website` | `string` | Official website URL |
| `project_page` | `string` | Registry page URL (e.g., DPG registry entry) |
| `repository_urls` | `string[]` | Source code repositories |
| `documentation_urls` | `string[]` | Documentation sites |
| `licenses` | `string[]` | SPDX license identifiers |
| `governance_model` | `string` | e.g., "foundation", "academic", "community" |
| `funding_model` | `string` | e.g., "grant", "government", "mixed" |
| `standards_alignment` | `string[]` | Aligned standards (e.g., "FHIR", "W3C DID") |
| `interoperability_frameworks` | `string[]` | Frameworks (e.g., "GovStack", "G2P Connect") |
| `deployment_countries` | `string[]` | Countries where deployed |
| `steward_organizations` | `string[]` | Primary stewards |
| `maintainers` | `string[]` | Named maintainer groups |
| `related_projects` | `string[]` | IDs of related projects |
| `sdgs` | `string[]` | Aligned SDGs (e.g., "SDG-3") |
| `dpi_domains` | `string[]` | DPI domains (e.g., "digital-identity", "health") |
| `maturity_level` | `emerging \| growing \| mature \| stagnant \| abandoned` | Computed from scores |
| `sustainability_score` | `number` (0–100) | Community and governance sustainability |
| `activity_score` | `number` (0–100) | Development activity level |
| `ecosystem_score` | `number` (0–100) | Ecosystem engagement breadth |
| `accessibility_score` | `number` (0–100) | Known accessibility maturity |
| `community_health` | `CommunityHealth` | Detailed health metrics (see below) |
| `last_updated` | `string` (ISO 8601) | Last data refresh |

### CommunityHealth

| Field | Type | Description |
|---|---|---|
| `commits_last_12_months` | `number` | Total commits in last 12 months |
| `contributors_last_12_months` | `number` | Unique contributors |
| `issue_closure_rate` | `number` (0–1) | closed / (open + closed) |
| `median_issue_response_hours` | `number` | Median hours to first response |
| `releases_last_12_months` | `number` | Tagged releases |
| `contributor_diversity_index` | `number` (0–1) | Concentration index (1 = fully distributed) |
| `governance_maturity` | `number` (0–100) | Governance docs, processes |
| `documentation_quality` | `number` (0–100) | Breadth and freshness of docs |
| `onboarding_quality` | `number` (0–100) | Contributing guides, good-first-issues |
| `dependency_freshness` | `number` (0–100) | Up-to-date dependencies |
| `security_advisories_open` | `number` | Open security advisories |
| `openssf_scorecard` | `number \| null` (0–10) | OpenSSF Scorecard result |

---

## Organization

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique slug |
| `name` | `string` | Display name |
| `type` | `string` | e.g., "academic", "ngo", "foundation", "government" |
| `website` | `string` | Website URL |
| `country` | `string` | HQ country |
| `city` | `string` | HQ city |
| `coordinates` | `{ lat: number, lon: number } \| null` | Geographic coordinates |
| `associated_projects` | `string[]` | Project IDs |
| `partnerships` | `string[]` | Partner org IDs |
| `funders` | `string[]` | Funder org IDs |
| `staff` | `string[]` | Person IDs |
| `github_org` | `string` | GitHub organization slug |
| `linkedin` | `string` | LinkedIn URL |
| `governance_role` | `string` | e.g., "steward", "funder", "implementer" |

---

## Deployment

| Field | Type | Description |
|---|---|---|
| `country` | `string` | Country name |
| `government` | `string` | Government entity name |
| `ministry` | `string` | Ministry or department |
| `project` | `string` | Project ID |
| `deployment_type` | `string` | e.g., "national", "pilot", "subnational" |
| `implementation_partner` | `string` | Implementing organization |
| `deployment_status` | `planned \| pilot \| active \| retired` | Current status |

---

## Repository

Snapshot of GitHub repository metadata (collected during enrichment).

| Field | Type | Description |
|---|---|---|
| `platform` | `"github"` | Currently only GitHub |
| `url` | `string` | Repository URL |
| `stars` | `number` | Star count |
| `forks` | `number` | Fork count |
| `watchers` | `number` | Watcher count |
| `contributors` | `number` | Contributor count |
| `open_issues` | `number` | Open issues |
| `closed_issues` | `number` | Closed issues |
| `releases` | `number` | Recent releases |
| `latest_release` | `string \| null` | Latest release tag |
| `latest_commit` | `string \| null` | Latest push date (ISO 8601) |
| `commit_frequency` | `number` | Average commits per week |
| `bus_factor` | `number` | Estimated bus factor |
| `governance_files` | `string[]` | Governance-related files present |
| `code_of_conduct` | `boolean` | Has CODE_OF_CONDUCT.md |
| `contributing_guidelines` | `boolean` | Has CONTRIBUTING.md |
| `security_policy` | `boolean` | Has SECURITY.md |

---

## Relationship

| Field | Type | Description |
|---|---|---|
| `source` | `string` | Source entity ID (project or org) |
| `target` | `string` | Target entity ID (project or org) |
| `type` | `RelationshipType` | Relationship type (see below) |
| `strength` | `number` (0–1) | Relationship strength |
| `evidence` | `string` | Source or description |

### RelationshipType values

`funded_by`, `integrates_with`, `implements`, `aligned_with`, `governed_by`, `maintained_by`, `deployed_in`, `used_by`, `sponsored_by`, `participates_in`

---

## DPI Domain Values (recommended)

`digital-identity` · `civil-registration` · `health` · `education` · `social-protection` · `digital-payments` · `data-infrastructure` · `interoperability` · `civic-participation` · `policy` · `climate`

---

## Maturity Level Definitions

| Value | Criteria |
|---|---|
| `mature` | Active development, strong governance, wide deployment, sustained community |
| `growing` | Active development, establishing governance and community |
| `emerging` | Early stage, limited deployment, community forming |
| `stagnant` | Minimal recent activity, governance unclear |
| `abandoned` | No meaningful activity for 12+ months |
