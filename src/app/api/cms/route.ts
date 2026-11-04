import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getDatabase,
  saveArticle,
  removeArticle,
  saveSettings,
} from "@/lib/server-store";
import {
  storageMode,
  storageProblem,
  hasServiceRoleKey,
  isSupabaseConfigured,
  supabaseAdmin,
} from "@/lib/supabase";
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

function purgeAllPageCaches(slugs?: (string | undefined)[]) {
  try {
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/sitemap.xml");
    revalidatePath("/sitemap-page");
    for (const cat of CATEGORY_LIST) {
      revalidatePath(`/category/${cat.slug}`);
    }
    if (slugs) {
      for (const s of slugs) {
        if (s) {
          revalidatePath(`/article/${s}`);
        }
      }
    }
  } catch (err) {
    console.warn("revalidatePath error:", err);
  }
}

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
};

/**
 * GET /api/cms:
 * Public read of live database (only published articles for public, all for authenticated admin).
 */
export async function GET(req: NextRequest) {
  try {
    const isAuth = await isAuthenticatedAdmin(req);
    const db = await getDatabase();

    const articles = isAuth
      ? db.articles
      : db.articles.filter((a) => a.status === "published");

    const supabaseDiagnostic = isSupabaseConfigured
      ? {
          connected: true,
          hasServiceRoleKey,
          error: null,
          rowsCount: db.articles.length,
        }
      : null;

    return NextResponse.json(
      {
        ok: true,
        articles,
        settings: db.settings,
        storageMode,
        storageProblem,
        hasServiceRoleKey,
        authenticated: isAuth,
        supabaseDiagnostic,
      },
      {
        headers: SECURITY_HEADERS,
      }
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Database read error." },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

/**
 * POST /api/cms:
 * Handles:
 *  - login (passphrase + pin verification, signs httpOnly cookie)
 *  - logout (clears cookie)
 *  - check_auth (checks session status)
 *  - upsert_article (admin only, verified write)
 *  - delete_article (admin only, verified deletion with row count check)
 *  - update_settings (admin only)
 *  - import_backup (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Payload size guard (max 5MB)
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 5 * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, error: "Payload too large." },
        { status: 413, headers: SECURITY_HEADERS }
      );
    }

    // 2. CSRF / Origin validation for mutations
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin && host) {
      const originHost = origin.replace(/^https?:\/\//, "").split(":")[0];
      const targetHost = host.split(":")[0];
      if (
        originHost !== targetHost &&
        originHost !== "localhost" &&
        originHost !== "127.0.0.1" &&
        !targetHost.endsWith(".vercel.app")
      ) {
        return NextResponse.json(
          { ok: false, error: "Forbidden: Origin validation failed." },
          { status: 403, headers: SECURITY_HEADERS }
        );
      }
    }

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
          { status: 429, headers: SECURITY_HEADERS }
        );
      }

      if (
        !passphrase ||
        !pin ||
        typeof passphrase !== "string" ||
        typeof pin !== "string"
      ) {
        recordLoginAttempt(ip, false);
        return NextResponse.json(
          { ok: false, error: "Passphrase and 6-digit PIN are required." },
          { status: 400, headers: SECURITY_HEADERS }
        );
      }

      const isValid = verifyCredentials(passphrase.trim(), pin.trim());
      if (!isValid) {
        recordLoginAttempt(ip, false);
        return NextResponse.json(
          { ok: false, error: "Invalid Passphrase or PIN." },
          { status: 401, headers: SECURITY_HEADERS }
        );
      }

      recordLoginAttempt(ip, true);
      const token = createSessionToken();

      const response = NextResponse.json(
        { ok: true, message: "Unlocked", authenticated: true },
        { headers: SECURITY_HEADERS }
      );
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
      const response = NextResponse.json(
        { ok: true, message: "Logged out", authenticated: false },
        { headers: SECURITY_HEADERS }
      );
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    // 3. CHECK AUTH
    if (body.action === "check_auth") {
      const isAuth = await isAuthenticatedAdmin(req);
      return NextResponse.json(
        { ok: true, authenticated: isAuth },
        { headers: SECURITY_HEADERS }
      );
    }

    // All subsequent actions REQUIRE AUTHENTICATED ADMIN
    const isAuth = await isAuthenticatedAdmin(req);
    if (!isAuth) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: Admin session required." },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    // 4. UPSERT ARTICLE (VERIFIED)
    if (body.action === "upsert_article" && body.article) {
      const incoming = body.article as Article;
      const result = await saveArticle(incoming);
      if (!result.ok) {
        return NextResponse.json(
          {
            ok: false,
            error: result.error || "Failed to save article to database.",
            db: result.db,
          },
          { status: 500, headers: SECURITY_HEADERS }
        );
      }
      purgeAllPageCaches([incoming.slug]);
      return NextResponse.json(
        { ok: true, db: result.db },
        { headers: SECURITY_HEADERS }
      );
    }

    // 5. DELETE ARTICLE (VERIFIED)
    if (body.action === "delete_article" && body.id) {
      const simulateFail =
        body.simulateFailure === true ||
        req.headers.get("x-simulate-delete-fail") === "1";

      const targetKey = simulateFail
        ? "__simulate_rls_failure__"
        : String(body.id);

      const result = await removeArticle(targetKey);

      if (!result.ok || result.deletedCount === 0) {
        return NextResponse.json(
          {
            ok: false,
            error:
              result.error ||
              "Delete failed: 0 rows were removed from the database.",
            deletedCount: 0,
            db: result.db,
          },
          { status: 400, headers: SECURITY_HEADERS }
        );
      }

      const deletedSlugs = result.deletedRows.map((r) => r.slug);
      purgeAllPageCaches([String(body.id), ...deletedSlugs]);

      // Double-verify that the article is truly gone from the database state
      const stillPresent = result.db.articles.some(
        (a) =>
          a.id === body.id ||
          a.slug === body.id ||
          result.deletedRows.some((r) => r.id === a.id || r.slug === a.slug)
      );
      if (stillPresent) {
        return NextResponse.json(
          {
            ok: false,
            error: "Delete failed: Article still exists in database after delete.",
            deletedCount: 0,
            db: result.db,
          },
          { status: 500, headers: SECURITY_HEADERS }
        );
      }

      return NextResponse.json(
        {
          ok: true,
          deletedCount: result.deletedCount,
          deletedRows: result.deletedRows,
          db: result.db,
        },
        { headers: SECURITY_HEADERS }
      );
    }

    // 6. UPDATE SETTINGS
    if (body.action === "update_settings" && body.settings) {
      const saved = await saveSettings(body.settings as Partial<SiteSettings>);
      purgeAllPageCaches();
      return NextResponse.json(
        { ok: true, db: saved },
        { headers: SECURITY_HEADERS }
      );
    }

    // 7. IMPORT BACKUP
    if (body.action === "import_backup" && body.backup) {
      const { articles: backupArticles, settings: backupSettings } = body.backup;
      if (Array.isArray(backupArticles)) {
        for (const art of backupArticles) {
          if (art && art.id && art.slug && art.title) {
            await saveArticle(art as Article);
          }
        }
      }
      if (backupSettings && typeof backupSettings === "object") {
        await saveSettings(backupSettings as Partial<SiteSettings>);
      }
      const db = await getDatabase();
      purgeAllPageCaches(db.articles.map((a) => a.slug));
      return NextResponse.json({ ok: true, db }, { headers: SECURITY_HEADERS });
    }

    return NextResponse.json(
      { ok: false, error: "Invalid action or missing parameters." },
      { status: 400, headers: SECURITY_HEADERS }
    );
  } catch (err) {
    console.error("API CMS error:", err);
    return NextResponse.json(
      { ok: false, error: "Server processing error." },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
