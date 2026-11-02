import React from "react";
import { Metadata } from "next";
import { getDatabase, getArticleBySlug } from "@/lib/server-store";
import { generateArticleJsonLd } from "@/lib/schema";
import { ArticleReaderView } from "@/components/article/ArticleReaderView";
import { ArticleClientResolver } from "@/components/article/ArticleClientResolver";
import { Article } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const { settings } = await getDatabase();
    const article = await getArticleBySlug(slug);

    if (!article) {
      const cleanTitle = decodeURIComponent(slug)
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return {
        title: `${cleanTitle} | Zee Writes`,
        description: `Read ${cleanTitle} on Zee Writes.`,
      };
    }

    const baseUrl = settings.siteUrl.replace(/\/$/, "");
    const canonicalUrl = `${baseUrl}/article/${article.slug}`;

    return {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt,
      keywords: article.tags,
      authors: [{ name: "Zee", url: `${baseUrl}/about` }],
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        type: "article",
        url: canonicalUrl,
        title: article.metaTitle || article.title,
        description: article.metaDescription || article.excerpt,
        publishedTime: article.publishedAt,
        modifiedTime: article.updatedAt,
        authors: ["Zee"],
        tags: article.tags,
      },
      twitter: {
        card: "summary_large_image",
        title: article.metaTitle || article.title,
        description: article.metaDescription || article.excerpt,
      },
    };
  } catch {
    return {
      title: "Zee Writes | Guides & Tech Fixes",
    };
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const { settings } = await getDatabase();
  const article = await getArticleBySlug(slug);

  if (!article) {
    return <ArticleClientResolver slug={slug} fallbackSettings={settings} />;
  }

  let jsonLd: any = null;
  try {
    jsonLd = generateArticleJsonLd(article, settings);
  } catch (err) {
    console.warn("JSON-LD generation notice:", err);
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ArticleReaderView initialArticle={article} slug={article.slug} />
    </>
  );
}
