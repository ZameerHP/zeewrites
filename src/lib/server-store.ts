import fs from "node:fs";
import path from "node:path";
import { Article, SiteSettings } from "@/types";
import { SEED_ARTICLES } from "@/data/articles";
import { DEFAULT_SITE_SETTINGS } from "@/data/categories";
import { supabase, isSupabaseConfigured } from "./supabase";

export interface DatabaseSchema {
  articles: Article[];
  settings: SiteSettings;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "zeewrites-db.json");

// Local File Read Fallback
function readLocalJson(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return {
        articles: [],
        settings: DEFAULT_SITE_SETTINGS,
      };
    }
    const raw = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;
    const articles = Array.isArray(parsed.articles) ? parsed.articles : [];
    const settings: SiteSettings = {
      ...DEFAULT_SITE_SETTINGS,
      ...(parsed.settings || {}),
    };
    return { articles, settings };
  } catch {
    return {
      articles: [],
      settings: DEFAULT_SITE_SETTINGS,
    };
  }
}

// Local File Write
function writeLocalJson(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    // Vercel serverless has a read-only filesystem outside /tmp, catch gracefully
    console.warn("Local filesystem write skipped/failed:", err);
  }
}

/**
 * Read Database:
 * 1. If Supabase is configured (in Vercel or locally), fetch live from Supabase table 'articles' and 'settings'
 * 2. Fall back seamlessly to local zeewrites-db.json / SEED_ARTICLES
 */
export async function getDatabase(): Promise<DatabaseSchema> {
  if (isSupabaseConfigured && supabase) {
    try {
      const [artRes, setRes] = await Promise.all([
        supabase.from("articles").select("*").order("published_at", { ascending: false }),
        supabase.from("site_settings").select("*").limit(1).maybeSingle(),
      ]);

      if (!artRes.error && Array.isArray(artRes.data) && artRes.data.length > 0) {
        // Map snake_case / json columns back to Article objects
        const articles: Article[] = artRes.data.map((row) => {
          if (row.raw_payload) {
            return row.raw_payload as Article;
          }
          return {
            id: row.id,
            slug: row.slug,
            title: row.title,
            subtitle: row.subtitle || "",
            excerpt: row.excerpt || "",
            category: row.category,
            publishedAt: row.published_at || new Date().toISOString(),
            updatedAt: row.updated_at || new Date().toISOString(),
            testedOn: row.tested_on || "",
            readingTimeMinutes: row.reading_time_minutes || 5,
            wordCount: row.word_count || 500,
            featured: Boolean(row.featured),
            status: row.status || "published",
            primaryKeyword: row.primary_keyword || "",
            metaTitle: row.meta_title || row.title,
            metaDescription: row.meta_description || row.excerpt || "",
            coverImage: row.cover_image || {
              url: "/images/diagrams/ssl-handshake.svg",
              alt: row.title,
              caption: "",
              width: 1200,
              height: 750,
              diagramType: "ssl-handshake",
            },
            verifiedTakeaway: row.verified_takeaway || {
              symptom: "",
              rootCause: "",
              instantFix: "",
              estimatedFixTime: "",
              testedPlatforms: [],
            },
            howToSteps: row.how_to_steps || [],
            sections: row.sections || [],
            faqs: row.faqs || [],
            author: row.author || DEFAULT_AUTHOR_FALLBACK,
            tags: row.tags || [],
            relatedSlugs: row.related_slugs || [],
            helpfulYes: row.helpful_yes ?? 0,
            helpfulNo: row.helpful_no ?? 0,
          };
        });

        const settings: SiteSettings =
          setRes.data && setRes.data.raw_payload
            ? setRes.data.raw_payload
            : DEFAULT_SITE_SETTINGS;

        return { articles, settings };
      }
    } catch (err) {
      console.error("Supabase read error, falling back to local JSON:", err);
    }
  }

  return readLocalJson();
}

/**
 * Synchronous read for compatibility with static calls
 */
export function readDatabase(): DatabaseSchema {
  return readLocalJson();
}

/**
 * Save Article (Insert or Update):
 * Upserts to Supabase if configured + updates local JSON file
 */
export async function saveArticle(article: Article): Promise<DatabaseSchema> {
  const current = await getDatabase();
  const existingIdx = current.articles.findIndex(
    (a) => a.id === article.id || a.slug === article.slug
  );

  if (existingIdx >= 0) {
    current.articles[existingIdx] = article;
  } else {
    current.articles = [article, ...current.articles];
  }

  writeLocalJson(current);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("articles").upsert({
        id: article.id,
        slug: article.slug,
        title: article.title,
        subtitle: article.subtitle,
        excerpt: article.excerpt,
        category: article.category,
        published_at: article.publishedAt,
        updated_at: article.updatedAt,
        tested_on: article.testedOn,
        reading_time_minutes: article.readingTimeMinutes,
        word_count: article.wordCount,
        featured: article.featured,
        status: article.status,
        primary_keyword: article.primaryKeyword,
        meta_title: article.metaTitle,
        meta_description: article.metaDescription,
        raw_payload: article,
      });
    } catch (err) {
      console.error("Supabase upsert error:", err);
    }
  }

  return current;
}

/**
 * Delete Article:
 * Removes from Supabase if configured + removes from local JSON file
 */
export async function removeArticle(id: string): Promise<DatabaseSchema> {
  const current = await getDatabase();
  current.articles = current.articles.filter((a) => a.id !== id);

  writeLocalJson(current);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("articles").delete().eq("id", id);
    } catch (err) {
      console.error("Supabase delete error:", err);
    }
  }

  return current;
}

/**
 * Update Settings
 */
export async function saveSettings(
  nextSettings: Partial<SiteSettings>
): Promise<DatabaseSchema> {
  const current = await getDatabase();
  current.settings = {
    ...current.settings,
    ...nextSettings,
    updatedAt: new Date().toISOString(),
  };

  writeLocalJson(current);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("site_settings").upsert({
        id: "default",
        raw_payload: current.settings,
        updated_at: current.settings.updatedAt,
      });
    } catch (err) {
      console.error("Supabase settings error:", err);
    }
  }

  return current;
}

/**
 * Legacy writeDatabase wrapper for backward compatibility
 */
export function writeDatabase(nextData: DatabaseSchema): DatabaseSchema {
  writeLocalJson(nextData);
  return nextData;
}

const DEFAULT_AUTHOR_FALLBACK = {
  name: "Zee",
  role: "",
  credentials: "",
  bio: "Zee writes the guides and maintains the text tools on Zee Writes.",
  avatarInitials: "Z",
  yearsExperience: 0,
  verifiedFixesPublished: 0,
};
