"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  ArrowUpRight,
  ArrowLeft,
  Upload,
  Lock,
  Pencil,
  Search,
  Settings,
  ChevronDown,
} from "lucide-react";
import {
  Article,
  ArticleFAQ,
  ArticleHowToStep,
  ArticleImage,
  ArticleSection,
  CategorySlug,
} from "@/types";
import { CATEGORIES, CATEGORY_LIST, DEFAULT_AUTHOR } from "@/data/categories";
import { useSite } from "@/components/providers/SiteProvider";
import { TechnicalDiagram } from "@/components/ui/TechnicalDiagram";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";

/* --------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------ */

type DiagramType = NonNullable<ArticleImage["diagramType"]>;

const COVER_STYLES: { value: DiagramType; label: string }[] = [
  { value: "ssl-handshake", label: "Network / Security" },
  { value: "browser-memory", label: "Browser" },
  { value: "utf8-pipeline", label: "Text Encoding" },
  { value: "hidden-chars-ast", label: "Hidden Characters" },
  { value: "markdown-ast", label: "Markdown / Writing" },
  { value: "regex-nfa", label: "Regex / Patterns" },
  { value: "pdf-normalization", label: "PDF / Documents" },
  { value: "json-schema", label: "JSON / Data" },
  { value: "git-crlf", label: "Code / Git" },
  { value: "cwv-timeline", label: "Performance" },
];

const DEFAULT_COVER_BY_CATEGORY: Record<CategorySlug, DiagramType> = {
  "how-to-fixes": "ssl-handshake",
  "text-guides": "utf8-pipeline",
  solutions: "cwv-timeline",
  tutorials: "markdown-ast",
  tools: "json-schema",
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function countWords(text: string): number {
  return (text.trim().match(/[\p{L}\p{N}_'-]+/gu) || []).length;
}

/**
 * Convert the plain writing format into structured article sections.
 *   ## Heading         -> starts a new section
 *   blank line         -> new paragraph
 *   ```  ...  ```      -> code block
 *   > Tip: text        -> highlighted tip box
 */
function contentToSections(content: string, fallbackHeading: string): ArticleSection[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const sections: ArticleSection[] = [];
  const usedIds = new Set<string>();

  const makeId = (heading: string) => {
    const base = slugify(heading) || "section";
    let id = base;
    let n = 2;
    while (usedIds.has(id)) id = `${base}-${n++}`;
    usedIds.add(id);
    return id;
  };

  let current: ArticleSection | null = null;
  let paragraph: string[] = [];
  let inCode = false;
  let codeLang = "";
  let codeLines: string[] = [];

  const ensureSection = () => {
    if (!current) {
      current = { id: makeId(fallbackHeading), heading: fallbackHeading, paragraphs: [] };
      sections.push(current);
    }
    return current;
  };

  const flushParagraph = () => {
    const text = paragraph.join(" ").trim();
    paragraph = [];
    if (!text) return;
    const sec = ensureSection();
    const tip = text.match(/^>\s*(tip|note|warning)?\s*:?\s*(.*)$/i);
    if (tip && text.startsWith(">")) {
      const kind = (tip[1] || "tip").toLowerCase();
      const body = tip[2].replace(/^>\s*/gm, "").trim();
      if (!sec.callout) {
        sec.callout = {
          type: kind === "warning" ? "warning" : "pro-tip",
          title: kind === "warning" ? "Warning" : kind === "note" ? "Note" : "Tip",
          body,
        };
        return;
      }
      sec.paragraphs.push(body);
      return;
    }
    sec.paragraphs.push(text);
  };

  for (const rawLine of lines) {
    const line = rawLine;

    if (inCode) {
      if (line.trim().startsWith("```")) {
        inCode = false;
        let sec = ensureSection();
        if (sec.codeBlock) {
          // Only one code block per section; continue in a new section.
          const next: ArticleSection = {
            id: makeId(`${sec.heading} continued`),
            heading: `${sec.heading} (continued)`,
            paragraphs: [],
          };
          sections.push(next);
          current = next;
          sec = next;
        }
        sec.codeBlock = { language: codeLang || "text", code: codeLines.join("\n") };
        codeLines = [];
        codeLang = "";
      } else {
        codeLines.push(line);
      }
      continue;
    }

    if (line.trim().startsWith("```")) {
      flushParagraph();
      inCode = true;
      codeLang = line.trim().slice(3).trim();
      continue;
    }

    const headingMatch = line.match(/^#{1,3}\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      const heading = headingMatch[1].trim();
      current = { id: makeId(heading), heading, paragraphs: [] };
      sections.push(current);
      continue;
    }

    if (line.trim() === "") {
      flushParagraph();
      continue;
    }

    paragraph.push(line.trim());
  }

  if (inCode && codeLines.length) {
    const sec = ensureSection();
    if (!sec.codeBlock) sec.codeBlock = { language: codeLang || "text", code: codeLines.join("\n") };
  }
  flushParagraph();

  return sections.filter(
    (s) => s.paragraphs.length > 0 || s.codeBlock || s.callout
  );
}

function sectionsToContent(sections: ArticleSection[]): string {
  return sections
    .map((s) => {
      const parts: string[] = [`## ${s.heading}`];
      s.paragraphs.forEach((p) => parts.push(p));
      if (s.subheadings) {
        s.subheadings.forEach((sub) => {
          parts.push(`### ${sub.title}`);
          sub.paragraphs.forEach((p) => parts.push(p));
          if (sub.codeBlock) {
            parts.push("```" + sub.codeBlock.language + "\n" + sub.codeBlock.code + "\n```");
          }
        });
      }
      if (s.callout) {
        const label = s.callout.type === "warning" ? "Warning" : "Tip";
        parts.push(`> ${label}: ${s.callout.body}`);
      }
      if (s.codeBlock) {
        parts.push("```" + s.codeBlock.language + "\n" + s.codeBlock.code + "\n```");
      }
      return parts.join("\n\n");
    })
    .join("\n\n");
}

/* --------------------------------------------------------------------------
 * Small UI primitives
 * ------------------------------------------------------------------------ */

const inputCls =
  "w-full rounded-[12px] border border-hairline bg-surface px-4 py-3 text-[15px] text-ink placeholder:text-muted focus:outline-none focus:border-[#4a74f0] focus:ring-[3px] focus:ring-[#4a74f0]/25 transition-[box-shadow,border-color] duration-150";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-[14px] font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="block text-[13px] text-muted">{hint}</span>}
    </label>
  );
}

function Card({
  title,
  step,
  children,
  right,
}: {
  title: string;
  step?: number;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="rounded-[20px] bg-surface border border-hairline shadow-1 p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 font-sans font-semibold text-[17px] text-ink">
          {step !== undefined && (
            <span className="h-7 w-7 rounded-full bg-badge-bg text-badge-text text-[13px] font-semibold flex items-center justify-center">
              {step}
            </span>
          )}
          {title}
        </h2>
        {right}
      </div>
      {children}
    </section>
  );
}

/* --------------------------------------------------------------------------
 * Main component
 * ------------------------------------------------------------------------ */

interface SimpleAdminPanelProps {
  onLock: () => void;
  onOpenAdvanced: () => void;
}

type View = "list" | "editor";

export function SimpleAdminPanel({ onLock, onOpenAdvanced }: SimpleAdminPanelProps) {
  const { articles, upsertArticle, deleteArticle, showToast } = useSite();

  const [view, setView] = useState<View>("list");
  const [listFilter, setListFilter] = useState<"all" | CategorySlug>("all");
  const [listQuery, setListQuery] = useState("");

  // Modal deletion state
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Ensure scroll is free and not locked
  useEffect(() => {
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
    document.documentElement.classList.remove("lenis-stopped");
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  // Editor state
  const [editing, setEditing] = useState<Article | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CategorySlug>("how-to-fixes");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [steps, setSteps] = useState<ArticleHowToStep[]>([]);
  const [faqs, setFaqs] = useState<ArticleFAQ[]>([]);
  const [coverType, setCoverType] = useState<DiagramType>("ssl-handshake");
  const [coverUrl, setCoverUrl] = useState("");
  const [coverSize, setCoverSize] = useState({ w: 1200, h: 750 });
  const [featured, setFeatured] = useState(false);
  const [tags, setTags] = useState("");
  const [problem, setProblem] = useState("");
  const [cause, setCause] = useState("");
  const [quickFix, setQuickFix] = useState("");
  const [testedOn, setTestedOn] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  const sortedArticles = useMemo(
    () =>
      [...articles].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [articles]
  );

  const visibleArticles = useMemo(() => {
    const q = listQuery.trim().toLowerCase();
    return sortedArticles.filter(
      (a) =>
        (listFilter === "all" || a.category === listFilter) &&
        (!q || a.title.toLowerCase().includes(q))
    );
  }, [sortedArticles, listFilter, listQuery]);

  const countsByCategory = useMemo(() => {
    const c: Record<string, number> = {};
    articles.forEach((a) => (c[a.category] = (c[a.category] || 0) + 1));
    return c;
  }, [articles]);

  const wordCount = useMemo(() => {
    const stepWords = steps.map((s) => `${s.name} ${s.text}`).join(" ");
    const faqWords = faqs.map((f) => `${f.question} ${f.answer}`).join(" ");
    return countWords(`${title} ${summary} ${content} ${stepWords} ${faqWords}`);
  }, [title, summary, content, steps, faqs]);

  const slug = customSlug.trim() ? slugify(customSlug) : slugify(title);

  /* ---------------- Editor lifecycle ---------------- */

  const resetEditor = (cat: CategorySlug = "how-to-fixes") => {
    setEditing(null);
    setTitle("");
    setCategory(cat);
    setSummary("");
    setContent("");
    setSteps([]);
    setFaqs([]);
    setCoverType(DEFAULT_COVER_BY_CATEGORY[cat]);
    setCoverUrl("");
    setCoverSize({ w: 1200, h: 750 });
    setFeatured(false);
    setTags("");
    setProblem("");
    setCause("");
    setQuickFix("");
    setTestedOn("");
    setCustomSlug("");
    setShowMore(false);
  };

  const startNewPost = (cat: CategorySlug = "how-to-fixes") => {
    resetEditor(cat);
    setView("editor");
    window.scrollTo({ top: 0 });
  };

  const openForEdit = (a: Article) => {
    setEditing(a);
    setTitle(a.title);
    setCategory(a.category);
    setSummary(a.excerpt);
    setContent(sectionsToContent(a.sections));
    setSteps(a.howToSteps || []);
    setFaqs(a.faqs || []);
    const isUpload =
      a.coverImage.diagramType === "custom-upload" ||
      a.coverImage.url.startsWith("data:image/");
    setCoverType(isUpload ? DEFAULT_COVER_BY_CATEGORY[a.category] : a.coverImage.diagramType || "utf8-pipeline");
    setCoverUrl(isUpload ? a.coverImage.url : "");
    setCoverSize({ w: a.coverImage.width || 1200, h: a.coverImage.height || 750 });
    setFeatured(a.featured);
    setTags(a.tags.join(", "));
    setProblem(a.verifiedTakeaway.symptom);
    setCause(a.verifiedTakeaway.rootCause);
    setQuickFix(a.verifiedTakeaway.instantFix);
    setTestedOn(a.testedOn);
    setCustomSlug(a.slug);
    setShowMore(false);
    setView("editor");
    window.scrollTo({ top: 0 });
  };

  const handleCategoryChange = (cat: CategorySlug) => {
    // If the cover is still the default for the old category, follow the new one.
    if (!coverUrl && coverType === DEFAULT_COVER_BY_CATEGORY[category]) {
      setCoverType(DEFAULT_COVER_BY_CATEGORY[cat]);
    }
    setCategory(cat);
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 1600;
        const scale = img.width > maxW ? maxW / img.width : 1;
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        setCoverUrl(canvas.toDataURL("image/webp", 0.84));
        setCoverSize({ w, h });
        showToast("Image added and optimized.");
      };
      if (typeof ev.target?.result === "string") img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const insertIntoContent = (snippet: string) => {
    const el = contentRef.current;
    if (!el) {
      setContent((c) => (c ? `${c}\n\n${snippet}` : snippet));
      return;
    }
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const before = content.slice(0, start);
    const after = content.slice(end);
    const pad = before && !before.endsWith("\n\n") ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
    const next = `${before}${pad}${snippet}\n\n${after}`;
    setContent(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = (before + pad + snippet).length;
      el.setSelectionRange(pos, pos);
    });
  };

  const handleSave = async (status: "published" | "draft") => {
    if (!title.trim()) {
      showToast("Please add a title first.");
      return;
    }
    if (!content.trim() && steps.length === 0) {
      showToast("Please write some content or add at least one step.");
      return;
    }
    const finalSlug = slug || `post-${Date.now()}`;
    const clash = articles.find(
      (a) => a.slug === finalSlug && a.id !== editing?.id
    );
    if (clash) {
      showToast("Another post already uses this link. Change the title or the link in More options.");
      setShowMore(true);
      return;
    }

    setSaving(true);
    const now = new Date().toISOString();
    const cleanSummary = summary.trim() || content.trim().replace(/[#>`*]/g, "").slice(0, 200);
    const fallbackHeading = category === "tutorials" ? "Tutorial" : "Overview";
    let sections = contentToSections(content, fallbackHeading);

    // Keep tables / inline images from the original article when headings still match.
    if (editing) {
      sections = sections.map((s) => {
        const orig = editing.sections.find((o) => o.heading === s.heading);
        if (!orig) return s;
        return {
          ...s,
          table: orig.table,
          inlineImage: orig.inlineImage,
        };
      });
    }

    const cleanSteps = steps
      .filter((s) => s.name.trim() || s.text.trim())
      .map((s, i) => ({
        stepNumber: i + 1,
        name: s.name.trim() || `Step ${i + 1}`,
        text: s.text.trim(),
        commandOrCode: s.commandOrCode?.trim() || undefined,
        proTip: s.proTip?.trim() || undefined,
      }));
    const cleanFaqs = faqs.filter((f) => f.question.trim() && f.answer.trim());

    const cover: ArticleImage = coverUrl
      ? {
          url: coverUrl,
          alt: title.trim(),
          caption: cleanSummary.slice(0, 160),
          width: coverSize.w,
          height: coverSize.h,
          diagramType: "custom-upload",
        }
      : {
          url: `/images/diagrams/${coverType}.svg`,
          alt: title.trim(),
          caption: cleanSummary.slice(0, 160),
          width: 1200,
          height: 750,
          diagramType: coverType,
        };

    const article: Article = {
      ...(editing || ({} as Article)),
      id: editing?.id || `art-${Date.now()}`,
      slug: finalSlug,
      title: title.trim(),
      subtitle: editing?.subtitle || cleanSummary,
      excerpt: cleanSummary,
      category,
      publishedAt:
        editing && editing.status === "published" ? editing.publishedAt : now,
      updatedAt: now,
      testedOn: testedOn.trim(),
      readingTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)),
      wordCount,
      featured,
      status,
      primaryKeyword: editing?.primaryKeyword || title.trim().toLowerCase(),
      metaTitle: `${title.trim()} | Zee Writes`,
      metaDescription: cleanSummary.slice(0, 158),
      coverImage: cover,
      verifiedTakeaway: {
        symptom: problem.trim(),
        rootCause: cause.trim(),
        instantFix: quickFix.trim(),
        estimatedFixTime: editing?.verifiedTakeaway.estimatedFixTime || "",
        testedPlatforms: testedOn
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      },
      howToSteps: cleanSteps,
      sections,
      faqs: cleanFaqs,
      author: editing?.author || DEFAULT_AUTHOR,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      relatedSlugs:
        editing?.relatedSlugs ||
        articles
          .filter((a) => a.category === category && a.slug !== finalSlug)
          .slice(0, 3)
          .map((a) => a.slug),
      helpfulYes: editing?.helpfulYes ?? 0,
      helpfulNo: editing?.helpfulNo ?? 0,
    };

    const result = await upsertArticle(article);
    setSaving(false);
    if (!result.ok) {
      showToast(`Save failed: ${result.error || "Database error"}`);
      return;
    }

    setEditing(article);
    setCustomSlug(article.slug);
    showToast(status === "published" ? "Published! Your post is live." : "Saved as draft.");
    setView("list");
  };

  const requestDelete = (a: Article) => {
    setDeleteTarget(a);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const target = deleteTarget;
    const res = await deleteArticle(target.id);
    setIsDeleting(false);
    setDeleteTarget(null);

    if (!res.ok) {
      showToast(`Delete failed: ${res.error || "Database error"}`);
      return;
    }

    showToast("Post deleted.");
    if (editing?.id === target.id) {
      resetEditor();
      setView("list");
    }
  };

  /* ---------------- Render ---------------- */

  const previewImage: ArticleImage = coverUrl
    ? { url: coverUrl, alt: title, caption: "", width: coverSize.w, height: coverSize.h, diagramType: "custom-upload" }
    : { url: "", alt: title, caption: "", width: 1200, height: 750, diagramType: coverType };

  return (
    <div
      data-lenis-prevent="true"
      className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-6 overflow-y-visible"
    >
      {/* Top bar */}
      <header className="rounded-[20px] bg-surface border border-hairline shadow-1 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-sans font-semibold text-[20px] text-ink">Admin Panel</h1>
            <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Synced &amp; Vercel Ready
            </span>
          </div>
          <p className="text-[13px] text-muted mt-0.5">
            {articles.length} posts · {articles.filter((a) => a.status === "draft").length} drafts · Cloud Supabase enabled
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`px-4 min-h-[40px] rounded-full text-[14px] font-medium border transition-colors ${
              view === "list"
                ? "bg-ink text-white border-ink"
                : "bg-surface text-ink border-hairline hover:border-[#4a74f0]"
            }`}
          >
            My Posts ({articles.length})
          </button>
          <button
            type="button"
            onClick={() => startNewPost()}
            className="inline-flex items-center gap-1.5 px-4 min-h-[40px] rounded-full text-[14px] font-semibold bg-[#4a74f0] text-white hover:bg-[#3a63de] transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            New Post
          </button>
          <button
            type="button"
            onClick={onOpenAdvanced}
            title="Advanced studio: SEO grader, AdSense, backups"
            className="inline-flex items-center gap-1.5 px-3.5 min-h-[40px] rounded-full text-[14px] text-secondary border border-hairline bg-surface hover:text-ink"
          >
            <Settings className="w-4 h-4" strokeWidth={1.5} />
            Advanced
          </button>
          <button
            type="button"
            onClick={onLock}
            className="inline-flex items-center gap-1.5 px-3.5 min-h-[40px] rounded-full text-[14px] text-secondary border border-hairline bg-surface hover:text-red-600"
          >
            <Lock className="w-4 h-4" strokeWidth={1.5} />
            Log out
          </button>
        </div>
      </header>

      {/* ============================ LIST VIEW ============================ */}
      {view === "list" && (
        <>
          {/* Quick start per category */}
          <section className="space-y-3">
            <h2 className="text-[15px] font-semibold text-ink">Write a new post in…</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {CATEGORY_LIST.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => startNewPost(cat.slug)}
                  className="group text-left rounded-[18px] bg-surface border border-hairline shadow-1 hover:shadow-2 hover:border-[#4a74f0]/50 p-4 transition-[box-shadow,border-color] duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] font-semibold text-ink">{cat.shortName}</span>
                    <Plus className="w-4 h-4 text-muted group-hover:text-[#4a74f0]" />
                  </div>
                  <p className="mt-1 text-[13px] text-muted line-clamp-2">{cat.tagline}</p>
                  <p className="mt-2 text-[12px] font-medium text-secondary">
                    {countsByCategory[cat.slug] || 0} posts
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* Posts table */}
          <section className="rounded-[20px] bg-surface border border-hairline shadow-1 overflow-hidden">
            <div className="p-4 sm:p-5 flex flex-wrap items-center gap-3 border-b border-hairline">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  value={listQuery}
                  onChange={(e) => setListQuery(e.target.value)}
                  placeholder="Search your posts"
                  className={`${inputCls} pl-10 py-2.5`}
                />
              </div>
              <select
                value={listFilter}
                onChange={(e) => setListFilter(e.target.value as "all" | CategorySlug)}
                className={`${inputCls} w-auto py-2.5`}
              >
                <option value="all">All categories</option>
                {CATEGORY_LIST.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.shortName}
                  </option>
                ))}
              </select>
            </div>

            {visibleArticles.length === 0 ? (
              <div className="p-10 text-center text-[15px] text-muted">
                No posts here yet.{" "}
                <button
                  type="button"
                  onClick={() => startNewPost(listFilter === "all" ? "how-to-fixes" : listFilter)}
                  className="text-[#4a74f0] font-semibold"
                >
                  Write the first one
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-[rgba(15,35,90,0.08)]">
                {visibleArticles.map((a) => (
                  <li key={a.id} className="p-4 sm:px-5 flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[220px]">
                      <button
                        type="button"
                        onClick={() => openForEdit(a)}
                        className="text-left text-[15px] font-semibold text-ink hover:text-[#4a74f0]"
                      >
                        {a.title}
                      </button>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-muted">
                        <span className="px-2 py-0.5 rounded-full bg-badge-bg text-badge-text font-medium">
                          {CATEGORIES[a.category]?.shortName || a.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full font-medium ${
                            a.status === "published"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {a.status === "published" ? "Live" : "Draft"}
                        </span>
                        <span>
                          Updated {new Date(a.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openForEdit(a)}
                        className="inline-flex items-center gap-1 px-3 min-h-[36px] rounded-full border border-hairline text-[13px] text-ink hover:border-[#4a74f0]"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      {a.status === "published" && (
                        <Link
                          href={`/article/${a.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-3 min-h-[36px] rounded-full border border-hairline text-[13px] text-ink hover:border-[#4a74f0]"
                        >
                          View <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => requestDelete(a)}
                        aria-label={`Delete ${a.title}`}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-hairline text-muted hover:text-red-600 hover:border-red-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {/* =========================== EDITOR VIEW =========================== */}
      {view === "editor" && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setView("list")}
            className="inline-flex items-center gap-1.5 text-[14px] font-medium text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Posts ({articles.length})</span>
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-5">
            {/* 1. Basics */}
            <Card step={1} title="Title & category">
              <Field label="Title">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. How to Fix Wi-Fi That Keeps Disconnecting on Windows 11"
                  className={`${inputCls} text-[17px] font-medium`}
                />
              </Field>

              <div className="space-y-1.5">
                <span className="block text-[14px] font-semibold text-ink">Category</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORY_LIST.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={`rounded-[12px] border px-3 py-2.5 text-[14px] font-medium transition-colors ${
                        category === cat.slug
                          ? "border-[#4a74f0] bg-[#4a74f0]/[0.08] text-[#2a4fc4]"
                          : "border-hairline bg-surface text-ink hover:border-[#4a74f0]/50"
                      }`}
                    >
                      {cat.shortName}
                    </button>
                  ))}
                </div>
              </div>

              <Field
                label="Short summary"
                hint="1–2 sentences. Shown on cards and in Google results."
              >
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={2}
                  placeholder="What will the reader learn or fix?"
                  className={inputCls}
                />
              </Field>
            </Card>

            {/* 2. Content */}
            <Card
              step={2}
              title="Write your post"
              right={<span className="text-[13px] text-muted">{wordCount} words</span>}
            >
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => insertIntoContent("## New heading")}
                  className="px-3 min-h-[34px] rounded-full border border-hairline text-[13px] text-ink hover:border-[#4a74f0]"
                >
                  + Heading
                </button>
                <button
                  type="button"
                  onClick={() => insertIntoContent("```\npaste command or code here\n```")}
                  className="px-3 min-h-[34px] rounded-full border border-hairline text-[13px] text-ink hover:border-[#4a74f0]"
                >
                  + Code box
                </button>
                <button
                  type="button"
                  onClick={() => insertIntoContent("> Tip: write a helpful tip here")}
                  className="px-3 min-h-[34px] rounded-full border border-hairline text-[13px] text-ink hover:border-[#4a74f0]"
                >
                  + Tip box
                </button>
                <button
                  type="button"
                  onClick={() => insertIntoContent("[link text](/article/your-post-link)")}
                  className="px-3 min-h-[34px] rounded-full border border-hairline text-[13px] text-ink hover:border-[#4a74f0]"
                >
                  + Link
                </button>
              </div>
              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={18}
                placeholder={
                  "## Why this happens\n\nWrite normally. Leave an empty line between paragraphs.\n\n## How to fix it\n\nStart a new section with ## and a heading.\n\n> Tip: Lines starting with > Tip: become a highlighted tip."
                }
                className={`${inputCls} font-sans leading-[1.7] min-h-[360px]`}
              />
              <p className="text-[13px] text-muted">
                Just type. Use <b>## Heading</b> for a new section, an empty line for a new
                paragraph, the <b>Code box</b> button for commands, and <b>&gt; Tip:</b> for a tip box.
              </p>
            </Card>

            {/* 3. Steps */}
            <Card
              step={3}
              title="Steps (optional)"
              right={
                <button
                  type="button"
                  onClick={() =>
                    setSteps((s) => [
                      ...s,
                      { stepNumber: s.length + 1, name: "", text: "", commandOrCode: "" },
                    ])
                  }
                  className="inline-flex items-center gap-1 px-3 min-h-[34px] rounded-full bg-badge-bg text-badge-text text-[13px] font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> Add step
                </button>
              }
            >
              {steps.length === 0 ? (
                <p className="text-[14px] text-muted">
                  Great for tutorials and fixes. Each step shows as a numbered card at the top of the post.
                </p>
              ) : (
                <ol className="space-y-3">
                  {steps.map((st, i) => (
                    <li key={i} className="rounded-[14px] border border-hairline p-4 space-y-2.5 bg-page">
                      <div className="flex items-center gap-2">
                        <span className="h-7 w-7 shrink-0 rounded-full bg-ink text-white text-[13px] font-semibold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <input
                          value={st.name}
                          onChange={(e) =>
                            setSteps((arr) =>
                              arr.map((x, j) => (j === i ? { ...x, name: e.target.value } : x))
                            )
                          }
                          placeholder="Step title, e.g. Open Settings"
                          className={`${inputCls} py-2.5`}
                        />
                        <button
                          type="button"
                          onClick={() => setSteps((arr) => arr.filter((_, j) => j !== i))}
                          aria-label="Remove step"
                          className="w-9 h-9 shrink-0 rounded-full border border-hairline text-muted hover:text-red-600 flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        value={st.text}
                        onChange={(e) =>
                          setSteps((arr) =>
                            arr.map((x, j) => (j === i ? { ...x, text: e.target.value } : x))
                          )
                        }
                        rows={2}
                        placeholder="What should the reader do?"
                        className={inputCls}
                      />
                      <textarea
                        value={st.commandOrCode || ""}
                        onChange={(e) =>
                          setSteps((arr) =>
                            arr.map((x, j) =>
                              j === i ? { ...x, commandOrCode: e.target.value } : x
                            )
                          )
                        }
                        rows={1}
                        placeholder="Command to copy (optional)"
                        className={`${inputCls} font-mono text-[13px]`}
                      />
                    </li>
                  ))}
                </ol>
              )}
            </Card>

            {/* 4. FAQs */}
            <Card
              step={4}
              title="Questions & answers (optional)"
              right={
                <button
                  type="button"
                  onClick={() => setFaqs((f) => [...f, { question: "", answer: "" }])}
                  className="inline-flex items-center gap-1 px-3 min-h-[34px] rounded-full bg-badge-bg text-badge-text text-[13px] font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> Add question
                </button>
              }
            >
              {faqs.length === 0 ? (
                <p className="text-[14px] text-muted">
                  Add common questions readers ask. They appear at the end of the post.
                </p>
              ) : (
                <div className="space-y-3">
                  {faqs.map((f, i) => (
                    <div key={i} className="rounded-[14px] border border-hairline p-4 space-y-2.5 bg-page">
                      <div className="flex items-center gap-2">
                        <input
                          value={f.question}
                          onChange={(e) =>
                            setFaqs((arr) =>
                              arr.map((x, j) => (j === i ? { ...x, question: e.target.value } : x))
                            )
                          }
                          placeholder="Question"
                          className={`${inputCls} py-2.5`}
                        />
                        <button
                          type="button"
                          onClick={() => setFaqs((arr) => arr.filter((_, j) => j !== i))}
                          aria-label="Remove question"
                          className="w-9 h-9 shrink-0 rounded-full border border-hairline text-muted hover:text-red-600 flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        value={f.answer}
                        onChange={(e) =>
                          setFaqs((arr) =>
                            arr.map((x, j) => (j === i ? { ...x, answer: e.target.value } : x))
                          )
                        }
                        rows={2}
                        placeholder="Answer"
                        className={inputCls}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24 self-start">
            <Card title="Publish">
              <div className="text-[13px] text-muted space-y-1">
                <p>
                  Status:{" "}
                  <b className="text-ink">
                    {editing ? (editing.status === "published" ? "Live" : "Draft") : "New, not saved"}
                  </b>
                </p>
                <p className="break-all">
                  Link: <span className="text-ink">/article/{slug || "…"}</span>
                </p>
              </div>
              <label className="flex items-center gap-2 text-[14px] text-ink">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 accent-[#4a74f0]"
                />
                Feature on home page
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave("draft")}
                  className="min-h-[44px] rounded-full border border-hairline bg-surface text-[14px] font-medium text-ink hover:border-[#4a74f0] disabled:opacity-60"
                >
                  Save draft
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave("published")}
                  className="min-h-[44px] rounded-full bg-[#4a74f0] text-white text-[14px] font-semibold hover:bg-[#3a63de] disabled:opacity-60"
                >
                  {editing?.status === "published" ? "Update" : "Publish"}
                </button>
              </div>
              {editing?.status === "published" && (
                <Link
                  href={`/article/${editing.slug}`}
                  target="_blank"
                  className="flex items-center justify-center gap-1 text-[14px] font-medium text-[#4a74f0]"
                >
                  View live post <ArrowUpRight className="w-4 h-4" />
                </Link>
              )}
            </Card>

            <Card title="Cover image">
              <div className="rounded-[14px] overflow-hidden border border-hairline">
                <TechnicalDiagram image={previewImage} />
              </div>
              {coverUrl ? (
                <button
                  type="button"
                  onClick={() => setCoverUrl("")}
                  className="w-full min-h-[38px] rounded-full border border-hairline text-[13px] text-ink hover:border-red-300 hover:text-red-600"
                >
                  Remove photo, use illustration
                </button>
              ) : (
                <select
                  value={coverType}
                  onChange={(e) => setCoverType(e.target.value as DiagramType)}
                  className={`${inputCls} py-2.5`}
                >
                  {COVER_STYLES.map((s) => (
                    <option key={s.value} value={s.value}>
                      Illustration: {s.label}
                    </option>
                  ))}
                </select>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImageUpload(f);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full inline-flex items-center justify-center gap-1.5 min-h-[38px] rounded-full border border-hairline text-[13px] text-ink hover:border-[#4a74f0]"
              >
                <Upload className="w-3.5 h-3.5" /> Upload your own photo
              </button>
            </Card>

            <section className="rounded-[20px] bg-surface border border-hairline shadow-1">
              <button
                type="button"
                onClick={() => setShowMore((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-4 text-[15px] font-semibold text-ink"
              >
                More options
                <ChevronDown
                  className={`w-4 h-4 text-muted transition-transform ${showMore ? "rotate-180" : ""}`}
                />
              </button>
              {showMore && (
                <div className="px-5 pb-5 space-y-4">
                  <Field label="Tags" hint="Separate with commas.">
                    <input
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="Windows, Wi-Fi, Network"
                      className={`${inputCls} py-2.5`}
                    />
                  </Field>
                  <Field label="Tested on" hint="e.g. Windows 11, Chrome 130">
                    <input
                      value={testedOn}
                      onChange={(e) => setTestedOn(e.target.value)}
                      className={`${inputCls} py-2.5`}
                    />
                  </Field>
                  <p className="text-[13px] text-muted pt-1">
                    Summary box (shown above the post if filled):
                  </p>
                  <Field label="Problem">
                    <input value={problem} onChange={(e) => setProblem(e.target.value)} className={`${inputCls} py-2.5`} />
                  </Field>
                  <Field label="Cause">
                    <input value={cause} onChange={(e) => setCause(e.target.value)} className={`${inputCls} py-2.5`} />
                  </Field>
                  <Field label="Quick fix">
                    <input value={quickFix} onChange={(e) => setQuickFix(e.target.value)} className={`${inputCls} py-2.5`} />
                  </Field>
                  <Field label="Custom link" hint="Leave empty to create it from the title.">
                    <input
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value)}
                      placeholder={slugify(title) || "my-post-link"}
                      className={`${inputCls} py-2.5`}
                    />
                  </Field>
                </div>
              )}
            </section>

            {editing && (
              <button
                type="button"
                onClick={() => requestDelete(editing)}
                className="w-full inline-flex items-center justify-center gap-1.5 min-h-[40px] rounded-full border border-hairline text-[13px] text-muted hover:text-red-600 hover:border-red-300"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete this post
              </button>
            )}
          </aside>
        </div>
        </div>
      )}

      {/* Styled Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title={deleteTarget?.title || ""}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
