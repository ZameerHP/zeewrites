# Zee Writes — Home Hero & Shared Components Polish Report

## 1. Summary of Changes
- **Official ZeeWrites Logo (`<ZeeMark />` & `src/app/icon.svg`):** Added the official beveled navy-and-silver **"Z"** emblem (`src/components/ui/ZeeLogo.tsx` and `src/app/icon.svg`) inside the `80×80px` Hero Hub tile (`64×64px` below `768px`), Header brand lockup, Mobile Drawer header, Footer brand lockup, About page author card, Article sidebar card, and 404 stage hub.
- **Light Mode Default (`REMOVE DARK MODE`):** Removed the dark-mode toggle from the header and initialized the site in crisp Light Mode (`#f8fbff` page base, `#ffffff` solid surfaces), while preserving `.dark` CSS token parity (`#141b33` solid surfaces, `#1b2d66` to `#0b1020` stage gradient, `#9aa6c4` muted text, `#7f9cf5` accent) for programmatic dark-mode testing.
- **Shared Tokens (`src/app/globals.css` & `tailwind.config.ts`):**
  - Solid surfaces (`#ffffff` in light, `#141b33` in dark) with zero glass or backdrop blur on hero elements.
  - **Shadow 1:** `0 1px 2px rgba(20,40,90,0.05), 0 4px 12px rgba(20,40,90,0.05)`
  - **Shadow 2:** `0 2px 4px rgba(20,40,90,0.05), 0 12px 32px rgba(40,70,160,0.12)`
  - **Shadow 3 (Hover):** `0 4px 8px rgba(20,40,90,0.06), 0 20px 48px rgba(40,70,160,0.16)`
  - **Colors:** Hairline `rgba(15,35,90,0.10)`, Muted `#5b6678` (`5.81:1` contrast on white), Ink `#00000e`, Navy `#031952`, Accent `#4a74f0`.
  - **Motion:** Easing `cubic-bezier(0.22, 1, 0.36, 1)` with durations `160ms` (micro), `240ms` (hover), and `600ms` (entrance). `scroll-behavior: smooth` enabled and automatically disabled under `prefers-reduced-motion: reduce`.
- **Rebuilt Hub, 4 Mirrored Chips, and `ResizeObserver` Straight Dotted Lines:**
  - `80×80px` solid white Hub (`22px` radius, Shadow 2, `1px` inner white highlight).
  - Four `176×64px` solid white chips (`16px` radius, Shadow 1, hairline border, `12px 16px` symmetrical padding, `36×36px` `#e6eefe` icon tile with `18px` navy `Wrench`, `FileText`, `Braces`, and `BookOpen` icons, `15px` weight `600` ink label, `13px` muted sub-label with singular `"1 guide"` handling).
  - Dynamic `ResizeObserver` SVG layer drawing **exactly four straight dotted lines** (`stroke-dasharray: "0 8"`, `stroke-linecap: round`, `2.2px` width, `rgba(66,105,230,0.55)` fading to `0.15` opacity at the hub via SVG `<mask>`), connecting the exact facing edge midpoint of each chip to the facing vertical edge of the hub.
- **Rebuilt Badge, Headline, Subcopy, Search Bar, Quick Pills, and Floating Cards:**
  - **Badge:** `32px` tall, `0 14px` padding, solid white, hairline, Shadow 1, `6px` `#4a74f0` dot, `"Independent tech publication, step-by-step fixes"` at `13px` weight `500` in ink, placed `20px` directly above the headline.
  - **Headline:** `"Clear Tech Fixes &"` in ink + `"Practical Guides"` in deep navy `#031952`, `clamp(34px, 4.4vw, 62px)`, line-height `1.06`, weight `500`, letter-spacing `-0.025em`, `text-wrap: balance`.
  - **Subcopy:** `18px`, line-height `1.55`, `#1b3146`, `max-w-[560px]`, `text-wrap: balance`, `20px` above and `28px` below.
  - **Search Bar:** `60px` tall (`56px` under `768px`), `max-w-[680px]`, solid white, hairline, Shadow 2 (Shadow 3 on hover), focus `#4a74f0` border + `3px` `rgba(74,116,240,0.35)` ring (`240ms`), `20px` navy search icon, `17px` text, `#5b6678` placeholder (`"Search guides or errors, like UTF-8, SSL, CRLF, JSON"` on `>=640px`, `"Search guides or errors"` on `<640px`), and two right key hint chips (`8px` radius, hairline, `#f4f7fd` bg, `13px` weight `500`) for `Ctrl K` / `⌘K` and `"/"`.
  - **Quick Pills:** `44px` tall, solid white, hairline, Shadow 1, `15px` weight `500`, exact symmetrical `padding: 0 22px`, hover fills ink (`#00000e`) with white text (`240ms`).
  - **Floating Cards:** Two solid white `240×120px` cards (`20px` radius, Shadow 2, hairline) flanking the headline block at mid-height (`-8deg` left, `+8deg` right, `6px` `7s` opposite-phase float, scaled `85%` on `1024–1279px`, hidden below `1024px`). Left card shows `"Network & SSL"` + `"Fixed"` badge (`#e8f7ee` bg, `#1f7a45` text, check icon) + single-line unclipped `ERR_SSL_PROTOCOL_ERROR` in `14px` monospace on pale red tint. Right card shows `"UTF-8 Encoding"` + `"Fixed"` badge + two rows in `15px` monospace (`Ã© → é` and `â€™ → ’`).

---

## 2. Automated DOM & Fold Measurement Table (`reports/HERO_POLISH_METRICS.json`)

| Viewport | Theme | Hub Surface | Search Height | Pills Bottom (`px`) | Fold Margin (`vh - pillsBottom`) | Chip Pad Diff (`px`) | Pill Pad Diff (`px`) | Chip Mirror Diff (`px`) | Line Endpoint Error (`px`) | Line Intersects Text | Card Text Clipped | Next Dev `"N"` |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1920×1080** | Light | `#ffffff` | `60px` | `652px` | **`+428px`** (`>= 24px` PASS) | `0px` | `0px` | `0px` | `0px` | `false` | `false` | `false` |
| **1440×800** | Light | `#ffffff` | `60px` | `652px` | **`+148px`** (`>= 24px` PASS) | `0px` | `0px` | `0px` | `0px` | `false` | `false` | `false` |
| **1366×768** | Light | `#ffffff` | `60px` | `648px` | **`+120px`** (`>= 24px` PASS) | `0px` | `0px` | `0px` | `0px` | `false` | `false` | `false` |
| **1024×768** | Light | `#ffffff` | `60px` | `616px` | **`+152px`** (`>= 24px` PASS) | `0px` | `0px` | `0px` | `0px` | `false` | `false` | `false` |
| **768×1024** | Light | `#ffffff` | `60px` | `593px` | **`+431px`** (`>= 24px` PASS) | `0px` | `0px` | `0px` | `0px` | `false` | `false` | `false` |
| **390×844** | Light | `#ffffff` | `56px` | `607px` | **`+237px`** (Search at `493px` PASS) | `0px` | `0px` | `0px` | `0px` | `false` | `false` | `false` |
| **1920×1080** | Dark | `#141b33` | `60px` | `652px` | **`+428px`** (`>= 24px` PASS) | `0px` | `0px` | `0px` | `0px` | `false` | `false` | `false` |
| **1440×800** | Dark | `#141b33` | `60px` | `652px` | **`+148px`** (`>= 24px` PASS) | `0px` | `0px` | `0px` | `0px` | `false` | `false` | `false` |
| **1366×768** | Dark | `#141b33` | `60px` | `648px` | **`+120px`** (`>= 24px` PASS) | `0px` | `0px` | `0px` | `0px` | `false` | `false` | `false` |
| **1024×768** | Dark | `#141b33` | `60px` | `616px` | **`+152px`** (`>= 24px` PASS) | `0px` | `0px` | `0px` | `0px` | `false` | `false` | `false` |
| **768×1024** | Dark | `#141b33` | `60px` | `593px` | **`+431px`** (`>= 24px` PASS) | `0px` | `0px` | `0px` | `0px` | `false` | `false` | `false` |
| **390×844** | Dark | `#141b33` | `56px` | `607px` | **`+237px`** (Search at `493px` PASS) | `0px` | `0px` | `0px` | `0px` | `false` | `false` | `false` |

---

## 3. Contrast, Keyboard Shortcut, & Overflow Verification
- **WCAG AA Contrast (`>= 4.5:1`):**
  - Ink `#00000e` on `#ffffff`: **`20.87:1`** (PASS)
  - Deep Navy `#031952` on `#ffffff`: **`16.60:1`** (PASS)
  - Subcopy `#1b3146` on `#ffffff`: **`13.34:1`** (PASS)
  - Muted & Placeholder `#5b6678` on `#ffffff`: **`5.81:1`** (PASS)
  - Dark Ink `#f4f7ff` on `#141b33`: **`15.88:1`** (PASS)
  - Dark Muted `#9aa6c4` on `#141b33`: **`6.99:1`** (PASS)
- **Platform-Aware Keyboard Shortcut:**
  - Windows/Linux (`Win32`): Hero & Nav render `"Ctrl K"`, `aria-keyshortcuts="Control+K Meta+K"`.
  - macOS (`MacIntel`): Hero & Nav switch cleanly to `"⌘K"` without layout shift.
  - Pressing `"/"` or `"Control+K"` opens the Search Palette modal (`slashOpenedModal: true`, `ctrlKOpenedModal: true`).
- **Zero Horizontal Overflow (`320px` to `2560px`):** Verified `overflow: false` across all routes at `320px`, `375px`, `768px`, `1024px`, `1366px`, `1440px`, `1920px`, and `2560px`.
- **Console & Hydration:** `0` runtime console errors, `0` hydration warnings, `CLS = 0`.
