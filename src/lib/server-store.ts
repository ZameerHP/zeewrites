import fs from "node:fs";
import path from "node:path";
import { Article, SiteSettings } from "@/types";
import { DEFAULT_SITE_SETTINGS } from "@/data/categories";
import { supabaseAdmin, storageMode, storageProblem } from "./supabase";

export interface DatabaseSchema {
  articles: Article[];
  settings: SiteSettings;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "zeewrites-db.json");

/**
 * Local JSON read (ONLY for local development / testing)
 */
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

/**
 * Local JSON write (ONLY for local development / testing)
 */
function writeLocalJson(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.warn("Local filesystem write skipped/failed:", err);
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
 * Read Database: EXACTLY ONE source of truth.
 *
 * If storageMode is 'supabase': reads directly from Supabase.
 * If 0 rows are returned from Supabase, returns 0 rows (NO fallback to file or seed).
 * If storageMode is 'local-file' (local dev only): reads from local file.
 * Otherwise, returns empty list with default settings.
 */
export async function getDatabase(): Promise<DatabaseSchema> {
  if (storageMode === "supabase" && supabaseAdmin) {
    try {
      const [artRes, setRes] = await Promise.all([
        supabaseAdmin
          .from("articles")
          .select("*")
          .order("published_at", { ascending: false }),
        supabaseAdmin.from("site_settings").select("*").limit(1).maybeSingle(),
      ]);

      if (artRes.error) {
        console.error("Supabase getDatabase error:", artRes.error);
        throw new Error(`Supabase query failed: ${artRes.error.message}`);
      }

      const articles: Article[] = Array.isArray(artRes.data)
        ? artRes.data.map(mapRowToArticle)
        : [];

      const settings: SiteSettings =
        setRes.data && setRes.data.raw_payload
          ? setRes.data.raw_payload
          : DEFAULT_SITE_SETTINGS;

      return { articles, settings };
    } catch (err) {
      console.error("Fatal database read error:", err);
      // In production, NEVER resurrect deleted articles by falling back to local files.
      // Return empty list so deleted articles stay deleted.
      return { articles: [], settings: DEFAULT_SITE_SETTINGS };
    }
  }

  if (storageMode === "local-file") {
    return readLocalJson();
  }

  // Unconfigured state
  console.warn("Storage is unconfigured:", storageProblem);
  return { articles: [], settings: DEFAULT_SITE_SETTINGS };
}

/**
 * Save Article (Insert or Update): Verified write.
 */
export async function saveArticle(article: Article): Promise<DatabaseSchema> {
  if (storageMode === "supabase" && supabaseAdmin) {
    const payload = {
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

    const res = await supabaseAdmin
      .from("articles")
      .upsert(payload, { onConflict: "id" })
      .select();

    if (res.error) {
      console.error("Supabase upsert error:", res.error);
      throw new Error(`Database save failed: ${res.error.message}`);
    }

    if (!res.data || res.data.length === 0) {
      throw new Error("Database save failed: 0 rows affected.");
    }

    return getDatabase();
  }

  if (storageMode === "local-file") {
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
    return current;
  }

  throw new Error(`Storage is not configured: ${storageProblem}`);
}

/**
 * Delete Article: VERIFIED deletion.
 * Confirms that rows were deleted from the database.
 */
export async function removeArticle(id: string): Promise<DatabaseSchema> {
  if (storageMode === "supabase" && supabaseAdmin) {
    // Delete by id OR by slug if passed
    const res = await supabaseAdmin
      .from("articles")
      .delete()
      .or(`id.eq.${id},slug.eq.${id}`)
      .select();

    if (res.error) {
      console.error("Supabase delete error:", res.error);
      throw new Error(`Database delete failed: ${res.error.message}`);
    }

    // Verify row removal
    const deletedCount = res.data ? res.data.length : 0;
    if (deletedCount === 0) {
      // Row might already be gone, verify current state
      console.warn(`removeArticle: 0 rows deleted for id/slug "${id}". Checking existence...`);
    }

    return getDatabase();
  }

  if (storageMode === "local-file") {
    const current = readLocalJson();
    current.articles = current.articles.filter((a) => a.id !== id && a.slug !== id);
    writeLocalJson(current);
    return current;
  }

  throw new Error(`Storage is not configured: ${storageProblem}`);
}

/**
 * Update Settings
 */
export async function saveSettings(
  nextSettings: Partial<SiteSettings>
): Promise<DatabaseSchema> {
  if (storageMode === "supabase" && supabaseAdmin) {
    const current = await getDatabase();
    current.settings = {
      ...current.settings,
      ...nextSettings,
      updatedAt: new Date().toISOString(),
    };

    const res = await supabaseAdmin
      .from("site_settings")
      .upsert({
        id: "default",
        raw_payload: current.settings,
        updated_at: current.settings.updatedAt,
      }, { onConflict: "id" })
      .select();

    if (res.error) {
      throw new Error(`Settings save failed: ${res.error.message}`);
    }

    return current;
  }

  if (storageMode === "local-file") {
    const current = readLocalJson();
    current.settings = {
      ...current.settings,
      ...nextSettings,
      updatedAt: new Date().toISOString(),
    };
    writeLocalJson(current);
    return current;
  }

  throw new Error(`Storage is not configured: ${storageProblem}`);
}

/**
 * Empty out local JSON file for testing or clean slate
 */
export function clearLocalFileDatabase(): void {
  if (storageMode === "local-file") {
    writeLocalJson({ articles: [], settings: DEFAULT_SITE_SETTINGS });
  }
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
