import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getDatabase,
  saveArticle,
  removeArticle,
  saveSettings,
  writeDatabase,
} from "@/lib/server-store";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Article, SiteSettings } from "@/types";
import { SEED_ARTICLES } from "@/data/articles";
import { DEFAULT_SITE_SETTINGS } from "@/data/categories";

export const dynamic = "force-dynamic";

function purgeAllPageCaches(slug?: string) {
  try {
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/sitemap.xml");
    revalidatePath("/sitemap-page");
    if (slug) {
      revalidatePath(`/article/${slug}`);
    }
  } catch (err) {
    console.warn("revalidatePath error:", err);
  }
}

export async function GET() {
  const db = await getDatabase();
  return NextResponse.json(
    {
      ...db,
      supabaseConnected: isSupabaseConfigured,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "upsert_article" && body.article) {
      const incoming = body.article as Article;
      const saved = await saveArticle(incoming);
      purgeAllPageCaches(incoming.slug);
      return NextResponse.json({ ok: true, db: saved });
    }

    if (body.action === "delete_article" && body.id) {
      const dbBefore = await getDatabase();
      const target = dbBefore.articles.find((a) => a.id === body.id || a.slug === body.id);
      const saved = await removeArticle(target ? target.id : body.id);
      purgeAllPageCaches(target?.slug);
      return NextResponse.json({ ok: true, db: saved });
    }

    if (body.action === "update_settings" && body.settings) {
      const saved = await saveSettings(body.settings as Partial<SiteSettings>);
      purgeAllPageCaches();
      return NextResponse.json({ ok: true, db: saved });
    }

    if (body.action === "import_backup" && body.backup) {
      const backup = body.backup;
      const current = await getDatabase();
      if (Array.isArray(backup.articles)) {
        current.articles = backup.articles;
      }
      if (backup.settings) {
        current.settings = { ...DEFAULT_SITE_SETTINGS, ...backup.settings };
      }
      const saved = writeDatabase(current);
      purgeAllPageCaches();
      return NextResponse.json({ ok: true, db: saved });
    }

    if (body.action === "reset_seed") {
      const saved = writeDatabase({
        articles: SEED_ARTICLES,
        settings: DEFAULT_SITE_SETTINGS,
      });
      purgeAllPageCaches();
      return NextResponse.json({ ok: true, db: saved });
    }

    return NextResponse.json(
      { ok: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
