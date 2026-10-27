import { NextRequest, NextResponse } from "next/server";
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

export async function GET() {
  const db = await getDatabase();
  return NextResponse.json(
    {
      ...db,
      supabaseConnected: isSupabaseConfigured,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
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
      return NextResponse.json({ ok: true, db: saved });
    }

    if (body.action === "delete_article" && body.id) {
      const saved = await removeArticle(body.id);
      return NextResponse.json({ ok: true, db: saved });
    }

    if (body.action === "update_settings" && body.settings) {
      const saved = await saveSettings(body.settings as Partial<SiteSettings>);
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
      return NextResponse.json({ ok: true, db: saved });
    }

    if (body.action === "reset_seed") {
      const saved = writeDatabase({
        articles: SEED_ARTICLES,
        settings: DEFAULT_SITE_SETTINGS,
      });
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
