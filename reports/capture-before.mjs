import { chromium } from "playwright-core";
import fs from "fs";
import path from "path";

const outDir = path.resolve("reports/before");
fs.mkdirSync(outDir, { recursive: true });

const routes = [
  { name: "home", path: "/" },
  { name: "category-how-to-fixes", path: "/category/how-to-fixes" },
  { name: "category-text-guides", path: "/category/text-guides" },
  { name: "category-solutions", path: "/category/solutions" },
  { name: "article-sample", path: "/article/json-schema-validation-api-payload-minification" },
  { name: "about", path: "/about" },
  { name: "contact", path: "/contact" },
  { name: "privacy-policy", path: "/privacy-policy" },
  { name: "terms", path: "/terms" },
  { name: "disclaimer", path: "/disclaimer" },
  { name: "sitemap-page", path: "/sitemap-page" },
  { name: "404", path: "/404-not-found" },
];

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
});

const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
const page = await context.newPage();

for (const r of routes) {
  await page.goto(`http://localhost:3000${r.path}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(outDir, `${r.name}.png`) });
}

await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
await page.keyboard.press("/");
await page.waitForTimeout(200);
await page.screenshot({ path: path.join(outDir, "search-palette.png") });

await browser.close();
console.log("Captured before screenshots:", fs.readdirSync(outDir));
