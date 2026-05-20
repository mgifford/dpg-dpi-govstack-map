import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const RAW_DIR = path.resolve("data/raw");

interface FetchJsonOptions {
  cacheKey: string;
  headers?: HeadersInit;
  timeoutMs?: number;
  allowStale?: boolean;
}

function cachePath(cacheKey: string): string {
  return path.join(RAW_DIR, `${cacheKey}.json`);
}

async function readCachedJson<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function fetchJsonWithCache<T>(url: string, options: FetchJsonOptions): Promise<T | null> {
  const {
    cacheKey,
    headers,
    timeoutMs = 15_000,
    allowStale = true
  } = options;

  const filePath = cachePath(cacheKey);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { headers, signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = (await response.json()) as T;
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    return data;
  } catch (error) {
    if (allowStale) {
      const cached = await readCachedJson<T>(filePath);
      if (cached != null) {
        console.warn(`[fetch] ${url} failed (${(error as Error).message}); using cached ${cacheKey}`);
        return cached;
      }
    }

    return null;
  } finally {
    clearTimeout(timer);
  }
}