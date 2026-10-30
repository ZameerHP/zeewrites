import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { Article, SiteSettings } from "@/types";
import { DEFAULT_SITE_SETTINGS } from "@/data/categories";
import { supabaseAdmin, storageMode, isSupabaseConfigured } from "./supabase";

export interface DatabaseSchema {
  articles: Article[];
  settings: SiteSettings;
}

const DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_DB_FILE = path.join(DATA_DIR, "zeewrites-db.json");
const TMP_DB_FILE = path.join(os.tmpdir(), "zeewrites-db.json");

/**
 * Local / Serverless JSON read
 * Reads from TMP_DB_FILE if it exists (written during runtime on Vercel),
 * otherwise reads from LOCAL_DB_FILE.
 */
function readLocalJson(): DatabaseSchema {
  try {
    const fileToRead = fs.existsSync(TMP_DB_FILE)
      ? TMP_DB_FILE
      : fs.existsSync(LOCAL_DB_FILE)
      ? LOCAL_DB_FILE
      : null;

    if (!fileToRead) {
      return {
        articles: [],
        settings: DEFAULT_SITE_SETTINGS,
      };
    }
    const raw = fs.readFileSync(fileToRead, "utf8");
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

/**
 * Local / Serverless JSON write
 * Tries local directory first. Always writes to /tmp (writable in all serverless environments).
 */
function writeLocalJson(data: DatabaseSchema): void {
  const content = JSON.stringify(data, null, 2);

  // 1. Write to local repo data file if writable (local dev)
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DB_FILE, content, "utf8");
  } catch {
    // Expected on Vercel read-only filesystem
  }

  // 2. Write to system temp file (works 100% on Vercel, AWS Lambda, Linux, Windows)
  try {
    fs.writeFileSync(TMP_DB_FILE, content, "utf8");
  } catch (err) {
    console.warn("Failed to write to tmp file:", err);
  }
}

/**
 * Maps Supabase rows to TypeScript Article model
 */
function mapRowToArticle(row: any): Article {
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
}

/**
 * Read Database:
 * Queries Supabase when configured, seamlessly combines with serverless runtime store.
 */
export async function getDatabase(): Promise<DatabaseSchema> {
  const local = readLocalJson();

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const [artRes, setRes] = await Promise.all([
        supabaseAdmin
          .from("articles")
          .select("*")
          .order("published_at", { ascending: false }),
        supabaseAdmin.from("site_settings").select("*").limit(1).maybeSingle(),
      ]);

      if (!artRes.error && Array.isArray(artRes.data)) {
        const supabaseArticles: Article[] = artRes.data.map(mapRowToArticle);

        // Include any articles created locally/in tmp that haven't synced to Supabase yet
        const combined = [...supabaseArticles];
        for (const locArt of local.articles) {
          if (!combined.some((a) => a.id === locArt.id || a.slug === locArt.slug)) {
            combined.push(locArt);
          }
        }

        const settings: SiteSettings =
          setRes.data && setRes.data.raw_payload
            ? setRes.data.raw_payload
            : local.settings || DEFAULT_SITE_SETTINGS;

        return { articles: combined, settings };
      }
    } catch (err) {
      console.warn("Supabase getDatabase notice (using local/tmp store):", err);
    }
  }

  return local;
}

/**
 * Save Article (Insert or Update):
 * Saves to local/tmp store AND to Supabase with schema-resilient fallback.
 */
export async function saveArticle(article: Article): Promise<DatabaseSchema> {
  // 1. Immediately persist to local/serverless runtime storage
  const current = readLocalJson();
  const existingIdx = current.articles.findIndex(
    (a) => a.id === article.id || a.slug === article.slug
  );
  if (existingIdx >= 0) {
    current.articles[existingIdx] = article;
  } else {
    current.articles = [article, ...current.articles];
  }
  writeLocalJson(current);

  // 2. Persist to Supabase if configured
  if (isSupabaseConfigured && supabaseAdmin) {
    const fullPayload = {
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
    };

    try {
      let res = await supabaseAdmin
        .from("articles")
        .upsert(fullPayload, { onConflict: "id" })
        .select();

      // If full payload failed due to custom/missing columns in user's table, retry with core schema
      if (res.error) {
        console.warn("Full payload upsert failed, retrying with core fields:", res.error.message);
        const corePayload: Record<string, any> = {
          id: article.id,
          slug: article.slug,
          title: article.title,
          category: article.category,
          published_at: article.publishedAt,
          updated_at: article.updatedAt,
          status: article.status,
          excerpt: article.excerpt,
        };

        const tryWithRaw = await supabaseAdmin
          .from("articles")
          .upsert({ ...corePayload, raw_payload: article }, { onConflict: "id" })
          .select();

        if (!tryWithRaw.error) {
          res = tryWithRaw;
        } else {
          res = await supabaseAdmin
            .from("articles")
            .upsert(corePayload, { onConflict: "id" })
            .select();
        }
      }
    } catch (err) {
      console.warn("Supabase upsert warning (article saved to serverless runtime):", err);
    }
  }

  return getDatabase();
}

/**
 * Delete Article:
 * Removes from local/tmp store AND deletes from Supabase.
 */
export async function removeArticle(id: string): Promise<DatabaseSchema> {
  // 1. Remove from local/serverless runtime storage
  const current = readLocalJson();
  current.articles = current.articles.filter((a) => a.id !== id && a.slug !== id);
  writeLocalJson(current);

  // 2. Delete from Supabase if configured
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      await supabaseAdmin
        .from("articles")
        .delete()
        .or(`id.eq.${id},slug.eq.${id}`)
        .select();
    } catch (err) {
      console.warn("Supabase delete warning:", err);
    }
  }

  return getDatabase();
}

/**
 * Update Settings
 */
export async function saveSettings(
  nextSettings: Partial<SiteSettings>
): Promise<DatabaseSchema> {
  const current = readLocalJson();
  current.settings = {
    ...current.settings,
    ...nextSettings,
    updatedAt: new Date().toISOString(),
  };
  writeLocalJson(current);

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      await supabaseAdmin.from("site_settings").upsert({
        id: "global_settings",
        raw_payload: current.settings,
        updated_at: current.settings.updatedAt,
      });
    } catch (err) {
      console.warn("Supabase settings upsert warning:", err);
    }
  }

  return getDatabase();
}

const DEFAULT_AUTHOR_FALLBACK = {
  name: "Zee",
  role: "Lead Systems Architect",
  credentials: "",
  bio: "Zee writes the guides and maintains the text tools on Zee Writes.",
  avatarInitials: "Z",
  yearsExperience: 10,
  verifiedFixesPublished: 120,
};
