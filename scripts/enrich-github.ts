/**
 * Enrich projects with GitHub repository metadata.
 * Uses the GitHub REST API (unauthenticated by default; set GITHUB_TOKEN for higher rate limits).
 * Phase 2 prep: this module now emits repository snapshots that downstream enrichers can extend.
 */

import type { Project, Repository } from "../src/lib/schema.js";
import { fetchJsonWithCache } from "./lib/fetch.js";
import {
  calculateActivityScore,
  calculateSustainabilityScore,
  classifyMaturity
} from "./lib/score.js";

const GITHUB_API = "https://api.github.com";
const TIMEOUT_MS = 15_000;

interface ProjectEnrichmentResult {
  project: Project;
  repository: Repository | null;
}

interface GhRepo {
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  pushed_at: string | null;
}

interface GhCommitActivity {
  total: number;
}

interface GhContributor {
  login: string;
}

interface GhRelease {
  tag_name: string;
  published_at: string;
}

interface GhContentItem {
  name: string;
  type: string;
}

function githubHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const cacheKey = url
    .replace(/^https?:\/\/api\.github\.com\//, "")
    .replace(/[^a-zA-Z0-9/_-]+/g, "-")
    .replace(/-+/g, "-");

  const data = await fetchJsonWithCache<T>(url, {
    cacheKey: `github/${cacheKey}`,
    headers: githubHeaders(),
    timeoutMs: TIMEOUT_MS
  });

  if (!data) {
    console.warn(`[enrich-github] No live or cached response for ${url}`);
  }

  return data;
}

function ownerRepo(url: string): [string, string] | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (!match) return null;
  return [match[1], match[2]];
}

function mergeProvenance(project: Project, entries: Project["provenance"]): Project["provenance"] {
  const next = { ...project.provenance };
  for (const [field, values] of Object.entries(entries)) {
    next[field] = [...(next[field] ?? []), ...values];
  }
  return next;
}

export async function enrichWithGitHub(project: Project): Promise<ProjectEnrichmentResult> {
  const repoUrl = project.repository_urls.find((url) => url.includes("github.com"));
  if (!repoUrl) {
    return { project, repository: null };
  }

  const pair = ownerRepo(repoUrl);
  if (!pair) {
    return { project, repository: null };
  }

  const [owner, repo] = pair;
  const base = `${GITHUB_API}/repos/${owner}/${repo}`;

  const [ghRepo, commitActivity, contributors, releases, contents] = await Promise.all([
    fetchJson<GhRepo>(base),
    fetchJson<GhCommitActivity[]>(`${base}/stats/commit_activity`),
    fetchJson<GhContributor[]>(`${base}/contributors?per_page=100&anon=false`),
    fetchJson<GhRelease[]>(`${base}/releases?per_page=50`),
    fetchJson<GhContentItem[]>(`${base}/contents`)
  ]);

  if (!ghRepo) {
    return { project, repository: null };
  }

  const commitsLast12 = Array.isArray(commitActivity)
    ? commitActivity.slice(-52).reduce((sum, week) => sum + week.total, 0)
    : 0;
  const uniqueContributors = Array.isArray(contributors) ? contributors.length : 0;
  const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
  const recentReleases = Array.isArray(releases)
    ? releases.filter((release) => new Date(release.published_at).getTime() > oneYearAgo).length
    : 0;
  const latestRelease =
    Array.isArray(releases) && releases.length > 0 ? releases[0].tag_name : null;
  const busFactor = uniqueContributors > 10 ? 3 : uniqueContributors > 3 ? 2 : 1;
  const contentNames = Array.isArray(contents)
    ? new Set(
        contents.filter((item) => item.type === "file").map((item) => item.name.toUpperCase())
      )
    : new Set<string>();
  const governanceFiles = [
    "CODE_OF_CONDUCT.md",
    "CONTRIBUTING.md",
    "SECURITY.md",
    "GOVERNANCE.md",
    "PUBLICCODE.YML"
  ].filter((fileName) => contentNames.has(fileName));
  const enrichedAt = new Date().toISOString();

  const repository: Repository = {
    platform: "github",
    url: repoUrl,
    license: project.licenses[0] ?? "",
    stars: ghRepo.stargazers_count,
    forks: ghRepo.forks_count,
    watchers: ghRepo.watchers_count,
    contributors: uniqueContributors,
    open_issues: ghRepo.open_issues_count,
    closed_issues: 0,
    releases: recentReleases,
    latest_release: latestRelease,
    latest_commit: ghRepo.pushed_at,
    commit_frequency: commitsLast12 / 52,
    release_frequency: recentReleases / 12,
    bus_factor: busFactor,
    governance_files: governanceFiles,
    code_of_conduct: governanceFiles.includes("CODE_OF_CONDUCT.md"),
    contributing_guidelines:
      governanceFiles.includes("CONTRIBUTING.md") || governanceFiles.includes("PUBLICCODE.YML"),
    security_policy: governanceFiles.includes("SECURITY.md"),
    dependency_health: project.community_health.dependency_freshness,
    openssf_score: project.community_health.openssf_scorecard ?? null,
    provenance: {
      url: [
        {
          source: "GitHub API",
          retrieved_at: enrichedAt,
          confidence: 0.99,
          kind: "scraped",
          note: "Repository snapshot collected from the GitHub REST API."
        }
      ],
      governance_files:
        governanceFiles.length > 0
          ? [
              {
                source: "GitHub contents API",
                retrieved_at: enrichedAt,
                confidence: 0.9,
                kind: "scraped",
                note: "Detected from files present at repository root."
              }
            ]
          : []
    }
  };

  const refreshedProject: Project = {
    ...project,
    activity_score: calculateActivityScore(repository),
    community_health: {
      ...project.community_health,
      commits_last_12_months: commitsLast12,
      contributors_last_12_months: uniqueContributors,
      releases_last_12_months: recentReleases
    },
    provenance: mergeProvenance(project, {
      activity_score: [
        {
          source: "GitHub API",
          retrieved_at: enrichedAt,
          confidence: 0.92,
          kind: "scraped",
          note: "Derived from repository commit, contributor, and release activity."
        }
      ],
      community_health: [
        {
          source: "GitHub API",
          retrieved_at: enrichedAt,
          confidence: 0.92,
          kind: "scraped",
          note: "Repository health metrics refreshed from GitHub."
        }
      ],
      repository_urls: [
        {
          source: "GitHub API",
          retrieved_at: enrichedAt,
          confidence: 0.99,
          kind: "declared",
          note: "GitHub repository used as the enrichment anchor."
        }
      ]
    }),
    last_updated: enrichedAt
  };

  const sustainabilityScore = calculateSustainabilityScore(refreshedProject);
  const maturity = classifyMaturity(refreshedProject.activity_score, sustainabilityScore);

  return {
    project: {
      ...refreshedProject,
      sustainability_score: sustainabilityScore,
      maturity_level: maturity,
      provenance: mergeProvenance(refreshedProject, {
        sustainability_score: [
          {
            source: "GitHub API",
            retrieved_at: enrichedAt,
            confidence: 0.85,
            kind: "inferred",
            note: "Recomputed after GitHub activity enrichment."
          }
        ]
      })
    },
    repository
  };
}

export async function enrichProjectsBatch(
  projects: Project[]
): Promise<{ projects: Project[]; repositories: Repository[] }> {
  const enrichedProjects: Project[] = [];
  const repositories: Repository[] = [];

  for (let index = 0; index < projects.length; index += 5) {
    const batch = projects.slice(index, index + 5);
    const enriched = await Promise.all(batch.map((project) => enrichWithGitHub(project)));

    for (const result of enriched) {
      enrichedProjects.push(result.project);
      if (result.repository) {
        repositories.push(result.repository);
      }
    }

    if (index + 5 < projects.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return { projects: enrichedProjects, repositories };
}
