const countryMap: Record<string, string> = {
  usa: "United States",
  uk: "United Kingdom",
  tanzania: "Tanzania",
  india: "India"
};

export function normalizeCountry(value: string): string {
  const cleaned = value.trim();
  const key = cleaned.toLowerCase();
  return countryMap[key] ?? cleaned;
}

export function normalizeLicense(value: string): string {
  const cleaned = value.trim().toUpperCase();
  if (cleaned === "APACHE 2" || cleaned === "APACHE-2" || cleaned === "APACHE 2.0") {
    return "Apache-2.0";
  }
  if (cleaned === "GPL3") {
    return "GPL-3.0";
  }
  if (cleaned === "MIT LICENSE") {
    return "MIT";
  }
  return value.trim();
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
