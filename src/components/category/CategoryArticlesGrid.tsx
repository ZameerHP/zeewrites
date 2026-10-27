"use client";

import React, { useMemo } from "react";
import { Article, CategorySlug } from "@/types";
import { useSite } from "@/components/providers/SiteProvider";
import { ArticleCard } from "@/components/ui/ArticleCard";

interface CategoryArticlesGridProps {
  categorySlug: CategorySlug;
  initialArticles: Article[];
}

export function CategoryArticlesGrid({
  categorySlug,
  initialArticles,
}: CategoryArticlesGridProps) {
  const { articles: liveArticles } = useSite();
  const sourceArticles = liveArticles;

  const categoryArticles = useMemo(() => {
    return sourceArticles
      .filter((a) => a.status === "published" && a.category === categorySlug)
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
  }, [sourceArticles, categorySlug]);

  if (categoryArticles.length === 0) {
    return (
      <div className="rounded-[24px] bg-surface border border-hairline p-12 text-center shadow-1 space-y-3">
        <h3 className="font-sans font-semibold text-[18px] text-ink">
          No guides in this category yet
        </h3>
        <p className="text-[14px] text-muted max-w-[420px] mx-auto">
          Articles added from the Admin Panel will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categoryArticles.map((article, idx) => (
        <ArticleCard
          key={article.id}
          article={article}
          priorityImage={idx < 3}
        />
      ))}
    </section>
  );
}
