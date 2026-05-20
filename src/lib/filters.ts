import type { AtlasDataset, Project } from "./schema";

export interface FilterOptions {
  countries: string[];
  projectTypes: string[];
  governanceModels: string[];
  licenses: string[];
  maturities: string[];
}

export interface ProjectFilterState {
  query: string;
  country: string;
  projectType: string;
  governanceModel: string;
  license: string;
  maturity: string;
}

export const defaultFilterState: ProjectFilterState = {
  query: "",
  country: "all",
  projectType: "all",
  governanceModel: "all",
  license: "all",
  maturity: "all"
};

export function applyProjectFilters(projects: Project[], state: ProjectFilterState): Project[] {
  const q = state.query.toLowerCase();
  return projects.filter((project) => {
    if (
      q &&
      !`${project.name} ${project.description} ${project.tags.join(" ")}`.toLowerCase().includes(q)
    ) {
      return false;
    }
    if (state.country !== "all" && !project.deployment_countries.includes(state.country)) {
      return false;
    }
    if (state.projectType !== "all" && project.project_type !== state.projectType) {
      return false;
    }
    if (state.governanceModel !== "all" && project.governance_model !== state.governanceModel) {
      return false;
    }
    if (state.license !== "all" && !project.licenses.includes(state.license)) {
      return false;
    }
    if (state.maturity !== "all" && project.maturity_level !== state.maturity) {
      return false;
    }
    return true;
  });
}

function unique(values: string[]): string[] {
  return ["all", ...Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b))];
}

export function deriveFilterOptions(dataset: AtlasDataset): FilterOptions {
  return {
    countries: unique(dataset.projects.flatMap((p) => p.deployment_countries)),
    projectTypes: unique(dataset.projects.map((p) => p.project_type)),
    governanceModels: unique(dataset.projects.map((p) => p.governance_model)),
    licenses: unique(dataset.projects.flatMap((p) => p.licenses)),
    maturities: unique(dataset.projects.map((p) => p.maturity_level))
  };
}
