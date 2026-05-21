/**
 * Enrich projects with repository metadata from GitHub and GitLab-style forges.
 * GitHub uses the REST API; GitLab and compatible hosts use their /api/v4 endpoints.
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

const GITLAB_PUBLIC_HOSTS = new Set(["gitlab.com", "framagit.org"]);

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

interface GlProject {
  star_count?: number;
  forks_count?: number;
  open_issues_count?: number;
  last_activity_at?: string | null;
  default_branch?: string | null;
  license?: {
    nickname?: string | null;
    key?: string | null;
  } | null;
}

interface GlContributor {
  name?: string;
}

interface GlCommit {
  committed_date?: string;
}

interface GlRelease {
  tag_name?: string;
  released_at?: string;
  created_at?: string;
}

interface GlTreeItem {
  name?: string;
  type?: string;
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

function gitlabHeaders(host: string): HeadersInit {
  const normalizedHost = host.toLowerCase();
  const token =
    normalizedHost === "gitlab.com"
      ? (process.env.GITLAB_TOKEN ?? process.env.GITLAB_COM_TOKEN)
      : process.env.GITLAB_TOKEN;

  const headers: Record<string, string> = {
    Accept: "application/json"
  };

  if (token) {
    headers["PRIVATE-TOKEN"] = token;
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

function gitlabProjectPath(url: string): { host: string; path: string } | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    const trimmedPath = parsed.pathname.replace(/^\/+|\/+$/g, "");
    if (!trimmedPath) return null;
    const segments = trimmedPath
      .split("/")
      .filter(Boolean)
      .filter((segment) => !segment.startsWith("-"));

    if (segments.length < 2) return null;

    return {
      host,
      path: segments.join("/").replace(/\.git$/, "")
    };
  } catch {
    return null;
  }
}

function isGitlabHost(host: string): boolean {
  return GITLAB_PUBLIC_HOSTS.has(host) || host.startsWith("gitlab.");
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
    const gitlabRepoUrl = project.repository_urls.find((url) => {
      const parsed = gitlabProjectPath(url);
      return parsed ? isGitlabHost(parsed.host) : false;
    });

    if (!gitlabRepoUrl) {
      return { project, repository: null };
    }

    return enrichWithGitLab(project, gitlabRepoUrl);
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

async function fetchGitLabJson<T>(host: string, path: string): Promise<T | null> {
  const url = `https://${host}${path}`;
  const cacheKey = `${host}${path}`
    .replace(/^https?:\/\//, "")
    .replace(/[^a-zA-Z0-9/_-]+/g, "-")
    .replace(/-+/g, "-");

  const data = await fetchJsonWithCache<T>(url, {
    cacheKey: `gitlab/${cacheKey}`,
    headers: gitlabHeaders(host),
    timeoutMs: TIMEOUT_MS
  });

  if (!data) {
    console.warn(`[enrich-github] No live or cached response for ${url}`);
  }

  return data;
}

async function enrichWithGitLab(
  project: Project,
  repoUrl: string
): Promise<ProjectEnrichmentResult> {
  const parsed = gitlabProjectPath(repoUrl);
  if (!parsed || !isGitlabHost(parsed.host)) {
    return { project, repository: null };
  }

  const encodedPath = encodeURIComponent(parsed.path);
  const base = `/api/v4/projects/${encodedPath}`;

  const [glProject, contributors, releases, tree, commits] = await Promise.all([
    fetchGitLabJson<GlProject>(parsed.host, base),
    fetchGitLabJson<GlContributor[]>(parsed.host, `${base}/repository/contributors`),
    fetchGitLabJson<GlRelease[]>(parsed.host, `${base}/releases?per_page=50`),
    fetchGitLabJson<GlTreeItem[]>(parsed.host, `${base}/repository/tree?per_page=100`),
    fetchGitLabJson<GlCommit[]>(
      parsed.host,
      `${base}/repository/commits?per_page=100&since=${encodeURIComponent(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())}`
    )
  ]);

  if (!glProject) {
    return { project, repository: null };
  }

  const commitsLast12 = Array.isArray(commits) ? commits.length : 0;
  const uniqueContributors = Array.isArray(contributors) ? contributors.length : 0;
  const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
  const recentReleases = Array.isArray(releases)
    ? releases.filter((release) => {
        const releasedAt = release.released_at ?? release.created_at;
        return releasedAt ? new Date(releasedAt).getTime() > oneYearAgo : false;
      }).length
    : 0;
  const latestRelease =
    Array.isArray(releases) && releases.length > 0 ? (releases[0].tag_name ?? null) : null;
  const busFactor = uniqueContributors > 10 ? 3 : uniqueContributors > 3 ? 2 : 1;
  const contentNames = Array.isArray(tree)
    ? new Set(
        tree
          .filter((item) => item.type === "blob" && item.name)
          .map((item) => String(item.name).toUpperCase())
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
    platform: "gitlab",
    url: repoUrl,
    license: project.licenses[0] ?? glProject.license?.nickname ?? glProject.license?.key ?? "",
    stars: glProject.star_count ?? 0,
    forks: glProject.forks_count ?? 0,
    watchers: glProject.star_count ?? 0,
    contributors: uniqueContributors,
    open_issues: glProject.open_issues_count ?? 0,
    closed_issues: 0,
    releases: recentReleases,
    latest_release: latestRelease,
    latest_commit: glProject.last_activity_at ?? null,
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
          source: `GitLab API (${parsed.host})`,
          retrieved_at: enrichedAt,
          confidence: 0.99,
          kind: "scraped",
          note: "Repository snapshot collected from a GitLab-compatible API."
        }
      ],
      governance_files:
        governanceFiles.length > 0
          ? [
              {
                source: `GitLab repository tree API (${parsed.host})`,
                retrieved_at: enrichedAt,
                confidence: 0.88,
                kind: "scraped",
                note: "Detected from the repository tree at the default branch root."
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
          source: `GitLab API (${parsed.host})`,
          retrieved_at: enrichedAt,
          confidence: 0.9,
          kind: "scraped",
          note: "Derived from repository commit, contributor, and release activity."
        }
      ],
      community_health: [
        {
          source: `GitLab API (${parsed.host})`,
          retrieved_at: enrichedAt,
          confidence: 0.9,
          kind: "scraped",
          note: "Repository health metrics refreshed from a GitLab-compatible API."
        }
      ],
      repository_urls: [
        {
          source: `GitLab API (${parsed.host})`,
          retrieved_at: enrichedAt,
          confidence: 0.99,
          kind: "declared",
          note: "GitLab repository used as the enrichment anchor."
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
            source: `GitLab API (${parsed.host})`,
            retrieved_at: enrichedAt,
            confidence: 0.84,
            kind: "inferred",
            note: "Recomputed after repository activity enrichment."
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
