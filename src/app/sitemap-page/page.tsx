import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getDatabase } from "@/lib/server-store";
import { CATEGORIES, CATEGORY_LIST } from "@/data/categories";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Sitemap | Zee Writes",
  description:
    "HTML Sitemap of all guides, categories, and legal pages on Zee Writes.",
  alternates: {
    canonical: "https://zeewrites.com/sitemap-page",
  },
};

export default async function HtmlSitemapPage() {
  const { articles, deletedIds = [] } = await getDatabase();
  const published = articles.filter(
    (a) =>
      a.status === "published" &&
      !deletedIds.includes(a.id) &&
      !deletedIds.includes(a.slug)
  );

  return (
    <div className="space-y-12 pb-8">
      {/* Compact Stage Header */}
      <section className="px-[14px]">
        <div className="relative rounded-[32px] border border-hairline stage-panel-gradient overflow-hidden min-h-[240px] sm:min-h-[260px] flex flex-col items-center justify-center py-12 px-4 sm:px-6 text-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 stage-dot-pattern"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[18%] stage-bottom-fade"
          />

          <div className="relative z-10 max-w-[700px] mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 h-[32px] px-[14px] mb-[20px] rounded-full bg-surface border border-hairline shadow-1 text-[13px] font-medium text-ink">
              <span className="w-[6px] h-[6px] rounded-full bg-accent" />
              <span>Site directory</span>
            </div>

            <h1 className="font-sans font-medium text-[clamp(30px,4.8vw,48px)] leading-[1.08] tracking-[-0.025em] text-ink [text-wrap:balance]">
              Sitemap
            </h1>

            <p className="mt-[20px] text-[18px] leading-[1.55] text-secondary max-w-[560px] mx-auto [text-wrap:balance]">
              Browse every published guide, category, and legal page on Zee
              Writes.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Column 1 (4 Cols): Categories & Legal Pages */}
        <div className="lg:col-span-4 space-y-6">
          <section className="rounded-[24px] bg-surface border border-hairline shadow-2 p-6 sm:p-7 space-y-4">
            <h2 className="font-sans font-semibold text-[18px] text-ink pb-2 border-b border-hairline">
              1. Categories
            </h2>
            <ul className="divide-y divide-hairline text-[15px]">
              <li>
                <Link
                  href="/"
                  className="py-2.5 flex items-center justify-between text-ink hover:text-navy font-medium transition-colors duration-micro"
                >
                  <span>Home</span>
                  <ArrowRight
                    className="w-4 h-4 text-muted"
                    strokeWidth={1.5}
                  />
                </Link>
              </li>
              {CATEGORY_LIST.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="py-2.5 flex items-center justify-between text-secondary hover:text-navy transition-colors duration-micro"
                  >
                    <span>{cat.name}</span>
                    <ArrowRight
                      className="w-4 h-4 text-muted"
                      strokeWidth={1.5}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[24px] bg-surface border border-hairline shadow-2 p-6 sm:p-7 space-y-4">
            <h2 className="font-sans font-semibold text-[18px] text-ink pb-2 border-b border-hairline">
              2. Legal &amp; Publication Pages
            </h2>
            <ul className="divide-y divide-hairline text-[15px]">
              {[
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" },
                { href: "/privacy-policy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms" },
                { href: "/disclaimer", label: "Disclaimer" },
              ].map((page) => (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    className="py-2.5 flex items-center justify-between text-secondary hover:text-navy transition-colors duration-micro"
                  >
                    <span>{page.label}</span>
                    <ArrowRight
                      className="w-4 h-4 text-muted"
                      strokeWidth={1.5}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Column 2 (8 Cols): All Published Guides in Clean Rows */}
        <section className="lg:col-span-8 rounded-[24px] bg-surface border border-hairline shadow-2 p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-hairline">
            <h2 className="font-sans font-semibold text-[20px] text-ink">
              3. All Guides ({published.length})
            </h2>
          </div>

          <ul className="divide-y divide-hairline">
            {published.map((art) => {
              const cat = CATEGORIES[art.category];
              const mins = Math.max(1, Math.ceil(art.wordCount / 200));
              return (
                <li key={art.id}>
                  <Link
                    href={`/article/${art.slug}`}
                    className="group py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-page px-2 rounded-[12px] transition-colors duration-micro"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 text-[13px]">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-badge-bg text-badge-text font-medium text-[12px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-badge-dot" />
                          <span>{cat?.shortName || "Guide"}</span>
                        </span>
                        <span className="text-muted">{mins} min read</span>
                      </div>
                      <div className="font-sans font-semibold text-[16px] text-ink group-hover:text-navy leading-snug">
                        {art.title}
                      </div>
                    </div>

                    <ArrowRight
                      className="w-4 h-4 text-muted group-hover:text-navy group-hover:translate-x-0.5 transition-all duration-hover ease-out-expo shrink-0"
                      strokeWidth={1.5}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
