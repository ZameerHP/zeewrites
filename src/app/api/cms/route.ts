import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  getDatabase,
  saveArticle,
  removeArticle,
  saveSettings,
} from "@/lib/server-store";
import { storageMode, storageProblem } from "@/lib/supabase";
import {
  isAuthenticatedAdmin,
  createSessionToken,
  verifyCredentials,
  checkLoginRateLimit,
  recordLoginAttempt,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/server-auth";
import { Article, SiteSettings } from "@/types";
import { CATEGORY_LIST } from "@/data/categories";

export const dynamic = "force-dynamic";

function purgeAllPageCaches(slug?: string) {
  try {
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/sitemap.xml");
    revalidatePath("/sitemap-page");
    for (const cat of CATEGORY_LIST) {
      revalidatePath(`/category/${cat.slug}`);
    }
    if (slug) {
      revalidatePath(`/article/${slug}`);
    }
  } catch (err) {
    console.warn("revalidatePath error:", err);
  }
}

/**
 * GET /api/cms:
 * Public read of live database (only published articles for public, all for authenticated admin)
 */
export async function GET(req: NextRequest) {
  try {
    const isAuth = await isAuthenticatedAdmin(req);
    const db = await getDatabase();

    const articles = isAuth
      ? db.articles
      : db.articles.filter((a) => a.status === "published");

    return NextResponse.json(
      {
        articles,
        settings: db.settings,
        storageMode,
        storageProblem,
        authenticated: isAuth,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Read error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cms:
 * Handles:
 *  - login (passphrase + pin verification, signs httpOnly cookie)
 *  - logout (clears cookie)
 *  - check_auth (checks session status)
 *  - upsert_article (admin only)
 *  - delete_article (admin only, verified removal)
 *  - update_settings (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const body = await req.json();

    // 1. LOGIN ACTION
    if (body.action === "login") {
      const { passphrase, pin } = body;
      const rateCheck = checkLoginRateLimit(ip);
      if (!rateCheck.allowed) {
        return NextResponse.json(
          {
            ok: false,
            error: `Too many failed attempts. Locked out for ${rateCheck.waitSeconds}s.`,
          },
          { status: 429 }
        );
      }

      if (!passphrase || !pin || typeof passphrase !== "string" || typeof pin !== "string") {
        recordLoginAttempt(ip, false);
        return NextResponse.json(
          { ok: false, error: "Passphrase and 6-digit PIN are required." },
          { status: 400 }
        );
      }

      const isValid = verifyCredentials(passphrase.trim(), pin.trim());
      if (!isValid) {
        recordLoginAttempt(ip, false);
        return NextResponse.json(
          { ok: false, error: "Invalid Passphrase or PIN." },
          { status: 401 }
        );
      }

      recordLoginAttempt(ip, true);
      const token = createSessionToken();

      const response = NextResponse.json({ ok: true, message: "Unlocked", token });
      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE,
        path: "/",
      });

      return response;
    }

    // 2. LOGOUT ACTION
    if (body.action === "logout") {
      const response = NextResponse.json({ ok: true, message: "Logged out" });
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    // 3. CHECK AUTH
    if (body.action === "check_auth") {
      const isAuth = await isAuthenticatedAdmin(req);
      return NextResponse.json({ ok: true, authenticated: isAuth });
    }

    // All subsequent actions REQUIRE AUTHENTICATED ADMIN
    const isAuth = await isAuthenticatedAdmin(req);
    if (!isAuth) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: Admin session required." },
        { status: 401 }
      );
    }

    // 4. UPSERT ARTICLE
    if (body.action === "upsert_article" && body.article) {
      const incoming = body.article as Article;
      const saved = await saveArticle(incoming);
      purgeAllPageCaches(incoming.slug);
      return NextResponse.json({ ok: true, db: saved });
    }

    // 5. DELETE ARTICLE (VERIFIED)
    if (body.action === "delete_article" && body.id) {
      const dbBefore = await getDatabase();
      const target = dbBefore.articles.find(
        (a) => a.id === body.id || a.slug === body.id
      );
      const targetId = target ? target.id : body.id;

      const saved = await removeArticle(targetId);
      purgeAllPageCaches(target?.slug);

      // Verify that the article is truly gone
      const stillPresent = saved.articles.some((a) => a.id === targetId);
      if (stillPresent) {
        return NextResponse.json(
          { ok: false, error: "Delete failed: Article still exists in database." },
          { status: 500 }
        );
      }

      return NextResponse.json({ ok: true, db: saved });
    }

    // 6. UPDATE SETTINGS
    if (body.action === "update_settings" && body.settings) {
      const saved = await saveSettings(body.settings as Partial<SiteSettings>);
      purgeAllPageCaches();
      return NextResponse.json({ ok: true, db: saved });
    }

    return NextResponse.json(
      { ok: false, error: "Invalid action or missing parameters." },
      { status: 400 }
    );
  } catch (err) {
    console.error("API CMS error:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
