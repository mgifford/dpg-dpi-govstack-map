import { describe, it, expect } from "vitest";
import { normalizeCountry, normalizeLicense, slugify } from "../scripts/lib/normalize";

describe("normalizeCountry", () => {
  it("normalises known abbreviations", () => {
    expect(normalizeCountry("usa")).toBe("United States");
    expect(normalizeCountry("uk")).toBe("United Kingdom");
    expect(normalizeCountry("india")).toBe("India");
  });

  it("preserves unknown country names", () => {
    expect(normalizeCountry("Ruritania")).toBe("Ruritania");
  });

  it("trims whitespace", () => {
    expect(normalizeCountry("  india  ")).toBe("India");
  });

  it("is case-insensitive for known keys", () => {
    expect(normalizeCountry("USA")).toBe("United States");
    expect(normalizeCountry("UK")).toBe("United Kingdom");
  });
});

describe("normalizeLicense", () => {
  it("normalises Apache variants", () => {
    expect(normalizeLicense("Apache 2")).toBe("Apache-2.0");
    expect(normalizeLicense("APACHE 2.0")).toBe("Apache-2.0");
    expect(normalizeLicense("apache-2")).toBe("Apache-2.0");
  });

  it("normalises GPL variants", () => {
    expect(normalizeLicense("GPL3")).toBe("GPL-3.0");
  });

  it("normalises MIT variant", () => {
    expect(normalizeLicense("MIT License")).toBe("MIT");
  });

  it("preserves already-standard identifiers", () => {
    expect(normalizeLicense("Apache-2.0")).toBe("Apache-2.0");
    expect(normalizeLicense("MIT")).toBe("MIT");
    expect(normalizeLicense("AGPL-3.0")).toBe("AGPL-3.0");
  });
});

describe("slugify", () => {
  it("lowercases and replaces spaces with dashes", () => {
    expect(slugify("Open Knowledge Foundation")).toBe("open-knowledge-foundation");
  });

  it("replaces special characters", () => {
    expect(slugify("X-Road (v7)")).toBe("x-road-v7");
  });

  it("strips leading and trailing dashes", () => {
    expect(slugify("  MOSIP  ")).toBe("mosip");
  });

  it("handles already-slugified strings", () => {
    expect(slugify("dhis2")).toBe("dhis2");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });
});
