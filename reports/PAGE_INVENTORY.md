# Zee Writes — Complete Codebase & Route Inventory

## 1. Codebase Architecture Inventory

### App Router Pages & Routes (`src/app/`)
- `src/app/layout.tsx` — Root HTML layout, `next/font/google` loader, metadata, `<SiteProvider>`, `<Header>`, `<PageTransition>`, `<Footer>`.
- `src/app/globals.css` — Global CSS tokens, theme variables, dot pattern utilities, Lenis smooth scroll styles, and motion rules.
- `src/app/page.tsx` — Homepage (`/`) rendering JSON-LD and `<HomeContentView>`.
- `src/app/category/[slug]/page.tsx` — Category archive pages (`/category/how-to-fixes`, `/category/text-guides`, `/category/solutions`).
- `src/app/article/[slug]/page.tsx` — Individual guide reading route (`/article/[slug]`, 10 published guides) rendering JSON-LD and `<ArticleReaderView>`.
- `src/app/about/page.tsx` — About page (`/about`) rendering `<AboutBentoClient>`.
- `src/app/contact/page.tsx` — Contact page (`/contact`) rendering `<ContactFormClient>`.
- `src/app/privacy-policy/page.tsx` — Privacy Policy legal page (`/privacy-policy`, 12 numbered sections).
- `src/app/terms/page.tsx` — Terms of Use legal page (`/terms`).
- `src/app/disclaimer/page.tsx` — Disclaimer legal page (`/disclaimer`).
- `src/app/sitemap-page/page.tsx` — HTML Sitemap page (`/sitemap-page`).
- `src/app/not-found.tsx` — Custom 404 Not Found page (`/_not-found`).
- `src/app/editorial-policy/page.tsx` — Redirects `/editorial-policy` to `/about`.
- `src/app/tools/page.tsx` & `src/app/tools/[slug]/page.tsx` — Redirect `/tools` and `/tools/[slug]` to `/` (also configured in `next.config.mjs`).
- `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/ads.txt/route.ts`, `src/app/api/cms/route.ts` — SEO & API routes.

### Components (`src/components/`)
- `src/components/layout/Header.tsx` — Top navigation bar, mobile focus-trapped drawer, and global Command Search Palette (`⌘K` / `/`).
- `src/components/layout/Footer.tsx` — Global rounded inset stage footer.
- `src/components/layout/PageTransition.tsx` — Route transition wrapper.
- `src/components/providers/SiteProvider.tsx` — Theme state (`light` default + `dark` persisted without flash), search modal state, toast live region, and Lenis scroll provider.
- `src/components/home/HomeContentView.tsx` — Home hero stage panel (quso.ai + AGency.io style), Latest Guides segmented filter + featured card + 3-col grid, and Core Sections cards.
- `src/components/ui/ArticleCard.tsx` — "Card in card" guide card (white card, 24px radius, soft shadow, 18px inset blue gradient top panel with bespoke guide vignette).
- `src/components/ui/TechnicalDiagram.tsx` — Inline SVG/HTML Guide Vignettes for all 10 guides (`json-schema`, `git-crlf`, `markdown-ast`, `browser-memory`, `regex-nfa`, `cwv-timeline`, `hidden-chars-ast`, `pdf-normalization`, `ssl-handshake`, `utf8-pipeline`).
- `src/components/ui/AdSlot.tsx` — Quiet layout-stable ad container.
- `src/components/article/ArticleReaderView.tsx` — Individual guide layout (68ch reading measure, summary takeaway, numbered steps, code blocks with copy, tables, callouts, FAQ accordion, sticky TOC, related guides).
- `src/components/about/AboutBentoClient.tsx` — About page stage header, "What We Publish" + 5-step horizontal stepper, "Written by Zee" card, and 4 "Core coverage pillars" cards.
- `src/components/contact/ContactFormClient.tsx` — Contact page stage header, 3 left channel cards (Email, Phone, Response Time), and right "Send a Message" form card.

### Data & Utilities (`src/data/`, `src/lib/`, `src/types/`)
- `src/data/categories.ts` — Category definitions and site settings.
- `src/data/articles.ts`, `src/data/articles-part1.ts`, `src/data/articles-part2.ts` — All 10 published technical guides.
- `src/data/tools.ts` — Legacy tool definitions (currently redirected to `/`).
- `src/lib/schema.ts` — JSON-LD structured data generators.
- `src/lib/server-store.ts` — Server database reader/writer.
- `src/types/index.ts` — TypeScript interfaces.

---

## 2. Route & Screenshot Verification Matrix

| Path | Purpose | Old Look Screenshot | New Look Screenshots (375 / 768 / 1440 · Light & Dark) | Status |
| :--- | :--- | :--- | :--- | :--- |
| `/` | Home (Hero stage panel, Latest Guides, Core sections) | `reports/before/home.png` | `reports/after/home-{light,dark}-{375,768,1440}.png` | In Progress |
| `/category/how-to-fixes` | Category: How-To & Tech Fixes (3 guides) | `reports/before/category-how-to-fixes.png` | `reports/after/category-how-to-fixes-{light,dark}-{375,768,1440}.png` | In Progress |
| `/category/text-guides` | Category: Text & Productivity Guides (4 guides) | `reports/before/category-text-guides.png` | `reports/after/category-text-guides-{light,dark}-{375,768,1440}.png` | In Progress |
| `/category/solutions` | Category: Digital Solutions & Deep Dives (3 guides) | `reports/before/category-solutions.png` | `reports/after/category-solutions-{light,dark}-{375,768,1440}.png` | In Progress |
| `/article/json-schema-validation-api-payload-minification` | Individual Guide Article Page ( + all 10 guide vignettes) | `reports/before/article-sample.png` | `reports/after/article-{light,dark}-{375,768,1440}.png` | In Progress |
| `/about` | About Zee Writes (Stage header, 2 main cards, 4 pillars) | `reports/before/about.png` | `reports/after/about-{light,dark}-{375,768,1440}.png` | In Progress |
| `/contact` | Contact Page (Direct channels + Send a Message form) | `reports/before/contact.png` | `reports/after/contact-{light,dark}-{375,768,1440}.png` | In Progress |
| `/privacy-policy` | Legal: Privacy Policy (12 sections, 68ch reading layout) | `reports/before/privacy-policy.png` | `reports/after/privacy-policy-{light,dark}-{375,768,1440}.png` | In Progress |
| `/terms` | Legal: Terms of Use (68ch reading layout) | `reports/before/terms.png` | `reports/after/terms-{light,dark}-{375,768,1440}.png` | In Progress |
| `/disclaimer` | Legal: Disclaimer (68ch reading layout) | `reports/before/disclaimer.png` | `reports/after/disclaimer-{light,dark}-{375,768,1440}.png` | In Progress |
| `/sitemap-page` | HTML Sitemap (Grouped pages and guides in clean rows) | `reports/before/sitemap-page.png` | `reports/after/sitemap-page-{light,dark}-{375,768,1440}.png` | In Progress |
| `/404-not-found` | Custom 404 Page (Centered stage panel + Return Home pill) | `reports/before/404.png` | `reports/after/404-{light,dark}-{375,768,1440}.png` | In Progress |
| `/?search=open` | Global Search Palette (`⌘K` / `/` modal) | `reports/before/search-palette.png` | `reports/after/search-palette-{light,dark}-{375,768,1440}.png` | In Progress |
