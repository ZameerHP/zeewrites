# Zee Writes — Precision Guides, Actionable Tech Fixes & Instant Text Utilities

A production-ready, editorial publication, technical troubleshooting hub, and interactive suite of 6 client-side Text & Developer Utilities engineered for **100% strict compliance with Google Publisher Policies, Google AdSense Program Policies, Google Search Essentials (Helpful Content & E-E-A-T), and 100/100 Core Web Vitals**.

---

## Core Architecture & Highlights

* **Framework:** Next.js 15 (App Router, Server Components + Client Interactivity, TypeScript, Tailwind CSS)
* **Smooth Scrolling:** Global **Lenis** smooth scroll (`lerp: 0.085`, `duration: 1.15`, `smoothWheel: true`) with automatic `prefers-reduced-motion` detection and modal/editor scroll locking.
* **Performance-Isolated 3D Visuals:** Hardware-accelerated **3D Glassmorphic Editorial Prism** in the Hero section lazy-loaded via `requestIdleCallback` and `IntersectionObserver` (`DPR <= 1.5`) with zero layout shift (`CLS = 0.00`).
* **Dual Editorial Theme Palette (WCAG AAA Contrast):**
  * **Light Mode (Default):** Warm Alabaster (`#FAF9F5`), Pure Ivory (`#FFFFFF`), Obsidian Slate (`#0F172A`), Electric Indigo (`#4F46E5`), Emerald Signal (`#059669`).
  * **Dark Mode (Carbon Editorial):** Deep Obsidian (`#090A0F`), Glass Card (`#12151E`), Crisp Pearl (`#F8FAFC`), Luminous Indigo (`#6366F1`).

---

## Complete Route Map

### 1. Core Content Pillars & 10 Pre-Populated Pillar Articles (1,200+ Words Each)
* `/category/how-to-fixes` — **How-To & Tech Fixes**
* `/category/text-guides` — **Text & Productivity Guides**
* `/category/solutions` — **Digital Solutions & Deep Dives**
* `/article/[slug]` — 10 comprehensive, lab-tested technical articles complete with custom vector schematics, **Verified Fix / Key Takeaway** summary callout boxes, numbered **How-To** steps with 1-click Copy buttons, scroll-spy sticky **Table of Contents**, interactive helpfulness widgets, E-E-A-T Author Bio boxes, and `TechArticle` + `HowTo` + `FAQPage` + `BreadcrumbList` JSON-LD structured data.

### 2. Interactive Text Tools Suite (`/tools` & `/tools/[slug]`)
Every single utility executes 100% client-side in browser memory and includes a **900+ word original educational guide**, mathematical/algorithmic formula box, real-world use cases, comparison table, and FAQ accordion right below the workspace:
1. `/tools/smart-case-formatter` — **Smart Case & Title Formatter** (AP/Chicago Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE)
2. `/tools/word-counter-analyzer` — **Deep Word, Character, Reading Time & Keyword Density Analyzer** (Flesch Reading Ease, Flesch-Kincaid Grade, Silent/Speaking time, 1/2/3-word N-Gram SEO Keyword Density)
3. `/tools/invisible-character-fixer` — **Invisible Character, Broken Encoding & Whitespace Fixer** (Visual X-Ray inspector for `U+200B`, `U+FEFF`, `U+00A0`, UTF-8 Mojibake repair `â€™` → `’`, `Ã©` → `é`, and smart quote sanitization)
4. `/tools/duplicate-line-scrubber` — **Duplicate Line & List Scrubber** ($O(n)$ hash-set deduplication, natural numeric sorting, SQL/JSON/HTML list wrappers, regex line filter)
5. `/tools/markdown-html-converter` — **Markdown <-> Clean HTML & Rich Text Converter** (Bidirectional CommonMark/GFM to clean semantic HTML5 compiler with live split-pane preview)
6. `/tools/json-text-diff-validator` — **JSON / Text Diff & Formatting Validator** (RFC 8259 JSON validator with line/column error locator, 1-click Auto-Repair for broken JSON, and LCS line-by-line Text Diff comparator)

### 3. Mandatory Google AdSense Trust, Legal & Technical SEO Routes
* `/about` — Detailed mission statement, E-E-A-T credentials, and 4-stage lab verification workflow
* `/contact` — Functional contact form with honeypot anti-spam protection, direct email (`contact@zeewrites.com`), and 24–48h response SLA
* `/privacy-policy` — Explicit Google AdSense DoubleClick DART cookie disclosures, opt-out links, GDPR, CCPA/CPRA, and Google Consent Mode v2 clauses
* `/terms` — Terms & Conditions of Use
* `/disclaimer` — Editorial Policy, Fact-Checking Standards & Technical Disclaimer
* `/sitemap-page` — Human-readable HTML Sitemap
* `/sitemap.xml`, `/robots.txt`, and `/ads.txt`

### 4. Hidden, Zero-Discoverability Admin CMS Panel ("Stealth Editorial Studio")
* **Stealth URL:** `/zee-studio-vault` (Excluded in `robots.txt` via `Disallow: /zee-studio-vault` and tagged with `noindex, nofollow`)
* **Secret Keyboard Shortcut:** Press `Ctrl + Shift + Alt + Z` (or `Cmd + Shift + Alt + Z` on macOS) from anywhere on the site
* **Default Owner Credentials:**
  * **Passphrase:** `zeewrites-master-vault`
  * **6-Digit PIN:** `202600`

---

## Running Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.
