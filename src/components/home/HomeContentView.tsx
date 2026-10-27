"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  Check,
  Wrench,
  FileText,
  Braces,
  BookOpen,
} from "lucide-react";
import { Article, CategorySlug } from "@/types";
import { useSite } from "@/components/providers/SiteProvider";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { AdSlot } from "@/components/ui/AdSlot";
import { CATEGORY_LIST } from "@/data/categories";
import { ZeeMark } from "@/components/ui/ZeeLogo";
import { usePlatformShortcut } from "@/components/ui/usePlatformShortcut";

interface HomeContentViewProps {
  initialArticles: Article[];
}

interface DottedLineCoords {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function formatGuideCount(count: number): string {
  return count === 1 ? "1 guide" : `${count} guides`;
}

export function HomeContentView({ initialArticles }: HomeContentViewProps) {
  const { articles: liveArticles, setCommandOpen } = useSite();
  const articles = liveArticles;
  const shortcutLabel = usePlatformShortcut();

  const [selectedCategory, setSelectedCategory] = useState<
    "all" | CategorySlug
  >("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [isCompactViewport, setIsCompactViewport] = useState(false);

  const heroSearchRef = useRef<HTMLInputElement | null>(null);
  const hubZoneRef = useRef<HTMLDivElement | null>(null);
  const hubTileRef = useRef<HTMLDivElement | null>(null);
  const chipRefs = useRef<(HTMLAnchorElement | null)[]>([
    null,
    null,
    null,
    null,
  ]);

  const [lineCoords, setLineCoords] = useState<DottedLineCoords[]>([]);
  const [linesMeasured, setLinesMeasured] = useState(false);

  // Responsive placeholder copy (<640px vs >=640px)
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 639px)");
    const updatePlaceholder = () => setIsCompactViewport(mql.matches);
    updatePlaceholder();
    mql.addEventListener("change", updatePlaceholder);
    return () => mql.removeEventListener("change", updatePlaceholder);
  }, []);

  // Measure Hub & Chip rectangles with ResizeObserver to draw 4 exact straight dotted lines
  const measureConnections = useCallback(() => {
    const zoneEl = hubZoneRef.current;
    const hubEl = hubTileRef.current;
    if (!zoneEl || !hubEl) return;

    const zoneRect = zoneEl.getBoundingClientRect();
    const hubRect = hubEl.getBoundingClientRect();

    if (zoneRect.width === 0 || hubRect.width === 0) return;

    const nextLines: DottedLineCoords[] = [];

    for (let i = 0; i < 4; i++) {
      const chipEl = chipRefs.current[i];
      if (!chipEl) continue;
      const chipRect = chipEl.getBoundingClientRect();
      if (chipRect.width === 0) continue;

      const isLeftChip = i < 2;
      // Endpoint 1: exact midpoint of facing Hub vertical edge
      const x1 = (isLeftChip ? hubRect.left : hubRect.right) - zoneRect.left;
      const y1 = (hubRect.top + hubRect.bottom) / 2 - zoneRect.top;

      // Endpoint 2: exact midpoint of facing Chip vertical edge
      const x2 = (isLeftChip ? chipRect.right : chipRect.left) - zoneRect.left;
      const y2 = (chipRect.top + chipRect.bottom) / 2 - zoneRect.top;

      nextLines.push({ x1, y1, x2, y2 });
    }

    if (nextLines.length === 4) {
      setLineCoords(nextLines);
      setLinesMeasured(true);
    }
  }, []);

  useEffect(() => {
    measureConnections();

    const zoneEl = hubZoneRef.current;
    const hubEl = hubTileRef.current;
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            measureConnections();
          })
        : null;

    if (ro && zoneEl) ro.observe(zoneEl);
    if (ro && hubEl) ro.observe(hubEl);
    chipRefs.current.forEach((chip) => {
      if (ro && chip) ro.observe(chip);
    });

    // Track entrance animations over the first 900ms so bounding rects settle at exact final pixel coords
    let startTime = performance.now();
    let rafId: number | null = null;
    const syncDuringEntrance = (now: number) => {
      measureConnections();
      if (now - startTime < 950) {
        rafId = requestAnimationFrame(syncDuringEntrance);
      }
    };
    rafId = requestAnimationFrame(syncDuringEntrance);

    const handleResize = () => measureConnections();
    window.addEventListener("resize", handleResize);

    return () => {
      if (ro) ro.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, [measureConnections]);

  const publishedArticles = useMemo(() => {
    return articles
      .filter((a) => a.status === "published")
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
  }, [articles]);

  const activeCategories = useMemo(() => {
    return CATEGORY_LIST.filter((cat) =>
      publishedArticles.some((a) => a.category === cat.slug)
    );
  }, [publishedArticles]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of CATEGORY_LIST) {
      counts[cat.slug] = publishedArticles.filter(
        (a) => a.category === cat.slug
      ).length;
    }
    return counts;
  }, [publishedArticles]);

  const heroChips = useMemo(
    () => [
      {
        id: "how-to-fixes",
        label: "How-To Fixes",
        subLabel: formatGuideCount(categoryCounts["how-to-fixes"] ?? 3),
        href: "/category/how-to-fixes",
        icon: Wrench,
        positionClass:
          "left-[8px] lg:left-[32px] xl:left-[56px] top-0",
        delayMs: 140,
      },
      {
        id: "text-guides",
        label: "Text Guides",
        subLabel: formatGuideCount(categoryCounts["text-guides"] ?? 4),
        href: "/category/text-guides",
        icon: FileText,
        positionClass:
          "left-[0px] lg:left-[12px] xl:left-[24px] top-[72px]",
        delayMs: 200,
      },
      {
        id: "solutions",
        label: "Solutions",
        subLabel: formatGuideCount(categoryCounts["solutions"] ?? 3),
        href: "/category/solutions",
        icon: Braces,
        positionClass:
          "right-[8px] lg:right-[32px] xl:right-[56px] top-0",
        delayMs: 260,
      },
      {
        id: "about-zee",
        label: "About Zee",
        subLabel: "Publication",
        href: "/about",
        icon: BookOpen,
        positionClass:
          "right-[0px] lg:right-[12px] xl:right-[24px] top-[72px]",
        delayMs: 320,
      },
    ],
    [categoryCounts]
  );

  const quickPills = useMemo(
    () => [
      { label: "How-To Fixes", href: "/category/how-to-fixes" },
      { label: "Text Guides", href: "/category/text-guides" },
      { label: "Solutions", href: "/category/solutions" },
      { label: "About Zee", href: "/about" },
    ],
    []
  );

  const filteredArticles = useMemo(() => {
    return publishedArticles.filter((a) => {
      const matchesCat =
        selectedCategory === "all" || a.category === selectedCategory;
      const q = searchFilter.trim().toLowerCase();
      if (!q) return matchesCat;
      const matchesText =
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)) ||
        a.primaryKeyword.toLowerCase().includes(q);
      return matchesCat && matchesText;
    });
  }, [publishedArticles, selectedCategory, searchFilter]);

  const showFeaturedLayout =
    selectedCategory === "all" &&
    searchFilter.trim() === "" &&
    filteredArticles.length > 1;

  const searchPlaceholder = isCompactViewport
    ? "Search guides or errors"
    : "Search guides or errors, like UTF-8, SSL, CRLF, JSON";

  return (
    <div className="pb-8">
      {/* =====================================================================
       * 1. HOME HERO STAGE PANEL
       * =================================================================== */}
      <section className="px-[14px]">
        <div
          id="hero-stage-panel"
          className="relative rounded-[32px] border border-hairline stage-panel-gradient overflow-hidden md:min-h-[640px] lg:h-[min(calc(100svh-82px),760px)] flex flex-col items-center justify-start pt-[28px] pb-[40px] px-4 sm:px-6"
        >
          {/* Fine dot grid at 0.12 opacity with vertical fade mask below the search bar */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 stage-dot-pattern"
          />

          {/* Soft white fade over the bottom 18% of the panel so it blends into the next section */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[18%] stage-bottom-fade"
          />

          {/* Two Solid Floating Cards Flanking Headline at Mid Height (1024px and up) */}
          <div
            aria-hidden="true"
            className="hidden lg:block pointer-events-none absolute inset-x-0 top-[46%] -translate-y-1/2 max-w-[1380px] mx-auto px-4 xl:px-10 z-10"
          >
            {/* Left Floating Card: Network & SSL (-8 deg) */}
            <div
              id="hero-floating-card-left"
              style={{ animationDelay: "580ms" }}
              className="animate-hero-rise absolute left-3 xl:left-10 -top-[58px]"
            >
              <div className="lg:scale-[0.85] xl:scale-100 origin-left">
                <div className="w-[240px] min-h-[120px] rounded-[20px] bg-surface shadow-2 border border-hairline p-4 flex flex-col justify-between gap-2.5 animate-float-left rotated-card-left">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-ink leading-tight">
                      Network &amp; SSL
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e8f7ee] text-[#1f7a45] text-[12px] font-medium leading-tight shrink-0">
                      <Check className="w-3 h-3 text-[#1f7a45]" strokeWidth={2} />
                      <span>Fixed</span>
                    </span>
                  </div>

                  <div className="px-2.5 py-2 rounded-[10px] bg-[#fef2f2] dark:bg-[#2a1622] border border-[#fecaca]/80 dark:border-[#f87171]/25 font-mono text-[14px] tracking-[-0.02em] text-[#991b1b] dark:text-[#fca5a5] font-medium whitespace-nowrap text-center">
                    ERR_SSL_PROTOCOL_ERROR
                  </div>
                </div>
              </div>
            </div>

            {/* Right Floating Card: UTF-8 Encoding (+8 deg, opposite float phase) */}
            <div
              id="hero-floating-card-right"
              style={{ animationDelay: "580ms" }}
              className="animate-hero-rise absolute right-3 xl:right-10 -top-[58px]"
            >
              <div className="lg:scale-[0.85] xl:scale-100 origin-right">
                <div
                  style={{ animationDelay: "-3.5s" }}
                  className="w-[240px] min-h-[120px] rounded-[20px] bg-surface shadow-2 border border-hairline p-4 flex flex-col justify-between gap-2 animate-float-right rotated-card-right"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-ink leading-tight">
                      UTF-8 Encoding
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e8f7ee] text-[#1f7a45] text-[12px] font-medium leading-tight shrink-0">
                      <Check className="w-3 h-3 text-[#1f7a45]" strokeWidth={2} />
                      <span>Fixed</span>
                    </span>
                  </div>

                  <div className="rounded-[10px] bg-[#f4f7fd] dark:bg-[#1c2646] border border-hairline px-3 py-1.5 space-y-1 font-mono text-[15px] leading-tight">
                    <div className="flex items-center justify-between text-ink">
                      <span className="text-muted">{"\u00C3\u00A9"}</span>
                      <span className="text-muted">{"\u2192"}</span>
                      <span className="font-semibold text-navy">{"\u00E9"}</span>
                    </div>
                    <div className="flex items-center justify-between text-ink">
                      <span className="text-muted">{"\u00E2\u20AC\u2122"}</span>
                      <span className="text-muted">{"\u2192"}</span>
                      <span className="font-semibold text-navy">
                        {"\u2019"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================================
           * TOP HUB ZONE (Hub + 4 Mirrored Chips + 4 Measured Straight Dotted Lines)
           * =============================================================== */}
          <div
            ref={hubZoneRef}
            id="hero-hub-zone"
            className="relative z-10 w-full max-w-[1060px] mx-auto h-[72px] md:h-[136px] flex items-center justify-center shrink-0"
          >
            {/* Dynamic SVG Layer Behind Hub and Chips (768px and up) */}
            <svg
              id="hero-dotted-lines-svg"
              aria-hidden="true"
              className={`hidden md:block pointer-events-none absolute inset-0 w-full h-full z-0 transition-opacity duration-entrance ease-out-expo ${
                linesMeasured ? "opacity-100" : "opacity-0"
              }`}
              style={{ transitionDelay: "80ms" }}
            >
              <defs>
                {lineCoords.map((line, idx) => (
                  <React.Fragment key={`mask-def-${idx}`}>
                    <linearGradient
                      id={`hub-line-grad-${idx}`}
                      gradientUnits="userSpaceOnUse"
                      x1={line.x1}
                      y1={line.y1}
                      x2={line.x2}
                      y2={line.y2}
                    >
                      {/* Fade to 0.15 effective opacity at the hub (0.55 * 0.273 = 0.15) */}
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.273" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                    </linearGradient>
                    <mask
                      id={`hub-line-mask-${idx}`}
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="100%"
                      height="100%"
                    >
                      <rect
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        fill={`url(#hub-line-grad-${idx})`}
                      />
                    </mask>
                  </React.Fragment>
                ))}
              </defs>

              {lineCoords.map((line, idx) => (
                <line
                  key={`dotted-line-${idx}`}
                  data-line-index={idx}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="var(--ray-dot-color)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeDasharray="0 8"
                  mask={`url(#hub-line-mask-${idx})`}
                />
              ))}
            </svg>

            {/* Center Hub Tile: 80x80px on >=768px, 64x64px under 768px */}
            <div
              ref={hubTileRef}
              id="hero-hub-tile"
              className="relative z-10 w-[64px] h-[64px] md:w-[80px] md:h-[80px] rounded-[18px] md:rounded-[22px] bg-surface shadow-2 border border-hairline ring-1 ring-inset ring-white dark:ring-white/15 flex items-center justify-center animate-hub-entrance"
            >
              <ZeeMark size={42} className="hidden md:inline-flex" />
              <ZeeMark size={34} className="md:hidden" />
            </div>

            {/* Four Symmetrical Chips Mirrored Left and Right of Hub (768px and up) */}
            {heroChips.map((chip, index) => {
              const Icon = chip.icon;
              return (
                <Link
                  key={chip.id}
                  ref={(el) => {
                    chipRefs.current[index] = el;
                  }}
                  href={chip.href}
                  data-hero-chip={chip.id}
                  style={{ animationDelay: `${chip.delayMs}ms` }}
                  className={`hidden md:flex absolute ${chip.positionClass} z-10 w-[176px] h-[64px] rounded-[16px] bg-surface shadow-1 border border-hairline py-[12px] px-[16px] items-center gap-3 hover:-translate-y-[2px] hover:shadow-3 transition-[transform,box-shadow] duration-hover ease-out-expo focus-visible:outline-2 focus-visible:outline-[#4a74f0] focus-visible:outline-offset-2 animate-hero-rise`}
                >
                  <span className="w-[36px] h-[36px] rounded-[10px] bg-[#e6eefe] dark:bg-[#1e2a4a] flex items-center justify-center shrink-0">
                    <Icon
                      className="w-[18px] h-[18px] text-navy shrink-0"
                      strokeWidth={1.75}
                    />
                  </span>
                  <span className="flex flex-col justify-center min-w-0 text-left">
                    <span className="text-[15px] font-semibold text-ink leading-[1.2] whitespace-nowrap">
                      {chip.label}
                    </span>
                    <span className="text-[13px] font-normal text-muted leading-[1.25] whitespace-nowrap mt-0.5">
                      {chip.subLabel}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>

          {/* =================================================================
           * CENTER HERO STACK (Badge -> Headline -> Subcopy -> Search -> Pills)
           * =============================================================== */}
          <div className="relative z-10 w-full max-w-[760px] mx-auto text-center flex flex-col items-center mt-2 md:mt-2">
            {/* Pill Badge: 32px tall, padding 0 14px, solid white, hairline, shadow 1, 6px accent dot, 20px gap above headline */}
            <div
              id="hero-badge"
              style={{ animationDelay: "280ms" }}
              className="inline-flex items-center justify-center gap-2 h-[32px] px-[14px] mb-[20px] rounded-full bg-surface border border-hairline shadow-1 text-[11.5px] sm:text-[13px] font-medium text-ink whitespace-nowrap animate-hero-rise"
            >
              <span
                aria-hidden="true"
                className="w-[6px] h-[6px] rounded-full bg-accent shrink-0"
              />
              <span>Independent tech publication, step-by-step fixes</span>
            </div>

            {/* Two-Line Headline: clamp(34px, 4.4vw, 62px), line-height 1.06, weight 500, letter-spacing -0.025em */}
            <h1
              id="hero-headline"
              style={{ animationDelay: "340ms" }}
              className="font-sans font-medium text-[clamp(34px,4.4vw,62px)] leading-[1.06] tracking-[-0.025em] text-ink [text-wrap:balance] animate-hero-rise"
            >
              <span className="block">Clear Tech Fixes &amp;</span>
              <span className="block text-navy">Practical Guides</span>
            </h1>

            {/* Subcopy: 18px, line-height 1.55, #1b3146, max-w 560px, text-wrap balance, 20px above and 28px below */}
            <p
              id="hero-subcopy"
              style={{ animationDelay: "400ms" }}
              className="mt-[20px] mb-[28px] text-[18px] leading-[1.55] text-secondary max-w-[560px] mx-auto [text-wrap:balance] animate-hero-rise"
            >
              Step-by-step solutions for common operating system, browser,
              network, and text formatting problems.
            </p>

            {/* Search Bar Wrapper (60px tall on >=768px, 56px under 768px, max-width 680px, solid white, hairline, shadow 2 -> shadow 3) */}
            <div
              style={{ animationDelay: "460ms" }}
              className="relative w-full md:max-w-[580px] lg:max-w-[680px] animate-hero-rise"
            >
              {/* Small Dashed Arrow pointing clearly at the left start of the search bar, aligned to its baseline, in accent blue at 60% opacity */}
              <svg
                aria-hidden="true"
                viewBox="0 0 56 36"
                fill="none"
                className="hidden md:block pointer-events-none absolute -left-[52px] bottom-[8px] w-[44px] h-[30px] text-accent opacity-60"
              >
                <path
                  d="M 6 2 C 8 20, 22 28, 46 28"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
                <path
                  d="M 40 23 L 48 28 L 40 33"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <div
                id="hero-search-bar"
                className="flex items-center h-[56px] md:h-[60px] w-full rounded-full bg-surface shadow-2 hover:shadow-3 border border-hairline pl-5 pr-3 focus-within:border-[#4a74f0] focus-within:ring-[3px] focus-within:ring-[#4a74f0]/35 transition-[box-shadow,border-color] duration-hover ease-out-expo"
              >
                <Search
                  className="w-[20px] h-[20px] text-navy mr-3.5 shrink-0"
                  strokeWidth={1.75}
                />
                <input
                  ref={heroSearchRef}
                  type="search"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label="Search guides or errors"
                  aria-keyshortcuts="Control+K Meta+K /"
                  className="w-full bg-transparent text-[17px] text-ink placeholder:text-muted placeholder:opacity-100 focus:outline-none"
                />

                {/* Two Key Hint Chips on Right Side (8px radius, hairline, #f4f7fd background, 13px weight 500) */}
                <div className="hidden sm:flex items-center gap-1.5 ml-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setCommandOpen(true)}
                    aria-label={`Open search palette (${shortcutLabel})`}
                    aria-keyshortcuts="Control+K Meta+K"
                    className="inline-flex items-center justify-center min-w-[54px] h-[32px] px-2.5 rounded-[8px] bg-[#f4f7fd] dark:bg-[#1c2646] border border-hairline text-[13px] font-medium text-ink hover:border-[#4a74f0] transition-colors duration-micro ease-out-expo"
                  >
                    {shortcutLabel}
                  </button>
                  <span
                    aria-hidden="true"
                    className="inline-flex items-center justify-center w-[28px] h-[32px] rounded-[8px] bg-[#f4f7fd] dark:bg-[#1c2646] border border-hairline text-[13px] font-medium text-ink"
                  >
                    /
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Pills: 44px tall, solid white, hairline, shadow 1, 15px weight 500, padding 0 22px symmetrical, hover fills ink with white text in 240ms */}
            <div
              id="hero-quick-pills"
              style={{ animationDelay: "520ms" }}
              className="w-full max-w-[560px] md:max-w-none grid grid-cols-2 md:flex md:flex-wrap items-center justify-center gap-2.5 mt-[16px] animate-hero-rise"
            >
              {quickPills.map((pill) => (
                <Link
                  key={pill.href}
                  href={pill.href}
                  data-quick-pill={pill.label}
                  className="inline-flex items-center justify-center h-[44px] px-[22px] rounded-full bg-surface text-ink border border-hairline shadow-1 text-[15px] font-medium hover:bg-[#00000e] hover:text-[#ffffff] dark:hover:bg-[#f4f7ff] dark:hover:text-[#0b1020] transition-[background-color,color,box-shadow,transform] duration-hover ease-out-expo focus-visible:outline-2 focus-visible:outline-[#4a74f0] focus-visible:outline-offset-2"
                >
                  <span>{pill.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
       * 2. LATEST GUIDES SECTION
       * =================================================================== */}
      <section
        id="featured-guides"
        aria-labelledby="guides-heading"
        className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-16 lg:pt-24 space-y-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 h-[32px] px-[14px] rounded-full bg-surface border border-hairline shadow-1 text-[13px] font-medium text-ink">
              <span className="w-[6px] h-[6px] rounded-full bg-accent" />
              <span>Technical archive</span>
            </div>
            <h2
              id="guides-heading"
              className="font-sans font-medium text-[clamp(28px,4vw,48px)] leading-[1.15] tracking-[-0.02em] text-ink"
            >
              Latest Guides
            </h2>
          </div>

          {/* Pill Segmented Filter Control */}
          <div
            role="tablist"
            aria-label="Filter guides by category"
            className="inline-flex flex-wrap items-center gap-1 p-1.5 rounded-[22px] sm:rounded-full bg-surface border border-hairline shadow-1 self-start lg:self-auto"
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategory === "all"}
              onClick={() => setSelectedCategory("all")}
              className={`inline-flex items-center gap-2 px-4 min-h-[44px] rounded-full text-[14px] font-medium transition-all duration-hover ease-out-expo ${
                selectedCategory === "all"
                  ? "bg-[#00000e] text-white shadow-2"
                  : "text-secondary hover:text-ink"
              }`}
            >
              <span>All</span>
              <span
                className={
                  selectedCategory === "all" ? "text-white/80" : "text-muted"
                }
              >
                {publishedArticles.length}
              </span>
            </button>

            {activeCategories.map((cat) => {
              const count = publishedArticles.filter(
                (a) => a.category === cat.slug
              ).length;
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`inline-flex items-center gap-2 px-4 min-h-[44px] rounded-full text-[14px] font-medium transition-all duration-hover ease-out-expo ${
                    isSelected
                      ? "bg-[#00000e] text-white shadow-2"
                      : "text-secondary hover:text-ink"
                  }`}
                >
                  <span>{cat.shortName}</span>
                  <span
                    className={isSelected ? "text-white/80" : "text-muted"}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Guides Grid */}
        <div key={selectedCategory} className="animate-fade-filter space-y-6">
          {filteredArticles.length === 0 ? (
            <div className="rounded-[24px] bg-surface border border-hairline shadow-2 p-12 text-center space-y-4">
              <p className="text-[17px] font-medium text-ink">
                {searchFilter
                  ? `No guides match "${searchFilter}" in this category.`
                  : "No guides published yet. Articles added in the Admin Panel will appear here live."}
              </p>
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchFilter("");
                    setSelectedCategory("all");
                  }}
                  className="px-6 min-h-[44px] text-[14px] font-medium btn-primary-pill"
                >
                  Reset Filter
                </button>
              )}
            </div>
          ) : showFeaturedLayout ? (
            <>
              <ArticleCard
                article={filteredArticles[0]}
                priorityImage={true}
                featured={true}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.slice(1).map((article, idx) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    priorityImage={idx < 2}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article, idx) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  priorityImage={idx < 3}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <AdSlot id="home-main-slot" format="leaderboard" />
      </div>

      {/* =====================================================================
       * 3. CORE SECTIONS (3 Category Cards)
       * =================================================================== */}
      <section
        aria-labelledby="core-sections-heading"
        className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-16 lg:pt-24 space-y-8"
      >
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 h-[32px] px-[14px] rounded-full bg-surface border border-hairline shadow-1 text-[13px] font-medium text-ink">
            <span className="w-[6px] h-[6px] rounded-full bg-accent" />
            <span>Core sections</span>
          </div>
          <h2
            id="core-sections-heading"
            className="font-sans font-medium text-[clamp(28px,4vw,48px)] leading-[1.15] tracking-[-0.02em] text-ink"
          >
            Explore by <span className="text-navy">Category</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeCategories.map((cat) => {
            const count = publishedArticles.filter(
              (a) => a.category === cat.slug
            ).length;
            return (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="group rounded-[24px] bg-surface border border-hairline shadow-2 hover:shadow-3 hover:-translate-y-[2px] transition-[transform,box-shadow] duration-hover ease-out-expo p-7 flex flex-col justify-between gap-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-badge-bg text-badge-text text-[13px] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-badge-dot" />
                      <span>{formatGuideCount(count)}</span>
                    </span>
                    <ArrowRight
                      className="w-4 h-4 text-muted group-hover:text-navy group-hover:translate-x-0.5 transition-all duration-hover ease-out-expo"
                      strokeWidth={1.5}
                    />
                  </div>

                  <h3 className="font-sans font-semibold text-[20px] leading-[1.3] text-ink group-hover:text-navy transition-colors duration-micro">
                    {cat.name}
                  </h3>

                  <p className="text-[16px] leading-[1.6] text-secondary">
                    {cat.tagline}
                  </p>
                </div>

                <div className="pt-4 border-t border-hairline flex items-center justify-between text-[14px] font-semibold text-navy">
                  <span>Browse {cat.shortName}</span>
                  <ArrowRight
                    className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-hover ease-out-expo"
                    strokeWidth={1.5}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
