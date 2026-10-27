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
import { SEED_ARTICLES } from "@/data/articles";
import { DEFAULT_SITE_SETTINGS } from "@/data/categories";

interface SiteContextValue {
  theme: "light" | "dark";
  toggleTheme: () => void;
  articles: Article[];
  settings: SiteSettings;
  refreshCmsData: () => Promise<void>;
  upsertArticle: (article: Article) => Promise<boolean>;
  deleteArticle: (id: string) => Promise<boolean>;
  updateSettings: (next: Partial<SiteSettings>) => Promise<boolean>;
  importFullBackup: (backup: {
    articles: Article[];
    settings: SiteSettings;
  }) => Promise<boolean>;
  resetToSeed: () => Promise<boolean>;
  isCommandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  isModalLocked: boolean;
  setModalLocked: (locked: boolean) => void;
  scrollToElement: (targetId: string) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const SiteContext = createContext<SiteContextValue | undefined>(undefined);

const LOCAL_STORAGE_CMS_KEY = "zeewrites_cms_backup_v2";
const LOCAL_STORAGE_THEME_KEY = "zeewrites_theme_v1";

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

  // Initialize theme in Light Mode (#f8fbff / #ffffff solid surfaces)
  useEffect(() => {
    try {
      localStorage.removeItem("zeewrites_theme_v3");
      localStorage.removeItem("zeewrites_theme_v1");
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

  // Initialize Lenis Smooth Scroll with refined editorial inertia
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

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

  // Pause Lenis when modal command palette is open
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    if (isCommandOpen || isModalLocked) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [isCommandOpen, isModalLocked]);

  // Smooth reset & recalculate height on route navigation
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
  // 1) Cmd/Ctrl + K -> Open Instant Command Palette Search
  // 2) Ctrl/Cmd + Shift + Alt + Z -> Stealth Admin Vault Trigger
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

  // Sync CMS Data with API + LocalStorage fallback
  const refreshCmsData = useCallback(async () => {
    try {
      const res = await fetch("/api/cms", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.articles)) setArticles(data.articles);
        if (data.settings) setSettings(data.settings);
        localStorage.setItem(LOCAL_STORAGE_CMS_KEY, JSON.stringify(data));
        return;
      }
    } catch {
      // Fallback to localStorage if offline
      try {
        const localRaw = localStorage.getItem(LOCAL_STORAGE_CMS_KEY);
        if (localRaw) {
          const parsed = JSON.parse(localRaw);
          if (Array.isArray(parsed.articles)) setArticles(parsed.articles);
          if (parsed.settings) setSettings(parsed.settings);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    refreshCmsData();
  }, [refreshCmsData]);

  useEffect(() => {
    if (pathname?.startsWith("/zee-studio-vault")) {
      refreshCmsData();
    }
  }, [pathname, refreshCmsData]);

  const upsertArticle = useCallback(
    async (article: Article): Promise<boolean> => {
      try {
        const res = await fetch("/api/cms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "upsert_article", article }),
        });
        if (res.ok) {
          const { db } = await res.json();
          setArticles(db.articles);
          localStorage.setItem(LOCAL_STORAGE_CMS_KEY, JSON.stringify(db));
          return true;
        }
      } catch {
        // Offline fallback
      }
      setArticles((prev) => {
        const idx = prev.findIndex(
          (a) => a.id === article.id || a.slug === article.slug
        );
        const next =
          idx >= 0
            ? prev.map((item, i) => (i === idx ? article : item))
            : [article, ...prev];
        try {
          localStorage.setItem(
            LOCAL_STORAGE_CMS_KEY,
            JSON.stringify({ articles: next, settings })
          );
        } catch {
          // ignore
        }
        return next;
      });
      return true;
    },
    [settings]
  );

  const deleteArticle = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const res = await fetch("/api/cms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete_article", id }),
        });
        if (res.ok) {
          const { db } = await res.json();
          setArticles(db.articles);
          localStorage.setItem(LOCAL_STORAGE_CMS_KEY, JSON.stringify(db));
          return true;
        }
      } catch {
        // fallback
      }
      setArticles((prev) => {
        const next = prev.filter((a) => a.id !== id);
        try {
          localStorage.setItem(
            LOCAL_STORAGE_CMS_KEY,
            JSON.stringify({ articles: next, settings })
          );
        } catch {
          // ignore
        }
        return next;
      });
      return true;
    },
    [settings]
  );

  const updateSettings = useCallback(
    async (nextPartial: Partial<SiteSettings>): Promise<boolean> => {
      try {
        const res = await fetch("/api/cms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update_settings",
            settings: nextPartial,
          }),
        });
        if (res.ok) {
          const { db } = await res.json();
          setSettings(db.settings);
          localStorage.setItem(LOCAL_STORAGE_CMS_KEY, JSON.stringify(db));
          return true;
        }
      } catch {
        // fallback
      }
      setSettings((prev) => {
        const merged = {
          ...prev,
          ...nextPartial,
          updatedAt: new Date().toISOString(),
        };
        try {
          localStorage.setItem(
            LOCAL_STORAGE_CMS_KEY,
            JSON.stringify({ articles, settings: merged })
          );
        } catch {
          // ignore
        }
        return merged;
      });
      return true;
    },
    [articles]
  );

  const importFullBackup = useCallback(
    async (backup: {
      articles: Article[];
      settings: SiteSettings;
    }): Promise<boolean> => {
      try {
        const res = await fetch("/api/cms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "import_backup", backup }),
        });
        if (res.ok) {
          const { db } = await res.json();
          setArticles(db.articles);
          setSettings(db.settings);
          localStorage.setItem(LOCAL_STORAGE_CMS_KEY, JSON.stringify(db));
          return true;
        }
      } catch {
        // fallback
      }
      if (Array.isArray(backup.articles)) setArticles(backup.articles);
      if (backup.settings) setSettings(backup.settings);
      return true;
    },
    []
  );

  const resetToSeed = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_seed" }),
      });
      if (res.ok) {
        const { db } = await res.json();
        setArticles(db.articles);
        setSettings(db.settings);
        localStorage.setItem(LOCAL_STORAGE_CMS_KEY, JSON.stringify(db));
        return true;
      }
    } catch {
      // fallback
    }
    setArticles(SEED_ARTICLES);
    setSettings(DEFAULT_SITE_SETTINGS);
    return true;
  }, []);

  return (
    <SiteContext.Provider
      value={{
        theme,
        toggleTheme,
        articles,
        settings,
        refreshCmsData,
        upsertArticle,
        deleteArticle,
        updateSettings,
        importFullBackup,
        resetToSeed,
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
