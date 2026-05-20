import type { Project, Repository } from "../../src/lib/schema.js";

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

export function calculateActivityScore(repo: Repository): number {
  const commitsWeight = Math.min(repo.commit_frequency * 12, 50);
  const releasesWeight = Math.min(repo.releases * 5, 25);
  const issuesWeight = repo.closed_issues + repo.open_issues > 0
    ? (repo.closed_issues / (repo.closed_issues + repo.open_issues)) * 25
    : 0;
  return clamp(Math.round(commitsWeight + releasesWeight + issuesWeight));
}

export function calculateSustainabilityScore(project: Project): number {
  const health = project.community_health;
  const governance = health.governance_maturity * 0.25;
  const docs = health.documentation_quality * 0.2;
  const onboarding = health.onboarding_quality * 0.2;
  const dependency = health.dependency_freshness * 0.2;
  const securityPenalty = Math.min(health.security_advisories_open * 4, 20);
  return clamp(Math.round(governance + docs + onboarding + dependency - securityPenalty));
}

export function classifyMaturity(activityScore: number, sustainabilityScore: number): Project["maturity_level"] {
  const composite = (activityScore + sustainabilityScore) / 2;
  if (composite > 75) {
    return "mature";
  }
  if (composite > 55) {
    return "growing";
  }
  if (composite > 35) {
    return "emerging";
  }
  if (composite > 20) {
    return "stagnant";
  }
  return "abandoned";
}
