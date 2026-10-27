import { chromium } from "playwright-core";
import fs from "fs";
import path from "path";

const afterDir = path.resolve("reports/after");
fs.mkdirSync(afterDir, { recursive: true });

const routes = [
  { name: "home", path: "/" },
  { name: "category-how-to-fixes", path: "/category/how-to-fixes" },
  { name: "category-text-guides", path: "/category/text-guides" },
  { name: "category-solutions", path: "/category/solutions" },
  { name: "article", path: "/article/json-schema-validation-api-payload-minification" },
  { name: "about", path: "/about" },
  { name: "contact", path: "/contact" },
  { name: "privacy-policy", path: "/privacy-policy" },
  { name: "terms", path: "/terms" },
  { name: "disclaimer", path: "/disclaimer" },
  { name: "sitemap-page", path: "/sitemap-page" },
  { name: "404", path: "/404-not-found" },
];

const screenshotWidths = [375, 768, 1440];
const responsiveTestWidths = [
  320, 360, 375, 390, 414, 480, 600, 768, 820, 1024, 1280, 1440, 1536, 1920,
  2560,
];

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
});

const report = {
  screenshotsCaptured: 0,
  overflowFailures: [],
  interactiveChecks: {},
  a11yAndPerfByRoute: {},
  brokenLinks: [],
};

// 1. Capture 375, 768, 1440 screenshots in both light and dark themes
for (const theme of ["light", "dark"]) {
  for (const width of screenshotWidths) {
    const context = await browser.newContext({
      viewport: { width, height: 960 },
    });
    await context.addInitScript((t) => {
      localStorage.setItem("zeewrites_theme_v3", t);
    }, theme);

    const page = await context.newPage();

    for (const r of routes) {
      await page.goto(`http://localhost:3000${r.path}`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(150);
      const filename = `${r.name}-${theme}-${width}.png`;
      await page.screenshot({
        path: path.join(afterDir, filename),
        fullPage: false,
      });
      report.screenshotsCaptured++;
    }

    // Search palette screenshot
    await page.goto("http://localhost:3000/", {
      waitUntil: "networkidle",
    });
    await page.keyboard.press("Control+k");
    await page.waitForTimeout(200);
    const searchFilename = `search-palette-${theme}-${width}.png`;
    await page.screenshot({
      path: path.join(afterDir, searchFilename),
      fullPage: false,
    });
    report.screenshotsCaptured++;

    await context.close();
  }
}

// 2. Test all 15 responsive widths for zero horizontal scroll
const respContext = await browser.newContext();
const respPage = await respContext.newPage();
for (const width of responsiveTestWidths) {
  await respPage.setViewportSize({ width, height: 900 });
  for (const r of routes) {
    await respPage.goto(`http://localhost:3000${r.path}`, {
      waitUntil: "domcontentloaded",
    });
    const overflowInfo = await respPage.evaluate(() => {
      const sw = document.documentElement.scrollWidth;
      const iw = window.innerWidth;
      return { overflow: sw > iw, scrollWidth: sw, innerWidth: iw };
    });
    if (overflowInfo.overflow) {
      report.overflowFailures.push({
        route: r.path,
        width,
        scrollWidth: overflowInfo.scrollWidth,
      });
    }
  }
}

// 3. Accessibility & Performance / CLS audit on every route
await respPage.setViewportSize({ width: 1440, height: 900 });
for (const r of routes) {
  await respPage.goto(`http://localhost:3000${r.path}`, {
    waitUntil: "networkidle",
  });
  await respPage.waitForTimeout(200);
  const audit = await respPage.evaluate(() => {
    const h1Count = document.querySelectorAll("h1").length;
    const unlabeledButtons = Array.from(document.querySelectorAll("button")).filter(
      (b) => !b.textContent?.trim() && !b.getAttribute("aria-label")
    ).length;
    const unlabeledInputs = Array.from(
      document.querySelectorAll("input, textarea")
    ).filter((inp) => {
      const id = inp.getAttribute("id");
      const hasLabel = id && document.querySelector(`label[for="${id}"]`);
      return !hasLabel && !inp.getAttribute("aria-label");
    }).length;
    const nestedLinks = document.querySelectorAll("a a, button button, a button, button a").length;

    const shiftEntries = performance.getEntriesByType("layout-shift") || [];
    const cls = shiftEntries.reduce(
      (sum, entry) => sum + (entry.hadRecentInput ? 0 : entry.value || 0),
      0
    );

    return {
      h1Count,
      unlabeledButtons,
      unlabeledInputs,
      nestedLinks,
      cls: Number(cls.toFixed(4)),
    };
  });
  report.a11yAndPerfByRoute[r.path] = audit;
}

// 4. Interactive feature checks (with full hydration)
await respPage.setViewportSize({ width: 1440, height: 900 });
await respPage.goto("http://localhost:3000/", { waitUntil: "networkidle" });

// 4a. Category filter tabs on Home
await respPage.getByRole("tab", { name: /How-To Fixes/i }).click();
await respPage.waitForTimeout(200);
const howToSelected = await respPage
  .getByRole("tab", { name: /How-To Fixes/i })
  .getAttribute("aria-selected");
report.interactiveChecks.categoryFilterTabs = howToSelected === "true";

// 4b. Search palette via '/' and keyboard navigation
await respPage.keyboard.press("/");
await respPage.waitForTimeout(200);
const searchDialogVisible = await respPage
  .getByRole("dialog", { name: /Search guides/i })
  .isVisible();
await respPage.keyboard.press("Escape");
await respPage.waitForTimeout(150);
const searchDialogClosed = !(await respPage
  .getByRole("dialog", { name: /Search guides/i })
  .isVisible());
report.interactiveChecks.searchPaletteKeyboard =
  searchDialogVisible && searchDialogClosed;

// 4c. Theme toggle & persistence without flash
const initialDarkClass = await respPage.evaluate(() =>
  document.documentElement.classList.contains("dark")
);
await respPage.getByRole("button", { name: /Switch to/i }).click();
await respPage.waitForTimeout(150);
const toggledDarkClass = await respPage.evaluate(() =>
  document.documentElement.classList.contains("dark")
);
await respPage.reload({ waitUntil: "networkidle" });
const persistedDarkClass = await respPage.evaluate(() =>
  document.documentElement.classList.contains("dark")
);
report.interactiveChecks.themeToggleAndPersistence =
  initialDarkClass !== toggledDarkClass &&
  toggledDarkClass === persistedDarkClass;

// 4d. Contact form validation states
await respPage.goto("http://localhost:3000/contact", {
  waitUntil: "networkidle",
});
await respPage.getByRole("button", { name: /Send Message/i }).click();
await respPage.waitForTimeout(150);
const errorVisible = await respPage
  .getByText("Please enter your name.")
  .isVisible();
report.interactiveChecks.contactFormValidation = errorVisible;

// 4e. Copy button live region toast
await respPage
  .getByRole("button", { name: /Copy email address zameerpanhwer67@gmail.com/i })
  .first()
  .click();
await respPage.waitForTimeout(150);
const copiedVisible = await respPage.getByText("Copied").first().isVisible();
report.interactiveChecks.copyToClipboardFeedback = copiedVisible;

// 4f. Mobile Drawer at 375px (open, scroll lock, Escape close)
await respPage.setViewportSize({ width: 375, height: 812 });
await respPage.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await respPage.getByRole("button", { name: /Open navigation menu/i }).click();
await respPage.waitForTimeout(200);
const drawerOpen = await respPage
  .getByRole("dialog", { name: /Mobile navigation menu/i })
  .isVisible();
const bodyOverflowLocked = await respPage.evaluate(
  () => document.body.style.overflow === "hidden"
);
await respPage.keyboard.press("Escape");
await respPage.waitForTimeout(200);
const drawerClosed = !(await respPage
  .getByRole("dialog", { name: /Mobile navigation menu/i })
  .isVisible());
report.interactiveChecks.mobileDrawerAccessible =
  drawerOpen && bodyOverflowLocked && drawerClosed;

// 5. Internal link checker across Sitemap page
await respPage.setViewportSize({ width: 1440, height: 900 });
await respPage.goto("http://localhost:3000/sitemap-page", {
  waitUntil: "networkidle",
});
const hrefs = await respPage.evaluate(() =>
  Array.from(document.querySelectorAll("a[href^='/']")).map((a) =>
    a.getAttribute("href")
  )
);
const uniqueHrefs = [...new Set(hrefs.filter(Boolean))];
for (const href of uniqueHrefs) {
  const res = await respPage.goto(`http://localhost:3000${href}`, {
    waitUntil: "domcontentloaded",
  });
  if (!res || res.status() >= 400) {
    report.brokenLinks.push({ href, status: res?.status() });
  }
}

await browser.close();
fs.writeFileSync(
  path.resolve("reports/qa-results.json"),
  JSON.stringify(report, null, 2)
);
console.log("QA Suite Completed:", JSON.stringify(report, null, 2));
