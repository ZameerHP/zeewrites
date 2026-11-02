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

export type SyncStatus = "synced" | "syncing" | "error";

interface SiteContextValue {
  theme: "light" | "dark";
  toggleTheme: () => void;
  articles: Article[];
  settings: SiteSettings;
  storageMode: "supabase" | "local-file";
  syncStatus: SyncStatus;
  syncError: string | null;
  isAdminAuthenticated: boolean;
  refreshCmsData: () => Promise<void>;
  upsertArticle: (article: Article) => Promise<{ ok: boolean; error?: string }>;
  deleteArticle: (
    id: string,
    options?: { simulateFailure?: boolean }
  ) => Promise<{ ok: boolean; error?: string }>;
  updateSettings: (
    next: Partial<SiteSettings>
  ) => Promise<{ ok: boolean; error?: string }>;
  isCommandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  isModalLocked: boolean;
  setModalLocked: (locked: boolean) => void;
  scrollToElement: (targetId: string) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const BROADCAST_CHANNEL_NAME = "zeewrites_cms_sync";

const LEGACY_LOCALSTORAGE_KEYS = [
  "zeewrites_user_articles_v2",
  "zeewrites_deleted_ids_v2",
  "zeewrites_client_cache_v3",
  "zeewrites_cms_backup_v2",
  "zeewrites_local_db_v1",
  "zeewrites_theme_v3",
  "zeewrites_theme_v1",
];

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
  const [storageMode, setStorageMode] = useState<"supabase" | "local-file">(
    "supabase"
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] =
    useState<boolean>(false);
  const [isCommandOpen, setCommandOpen] = useState(false);
  const [isModalLocked, setModalLocked] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3600);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Keep state synced when server components re-render with fresh initialArticles
  useEffect(() => {
    setArticles((prev) => {
      // Only overwrite from initialArticles if not currently on the admin route
      // (admin route fetches both published and draft articles via /api/cms)
      if (pathname?.startsWith("/zee-studio-vault")) {
        return prev;
      }
      return initialArticles;
    });
  }, [initialArticles, pathname]);

  // Purge all legacy localStorage article caches on mount so deleted posts never resurrect
  useEffect(() => {
    try {
      for (const key of LEGACY_LOCALSTORAGE_KEYS) {
        localStorage.removeItem(key);
      }
      sessionStorage.removeItem("zeewrites_admin_token");
    } catch {
      // ignore
    }
    setTheme("light");
    document.documentElement.classList.remove("dark");
  }, []);

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

  // Global keyboard shortcuts
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
        showToast("Opening Stealth Editorial Studio...");
        router.push("/zee-studio-vault");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, showToast]);

  const notifyOtherTabs = useCallback(() => {
    try {
      channelRef.current?.postMessage({
        type: "cms_updated",
        timestamp: Date.now(),
      });
    } catch {
      // ignore if BroadcastChannel is unsupported
    }
  }, []);

  // Fetch CMS Data directly from Server API (Single Source of Truth — no union merging)
  const refreshCmsData = useCallback(async () => {
    try {
      const res = await fetch("/api/cms", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
        credentials: "include",
      });
      if (!res.ok) {
        setSyncStatus("error");
        setSyncError(`Server returned ${res.status}`);
        return;
      }
      const data = await res.json();
      const serverArticles: Article[] = Array.isArray(data.articles)
        ? data.articles
        : [];

      // Replace local state strictly with the database response (never union merge)
      setArticles(serverArticles);
      if (data.storageMode) setStorageMode(data.storageMode);
      if (data.settings) setSettings(data.settings);
      setIsAdminAuthenticated(Boolean(data.authenticated));
      setSyncStatus("synced");
      setSyncError(null);
    } catch (err) {
      console.warn("Could not fetch /api/cms:", err);
      setSyncStatus("error");
      setSyncError(err instanceof Error ? err.message : "Network error");
    }
  }, []);

  useEffect(() => {
    refreshCmsData();
  }, [refreshCmsData]);

  // Cross-tab synchronization via BroadcastChannel + window focus refresh
  useEffect(() => {
    if (typeof window === "undefined") return;

    let bc: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      try {
        bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        channelRef.current = bc;
        bc.onmessage = (event) => {
          if (event.data?.type === "cms_updated") {
            refreshCmsData();
            router.refresh();
          }
        };
      } catch {
        // ignore
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshCmsData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (bc) {
        bc.close();
        channelRef.current = null;
      }
    };
  }, [refreshCmsData, router]);

  // Keep articles in sync when navigating across routes
  useEffect(() => {
    refreshCmsData();
  }, [pathname, refreshCmsData]);

  // Upsert Article: Verified server-first write (no fake success)
  const upsertArticle = useCallback(
    async (article: Article): Promise<{ ok: boolean; error?: string }> => {
      setSyncStatus("syncing");
      setSyncError(null);

      try {
        const res = await fetch("/api/cms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ action: "upsert_article", article }),
        });

        const data = await res.json();
        if (!res.ok || !data.ok) {
          const err = data.error || `Server returned ${res.status}`;
          setSyncStatus("error");
          setSyncError(err);
          return { ok: false, error: err };
        }

        if (Array.isArray(data.db?.articles)) {
          setArticles(data.db.articles);
        } else {
          await refreshCmsData();
        }

        setSyncStatus("synced");
        setSyncError(null);
        notifyOtherTabs();
        router.refresh();
        return { ok: true };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Network error";
        setSyncStatus("error");
        setSyncError(msg);
        return { ok: false, error: msg };
      }
    },
    [notifyOtherTabs, refreshCmsData, router]
  );

  // Delete Article: Waits for verified server deletion before removing or reporting success
  const deleteArticle = useCallback(
    async (
      id: string,
      options?: { simulateFailure?: boolean }
    ): Promise<{ ok: boolean; error?: string }> => {
      setSyncStatus("syncing");
      setSyncError(null);

      try {
        const res = await fetch("/api/cms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            action: "delete_article",
            id,
            simulateFailure: options?.simulateFailure,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.ok) {
          const err = data.error || `Server returned ${res.status}`;
          setSyncStatus("error");
          setSyncError(err);
          // Ensure list reflects true server state (keep the post in the list!)
          if (Array.isArray(data.db?.articles)) {
            setArticles(data.db.articles);
          }
          return { ok: false, error: err };
        }

        if (Array.isArray(data.db?.articles)) {
          setArticles(data.db.articles);
        } else {
          setArticles((prev) => prev.filter((a) => a.id !== id && a.slug !== id));
        }

        setSyncStatus("synced");
        setSyncError(null);
        notifyOtherTabs();
        router.refresh();
        return { ok: true };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Network error";
        setSyncStatus("error");
        setSyncError(msg);
        return { ok: false, error: msg };
      }
    },
    [notifyOtherTabs, router]
  );

  const updateSettings = useCallback(
    async (
      nextPartial: Partial<SiteSettings>
    ): Promise<{ ok: boolean; error?: string }> => {
      setSyncStatus("syncing");
      setSyncError(null);
      try {
        const res = await fetch("/api/cms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            action: "update_settings",
            settings: nextPartial,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.ok) {
          const err = data.error || "Failed to update settings";
          setSyncStatus("error");
          setSyncError(err);
          return { ok: false, error: err };
        }

        if (data.db?.settings) {
          setSettings(data.db.settings);
        }
        setSyncStatus("synced");
        setSyncError(null);
        notifyOtherTabs();
        router.refresh();
        return { ok: true };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Network error";
        setSyncStatus("error");
        setSyncError(msg);
        return { ok: false, error: msg };
      }
    },
    [notifyOtherTabs, router]
  );

  return (
    <SiteContext.Provider
      value={{
        theme,
        toggleTheme,
        articles,
        settings,
        storageMode,
        syncStatus,
        syncError,
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
