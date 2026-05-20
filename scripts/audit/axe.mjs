import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";

const baseUrl = process.env.AUDIT_BASE_URL || "http://127.0.0.1:4321";
const routes = [
  "/",
  "/projects/",
  "/organizations/",
  "/compare/",
  "/map/",
  "/graph/",
  "/deployments/",
  "/standards/",
  "/accessibility/"
];

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
let failed = false;

for (const route of routes) {
  const url = new URL(route, baseUrl).toString();
  await page.goto(url, { waitUntil: "networkidle" });
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();

  if (results.violations.length > 0) {
    failed = true;
    console.error(`\n[axe] ${route} — ${results.violations.length} violation(s)`);
    for (const violation of results.violations) {
      console.error(`- ${violation.id}: ${violation.help}`);
      for (const node of violation.nodes.slice(0, 3)) {
        console.error(`  target: ${node.target.join(", ")}`);
      }
    }
  } else {
    console.log(`[axe] ${route} — ok`);
  }
}

await context.close();
await browser.close();

if (failed) {
  process.exit(1);
}