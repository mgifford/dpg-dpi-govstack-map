import { readFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import {
  atlasDatasetSchema,
  deploymentSchema,
  organizationSchema,
  personSchema,
  projectSchema,
  relationshipSchema,
  repositorySchema,
  standardSchema,
  type AtlasDataset
} from "../../src/lib/schema.js";

const MANUAL_DIR = path.resolve("data/manual");

async function readYamlFile<T>(fileName: string): Promise<T> {
  const raw = await readFile(path.join(MANUAL_DIR, fileName), "utf8");
  return YAML.parse(raw) as T;
}

export async function loadManualDataset(): Promise<AtlasDataset> {
  const [projectsRaw, organizationsRaw, relationshipsRaw, deploymentsRaw, standardsRaw] = await Promise.all([
    readYamlFile<unknown[]>("projects.yml"),
    readYamlFile<unknown[]>("organizations.yml"),
    readYamlFile<unknown[]>("relationships.yml"),
    readYamlFile<unknown[]>("deployments.yml"),
    readYamlFile<unknown[]>("standards.yml")
  ]);

  const projects = projectsRaw.map((project) => projectSchema.parse(project));
  const organizations = organizationsRaw.map((organization) => organizationSchema.parse(organization));
  const relationships = relationshipsRaw.map((relationship) => relationshipSchema.parse(relationship));
  const deployments = deploymentsRaw.map((deployment) => deploymentSchema.parse(deployment));
  const standards = standardsRaw.map((standard) => standardSchema.parse(standard));

  const people = personSchema.array().parse([]);
  const repositories = repositorySchema.array().parse([]);

  return atlasDatasetSchema.parse({
    generated_at: new Date().toISOString(),
    version: "0.2.0",
    sources: ["manual-phase-1"],
    projects,
    organizations,
    people,
    deployments,
    repositories,
    relationships,
    standards
  });
}