"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X, ArrowRight } from "lucide-react";
import { useSite } from "@/components/providers/SiteProvider";
import { CATEGORIES, CATEGORY_LIST } from "@/data/categories";
import { ZeeMark } from "@/components/ui/ZeeLogo";
import { usePlatformShortcut } from "@/components/ui/usePlatformShortcut";

function formatGuideCount(count: number): string {
  return count === 1 ? "1 guide" : `${count} guides`;
}

export function Header() {
  const {
    articles,
    isCommandOpen,
    setCommandOpen,
    setModalLocked,
  } = useSite();
  const pathname = usePathname();
  const router = useRouter();
  const shortcutLabel = usePlatformShortcut();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const mobileToggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const mobileDrawerRef = useRef<HTMLDivElement | null>(null);
  const wasMobileOpenRef = useRef(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Mobile drawer scroll lock, Escape handler, focus trap, and focus restore
  useEffect(() => {
    setModalLocked(mobileMenuOpen);
    if (mobileMenuOpen) {
      wasMobileOpenRef.current = true;
      document.body.style.overflow = "hidden";
      const focusable = mobileDrawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable && focusable.length > 0) {
        setTimeout(() => focusable[0].focus(), 20);
      }
    } else {
      document.body.style.overflow = "";
      if (wasMobileOpenRef.current) {
        wasMobileOpenRef.current = false;
        mobileToggleBtnRef.current?.focus();
      }
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen, setModalLocked]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleDrawerKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setMobileMenuOpen(false);
        return;
      }
      if (e.key === "Tab" && mobileDrawerRef.current) {
        const focusable = Array.from(
          mobileDrawerRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleDrawerKeyDown);
    return () => window.removeEventListener("keydown", handleDrawerKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (isCommandOpen) {
      setSelectedIndex(0);
      setTimeout(() => searchInputRef.current?.focus(), 30);
    } else {
      setQuery("");
    }
  }, [isCommandOpen]);

  // Global '/' shortcut to open search palette when not focused in an input
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (!isInputFocused && e.key === "/" && !isCommandOpen) {
        e.preventDefault();
        setCommandOpen(true);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isCommandOpen, setCommandOpen]);

  const publishedArticles = useMemo(
    () => articles.filter((a) => a.status === "published"),
    [articles]
  );

  const activeCategories = useMemo(
    () =>
      CATEGORY_LIST.filter((cat) =>
        publishedArticles.some((a) => a.category === cat.slug)
      ),
    [publishedArticles]
  );

  const filteredArticles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return publishedArticles.slice(0, 8);
    return publishedArticles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        a.primaryKeyword.toLowerCase().includes(q)
    );
  }, [query, publishedArticles]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filteredArticles.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % filteredArticles.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filteredArticles.length > 0) {
        setSelectedIndex(
          (prev) => (prev - 1 + filteredArticles.length) % filteredArticles.length
        );
      }
    } else if (e.key === "Enter" && filteredArticles[selectedIndex]) {
      e.preventDefault();
      const target = filteredArticles[selectedIndex];
      setCommandOpen(false);
      router.push(`/article/${target.slug}`);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setCommandOpen(false);
    }
  };

  const centerNavLinks = useMemo(
    () => [
      {
        href: "/category/how-to-fixes",
        label: "How-To Fixes",
      },
      {
        href: "/category/text-guides",
        label: "Text Guides",
      },
      {
        href: "/category/solutions",
        label: "Solutions",
      },
      {
        href: "/category/tutorials",
        label: "Tutorials",
      },
      {
        href: "/tools",
        label: "Tools",
      },
      {
        href: "/about",
        label: "About",
      },
    ],
    []
  );

  const isContactActive = pathname === "/contact";

  return (
    <>
      <header className="relative z-40 w-full bg-transparent h-[72px] flex items-center">
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Left: Official ZeeWrites Beveled Z Logo Tile + "Zee Writes" + "Guides & Fixes" */}
          <Link
            href="/"
            aria-label="Zee Writes Home"
            className="flex items-center gap-3 group shrink-0 min-h-[44px]"
          >
            <div className="h-10 w-10 rounded-[12px] bg-surface text-ink border border-hairline shadow-1 ring-1 ring-inset ring-white dark:ring-white/15 flex items-center justify-center shrink-0 group-hover:shadow-2 transition-shadow duration-hover ease-out-expo">
              <ZeeMark size={26} />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-sans font-semibold text-[17px] tracking-[-0.02em] text-ink leading-tight">
                Zee Writes
              </span>
              <span className="text-[13px] font-normal text-muted leading-tight">
                Guides &amp; Fixes
              </span>
            </div>
          </Link>

          {/* Center: How-To Fixes, Text Guides, Solutions, Tutorials, Tools, About */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-1 xl:gap-1.5"
          >
            {centerNavLinks.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 xl:px-4 py-2 min-h-[44px] rounded-full text-[14px] xl:text-[15px] font-medium transition-colors duration-micro ease-out-expo ${
                    isActive
                      ? "bg-surface text-ink border border-hairline shadow-1"
                      : "text-secondary hover:text-ink hover:bg-surface"
                  }`}
                >
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="w-1.5 h-1.5 rounded-full bg-accent"
                    />
                  )}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Search pill + black Contact pill */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="nav-search-pill"
              type="button"
              onClick={() => setCommandOpen(true)}
              aria-label={`Search guides (${shortcutLabel})`}
              aria-keyshortcuts="Control+K Meta+K"
              className="inline-flex items-center justify-center gap-2.5 w-[44px] sm:w-auto sm:pl-4 sm:pr-2.5 min-h-[44px] rounded-full bg-surface text-ink border border-hairline shadow-1 hover:shadow-3 text-[14px] font-medium transition-[box-shadow,transform] duration-hover ease-out-expo shrink-0"
            >
              <Search className="w-4 h-4 text-navy shrink-0" strokeWidth={1.75} />
              <span className="hidden sm:inline text-muted">Search</span>
              <kbd className="hidden sm:inline-flex items-center justify-center min-w-[50px] h-[26px] px-2 text-[12px] font-sans font-medium rounded-[8px] bg-[#f4f7fd] dark:bg-[#1c2646] border border-hairline text-ink">
                {shortcutLabel}
              </kbd>
            </button>

            <Link
              href="/contact"
              className={`hidden sm:inline-flex items-center justify-center gap-2 px-5 min-h-[44px] text-[14px] font-medium btn-primary-pill ${
                isContactActive ? "ring-2 ring-focus-blue ring-offset-2" : ""
              }`}
            >
              {isContactActive && (
                <span
                  aria-hidden="true"
                  className="w-1.5 h-1.5 rounded-full bg-[#7f9cf5]"
                />
              )}
              <span>Contact</span>
            </Link>

            <button
              ref={mobileToggleBtnRef}
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-drawer"
              className="lg:hidden h-[44px] w-[44px] inline-flex items-center justify-center rounded-full bg-surface text-ink border border-hairline shadow-1 shrink-0"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" strokeWidth={1.5} />
              ) : (
                <Menu className="w-5 h-5" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Accessible Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          ref={mobileDrawerRef}
          className="fixed inset-0 z-50 lg:hidden flex flex-col"
        >
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-[#00000e]/35"
          />
          <div className="relative z-10 m-3 rounded-[24px] bg-surface border border-hairline shadow-3 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-[10px] bg-surface border border-hairline shadow-1 flex items-center justify-center shrink-0">
                  <ZeeMark size={24} />
                </div>
                <div>
                  <div className="font-semibold text-[16px] text-ink leading-tight">
                    Zee Writes
                  </div>
                  <div className="text-[13px] text-muted leading-tight">
                    Guides &amp; Fixes
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="h-[44px] w-[44px] inline-flex items-center justify-center rounded-full bg-page text-ink border border-hairline"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            <nav aria-label="Mobile navigation" className="space-y-1">
              {centerNavLinks.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 min-h-[44px] rounded-[14px] text-[15px] font-medium transition-colors duration-micro ${
                      isActive
                        ? "bg-badge-bg text-badge-text"
                        : "text-secondary hover:bg-page hover:text-ink"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-badge-dot" />
                      )}
                      {item.label}
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted" strokeWidth={1.5} />
                  </Link>
                );
              })}
            </nav>

            <div className="pt-2 border-t border-hairline flex flex-col gap-2">
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center px-5 min-h-[44px] text-[15px] font-medium btn-primary-pill"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Search Palette Modal (Solid white surface, Shadow 3, keyboard navigation) */}
      {isCommandOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search guides"
          onKeyDown={handleModalKeyDown}
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4"
        >
          <div
            onClick={() => setCommandOpen(false)}
            className="fixed inset-0 bg-[#00000e]/35"
          />
          <div className="relative z-10 w-full max-w-[640px] rounded-[20px] bg-surface border border-hairline shadow-3 overflow-hidden">
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-hairline">
              <Search className="w-5 h-5 text-navy shrink-0" strokeWidth={1.75} />
              <input
                ref={searchInputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search guides or errors, like UTF-8, SSL, CRLF, JSON"
                aria-label="Search guides or errors"
                className="w-full bg-transparent text-[16px] text-ink placeholder:text-muted placeholder:opacity-100 focus:outline-none min-h-[44px]"
              />
              <button
                type="button"
                onClick={() => setCommandOpen(false)}
                aria-label="Close search modal"
                className="px-3 min-h-[36px] rounded-[8px] bg-[#f4f7fd] dark:bg-[#1c2646] border border-hairline text-[13px] font-medium text-ink hover:border-[#4a74f0] transition-colors duration-micro shrink-0"
              >
                Esc
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filteredArticles.length === 0 ? (
                <div className="py-12 px-4 text-center text-[15px] text-muted">
                  No guides found for &ldquo;{query}&rdquo;.
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredArticles.map((article, idx) => {
                    const readMins = Math.max(
                      1,
                      Math.ceil(article.wordCount / 200)
                    );
                    const isSelected = idx === selectedIndex;

                    return (
                      <button
                        key={article.id}
                        type="button"
                        onMouseEnter={() => setSelectedIndex(idx)}
                        onClick={() => {
                          setCommandOpen(false);
                          router.push(`/article/${article.slug}`);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-[14px] transition-colors duration-micro flex items-center justify-between gap-4 ${
                          isSelected
                            ? "bg-badge-bg text-ink"
                            : "hover:bg-page text-ink"
                        }`}
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2.5 text-[13px]">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface border border-hairline text-ink text-[12px] font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                              {CATEGORIES[article.category]?.shortName || "Guide"}
                            </span>
                            <span className="text-muted">
                              {readMins} min read
                            </span>
                          </div>
                          <div className="text-[15px] font-semibold text-ink truncate">
                            {article.title}
                          </div>
                        </div>
                        <ArrowRight
                          className={`w-4 h-4 shrink-0 transition-transform duration-micro ${
                            isSelected
                              ? "text-navy translate-x-0.5"
                              : "text-muted"
                          }`}
                          strokeWidth={1.5}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Keyboard Navigation Hint */}
            <div className="px-5 py-3 border-t border-hairline bg-page flex items-center justify-between text-[13px] text-muted">
              <div className="flex items-center gap-4">
                <span>Use up and down arrows to navigate</span>
                <span>Enter to open</span>
              </div>
              <span>{formatGuideCount(filteredArticles.length)}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
