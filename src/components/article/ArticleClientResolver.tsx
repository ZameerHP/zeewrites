"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { Article, SiteSettings } from "@/types";
import { useSite } from "@/components/providers/SiteProvider";
import { ArticleReaderView } from "@/components/article/ArticleReaderView";
import { ZeeMark } from "@/components/ui/ZeeLogo";

interface ArticleClientResolverProps {
  slug: string;
  fallbackSettings?: SiteSettings;
}

function cleanSlug(s: string): string {
  try {
    return decodeURIComponent(s)
      .toLowerCase()
      .trim()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  } catch {
    return s.toLowerCase().trim();
  }
}

export function ArticleClientResolver({
  slug,
  fallbackSettings,
}: ArticleClientResolverProps) {
  const { articles } = useSite();
  const [fetchedArticle, setFetchedArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const targetSlug = cleanSlug(slug);
  const rawTarget = decodeURIComponent(slug).toLowerCase().trim();

  // 1. Check local client SiteProvider articles
  const matchedInStore = useMemo(() => {
    return articles.find((a) => {
      const s = cleanSlug(a.slug);
      const rawS = a.slug.toLowerCase().trim();
      return (
        s === targetSlug ||
        rawS === rawTarget ||
        a.slug === slug ||
        a.id === slug ||
        a.slug.replace(/-/g, "") === slug.replace(/-/g, "")
      );
    });
  }, [articles, targetSlug, rawTarget, slug]);

  // 2. Fetch fresh from API if not yet found in store
  useEffect(() => {
    if (matchedInStore) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    async function fetchFromApi() {
      try {
        const res = await fetch("/api/cms", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.articles)) {
            const found = data.articles.find((a: Article) => {
              const s = cleanSlug(a.slug);
              const rawS = a.slug.toLowerCase().trim();
              return (
                s === targetSlug ||
                rawS === rawTarget ||
                a.slug === slug ||
                a.id === slug ||
                a.slug.replace(/-/g, "") === slug.replace(/-/g, "")
              );
            });
            if (found && isMounted) {
              setFetchedArticle(found);
            }
          }
        }
      } catch (err) {
        console.warn("Could not fetch article dynamically:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchFromApi();
    return () => {
      isMounted = false;
    };
  }, [matchedInStore, targetSlug, rawTarget, slug]);

  const activeArticle = matchedInStore || fetchedArticle;

  if (activeArticle) {
    return <ArticleReaderView initialArticle={activeArticle} slug={activeArticle.slug} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-navy animate-spin" />
        <p className="text-[14px] text-muted font-mono">Loading article...</p>
      </div>
    );
  }

  // Not found fallback UI
  return (
    <section className="px-[14px] pb-12">
      <div className="relative rounded-[32px] border border-hairline stage-panel-gradient overflow-hidden min-h-[480px] flex flex-col items-center justify-center py-16 px-4 sm:px-6 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 stage-dot-pattern"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[18%] stage-bottom-fade"
        />

        <div className="relative z-10 max-w-[540px] mx-auto flex flex-col items-center">
          <div className="w-[64px] h-[64px] rounded-[18px] bg-surface shadow-2 border border-hairline ring-1 ring-inset ring-white dark:ring-white/15 flex items-center justify-center mb-5">
            <ZeeMark size={34} />
          </div>

          <div className="inline-flex items-center gap-2 h-[32px] px-[14px] mb-[20px] rounded-full bg-surface border border-hairline shadow-1 text-[13px] font-medium text-ink">
            <span className="w-[6px] h-[6px] rounded-full bg-accent" />
            <span>404 Page not found</span>
          </div>

          <h1 className="font-sans font-medium text-[clamp(30px,5vw,48px)] leading-[1.08] tracking-[-0.025em] text-ink [text-wrap:balance]">
            We Couldn&apos;t Find <span className="text-navy">That Page</span>
          </h1>

          <p className="mt-[20px] mb-[28px] text-[18px] text-secondary leading-[1.55] [text-wrap:balance]">
            The guide or page you requested may have moved. Use the link below
            to return to the frontpage.
          </p>

          <div className="flex items-center justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-7 min-h-[44px] text-[15px] font-medium btn-primary-pill"
            >
              <span>Return Home</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
