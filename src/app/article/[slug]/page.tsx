import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDatabase } from "@/lib/server-store";
import { generateArticleJsonLd } from "@/lib/schema";
import { ArticleReaderView } from "@/components/article/ArticleReaderView";

export const dynamic = "force-dynamic";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase().trim();
  const { articles, settings } = await getDatabase();
  const article = articles.find(
    (a) =>
      a.slug.toLowerCase().trim() === decodedSlug ||
      a.slug === slug ||
      a.id === slug
  );

  if (!article) {
    return {
      title: "Article Not Found | Zee Writes",
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
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase().trim();
  const { articles, settings } = await getDatabase();
  const article = articles.find(
    (a) =>
      a.slug.toLowerCase().trim() === decodedSlug ||
      a.slug === slug ||
      a.id === slug
  );

  if (!article) {
    notFound();
  }

  const jsonLd = generateArticleJsonLd(article, settings);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleReaderView initialArticle={article} slug={slug} />
    </>
  );
}
