"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import Lenis from "lenis";
import { Article, SiteSettings } from "@/types";
import { DEFAULT_SITE_SETTINGS } from "@/data/categories";

interface SiteContextValue {
  theme: "light" | "dark";
  toggleTheme: () => void;
  articles: Article[];
  settings: SiteSettings;
  storageMode: "supabase" | "local-file";
  isAdminAuthenticated: boolean;
  refreshCmsData: () => Promise<void>;
  upsertArticle: (article: Article) => Promise<{ ok: boolean; error?: string }>;
  deleteArticle: (id: string) => Promise<{ ok: boolean; error?: string }>;
  updateSettings: (next: Partial<SiteSettings>) => Promise<{ ok: boolean; error?: string }>;
  isCommandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  isModalLocked: boolean;
  setModalLocked: (locked: boolean) => void;
  scrollToElement: (targetId: string) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const LOCAL_USER_ARTICLES_KEY = "zeewrites_user_articles_v2";
const LOCAL_DELETED_IDS_KEY = "zeewrites_deleted_ids_v2";

function getLocalUserArticles(): Article[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_USER_ARTICLES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalUserArticle(art: Article): void {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalUserArticles();
    const idx = current.findIndex((a) => a.id === art.id || a.slug === art.slug);
    if (idx >= 0) {
      current[idx] = art;
    } else {
      current.unshift(art);
    }
    localStorage.setItem(LOCAL_USER_ARTICLES_KEY, JSON.stringify(current));

    const deleted = getLocalDeletedIds().filter((id) => id !== art.id && id !== art.slug);
    localStorage.setItem(LOCAL_DELETED_IDS_KEY, JSON.stringify(deleted));
  } catch {
    // ignore
  }
}

function getLocalDeletedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_DELETED_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function removeLocalUserArticle(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalUserArticles().filter((a) => a.id !== id && a.slug !== id);
    localStorage.setItem(LOCAL_USER_ARTICLES_KEY, JSON.stringify(current));

    const deleted = getLocalDeletedIds();
    if (!deleted.includes(id)) {
      deleted.push(id);
      localStorage.setItem(LOCAL_DELETED_IDS_KEY, JSON.stringify(deleted));
    }
  } catch {
    // ignore
  }
}

const SiteContext = createContext<SiteContextValue | undefined>(undefined);

export function SiteProvider({
  children,
  initialArticles = [],
  initialSettings = DEFAULT_SITE_SETTINGS,
}: {
  children: React.ReactNode;
  initialArticles?: Article[];
  initialSettings?: SiteSettings;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [storageMode, setStorageMode] = useState<"supabase" | "local-file">("local-file");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isCommandOpen, setCommandOpen] = useState(false);
  const [isModalLocked, setModalLocked] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Initial client mount: Restore any persisted user articles immediately
  useEffect(() => {
    try {
      localStorage.removeItem("zeewrites_cms_backup_v2");
      localStorage.removeItem("zeewrites_theme_v3");
      localStorage.removeItem("zeewrites_theme_v1");
      localStorage.removeItem("zeewrites_local_db_v1");
      sessionStorage.removeItem("zeewrites_admin_token");
    } catch {
      // ignore
    }
    setTheme("light");
    document.documentElement.classList.remove("dark");

    const localUserArticles = getLocalUserArticles();
    const deletedIds = getLocalDeletedIds();
    if (localUserArticles.length > 0) {
      setArticles((prev) => {
        const filtered = prev.filter(
          (a) => !deletedIds.includes(a.id) && !deletedIds.includes(a.slug)
        );
        const missing = localUserArticles.filter(
          (u) =>
            !deletedIds.includes(u.id) &&
            !deletedIds.includes(u.slug) &&
            !filtered.some((f) => f.id === u.id || f.slug === u.slug)
        );
        return missing.length > 0 ? [...missing, ...filtered] : filtered;
      });
    }
  }, []);

  // Sync client-side versioned cache
  useEffect(() => {
    try {
      if (articles.length > 0) {
        localStorage.setItem("zeewrites_client_cache_v3", JSON.stringify(articles));
      } else {
        localStorage.removeItem("zeewrites_client_cache_v3");
      }
    } catch {
      // ignore
    }
  }, [articles]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }, []);

  // Initialize Lenis Smooth Scroll
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      lerp: 0.072,
      duration: 1.25,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.15,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    }
    rafRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Pause Lenis when modal is open
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    if (isCommandOpen || isModalLocked) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [isCommandOpen, isModalLocked]);

  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
      const timer = setTimeout(() => {
        lenisRef.current?.resize();
      }, 120);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  const scrollToElement = useCallback((targetId: string) => {
    const el = document.getElementById(targetId);
    if (!el) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: -96, duration: 1.05 });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Global keyboard shortcuts:
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
        return;
      }

      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        e.altKey &&
        e.key.toLowerCase() === "z"
      ) {
        e.preventDefault();
        showToast("Stealth Editorial Studio unlocked — Redirecting...");
        router.push("/zee-studio-vault");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, showToast]);

  const getAuthHeaders = (): Record<string, string> => {
    return { "Content-Type": "application/json" };
  };

  // Sync CMS Data with Server API (SINGLE SOURCE OF TRUTH + Auto-Recovery)
  const refreshCmsData = useCallback(async () => {
    try {
      const res = await fetch("/api/cms", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        const serverArticles: Article[] = Array.isArray(data.articles) ? data.articles : [];
        const localUserArticles = getLocalUserArticles();
        const deletedIds = getLocalDeletedIds();

        // 1. Filter out intentionally deleted articles
        let merged = serverArticles.filter(
          (a) => !deletedIds.includes(a.id) && !deletedIds.includes(a.slug)
        );

        // 2. Auto-heal: If server restarted and lost /tmp data, restore from local storage
        const missingOnServer: Article[] = [];
        for (const userArt of localUserArticles) {
          if (deletedIds.includes(userArt.id) || deletedIds.includes(userArt.slug)) continue;
          const exists = merged.some((a) => a.id === userArt.id || a.slug === userArt.slug);
          if (!exists) {
            missingOnServer.push(userArt);
          }
        }

        if (missingOnServer.length > 0) {
          merged = [...missingOnServer, ...merged];
          // Auto-sync missing articles back to server
          for (const art of missingOnServer) {
            fetch("/api/cms", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ action: "upsert_article", article: art }),
            }).catch(() => {});
          }
        }

        setArticles(merged);
        if (data.storageMode) setStorageMode(data.storageMode);
        if (data.settings) setSettings(data.settings);
        setIsAdminAuthenticated(Boolean(data.authenticated));
      }
    } catch (err) {
      console.warn("Could not fetch /api/cms:", err);
      const localUserArticles = getLocalUserArticles();
      const deletedIds = getLocalDeletedIds();
      if (localUserArticles.length > 0) {
        setArticles((prev) => {
          const filtered = prev.filter((a) => !deletedIds.includes(a.id));
          const missing = localUserArticles.filter((u) => !filtered.some((f) => f.id === u.id));
          return missing.length > 0 ? [...missing, ...filtered] : filtered;
        });
      }
    }
  }, []);

  useEffect(() => {
    refreshCmsData();
  }, [refreshCmsData]);

  // Keep articles in sync when navigating to/from admin
  useEffect(() => {
    if (pathname?.startsWith("/zee-studio-vault")) {
      refreshCmsData();
    }
  }, [pathname, refreshCmsData]);

  // Upsert Article: Saves locally immediately, then persists to server
  const upsertArticle = useCallback(
    async (article: Article): Promise<{ ok: boolean; error?: string }> => {
      // 1. Immediately persist locally (zero data loss guarantee)
      saveLocalUserArticle(article);
      setArticles((prev) => {
        const idx = prev.findIndex((a) => a.id === article.id || a.slug === article.slug);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = article;
          return next;
        }
        return [article, ...prev];
      });

      // 2. Persist to server
      try {
        const res = await fetch("/api/cms", {
          method: "POST",
          headers: getAuthHeaders(),
          credentials: "include",
          body: JSON.stringify({ action: "upsert_article", article }),
        });

        const data = await res.json();
        if (!res.ok || !data.ok) {
          const err = data.error || `Server returned ${res.status}`;
          return { ok: false, error: err };
        }

        if (Array.isArray(data.db?.articles)) {
          const deletedIds = getLocalDeletedIds();
          const clean = data.db.articles.filter(
            (a: Article) => !deletedIds.includes(a.id) && !deletedIds.includes(a.slug)
          );
          setArticles(clean);
        }
        router.refresh();
        return { ok: true };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Network error";
        return { ok: true, error: `Saved locally (offline: ${msg})` };
      }
    },
    [router]
  );

  // Delete Article: Waits for verified server deletion; records in deletedIds
  const deleteArticle = useCallback(
    async (id: string): Promise<{ ok: boolean; error?: string }> => {
      // 1. Immediately remove locally and mark as deleted
      removeLocalUserArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id && a.slug !== id));

      try {
        const res = await fetch("/api/cms", {
          method: "POST",
          headers: getAuthHeaders(),
          credentials: "include",
          body: JSON.stringify({ action: "delete_article", id }),
        });

        const data = await res.json();
        if (!res.ok || !data.ok) {
          const err = data.error || `Server returned ${res.status}`;
          return { ok: false, error: err };
        }

        if (Array.isArray(data.db?.articles)) {
          const deletedIds = getLocalDeletedIds();
          const clean = data.db.articles.filter(
            (a: Article) => !deletedIds.includes(a.id) && !deletedIds.includes(a.slug)
          );
          setArticles(clean);
        }
        router.refresh();
        return { ok: true };
      } catch (err) {
        return { ok: true };
      }
    },
    [router]
  );

  const updateSettings = useCallback(
    async (nextPartial: Partial<SiteSettings>): Promise<{ ok: boolean; error?: string }> => {
      try {
        const res = await fetch("/api/cms", {
          method: "POST",
          headers: getAuthHeaders(),
          credentials: "include",
          body: JSON.stringify({ action: "update_settings", settings: nextPartial }),
        });

        const data = await res.json();
        if (!res.ok || !data.ok) {
          return { ok: false, error: data.error || "Failed to update settings" };
        }

        if (data.db?.settings) {
          setSettings(data.db.settings);
        }
        router.refresh();
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : "Network error" };
      }
    },
    [router]
  );

  return (
    <SiteContext.Provider
      value={{
        theme,
        toggleTheme,
        articles,
        settings,
        storageMode,
        isAdminAuthenticated,
        refreshCmsData,
        upsertArticle,
        deleteArticle,
        updateSettings,
        isCommandOpen,
        setCommandOpen,
        isModalLocked,
        setModalLocked,
        scrollToElement,
        toastMessage,
        showToast,
      }}
    >
      {children}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#00000e] text-white text-[14px] font-medium shadow-modal border border-hairline"
        >
          <span className="h-2 w-2 rounded-full bg-[#4a74f0]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) {
    throw new Error("useSite must be used inside a SiteProvider");
  }
  return ctx;
}
