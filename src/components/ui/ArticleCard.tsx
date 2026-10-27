import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Article } from "@/types";
import { CATEGORIES } from "@/data/categories";
import { TechnicalDiagram } from "@/components/ui/TechnicalDiagram";

interface ArticleCardProps {
  article: Article;
  priorityImage?: boolean;
  featured?: boolean;
}

export function ArticleCard({
  article,
  priorityImage = false,
  featured = false,
}: ArticleCardProps) {
  const category = CATEGORIES[article.category];
  const readingTimeMinutes = Math.max(1, Math.ceil(article.wordCount / 200));
  const formattedDate = new Date(article.publishedAt).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  return (
    <Link
      href={`/article/${article.slug}`}
      className={`group block rounded-[24px] bg-surface border border-hairline shadow-2 hover:shadow-3 hover:-translate-y-[2px] transition-[transform,box-shadow] duration-hover ease-out-expo p-3 focus-visible:outline-2 focus-visible:outline-focus-blue focus-visible:outline-offset-2 ${
        featured
          ? "grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
          : "flex flex-col h-full"
      }`}
    >
      {/* Inset Blue Gradient Panel with Guide Vignette */}
      <div className={featured ? "lg:col-span-6 w-full" : "w-full shrink-0"}>
        <TechnicalDiagram
          image={article.coverImage}
          priority={priorityImage}
          compact={true}
          showCaption={false}
        />
      </div>

      {/* Card Body */}
      <div
        className={
          featured
            ? "lg:col-span-6 p-3 sm:p-5 flex flex-col justify-between h-full space-y-4"
            : "px-3 pt-4 pb-3 flex flex-col justify-between flex-1 space-y-4"
        }
      >
        <div className="space-y-3">
          {/* Category Pill with small blue dot + sentence-case read time */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-badge-bg text-badge-text text-[13px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-badge-dot" />
              <span>{category?.shortName || "Guide"}</span>
            </span>
            <span className="text-[14px] text-muted font-normal">
              {readingTimeMinutes} min read
            </span>
          </div>

          {/* Card Title (20px, line-height 1.3, weight 600, up to 4 lines) */}
          <h3
            className={`font-sans font-semibold text-ink group-hover:text-navy transition-colors duration-micro leading-[1.3] line-clamp-4 ${
              featured ? "text-[22px] sm:text-[26px]" : "text-[20px]"
            }`}
          >
            {article.title}
          </h3>

          {/* Two-line excerpt in muted text */}
          <p className="text-[15px] text-muted line-clamp-2 leading-[1.6]">
            {article.excerpt}
          </p>
        </div>

        {/* Footer with Date and "Read Guide" + Arrow Icon */}
        <div className="pt-3 border-t border-hairline flex items-center justify-between gap-3 text-[14px]">
          <time dateTime={article.publishedAt} className="text-muted">
            {formattedDate}
          </time>

          <span className="inline-flex items-center gap-1.5 font-semibold text-navy group-hover:translate-x-0.5 transition-transform duration-hover ease-out-expo">
            <span>Read Guide</span>
            <ArrowRight className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          </span>
        </div>
      </div>
    </Link>
  );
}
