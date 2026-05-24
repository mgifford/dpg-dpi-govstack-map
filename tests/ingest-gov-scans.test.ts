import { describe, it, expect } from "vitest";
import { mapScanRecord } from "../scripts/ingest-gov-scans";
import type { GovScanRecord, GovScanSource } from "../scripts/ingest-gov-scans";

const SOURCE: GovScanSource = {
  name: "Test Gov Scans",
  url: "https://example.gov/technology-license-data.json",
  label: "test-gov-scans",
  enabled: true
};

const FULL_RECORD: GovScanRecord = {
  technology: "WordPress",
  osi_approved: "yes",
  license: "GPL-2.0",
  website: "https://wordpress.org",
  repo_url: "https://github.com/WordPress/WordPress",
  category: "CMS",
  description: "Open source content management system.",
  domain_count: 42,
  first_seen: "2024-01-15",
  last_seen: "2026-05-01"
};

// ── mapScanRecord ─────────────────────────────────────────────────────────────

describe("mapScanRecord", () => {
  it("maps a fully populated record to a valid Project", () => {
    const project = mapScanRecord(FULL_RECORD, SOURCE);
    expect(project).not.toBeNull();
    expect(project!.id).toBe("gov-scan-wordpress");
    expect(project!.name).toBe("WordPress");
    expect(project!.category).toBe("CMS");
    expect(project!.project_type).toBe("Government OSS");
    expect(project!.licenses).toContain("GPL-2.0");
    expect(project!.website).toBe("https://wordpress.org");
    expect(project!.repository_urls).toContain("https://github.com/WordPress/WordPress");
  });

  it("includes source label in tags", () => {
    const project = mapScanRecord(FULL_RECORD, SOURCE);
    expect(project!.tags).toContain("test-gov-scans");
    expect(project!.tags).toContain("government");
    expect(project!.tags).toContain("detected-in-production");
    expect(project!.tags).toContain("cms");
  });

  it("sets category to 'Government OSS' when record has no category", () => {
    const record: GovScanRecord = { ...FULL_RECORD, category: undefined };
    const project = mapScanRecord(record, SOURCE);
    expect(project!.category).toBe("Government OSS");
  });

  it("returns null for a record with no technology name", () => {
    const record: GovScanRecord = { ...FULL_RECORD, technology: "" };
    expect(mapScanRecord(record, SOURCE)).toBeNull();
  });

  it("returns null for a record with whitespace-only technology name", () => {
    const record: GovScanRecord = { ...FULL_RECORD, technology: "   " };
    expect(mapScanRecord(record, SOURCE)).toBeNull();
  });

  it("handles missing optional fields gracefully", () => {
    const minimal: GovScanRecord = {
      technology: "Drupal",
      osi_approved: "yes"
    };
    const project = mapScanRecord(minimal, SOURCE);
    expect(project).not.toBeNull();
    expect(project!.id).toBe("gov-scan-drupal");
    expect(project!.licenses).toEqual([]);
    expect(project!.repository_urls).toEqual([]);
    expect(project!.website).toBe("");
    expect(project!.description).toBe("");
  });

  it("normalises well-known license variants", () => {
    const record: GovScanRecord = { ...FULL_RECORD, license: "Apache 2" };
    const project = mapScanRecord(record, SOURCE);
    expect(project!.licenses).toContain("Apache-2.0");
  });

  it("rejects an invalid repo URL", () => {
    const record: GovScanRecord = { ...FULL_RECORD, repo_url: "not-a-url" };
    const project = mapScanRecord(record, SOURCE);
    expect(project!.repository_urls).toEqual([]);
  });

  it("rejects an invalid website URL", () => {
    const record: GovScanRecord = { ...FULL_RECORD, website: "not-a-url" };
    const project = mapScanRecord(record, SOURCE);
    expect(project!.website).toBe("");
  });

  it("builds a higher ecosystem score for widely-deployed tools", () => {
    const highUsage = mapScanRecord({ ...FULL_RECORD, domain_count: 100 }, SOURCE);
    const lowUsage = mapScanRecord({ ...FULL_RECORD, domain_count: 1 }, SOURCE);
    expect(highUsage!.ecosystem_score).toBeGreaterThan(lowUsage!.ecosystem_score);
  });

  it("includes domain_count and first/last seen dates in provenance note", () => {
    const project = mapScanRecord(FULL_RECORD, SOURCE, "2026-05-24T00:00:00Z");
    const descProvenance = project!.provenance["description"] ?? [];
    expect(descProvenance.length).toBeGreaterThan(0);
    const note = descProvenance[0].note;
    expect(note).toContain("42 domain(s)");
    expect(note).toContain("2024-01-15");
    expect(note).toContain("2026-05-01");
    expect(note).toContain("2026-05-24T00:00:00Z");
  });

  it("includes repo provenance only when repo_url is provided", () => {
    const withRepo = mapScanRecord(FULL_RECORD, SOURCE);
    expect(withRepo!.provenance["repository_urls"]).toBeDefined();

    const withoutRepo = mapScanRecord({ ...FULL_RECORD, repo_url: undefined }, SOURCE);
    expect(withoutRepo!.provenance["repository_urls"]).toBeUndefined();
  });

  it("includes license provenance only when license is provided", () => {
    const withLicense = mapScanRecord(FULL_RECORD, SOURCE);
    expect(withLicense!.provenance["licenses"]).toBeDefined();

    const withoutLicense = mapScanRecord({ ...FULL_RECORD, license: undefined }, SOURCE);
    expect(withoutLicense!.provenance["licenses"]).toBeUndefined();
  });

  it("deduplicates tags", () => {
    // Calling twice with the same source should not produce duplicate tags
    const project = mapScanRecord(FULL_RECORD, SOURCE);
    const tagSet = new Set(project!.tags);
    expect(tagSet.size).toBe(project!.tags.length);
  });

  it("assigns maturity_level 'emerging'", () => {
    const project = mapScanRecord(FULL_RECORD, SOURCE);
    expect(project!.maturity_level).toBe("emerging");
  });

  it("sets project_types array matching project_type", () => {
    const project = mapScanRecord(FULL_RECORD, SOURCE);
    expect(project!.project_types).toContain("Government OSS");
  });
});
