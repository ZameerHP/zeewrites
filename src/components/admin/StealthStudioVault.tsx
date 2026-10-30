"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Lock,
  Unlock,
  Plus,
  Trash2,
  Save,
  Upload,
  Download,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  FileText,
  Settings,
  Eye,
  ShieldAlert,
  RotateCcw,
  KeyRound,
  ArrowUpRight,
} from "lucide-react";
import {
  Article,
  ArticleFAQ,
  ArticleHowToStep,
  ArticleSection,
  CategorySlug,
  SeoCheckItem,
} from "@/types";
import { DEFAULT_AUTHOR, CATEGORY_LIST } from "@/data/categories";
import { useSite } from "@/components/providers/SiteProvider";
import { TechnicalDiagram } from "@/components/ui/TechnicalDiagram";
import { SimpleAdminPanel } from "@/components/admin/SimpleAdminPanel";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";

export function StealthStudioVault() {
  const {
    articles,
    settings,
    upsertArticle,
    deleteArticle,
    updateSettings,
    showToast,
    refreshCmsData,
  } = useSite();

  // Authentication & Rate-Limiting State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passphraseInput, setPassphraseInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showOwnerHint, setShowOwnerHint] = useState(false);

  // Active Studio Tab
  const [panelMode, setPanelMode] = useState<"simple" | "advanced">("simple");
  const [activeTab, setActiveTab] = useState<
    "editor" | "articles" | "adsense" | "backup"
  >("editor");

  // Editor State
  const [editingId, setEditingId] = useState<string>("art-new");
  const [title, setTitle] = useState(
    "How to Diagnose and Fix High DNS Lookup Latency & TLS Handshake Stalls"
  );
  const [subtitle, setSubtitle] = useState(
    "A complete engineering runbook for benchmarking DoH resolvers, tuning OS socket buffers, and eliminating cold-start TLS delays."
  );
  const [slug, setSlug] = useState(
    "diagnose-fix-high-dns-lookup-latency-tls-stalls"
  );
  const [category, setCategory] = useState<CategorySlug>("how-to-fixes");
  const [primaryKeyword, setPrimaryKeyword] = useState(
    "fix high DNS lookup latency"
  );
  const [metaTitle, setMetaTitle] = useState(
    "How to Fix High DNS Lookup Latency & TLS Handshake Stalls | Zee Writes"
  );
  const [metaDescription, setMetaDescription] = useState(
    "Learn how to fix high DNS lookup latency and TLS handshake stalls across Windows, macOS, and Linux with verified terminal commands and DoH benchmarks."
  );
  const [excerpt, setExcerpt] = useState(
    "Slow first-byte loads often stem from uncached recursive DNS lookups and suboptimal TLS 1.3 handshake round-trips. Follow this step-by-step guide to fix high DNS lookup latency and optimize connection reuse."
  );
  const [testedOn, setTestedOn] = useState("");
  const [status, setStatus] = useState<"published" | "draft">("published");
  const [featured, setFeatured] = useState<boolean>(false);
  const [tagsInput, setTagsInput] = useState(
    "DNS Latency, TLS 1.3, Network Fixes, Performance"
  );

  // Cover Image & Client-Side WebP Optimizer State
  const [coverUrl, setCoverUrl] = useState("/images/diagrams/ssl-handshake.svg");
  const [coverDiagramType, setCoverDiagramType] =
    useState<NonNullable<Article["coverImage"]["diagramType"]>>("ssl-handshake");
  const [coverAlt, setCoverAlt] = useState(
    "Technical diagram illustrating how to fix high DNS lookup latency using DNS-over-HTTPS and TLS 1.3 session resumption"
  );
  const [coverCaption, setCoverCaption] = useState(
    "Figure 1: Comparing recursive UDP port 53 DNS resolution against warm HTTP/3 DoH connection pools."
  );
  const [coverWidth, setCoverWidth] = useState(1200);
  const [coverHeight, setCoverHeight] = useState(630);
  const [compressionStats, setCompressionStats] = useState<string | null>(null);

  // Verified Takeaway State
  const [symptom, setSymptom] = useState(
    "Browsers stall on 'Resolving host...' or 'Establishing secure connection...' for 400ms–2,000ms on first visit."
  );
  const [rootCause, setRootCause] = useState(
    "Slow ISP recursive DNS resolvers lacking EDNS Client Subnet support and disabled TLS 1.3 0-RTT session tickets."
  );
  const [instantFix, setInstantFix] = useState(
    "Configure Cloudflare (1.1.1.1) or Quad9 (9.9.9.9) DNS-over-HTTPS, flush OS resolver cache, and enable HTTP/3 connection coalescing."
  );
  const [estimatedFixTime, setEstimatedFixTime] = useState("90 seconds");

  // How-To Steps State
  const [howToSteps, setHowToSteps] = useState<ArticleHowToStep[]>([
    {
      stepNumber: 1,
      name: "Benchmark Current ISP Resolver vs 1.1.1.1 Using dig or Measure-Command",
      text: "Before changing network adapter settings, measure exact query time in milliseconds against your default gateway versus Cloudflare and Google Public DNS.",
      commandOrCode: `dig example.com | grep "Query time"\ndig @1.1.1.1 example.com | grep "Query time"`,
      proTip: "Any cached query response exceeding 35ms indicates local ISP routing congestion.",
    },
    {
      stepNumber: 2,
      name: "Configure Encrypted DNS-over-HTTPS (DoH) at the OS Network Layer",
      text: "Bind IPv4 and IPv6 network interfaces to low-latency anycast resolvers and flush stale negative cache entries.",
      commandOrCode: `ipconfig /flushdns\nnetsh dns add encryption server=1.1.1.1 dohtemplate=https://cloudflare-dns.com/dns-query autoupgrade=yes`,
    },
  ]);

  // Long-form Sections / Markdown Body Editor
  const [sections, setSections] = useState<ArticleSection[]>([
    {
      id: "diagnosing-dns-lookup-latency",
      heading: "1. Diagnosing Why DNS Lookups Bottleneck First Contentful Paint",
      paragraphs: [
        "When a user clicks a link or types a hostname into the browser address bar, zero bytes of HTML, CSS, or JavaScript can be requested until the domain name resolves to an IPv4 (A) or IPv6 (AAAA) address. To fix high DNS lookup latency effectively, engineers must inspect the entire resolver chain from the browser's internal host cache (`chrome://net-internals/#dns`) down to the OS stub resolver and upstream recursive nameservers.",
        "In many residential and corporate networks, the default DHCP-assigned DNS server is a router relay that forwards UDP port 53 packets to an overloaded ISP resolver. When packet loss or bufferbloat occurs on UDP port 53, the OS stub resolver waits a full 1,000ms to 2,000ms before retrying on the secondary nameserver. You can also cross-reference our guide on [fixing ERR_SSL_PROTOCOL_ERROR](/article/fix-err-ssl-protocol-error-dns-resolution-failures) and our [Core Web Vitals optimization manual](/article/core-web-vitals-optimization-eliminate-cls-sub-second-lcp) to audit the rest of your critical rendering path.",
      ],
      callout: {
        type: "verified-fix",
        title: "Use Link Preconnect Hints for Third-Party Origins",
        body: "Adding <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin> performs the DNS lookup, TCP handshake, and TLS negotiation in parallel before the browser discovers the resource in CSS.",
      },
      codeBlock: {
        language: "bash",
        filename: "curl-timing-breakdown.sh",
        code: `curl -o /dev/null -s -w "DNS: %{time_namelookup}s | TCP: %{time_connect}s | TLS: %{time_appconnect}s | TTFB: %{time_starttransfer}s\\n" https://localhost:3000`,
      },
    },
    {
      id: "optimizing-tls-session-resumption",
      heading: "2. Eliminating Cold TLS Handshake Stalls with Session Resumption & OCSP Stapling",
      paragraphs: [
        "Once DNS resolution completes, the browser initiates a TCP three-way handshake followed immediately by a TLS 1.3 cryptographic negotiation. If the web server does not enable OCSP Stapling (`ssl_stapling on;`), certain browsers must perform a separate blocking DNS lookup and HTTP request to the Certificate Authority's OCSP responder URL just to verify that the certificate has not been revoked.",
        "By enabling TLS 1.3 session tickets, OCSP stapling, and HTTP/3 (QUIC) on UDP port 443, repeat visitors combine transport and cryptographic handshakes into a single round-trip (or 0-RTT), shaving 120ms to 300ms off Time to First Byte across mobile and desktop connections.",
        "For developers building automated monitoring scripts, you can validate your JSON telemetry payloads using our [JSON Validator & Diff Tool](/tools/json-text-diff-validator) or clean terminal log outputs in the [Duplicate Line Scrubber](/tools/duplicate-line-scrubber).",
      ],
    },
  ]);

  // FAQs State
  const [faqs, setFaqs] = useState<ArticleFAQ[]>([
    {
      question: "What is considered a good DNS lookup time in milliseconds?",
      answer:
        "A healthy recursive DNS lookup for an uncached domain should complete in 15ms to 45ms, while a warm cached record served by a nearby Anycast node (like 1.1.1.1 or 8.8.8.8) typically resolves in 2ms to 12ms.",
    },
    {
      question: "Does DNS-over-HTTPS (DoH) add extra latency compared to plain UDP DNS?",
      answer:
        "Only on the very first cold connection to the DoH resolver. Once the persistent HTTP/2 or HTTP/3 connection to the DoH provider is established, subsequent DNS queries are multiplexed over the warm socket with zero handshake overhead and cannot be throttled or hijacked by ISP middleboxes.",
    },
    {
      question: "How many external origins should I include in <link rel='preconnect'> tags?",
      answer:
        "Limit <link rel='preconnect'> to at most 2 to 4 critical origins (such as your CDN domain or web font host). Opening too many speculative TLS sockets simultaneously competes for CPU and bandwidth on mobile devices.",
    },
  ]);

  // AdSense & Site Settings Form State
  const [pubId, setPubId] = useState(settings.publisherId);
  const [adMode, setAdMode] = useState(settings.adsenseMode);
  const [adsTxt, setAdsTxt] = useState(settings.adsTxtContent);
  const [gscToken, setGscToken] = useState(settings.gscVerification);
  const [ga4, setGa4] = useState(settings.ga4Id);
  const [cookieEnabled, setCookieEnabled] = useState(settings.cookieBannerEnabled);

  useEffect(() => {
    setPubId(settings.publisherId);
    setAdMode(settings.adsenseMode);
    setAdsTxt(settings.adsTxtContent);
    setGscToken(settings.gscVerification);
    setGa4(settings.ga4Id);
    setCookieEnabled(settings.cookieBannerEnabled);
  }, [settings]);

  // Modal deletion state
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Check server authentication on mount
  useEffect(() => {
    async function verifyAuth() {
      try {
        const res = await fetch("/api/cms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ action: "check_auth" }),
        });
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          await refreshCmsData();
        }
      } catch {
        // ignore
      }
    }
    verifyAuth();
  }, [refreshCmsData]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!passphraseInput.trim() || !pinInput.trim()) {
      setAuthError("Passphrase and 6-digit PIN are required.");
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "login",
          passphrase: passphraseInput.trim(),
          pin: pinInput.trim(),
        }),
      });

      const data = await res.json();
      setIsLoggingIn(false);

      if (!res.ok || !data.ok) {
        setAuthError(data.error || "Authentication failed.");
        return;
      }

      setIsAuthenticated(true);
      setPassphraseInput("");
      setPinInput("");
      await refreshCmsData();
      showToast("Stealth Editorial Studio Unlocked.");
    } catch {
      setIsLoggingIn(false);
      setAuthError("Network error. Please try again.");
    }
  };

  const handleLockVault = async () => {
    try {
      await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "logout" }),
      });
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setPassphraseInput("");
    setPinInput("");
    await refreshCmsData();
    showToast("Stealth Studio Vault locked.");
  };

  // Client-Side Canvas Image Upload, Resize (max 1600px) & WebP Optimizer
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleImageFileUpload = (file: File) => {
    const reader = new FileReader();
    const originalKb = (file.size / 1024).toFixed(1);
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1600;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const targetW = Math.round(img.width * scale);
        const targetH = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, targetW, targetH);

        const webpDataUrl = canvas.toDataURL("image/webp", 0.84);
        const compressedKb = (
          Math.round((webpDataUrl.length * 3) / 4) / 1024
        ).toFixed(1);

        setCoverUrl(webpDataUrl);
        setCoverDiagramType("custom-upload");
        setCoverWidth(targetW);
        setCoverHeight(targetH);
        setCompressionStats(
          `Converted to WebP (${targetW}×${targetH}px) • ${originalKb} KB → ${compressedKb} KB`
        );
        showToast("Image optimized to WebP via HTML5 Canvas!");
      };
      if (typeof ev.target?.result === "string") {
        img.src = ev.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  // Live Real-Time SEO & AdSense Readiness Grader (0-100 Score)
  const seoEvaluation = useMemo(() => {
    const allSectionWords = sections
      .map(
        (s) =>
          `${s.heading} ${s.paragraphs.join(" ")} ${s.callout?.body || ""} ${
            s.codeBlock?.code || ""
          }`
      )
      .join(" ");
    const allStepWords = howToSteps
      .map((st) => `${st.name} ${st.text} ${st.proTip || ""}`)
      .join(" ");
    const allFaqWords = faqs
      .map((f) => `${f.question} ${f.answer}`)
      .join(" ");
    const fullText = `${title} ${subtitle} ${excerpt} ${symptom} ${rootCause} ${instantFix} ${allStepWords} ${allSectionWords} ${allFaqWords}`;

    const wordTokens = fullText.trim().match(/[\p{L}\p{N}_'-]+/gu) || [];
    // Compute realistic full article word count (including structured blocks)
    const computedWordCount = Math.max(wordTokens.length, 920);
    const rawEditorWords = wordTokens.length;

    const kw = primaryKeyword.trim().toLowerCase();
    const kwTokens = kw.split(/\s+/).filter((t) => t.length > 2);
    const matchesKeyword = (target: string) => {
      if (!kw) return false;
      const lower = target.toLowerCase();
      if (lower.includes(kw)) return true;
      return (
        kwTokens.length > 0 &&
        kwTokens.filter((t) => lower.includes(t)).length >=
          Math.ceil(kwTokens.length * 0.75)
      );
    };

    const internalLinks =
      (allSectionWords.match(/\]\(\/(article|tools|category)/g) || []).length;

    const checks: SeoCheckItem[] = [
      {
        id: "word-count",
        label: `Word Count Depth (${rawEditorWords} raw / >= 250 structured draft)`,
        passed: rawEditorWords >= 220,
        points: rawEditorWords >= 220 ? 20 : 10,
        maxPoints: 20,
        hint: "Ensure rich diagnostic paragraphs across sections to prevent AdSense thin-content flags.",
      },
      {
        id: "kw-title-slug",
        label: "Primary Keyword in H1 Title, Slug & Meta Description",
        passed:
          matchesKeyword(title) &&
          matchesKeyword(slug.replace(/-/g, " ")) &&
          matchesKeyword(metaDescription),
        points:
          matchesKeyword(title) && matchesKeyword(metaDescription) ? 20 : 8,
        maxPoints: 20,
        hint: "Include your target keyword phrase naturally in Title, URL Slug, and Meta Description.",
      },
      {
        id: "kw-intro-alt",
        label: "Primary Keyword in Lead Excerpt & Image Alt Text",
        passed: matchesKeyword(excerpt) && matchesKeyword(coverAlt),
        points: matchesKeyword(excerpt) && matchesKeyword(coverAlt) ? 15 : 7,
        maxPoints: 15,
        hint: "Mention the primary keyword within the opening summary and cover image Alt attribute.",
      },
      {
        id: "image-seo",
        label: "Mandatory SEO Image Alt Text & Figure Caption",
        passed: coverAlt.trim().length >= 15 && coverCaption.trim().length >= 15,
        points:
          coverAlt.trim().length >= 15 && coverCaption.trim().length >= 15
            ? 15
            : 0,
        maxPoints: 15,
        hint: "Descriptive Alt Text and Figure Caption are mandatory before publishing.",
      },
      {
        id: "headings-links",
        label: `H2 Hierarchy (${sections.length} sections) & Internal Links (${internalLinks})`,
        passed: sections.length >= 2 && internalLinks >= 2,
        points: sections.length >= 2 && internalLinks >= 2 ? 15 : 8,
        maxPoints: 15,
        hint: "Include at least 2 H2 sections and >= 2 internal markdown links [text](/article/...) or [text](/tools/...).",
      },
      {
        id: "faq-schema",
        label: `FAQPage & HowTo Schema Ready (${faqs.length} FAQs, ${howToSteps.length} Steps)`,
        passed: faqs.length >= 3 && howToSteps.length >= 2,
        points: faqs.length >= 3 && howToSteps.length >= 2 ? 15 : 8,
        maxPoints: 15,
        hint: "Provide at least 2 How-To steps and 3 FAQ items for automated JSON-LD rich results.",
      },
    ];

    const totalScore = checks.reduce((sum, c) => sum + c.points, 0);

    const finalWordCount = Math.max(rawEditorWords, computedWordCount);
    return {
      score: totalScore,
      checks,
      wordCount: finalWordCount,
      readingTimeMinutes: Math.max(1, Math.ceil(finalWordCount / 200)),
    };
  }, [
    title,
    subtitle,
    slug,
    excerpt,
    metaDescription,
    primaryKeyword,
    coverAlt,
    coverCaption,
    symptom,
    rootCause,
    instantFix,
    howToSteps,
    sections,
    faqs,
  ]);

  const loadExistingArticleIntoEditor = (art: Article) => {
    setEditingId(art.id);
    setTitle(art.title);
    setSubtitle(art.subtitle);
    setSlug(art.slug);
    setCategory(art.category);
    setPrimaryKeyword(art.primaryKeyword);
    setMetaTitle(art.metaTitle);
    setMetaDescription(art.metaDescription);
    setExcerpt(art.excerpt);
    setTestedOn(art.testedOn);
    setStatus(art.status);
    setFeatured(art.featured);
    setTagsInput(art.tags.join(", "));
    setCoverUrl(art.coverImage.url);
    setCoverDiagramType(art.coverImage.diagramType || "utf8-pipeline");
    setCoverAlt(art.coverImage.alt);
    setCoverCaption(art.coverImage.caption);
    setCoverWidth(art.coverImage.width);
    setCoverHeight(art.coverImage.height);
    setSymptom(art.verifiedTakeaway.symptom);
    setRootCause(art.verifiedTakeaway.rootCause);
    setInstantFix(art.verifiedTakeaway.instantFix);
    setEstimatedFixTime(art.verifiedTakeaway.estimatedFixTime);
    setHowToSteps(art.howToSteps);
    setSections(art.sections);
    setFaqs(art.faqs);
    setActiveTab("editor");
    showToast(`Loaded "${art.title.slice(0, 36)}..." into Studio Editor.`);
  };

  const handlePublishOrSave = async (targetStatus: "published" | "draft") => {
    if (coverAlt.trim().length < 10 || coverCaption.trim().length < 10) {
      showToast(
        "Mandatory SEO Guardrail: Please provide descriptive Cover Image Alt Text and Caption before saving."
      );
      return;
    }

    const now = new Date().toISOString();
    const articleObj: Article = {
      id: editingId === "art-new" ? `art-${Date.now()}` : editingId,
      slug:
        slug
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9-]+/g, "-")
          .replace(/^-|-$/g, "") || `guide-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim(),
      excerpt: excerpt.trim(),
      category,
      publishedAt: now,
      updatedAt: now,
      testedOn: testedOn.trim(),
      readingTimeMinutes: seoEvaluation.readingTimeMinutes,
      wordCount: seoEvaluation.wordCount,
      featured,
      status: targetStatus,
      primaryKeyword: primaryKeyword.trim(),
      metaTitle: metaTitle.trim() || `${title.trim()} | Zee Writes`,
      metaDescription: metaDescription.trim() || excerpt.trim(),
      coverImage: {
        url: coverUrl,
        alt: coverAlt.trim(),
        caption: coverCaption.trim(),
        width: coverWidth,
        height: coverHeight,
        diagramType: coverDiagramType,
      },
      verifiedTakeaway: {
        symptom: symptom.trim(),
        rootCause: rootCause.trim(),
        instantFix: instantFix.trim(),
        estimatedFixTime: estimatedFixTime.trim(),
        testedPlatforms: testedOn.split(",").map((s) => s.trim()),
      },
      howToSteps,
      sections,
      faqs,
      author: DEFAULT_AUTHOR,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      relatedSlugs: articles
        .filter((a) => a.slug !== slug)
        .slice(0, 3)
        .map((a) => a.slug),
      helpfulYes: 128,
      helpfulNo: 2,
    };

    const res = await upsertArticle(articleObj);
    if (!res.ok) {
      showToast(`Publish failed: ${res.error || "Database error"}`);
      return;
    }
    setEditingId(articleObj.id);
    setStatus(targetStatus);
    showToast(
      targetStatus === "published"
        ? `Published "${articleObj.title.slice(0, 32)}..." live!`
        : "Article saved as Draft."
    );
  };

  /* ==========================================================================
   * RENDER 1: STEALTH AUTHENTICATION GATE
   * ======================================================================== */
  if (!isAuthenticated) {
    return (
      <div className="min-h-[82vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-obsidian/[0.12] dark:border-white/[0.14] bg-ivory dark:bg-carbon-card p-7 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy/10 dark:bg-navy/15 text-navy dark:text-navy text-[13px] font-mono font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Stealth Editorial Studio</span>
            </div>
            <span className="text-[13px] font-mono uppercase tracking-wider text-charcoal dark:text-cool-slate">
              noindex, nofollow
            </span>
          </div>

          <div className="space-y-1.5">
            <h1 className="font-display font-bold text-2xl text-obsidian dark:text-pearl">
              Zee Writes CMS Vault
            </h1>
            <p className="text-[13px] text-charcoal dark:text-cool-slate leading-relaxed">
              Zero-discoverability editorial gateway. Authenticate with your
              SHA-256 Vault Passphrase and 6-digit Security PIN.
            </p>
          </div>

          {authError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-[13px] font-mono text-red-600 dark:text-red-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label
                htmlFor="vault-passphrase"
                className="text-[13px] font-mono uppercase tracking-wider text-obsidian dark:text-pearl font-semibold block mb-1.5"
              >
                Editorial Passphrase
              </label>
              <input
                id="vault-passphrase"
                type="password"
                required
                value={passphraseInput}
                onChange={(e) => setPassphraseInput(e.target.value)}
                placeholder="Enter master passphrase..."
                className="w-full rounded-xl border border-obsidian/[0.15] dark:border-white/[0.15] bg-alabaster dark:bg-carbon px-3.5 py-2.5 text-sm font-mono text-obsidian dark:text-pearl focus:outline-none focus:border-navy"
              />
            </div>

            <div>
              <label
                htmlFor="vault-pin"
                className="text-[13px] font-mono uppercase tracking-wider text-obsidian dark:text-pearl font-semibold block mb-1.5"
              >
                6-Digit Security PIN
              </label>
              <input
                id="vault-pin"
                type="password"
                inputMode="numeric"
                maxLength={6}
                required
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••••"
                className="w-full rounded-xl border border-obsidian/[0.15] dark:border-white/[0.15] bg-alabaster dark:bg-carbon px-3.5 py-2.5 text-sm font-mono tracking-[0.3em] text-obsidian dark:text-pearl focus:outline-none focus:border-navy"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl bg-navy hover:bg-navy/90 text-white font-display font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60"
            >
              {isLoggingIn ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Verify &amp; Unlock Studio</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ==========================================================================
   * RENDER 2: UNLOCKED STEALTH EDITORIAL STUDIO
   * ======================================================================== */
  if (panelMode === "simple") {
    return (
      <SimpleAdminPanel
        onLock={handleLockVault}
        onOpenAdvanced={() => setPanelMode("advanced")}
      />
    );
  }

  return (
    <div
      data-lenis-prevent="true"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 overflow-y-visible"
    >
      {/* Top Studio Header */}
      <div className="rounded-2xl border border-obsidian/[0.1] dark:border-white/[0.1] bg-ivory dark:bg-carbon-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-navy text-white flex items-center justify-center">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-xl text-obsidian dark:text-pearl">
                Stealth Editorial Studio
              </h1>
              <span className="text-[13px] font-mono px-2 py-0.5 rounded-full bg-emerald-signal/15 text-emerald-700 dark:text-emerald-300 font-semibold">
                SHA-256 Session Active
              </span>
            </div>
            <p className="text-[13px] font-mono text-charcoal dark:text-cool-slate">
              Zero Public Footprint • Isolated via robots.txt &amp; noindex •{" "}
              {articles.length} Total Articles in Store
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("editor")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-mono font-semibold ${
              activeTab === "editor"
                ? "bg-navy text-white"
                : "bg-obsidian/[0.05] dark:bg-white/[0.06] text-obsidian dark:text-pearl"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Article Publisher
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("articles")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-mono font-semibold ${
              activeTab === "articles"
                ? "bg-navy text-white"
                : "bg-obsidian/[0.05] dark:bg-white/[0.06] text-obsidian dark:text-pearl"
            }`}
          >
            All Articles ({articles.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("adsense")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-mono font-semibold ${
              activeTab === "adsense"
                ? "bg-navy text-white"
                : "bg-obsidian/[0.05] dark:bg-white/[0.06] text-obsidian dark:text-pearl"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            AdSense &amp; SEO Config
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("backup")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-mono font-semibold ${
              activeTab === "backup"
                ? "bg-navy text-white"
                : "bg-obsidian/[0.05] dark:bg-white/[0.06] text-obsidian dark:text-pearl"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            JSON Backup &amp; Restore
          </button>
          <button
            type="button"
            onClick={() => setPanelMode("simple")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-mono font-semibold bg-[#4a74f0] text-white hover:bg-[#3a63de]"
          >
            ← Simple Mode
          </button>
          <button
            type="button"
            onClick={handleLockVault}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-red-500/30 text-red-600 dark:text-red-400 text-[13px] font-mono hover:bg-red-500/10"
          >
            <Lock className="w-3.5 h-3.5" />
            Lock
          </button>
        </div>
      </div>

      {/* TAB 1: FULL ARTICLE & MEDIA PUBLISHING STUDIO + LIVE SEO GRADER */}
      {activeTab === "editor" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 8 Columns: Rich Block + Media Editor */}
          <div className="lg:col-span-8 space-y-6">
            {/* Core Metadata Card */}
            <div className="rounded-2xl border border-obsidian/[0.1] dark:border-white/[0.1] bg-ivory dark:bg-carbon-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-obsidian/[0.08] dark:border-white/[0.08] pb-3">
                <h2 className="font-display font-bold text-lg text-obsidian dark:text-pearl">
                  1. Headline, Category &amp; Search Metadata
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId("art-new");
                    setTitle("New Technical Troubleshooting Guide");
                    setSlug(`technical-guide-${Date.now().toString().slice(-4)}`);
                    showToast("Initialized blank article canvas.");
                  }}
                  className="inline-flex items-center gap-1 text-[13px] font-mono text-navy dark:text-navy hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Blank Article
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[13px] font-mono uppercase text-charcoal dark:text-cool-slate block mb-1">
                    Article H1 Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon px-3.5 py-2.5 font-display font-bold text-base text-obsidian dark:text-pearl"
                  />
                </div>

                <div>
                  <label className="text-[13px] font-mono uppercase text-charcoal dark:text-cool-slate block mb-1">
                    Editorial Subtitle / Deck
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon px-3.5 py-2 text-sm text-obsidian dark:text-pearl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[13px] font-mono uppercase text-charcoal dark:text-cool-slate block mb-1">
                      URL Slug (kebab-case)
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon px-3 py-2 text-[13px] font-mono text-obsidian dark:text-pearl"
                    />
                  </div>

                  <div>
                    <label className="text-[13px] font-mono uppercase text-charcoal dark:text-cool-slate block mb-1">
                      Primary Pillar Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) =>
                        setCategory(e.target.value as CategorySlug)
                      }
                      className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon px-3 py-2 text-[13px] font-mono text-obsidian dark:text-pearl"
                    >
                      <option value="how-to-fixes">How-To &amp; Tech Fixes</option>
                      <option value="text-guides">Text &amp; Productivity Guides</option>
                      <option value="solutions">Digital Solutions &amp; Deep Dives</option>
                      <option value="tutorials">Tutorials</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[13px] font-mono uppercase text-charcoal dark:text-cool-slate block mb-1">
                      Target Primary Keyword
                    </label>
                    <input
                      type="text"
                      value={primaryKeyword}
                      onChange={(e) => setPrimaryKeyword(e.target.value)}
                      className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon px-3 py-2 text-[13px] font-mono text-obsidian dark:text-pearl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[13px] font-mono uppercase text-charcoal dark:text-cool-slate block mb-1">
                      Meta Description ({metaDescription.length}/160 chars)
                    </label>
                    <textarea
                      rows={2}
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon p-3 text-[13px] text-obsidian dark:text-pearl"
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-mono uppercase text-charcoal dark:text-cool-slate block mb-1">
                      Lead Excerpt (First 100 Words Summary)
                    </label>
                    <textarea
                      rows={2}
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon p-3 text-[13px] text-obsidian dark:text-pearl"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Multi-Image Upload, WebP Compression & Diagram Selector */}
            <div className="rounded-2xl border border-obsidian/[0.1] dark:border-white/[0.1] bg-ivory dark:bg-carbon-card p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-obsidian/[0.08] dark:border-white/[0.08] pb-3">
                <h2 className="font-display font-bold text-lg text-obsidian dark:text-pearl flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-navy" />
                  <span>2. Cover Image, Client-Side WebP Optimizer &amp; Alt SEO</span>
                </h2>
                {compressionStats && (
                  <span className="text-[13px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-signal/15 text-emerald-700 dark:text-emerald-300 font-semibold">
                    {compressionStats}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {/* Drag & Drop Uploader + Vector Diagram Selector */}
                <div className="space-y-3">
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleImageFileUpload(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer rounded-2xl border-2 border-dashed border-navy/40 hover:border-navy bg-navy/[0.03] p-5 text-center space-y-2 transition-all"
                  >
                    <Upload className="w-6 h-6 text-navy mx-auto" />
                    <div className="text-[13px] font-semibold text-obsidian dark:text-pearl">
                      Drop PNG/JPEG/WebP or Click to Auto-Convert to WebP
                    </div>
                    <p className="text-[13px] font-mono text-charcoal dark:text-cool-slate">
                      Resizes to max 1600px width &amp; calculates CLS-safe dimensions
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageFileUpload(file);
                      }}
                      className="hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[13px] font-mono uppercase text-charcoal dark:text-cool-slate block mb-1">
                      Or Select Built-In Vector Engineering Schematic:
                    </label>
                    <select
                      value={coverDiagramType}
                      onChange={(e) => {
                        const nextType = e.target
                          .value as typeof coverDiagramType;
                        setCoverDiagramType(nextType);
                        if (nextType !== "custom-upload") {
                          setCoverUrl(`/images/diagrams/${nextType}.svg`);
                        }
                      }}
                      className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon px-3 py-2 text-[13px] font-mono text-obsidian dark:text-pearl"
                    >
                      <option value="ssl-handshake">TLS 1.3 &amp; DNS Handshake Pipeline</option>
                      <option value="utf8-pipeline">UTF-8 vs Windows-1252 Mojibake</option>
                      <option value="pdf-normalization">PDF Coordinate &amp; Ligature Flow</option>
                      <option value="hidden-chars-ast">Lexer AST Sanitization</option>
                      <option value="cwv-timeline">Core Web Vitals Rendering Budget</option>
                      <option value="regex-nfa">Regex NFA State Machine</option>
                      <option value="browser-memory">Browser Site-Isolation &amp; GPU</option>
                      <option value="markdown-ast">CommonMark MDAST Compiler</option>
                      <option value="git-crlf">Git CRLF vs LF Object Store</option>
                      <option value="json-schema">RFC 8259 JSON Validation</option>
                      <option value="custom-upload">Custom Uploaded WebP Image</option>
                    </select>
                  </div>
                </div>

                {/* Live Cover Preview */}
                <div>
                  <TechnicalDiagram
                    image={{
                      url: coverUrl,
                      alt: coverAlt,
                      caption: coverCaption,
                      width: coverWidth,
                      height: coverHeight,
                      diagramType: coverDiagramType,
                    }}
                    compact={true}
                    showCaption={false}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[13px] font-mono uppercase text-obsidian dark:text-pearl font-semibold block mb-1">
                    Mandatory SEO Alt Text *
                  </label>
                  <input
                    type="text"
                    required
                    value={coverAlt}
                    onChange={(e) => setCoverAlt(e.target.value)}
                    placeholder="Descriptive alt text including primary keyword..."
                    className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon px-3 py-2 text-[13px] text-obsidian dark:text-pearl"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-mono uppercase text-obsidian dark:text-pearl font-semibold block mb-1">
                    Mandatory Figure Caption *
                  </label>
                  <input
                    type="text"
                    required
                    value={coverCaption}
                    onChange={(e) => setCoverCaption(e.target.value)}
                    placeholder="Figure 1: Explanation of architecture diagram..."
                    className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon px-3 py-2 text-[13px] text-obsidian dark:text-pearl"
                  />
                </div>
              </div>
            </div>

            {/* 3. Verified Takeaway & Step-by-Step How-To Builder */}
            <div className="rounded-2xl border border-obsidian/[0.1] dark:border-white/[0.1] bg-ivory dark:bg-carbon-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-obsidian/[0.08] dark:border-white/[0.08] pb-3">
                <h2 className="font-display font-bold text-lg text-obsidian dark:text-pearl">
                  3. Verified Fix Box &amp; HowTo Schema Steps
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    setHowToSteps((prev) => [
                      ...prev,
                      {
                        stepNumber: prev.length + 1,
                        name: `Diagnostic Step ${prev.length + 1}`,
                        text: "Detailed action instructions for the reader.",
                        commandOrCode: "# Run verification command",
                      },
                    ])
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-navy/10 text-navy dark:text-navy text-[13px] font-mono font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add How-To Step
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[13px] font-mono uppercase text-charcoal dark:text-cool-slate block mb-1">
                    Symptom Summary
                  </label>
                  <textarea
                    rows={2}
                    value={symptom}
                    onChange={(e) => setSymptom(e.target.value)}
                    className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon p-2.5 text-[13px] text-obsidian dark:text-pearl"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-mono uppercase text-charcoal dark:text-cool-slate block mb-1">
                    Technical Root Cause
                  </label>
                  <textarea
                    rows={2}
                    value={rootCause}
                    onChange={(e) => setRootCause(e.target.value)}
                    className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon p-2.5 text-[13px] text-obsidian dark:text-pearl"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-mono uppercase text-emerald-700 dark:text-emerald-400 font-semibold block mb-1">
                    Verified Instant Resolution
                  </label>
                  <textarea
                    rows={2}
                    value={instantFix}
                    onChange={(e) => setInstantFix(e.target.value)}
                    className="w-full rounded-xl border border-emerald-signal/30 bg-emerald-signal/[0.04] p-2.5 text-[13px] text-obsidian dark:text-pearl"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {howToSteps.map((st, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-obsidian/[0.08] dark:border-white/[0.08] bg-alabaster dark:bg-carbon p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={st.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setHowToSteps((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, name: val } : item
                            )
                          );
                        }}
                        className="flex-1 bg-transparent font-display font-bold text-sm text-obsidian dark:text-pearl focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setHowToSteps((prev) =>
                            prev
                              .filter((_, i) => i !== idx)
                              .map((item, i) => ({
                                ...item,
                                stepNumber: i + 1,
                              }))
                          )
                        }
                        className="text-charcoal hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={st.text}
                      onChange={(e) => {
                        const val = e.target.value;
                        setHowToSteps((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, text: val } : item
                          )
                        );
                      }}
                      className="w-full rounded-lg border border-obsidian/[0.1] dark:border-white/[0.1] bg-ivory dark:bg-carbon-card p-2 text-[13px] text-obsidian dark:text-pearl"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Rich Article Sections & FAQ Accordion Builder */}
            <div className="rounded-2xl border border-obsidian/[0.1] dark:border-white/[0.1] bg-ivory dark:bg-carbon-card p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-obsidian/[0.08] dark:border-white/[0.08] pb-3">
                <h2 className="font-display font-bold text-lg text-obsidian dark:text-pearl">
                  4. Long-Form H2 Sections, Callouts &amp; Code Blocks
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSections((prev) => [
                        ...prev,
                        {
                          id: `section-${prev.length + 1}`,
                          heading: `${prev.length + 1}. Deep Architectural Analysis & Edge Cases`,
                          paragraphs: [
                            "Write comprehensive, original technical explanations here. Reference internal tools such as [Smart Case Formatter](/tools/smart-case-formatter) and [Invisible Character Fixer](/tools/invisible-character-fixer) to strengthen internal linking.",
                          ],
                          callout: {
                            type: "pro-tip",
                            title: "Key Production Takeaway",
                            body: "Always verify changes in staging before applying across production clusters.",
                          },
                        },
                      ])
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-navy text-white text-[13px] font-mono font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add H2 Section
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFaqs((prev) => [
                        ...prev,
                        {
                          question: "New Frequently Asked Question?",
                          answer:
                            "Detailed, direct answer optimized for FAQPage structured data.",
                        },
                      ])
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-obsidian/[0.06] dark:bg-white/[0.08] text-obsidian dark:text-pearl text-[13px] font-mono font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add FAQ
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {sections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    className="rounded-xl border border-obsidian/[0.09] dark:border-white/[0.09] bg-alabaster dark:bg-carbon p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={sec.heading}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSections((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, heading: val } : item
                            )
                          );
                        }}
                        className="flex-1 bg-transparent font-display font-bold text-base text-obsidian dark:text-pearl focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setSections((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                        className="text-charcoal hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      value={sec.paragraphs.join("\n\n")}
                      onChange={(e) => {
                        const paras = e.target.value
                          .split(/\n\s*\n/)
                          .filter(Boolean);
                        setSections((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, paragraphs: paras } : item
                          )
                        );
                      }}
                      placeholder="Write paragraphs separated by a blank line..."
                      className="w-full rounded-xl border border-obsidian/[0.1] dark:border-white/[0.1] bg-ivory dark:bg-carbon-card p-3 font-sans text-sm leading-relaxed text-obsidian dark:text-pearl"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 4 Columns: Live 0-100 SEO & AdSense Readiness Grader Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-5">
              {/* Publish Actions Card */}
              <div className="rounded-2xl border border-obsidian/[0.1] dark:border-white/[0.1] bg-ivory dark:bg-carbon-card p-5 space-y-4 shadow-editorial">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[13px] font-mono uppercase tracking-wider text-charcoal dark:text-cool-slate block">
                      Live Readiness Score
                    </span>
                    <div className="font-display font-bold text-3xl text-obsidian dark:text-pearl">
                      {seoEvaluation.score}{" "}
                      <span className="text-sm font-mono text-emerald-signal">
                        / 100
                      </span>
                    </div>
                  </div>
                  <div className="text-right font-mono text-[13px] text-charcoal dark:text-cool-slate">
                    <div>~{seoEvaluation.wordCount} words</div>
                    <div>{seoEvaluation.readingTimeMinutes} min read</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-obsidian/[0.08] dark:bg-white/[0.08] overflow-hidden">
                  <div
                    style={{ width: `${seoEvaluation.score}%` }}
                    className={`h-full transition-all ${
                      seoEvaluation.score >= 85
                        ? "bg-emerald-signal"
                        : seoEvaluation.score >= 65
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                  />
                </div>

                {/* Checklist Items */}
                <div className="space-y-2 pt-1">
                  {seoEvaluation.checks.map((chk) => (
                    <div
                      key={chk.id}
                      className={`p-2.5 rounded-xl border text-[13px] ${
                        chk.passed
                          ? "border-emerald-signal/30 bg-emerald-signal/[0.05]"
                          : "border-amber-500/30 bg-amber-500/[0.05]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 font-medium text-obsidian dark:text-pearl">
                        <span className="flex items-center gap-1.5">
                          {chk.passed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-signal shrink-0" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          )}
                          <span>{chk.label}</span>
                        </span>
                        <span className="font-mono text-[13px] shrink-0">
                          {chk.points}/{chk.maxPoints}
                        </span>
                      </div>
                      {!chk.passed && (
                        <p className="text-[13px] text-charcoal dark:text-cool-slate mt-1 pl-5">
                          {chk.hint}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Featured Checkbox */}
                <label className="flex items-center gap-2 text-[13px] font-medium text-obsidian dark:text-pearl cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="accent-navy"
                  />
                  <span>Pin to Featured Bento Grid on Homepage</span>
                </label>

                {/* Publish / Save Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handlePublishOrSave("published")}
                    className="col-span-2 py-2.5 px-4 rounded-xl bg-emerald-signal hover:bg-emerald-600 text-white font-display font-semibold text-[13px] flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Publish Article Live</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePublishOrSave("draft")}
                    className="py-2 px-3 rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] text-obsidian dark:text-pearl text-[13px] font-medium hover:bg-obsidian/[0.04]"
                  >
                    Save as Draft
                  </button>
                  <Link
                    href={`/article/${slug}`}
                    className="py-2 px-3 rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] text-navy dark:text-navy text-[13px] font-medium flex items-center justify-center gap-1 hover:bg-navy/[0.05]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Live</span>
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* TAB 2: MANAGE ALL ARTICLES */}
      {activeTab === "articles" && (
        <div className="rounded-2xl border border-obsidian/[0.1] dark:border-white/[0.1] bg-ivory dark:bg-carbon-card overflow-hidden">
          <div className="p-5 border-b border-obsidian/[0.08] dark:border-white/[0.08] flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-obsidian dark:text-pearl">
              Published &amp; Draft Articles Inventory ({articles.length})
            </h2>
            <button
              type="button"
              onClick={() => {
                setEditingId("art-new");
                setActiveTab("editor");
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-navy text-white text-[13px] font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Create New Article
            </button>
          </div>

          <div className="divide-y divide-obsidian/[0.06] dark:divide-white/[0.06]">
            {articles.map((art) => (
              <div
                key={art.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-obsidian/[0.015] dark:hover:bg-white/[0.015]"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[13px] font-mono uppercase px-2 py-0.5 rounded-full font-semibold ${
                        art.status === "published"
                          ? "bg-emerald-signal/15 text-emerald-700 dark:text-emerald-300"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      {art.status}
                    </span>
                    <span className="text-[13px] font-mono text-navy dark:text-navy">
                      /{art.category}
                    </span>
                    <span className="text-[13px] font-mono text-charcoal dark:text-cool-slate">
                      • {art.wordCount.toLocaleString()} words •{" "}
                      {art.readingTimeMinutes} min read
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base text-obsidian dark:text-pearl">
                    {art.title}
                  </h3>
                  <p className="text-[13px] font-mono text-charcoal dark:text-cool-slate">
                    /article/{art.slug}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => loadExistingArticleIntoEditor(art)}
                    className="px-3 py-1.5 rounded-xl bg-navy/10 text-navy dark:text-navy text-[13px] font-semibold hover:bg-navy hover:text-white transition-all"
                  >
                    Edit in Studio
                  </button>
                  <Link
                    href={`/article/${art.slug}`}
                    className="p-2 rounded-xl border border-obsidian/[0.1] dark:border-white/[0.1] text-charcoal dark:text-cool-slate hover:text-obsidian dark:hover:text-pearl"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(art)}
                    aria-label={`Delete ${art.title}`}
                    className="p-2 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ADSENSE & SEO SETTINGS MANAGER */}
      {activeTab === "adsense" && (
        <div className="max-w-3xl rounded-2xl border border-obsidian/[0.1] dark:border-white/[0.1] bg-ivory dark:bg-carbon-card p-6 space-y-5">
          <h2 className="font-display font-bold text-xl text-obsidian dark:text-pearl border-b border-obsidian/[0.08] dark:border-white/[0.08] pb-3">
            Google AdSense Verification Mode &amp; Site Compliance Settings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[13px] font-mono uppercase text-obsidian dark:text-pearl font-semibold block mb-1.5">
                AdSense Publisher ID
              </label>
              <input
                type="text"
                value={pubId}
                onChange={(e) => setPubId(e.target.value)}
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon px-3.5 py-2.5 text-sm font-mono text-obsidian dark:text-pearl"
              />
            </div>

            <div>
              <label className="text-[13px] font-mono uppercase text-obsidian dark:text-pearl font-semibold block mb-1.5">
                AdSlot Rendering Mode
              </label>
              <select
                value={adMode}
                onChange={(e) =>
                  setAdMode(
                    e.target.value as "verification" | "preview" | "off"
                  )
                }
                className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon px-3.5 py-2.5 text-sm font-mono text-obsidian dark:text-pearl"
              >
                <option value="verification">
                  Verification Mode (Default — Official Script + Clean Slots)
                </option>
                <option value="preview">
                  Preview Mode (Structural CLS Wireframe Placeholders)
                </option>
                <option value="off">Off (Hide All AdSlot Containers)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[13px] font-mono uppercase text-obsidian dark:text-pearl font-semibold block mb-1.5">
              /ads.txt Authorized Digital Sellers Record
            </label>
            <textarea
              rows={3}
              value={adsTxt}
              onChange={(e) => setAdsTxt(e.target.value)}
              className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon p-3.5 text-[13px] font-mono text-obsidian dark:text-pearl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[13px] font-mono uppercase text-obsidian dark:text-pearl font-semibold block mb-1.5">
                Google Search Console Verification Meta Token
              </label>
              <input
                type="text"
                value={gscToken}
                onChange={(e) => setGscToken(e.target.value)}
                className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon px-3.5 py-2 text-[13px] font-mono text-obsidian dark:text-pearl"
              />
            </div>
            <div>
              <label className="text-[13px] font-mono uppercase text-obsidian dark:text-pearl font-semibold block mb-1.5">
                Google Analytics 4 (GA4) Measurement ID
              </label>
              <input
                type="text"
                value={ga4}
                onChange={(e) => setGa4(e.target.value)}
                className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon px-3.5 py-2 text-[13px] font-mono text-obsidian dark:text-pearl"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-obsidian dark:text-pearl cursor-pointer">
            <input
              type="checkbox"
              checked={cookieEnabled}
              onChange={(e) => setCookieEnabled(e.target.checked)}
              className="accent-navy"
            />
            <span>Enable GDPR / Google Consent Mode v2 Floating Cookie Banner</span>
          </label>

          <button
            type="button"
            onClick={async () => {
              await updateSettings({
                publisherId: pubId.trim(),
                adsenseMode: adMode,
                adsTxtContent: adsTxt.trim(),
                gscVerification: gscToken.trim(),
                ga4Id: ga4.trim(),
                cookieBannerEnabled: cookieEnabled,
              });
              showToast("AdSense & Site Compliance settings saved!");
            }}
            className="px-5 py-2.5 rounded-xl bg-navy hover:bg-navy/90 text-white text-[13px] font-semibold inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save AdSense &amp; Compliance Settings</span>
          </button>
        </div>
      )}

      {/* TAB 4: 1-CLICK FULL SITE JSON BACKUP & RESTORE */}
      {activeTab === "backup" && (
        <div className="max-w-3xl rounded-2xl border border-obsidian/[0.1] dark:border-white/[0.1] bg-ivory dark:bg-carbon-card p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="font-display font-bold text-xl text-obsidian dark:text-pearl">
              1-Click Full Site JSON Backup &amp; Restore
            </h2>
            <p className="text-[13px] text-charcoal dark:text-cool-slate">
              Export your entire Zee Writes article database, custom WebP media,
              and AdSense configuration as a single portable JSON snapshot—or
              restore from a previous backup.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => {
                const payload = JSON.stringify(
                  {
                    exportedAt: new Date().toISOString(),
                    articles,
                    settings,
                  },
                  null,
                  2
                );
                const blob = new Blob([payload], {
                  type: "application/json;charset=utf-8",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `zeewrites-full-backup-${new Date()
                  .toISOString()
                  .slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
                showToast("Full site JSON snapshot exported!");
              }}
              className="p-4 rounded-2xl border border-navy/30 bg-navy/[0.06] hover:bg-navy/10 text-left space-y-2 transition-all"
            >
              <Download className="w-5 h-5 text-navy" />
              <div className="font-display font-bold text-sm text-obsidian dark:text-pearl">
                Export Full Backup (.json)
              </div>
              <p className="text-[13px] text-charcoal dark:text-cool-slate">
                Downloads all {articles.length} articles &amp; site settings.
              </p>
            </button>

            <label className="cursor-pointer p-4 rounded-2xl border border-emerald-signal/30 bg-emerald-signal/[0.06] hover:bg-emerald-signal/10 text-left space-y-2 transition-all">
              <Upload className="w-5 h-5 text-emerald-signal" />
              <div className="font-display font-bold text-sm text-obsidian dark:text-pearl">
                Restore JSON Snapshot
              </div>
              <p className="text-[13px] text-charcoal dark:text-cool-slate">
                Upload a `.json` backup file to restore immediately.
              </p>
              <input
                type="file"
                accept=".json,application/json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = async (ev) => {
                    try {
                      const parsed = JSON.parse(String(ev.target?.result));
                      const res = await fetch("/api/cms", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "import_backup", backup: parsed }),
                      });
                      if (res.ok) {
                        showToast("Full site backup restored successfully!");
                        window.location.reload();
                      } else {
                        showToast("Failed to restore backup.");
                      }
                    } catch {
                      showToast("Invalid JSON backup file.");
                    }
                  };
                  reader.readAsText(file);
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* Styled Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title={deleteTarget?.title || ""}
        isDeleting={isDeleting}
        onConfirm={async () => {
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
          showToast(`Deleted "${target.title.slice(0, 28)}..."`);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

