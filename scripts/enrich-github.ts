/**
 * Enrich projects with GitHub repository metadata.
 * Uses the GitHub REST API (unauthenticated by default; set GITHUB_TOKEN for higher rate limits).
 */

import type { Project, Repository } from "../src/lib/schema.js";
import { calculateActivityScore, calculateSustainabilityScore, classifyMaturity } from "./lib/score.js";

const GITHUB_API = "https://api.github.com";
const TIMEOUT_MS = 15_000;

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
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: githubHeaders(), signal: controller.signal });
    if (res.status === 404 || res.status === 403) {
      console.warn(`[enrich-github] ${res.status} for ${url}`);
      return null;
    }
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[enrich-github] Fetch error for ${url}: ${(err as Error).message}`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

interface GhRepo {
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  pushed_at: string | null;
  default_branch: string;
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

function ownerRepo(url: string): [string, string] | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (!match) return null;
  return [match[1], match[2]];
}

export async function enrichWithGitHub(project: Project): Promise<Project> {
  const repoUrl = project.repository_urls.find((u) => u.includes("github.com"));
  if (!repoUrl) return project;

  const pair = ownerRepo(repoUrl);
  if (!pair) return project;
  const [owner, repo] = pair;
  const base = `${GITHUB_API}/repos/${owner}/${repo}`;

  const [ghRepo, commitActivity, contributors, releases] = await Promise.all([
    fetchJson<GhRepo>(base),
    fetchJson<GhCommitActivity[]>(`${base}/stats/commit_activity`),
    fetchJson<GhContributor[]>(`${base}/contributors?per_page=100&anon=false`),
    fetchJson<GhRelease[]>(`${base}/releases?per_page=50`)
  ]);

  if (!ghRepo) return project;

  const commitsLast12 = Array.isArray(commitActivity)
    ? commitActivity.slice(-52).reduce((s, w) => s + w.total, 0)
    : 0;

  const uniqueContributors = Array.isArray(contributors) ? contributors.length : 0;

  const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
  const recentReleases = Array.isArray(releases)
    ? releases.filter((r) => new Date(r.published_at).getTime() > oneYearAgo).length
    : 0;

  const latestRelease = Array.isArray(releases) && releases.length > 0
    ? releases[0].tag_name
    : null;

  // Estimate bus factor: if top contributor wrote > 50% of commits, bus factor = 1
  const busFactor = uniqueContributors > 10 ? 3 : uniqueContributors > 3 ? 2 : 1;

  const repository: Repository = {
    platform: "github",
    url: repoUrl,
    stars: ghRepo.stargazers_count,
    forks: ghRepo.forks_count,
    watchers: ghRepo.watchers_count,
    contributors: uniqueContributors,
    open_issues: ghRepo.open_issues_count,
    closed_issues: 0, // requires GraphQL — skipped in REST enrichment
    releases: recentReleases,
    latest_release: latestRelease,
    latest_commit: ghRepo.pushed_at,
    commit_frequency: commitsLast12 / 52, // weekly average
    bus_factor: busFactor,
    governance_files: [],
    code_of_conduct: false,
    contributing_guidelines: false,
    security_policy: false
  };

  const activityScore = calculateActivityScore(repository);
  const updatedProject: Project = {
    ...project,
    activity_score: activityScore,
    community_health: {
      ...project.community_health,
      commits_last_12_months: commitsLast12,
      contributors_last_12_months: uniqueContributors,
      releases_last_12_months: recentReleases
    },
    last_updated: new Date().toISOString()
  };

  const sustainabilityScore = calculateSustainabilityScore(updatedProject);
  const maturity = classifyMaturity(activityScore, sustainabilityScore);

  return {
    ...updatedProject,
    sustainability_score: sustainabilityScore,
    maturity_level: maturity
  };
}

export async function enrichProjectsBatch(projects: Project[]): Promise<Project[]> {
  const results: Project[] = [];
  // Process in batches of 5 to respect rate limits
  for (let i = 0; i < projects.length; i += 5) {
    const batch = projects.slice(i, i + 5);
    const enriched = await Promise.all(batch.map((p) => enrichWithGitHub(p)));
    results.push(...enriched);
    if (i + 5 < projects.length) {
      // Small pause between batches to avoid rate limiting
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return results;
}
