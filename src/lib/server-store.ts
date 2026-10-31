import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { Article, SiteSettings } from "@/types";
import { DEFAULT_SITE_SETTINGS } from "@/data/categories";
import { SEED_ARTICLES } from "@/data/articles";
import { supabaseAdmin, storageMode, isSupabaseConfigured } from "./supabase";

export interface DatabaseSchema {
  articles: Article[];
  settings: SiteSettings;
  deletedIds?: string[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_DB_FILE = path.join(DATA_DIR, "zeewrites-db.json");
const TMP_DB_FILE = path.join(os.tmpdir(), "zeewrites-db.json");

function isTestOrPlaceholderArticle(a: Article): boolean {
  return (
    a.slug.includes("wswjhsb") ||
    a.slug === "wswsws" ||
    a.title.includes("wswjhsb") ||
    a.title.trim().toUpperCase() === "WSWSWS"
  );
}

/**
 * Local / Serverless JSON read
 * Merges authoritative LOCAL_DB_FILE and TMP_DB_FILE (written at runtime on Vercel),
 * strictly filters against all deletedIds, and guarantees zero resurrection of deleted posts.
 */
function readLocalJson(): DatabaseSchema {
  try {
    let localParsed: Partial<DatabaseSchema> | null = null;
    let tmpParsed: Partial<DatabaseSchema> | null = null;

    if (fs.existsSync(LOCAL_DB_FILE)) {
      try {
        localParsed = JSON.parse(fs.readFileSync(LOCAL_DB_FILE, "utf8"));
      } catch {}
    }

    if (fs.existsSync(TMP_DB_FILE)) {
      try {
        tmpParsed = JSON.parse(fs.readFileSync(TMP_DB_FILE, "utf8"));
      } catch {}
    }

    if (!localParsed && !tmpParsed) {
      return {
        articles: [],
        settings: DEFAULT_SITE_SETTINGS,
        deletedIds: [],
      };
    }

    const localDeleted = Array.isArray(localParsed?.deletedIds) ? localParsed.deletedIds : [];
    const tmpDeleted = Array.isArray(tmpParsed?.deletedIds) ? tmpParsed.deletedIds : [];
    const allDeleted = Array.from(new Set([...localDeleted, ...tmpDeleted]));

    const articleMap = new Map<string, Article>();
    if (Array.isArray(localParsed?.articles)) {
      for (const a of localParsed.articles) {
        articleMap.set(a.id, a);
        if (a.slug) articleMap.set(a.slug, a);
      }
    }
    if (Array.isArray(tmpParsed?.articles)) {
      for (const a of tmpParsed.articles) {
        articleMap.set(a.id, a);
        if (a.slug) articleMap.set(a.slug, a);
      }
    }

    const mergedArticles = Array.from(new Set(Array.from(articleMap.values())));
    const filteredArticles = mergedArticles.filter(
      (a) =>
        !allDeleted.includes(a.id) &&
        !allDeleted.includes(a.slug) &&
        !isTestOrPlaceholderArticle(a)
    );

    const settings: SiteSettings = {
      ...DEFAULT_SITE_SETTINGS,
      ...(localParsed?.settings || {}),
      ...(tmpParsed?.settings || {}),
    };

    return {
      articles: filteredArticles,
      settings,
      deletedIds: allDeleted,
    };
  } catch {
    return {
      articles: [],
      settings: DEFAULT_SITE_SETTINGS,
      deletedIds: [],
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

      const remoteDeletedIds: string[] = Array.isArray(setRes?.data?.raw_payload?.deletedIds)
        ? setRes.data.raw_payload.deletedIds
        : [];

      // Combine local and remote deletedIds so all workers stay synced
      const allDeletedIds = Array.from(
        new Set([...(local.deletedIds || []), ...remoteDeletedIds])
      );

      if (!artRes.error && Array.isArray(artRes.data)) {
        let supabaseArticles: Article[] = artRes.data.map(mapRowToArticle);

        // Merge local articles and supabase articles to guarantee zero data loss
        // of published user articles (e.g. Windows 11 article)
        const articleMap = new Map<string, Article>();
        for (const a of local.articles) {
          articleMap.set(a.id, a);
          if (a.slug) articleMap.set(a.slug, a);
        }
        for (const a of supabaseArticles) {
          articleMap.set(a.id, a);
          if (a.slug) articleMap.set(a.slug, a);
        }

        const merged = Array.from(new Set(Array.from(articleMap.values())));

        // Strictly filter out any deleted articles and test/placeholder articles
        const cleanArticles = merged.filter((a) => {
          if (allDeletedIds.includes(a.id) || (a.slug && allDeletedIds.includes(a.slug))) {
            return false;
          }
          if (isTestOrPlaceholderArticle(a)) {
            return false;
          }
          return true;
        });

        // Asynchronously delete any ghost rows from Supabase articles table
        const ghostsInSupabase = supabaseArticles.filter(
          (a) => allDeletedIds.includes(a.id) || (a.slug && allDeletedIds.includes(a.slug))
        );
        if (ghostsInSupabase.length > 0) {
          const idsToRemove = ghostsInSupabase.map((a) => a.id);
          Promise.resolve(
            supabaseAdmin.from("articles").delete().in("id", idsToRemove)
          ).catch(() => {});
        }

        // Asynchronously back up any local articles not yet in Supabase
        for (const a of cleanArticles) {
          const exists = supabaseArticles.some((sa) => sa.id === a.id || sa.slug === a.slug);
          if (!exists) {
            saveArticle(a).catch((e) => console.warn("Sync article to Supabase warning:", e));
          }
        }

        const settings: SiteSettings =
          setRes.data && setRes.data.raw_payload
            ? {
                ...DEFAULT_SITE_SETTINGS,
                ...local.settings,
                ...setRes.data.raw_payload,
              }
            : local.settings || DEFAULT_SITE_SETTINGS;

        const result: DatabaseSchema = {
          articles: cleanArticles,
          settings,
          deletedIds: allDeletedIds,
        };

        // Keep local/tmp cache in sync
        writeLocalJson(result);

        return result;
      }
    } catch (err) {
      console.warn("Supabase getDatabase notice (using local/tmp store):", err);
    }
  }

  // Fallback when Supabase is offline or not configured
  const allDeletedIds = local.deletedIds || [];
  const cleanLocalArticles = local.articles.filter((a) => {
    if (allDeletedIds.includes(a.id) || (a.slug && allDeletedIds.includes(a.slug))) {
      return false;
    }
    return !isTestOrPlaceholderArticle(a);
  });

  local.articles = cleanLocalArticles;
  local.deletedIds = allDeletedIds;
  writeLocalJson(local);

  return local;
}

/**
 * Save Article (Insert or Update):
 * Saves to local/tmp store AND to Supabase with schema-resilient fallback.
 */
export async function saveArticle(article: Article): Promise<DatabaseSchema> {
  // 1. Immediately persist to local/serverless runtime storage
  const current = readLocalJson();
  if (current.deletedIds) {
    current.deletedIds = current.deletedIds.filter(
      (id) => id !== article.id && id !== article.slug
    );
  }

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
  if (!current.deletedIds) current.deletedIds = [];
  if (!current.deletedIds.includes(id)) {
    current.deletedIds.push(id);
  }
  const target = current.articles.find((a) => a.id === id || a.slug === id);
  if (target?.slug && !current.deletedIds.includes(target.slug)) {
    current.deletedIds.push(target.slug);
  }

  current.articles = current.articles.filter((a) => a.id !== id && a.slug !== id);
  writeLocalJson(current);

  // 2. Delete from Supabase if configured and persist deletedIds to site_settings
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      await Promise.all([
        supabaseAdmin.from("articles").delete().eq("id", id),
        supabaseAdmin.from("articles").delete().eq("slug", id),
        target?.slug ? supabaseAdmin.from("articles").delete().eq("slug", target.slug) : Promise.resolve(),
        supabaseAdmin.from("site_settings").upsert({
          id: "global_settings",
          raw_payload: {
            ...current.settings,
            deletedIds: current.deletedIds,
          },
          updated_at: new Date().toISOString(),
        }),
      ]);
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
