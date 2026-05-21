import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { format } from "prettier";

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const formatted = await format(JSON.stringify(data), { parser: "json" });
  await writeFile(filePath, formatted, "utf8");
}

export function nowIso(): string {
  return new Date().toISOString();
}
