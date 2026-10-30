import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { TEXT_TOOLS } from "@/data/tools";
import { getDatabase } from "@/lib/server-store";
import { CategorySlug } from "@/types";
import { CategoryArticlesGrid } from "@/components/category/CategoryArticlesGrid";
import { AdSlot } from "@/components/ui/AdSlot";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES[slug as CategorySlug];

  if (!category) {
    return {
      title: "Category Not Found | Zee Writes",
    };
  }

  return {
    title: category.seoTitle,
    description: category.seoDescription,
    alternates: {
      canonical: `https://zeewrites.com/category/${category.slug}`,
    },
    openGraph: {
      title: category.seoTitle,
      description: category.seoDescription,
      url: `https://zeewrites.com/category/${category.slug}`,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = CATEGORIES[slug as CategorySlug];

  if (!category) {
    notFound();
  }

  const { articles } = await getDatabase();
  const categoryArticles = articles
    .filter((a) => a.status === "published" && a.category === category.slug)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://zeewrites.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: category.name,
        item: `https://zeewrites.com/category/${category.slug}`,
      },
    ],
  };

  return (
    <div className="space-y-12 pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Compact Stage Header */}
      <section className="px-[14px]">
        <div className="relative rounded-[32px] border border-hairline stage-panel-gradient overflow-hidden min-h-[260px] sm:min-h-[280px] flex flex-col items-center justify-center py-12 px-4 sm:px-6 text-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 stage-dot-pattern"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[18%] stage-bottom-fade"
          />

          <div className="relative z-10 max-w-[760px] mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 h-[32px] px-[14px] mb-[20px] rounded-full bg-surface border border-hairline shadow-1 text-[13px] font-medium text-ink">
              <span className="w-[6px] h-[6px] rounded-full bg-accent" />
              <span>{category.shortName}</span>
            </div>

            <h1 className="font-sans font-medium text-[clamp(30px,5vw,48px)] leading-[1.08] tracking-[-0.025em] text-ink [text-wrap:balance]">
              {category.name}
            </h1>

            <p className="mt-[20px] text-[18px] leading-[1.55] text-secondary max-w-[560px] mx-auto [text-wrap:balance]">
              {category.tagline}
            </p>
          </div>
        </div>
      </section>

      {/* 3-Column Card Grid */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {category.slug === "tools" ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEXT_TOOLS.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className="group rounded-[24px] bg-surface border border-hairline shadow-2 hover:shadow-3 hover:-translate-y-[2px] transition-[transform,box-shadow] duration-hover ease-out-expo p-7 flex flex-col justify-between gap-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-badge-bg text-badge-text text-[13px] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-badge-dot" />
                      <span>{tool.badge}</span>
                    </span>
                    <ArrowRight
                      className="w-4 h-4 text-muted group-hover:text-navy"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h2 className="font-sans font-semibold text-[20px] leading-[1.3] text-ink group-hover:text-navy">
                    {tool.name}
                  </h2>
                  <p className="text-[15px] text-secondary leading-[1.6]">
                    {tool.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-hairline flex items-center justify-end text-[14px] text-navy font-semibold gap-1.5">
                  <span>Open Tool</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </div>
              </Link>
            ))}
          </section>
        ) : (
          <CategoryArticlesGrid
            categorySlug={category.slug}
            initialArticles={categoryArticles}
          />
        )}

        <AdSlot id={`category-${category.slug}`} format="leaderboard" />
      </div>
    </div>
  );
}
