import { Article, CategorySlug } from "@/types";
import { ARTICLES_PART_1 } from "./articles-part1";
import { ARTICLES_PART_2 } from "./articles-part2";

export const SEED_ARTICLES: Article[] = [...ARTICLES_PART_1, ...ARTICLES_PART_2];

export function getPublishedArticles(articles: Article[] = SEED_ARTICLES): Article[] {
  return articles
    .filter((a) => a.status === "published")
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getArticleBySlug(
  slug: string,
  articles: Article[] = SEED_ARTICLES
): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getArticlesByCategory(
  category: CategorySlug,
  articles: Article[] = SEED_ARTICLES
): Article[] {
  return getPublishedArticles(articles).filter((a) => a.category === category);
}

export function getFeaturedArticles(articles: Article[] = SEED_ARTICLES): Article[] {
  return getPublishedArticles(articles).filter((a) => a.featured);
}
