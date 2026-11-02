"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Copy,
  Check,
  ChevronDown,
  Terminal,
} from "lucide-react";
import { Article } from "@/types";
import { CATEGORIES } from "@/data/categories";
import { useSite } from "@/components/providers/SiteProvider";
import { TechnicalDiagram } from "@/components/ui/TechnicalDiagram";
import { AdSlot } from "@/components/ui/AdSlot";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { ZeeMark } from "@/components/ui/ZeeLogo";
import { VALID_TLDS, normalizeWebsiteHref } from "@/lib/autolink";

/**
 * Render text with inline markdown formatting:
 * - [link text](url) -> Next.js Link (internal) or <a> (external)
 * - bare URLs / website names (e.g. "zeewrites.blog", "resend.com", "github.com") -> <a> (external)
 * - `code` -> inline code badge
 * - **bold** -> strong tag
 * - *italic* -> em tag
 * - ==highlight== or <mark>highlight</mark> -> styled highlight badge
 */
function renderFormattedText(text: string): React.ReactNode {
  if (!text) return null;

  const pattern = new RegExp(
    `\\[([^\\]]+)\\]\\(([^)]+)\\)|` +
      "`([^`]+)`|" +
      `\\*\\*([^*]+)\\*\\*|` +
      `\\*([^*]+)\\*|` +
      `==([^=]+)==|<mark>([^<]+)<\\/mark>|` +
      `(https?:\\/\\/[^\\s<>()]+[^\\s<>()\\.,;:?!'\"\\]\\[]|` +
      `\\bwww\\.[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)+(?:\\/[^\\s<>()\\.,;:?!'\"\\]\\[]*)?|` +
      `(?<![@\\/\\w])(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+(?:${VALID_TLDS})\\b(?:\\/[^\\s<>()\\.,;:?!'\"\\]\\[]*)?)`,
    "g"
  );
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIndex = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const [
      ,
      linkText,
      linkUrl,
      codeText,
      boldText,
      italicText,
      highlight1,
      highlight2,
      bareUrl,
    ] = match;
    const highlightText = highlight1 || highlight2;

    if (linkText && linkUrl) {
      const isInternal = linkUrl.startsWith("/") || linkUrl.startsWith("#");
      const safeUrl = /^(https?:\/\/|\/|#|mailto:)/i.test(linkUrl)
        ? linkUrl
        : `https://${linkUrl}`;
      if (isInternal) {
        nodes.push(
          <Link
            key={`l-${keyIndex++}`}
            href={safeUrl}
            className="text-navy font-semibold underline underline-offset-2 hover:text-[#3a63de] transition-colors"
          >
            {linkText}
          </Link>
        );
      } else {
        nodes.push(
          <a
            key={`a-${keyIndex++}`}
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-navy font-semibold underline underline-offset-2 hover:text-[#3a63de] transition-colors inline-flex items-center gap-0.5"
          >
            <span>{linkText}</span>
          </a>
        );
      }
    } else if (bareUrl) {
      const safeUrl = normalizeWebsiteHref(bareUrl);
      nodes.push(
        <a
          key={`u-${keyIndex++}`}
          href={safeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-navy font-semibold underline underline-offset-2 hover:text-[#3a63de] transition-colors inline-flex items-center gap-0.5"
        >
          <span>{bareUrl}</span>
        </a>
      );
    } else if (codeText) {
      nodes.push(
        <code
          key={`c-${keyIndex++}`}
          className="px-1.5 py-0.5 rounded-[6px] bg-badge-bg font-mono text-[14px] text-badge-text border border-hairline/60"
        >
          {codeText}
        </code>
      );
    } else if (boldText) {
      nodes.push(
        <strong key={`b-${keyIndex++}`} className="font-bold text-ink">
          {boldText}
        </strong>
      );
    } else if (italicText) {
      nodes.push(<em key={`i-${keyIndex++}`}>{italicText}</em>);
    } else if (highlightText) {
      nodes.push(
        <mark
          key={`m-${keyIndex++}`}
          className="px-1.5 py-0.5 rounded-[5px] bg-[#fef08a] dark:bg-[#ca8a04]/30 text-ink font-semibold border border-[#fde047] dark:border-[#ca8a04]/40"
        >
          {highlightText}
        </mark>
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length === 1 && typeof nodes[0] === "string" ? nodes[0] : <>{nodes}</>;
}

/**
 * Render structured content blocks inside articles:
 * - Markdown tables (| ... |) -> responsive scrollable table
 * - Bullet lists (- item) -> <ul>
 * - Numbered lists (1. item) -> <ol>
 * - Blockquotes (> quote) -> <blockquote>
 * - Paragraphs -> <p>
 */
function renderContentBlock(text: string, keyPrefix: string): React.ReactNode {
  if (!text) return null;
  const trimmed = text.trim();

  // 1. Table
  if (trimmed.startsWith("|") && trimmed.includes("\n|")) {
    const lines = trimmed.split("\n").filter((l) => l.trim().startsWith("|"));
    if (lines.length >= 2) {
      const parseCells = (line: string) =>
        line
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((c) => c.trim());
      const headers = parseCells(lines[0]);
      const startRow = lines[1].includes("---") ? 2 : 1;
      const rows = lines.slice(startRow).map(parseCells);

      return (
        <div key={keyPrefix} className="overflow-x-auto rounded-[18px] bg-surface shadow-2 border border-hairline my-4">
          <table className="w-full text-left border-collapse text-[15px]">
            <thead>
              <tr className="border-b border-hairline bg-badge-bg">
                {headers.map((h, i) => (
                  <th key={i} className="py-3 px-4 text-[14px] font-semibold text-ink">
                    {renderFormattedText(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-page transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="py-3 px-4 text-[15px] text-secondary">
                      {renderFormattedText(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }

  // 2. Bullet list
  if (/^[-*•–✔✓]\s+/.test(trimmed)) {
    const items = trimmed.split("\n").filter((l) => /^[-*•–✔✓]\s+/.test(l.trim()));
    if (items.length > 0) {
      return (
        <ul key={keyPrefix} className="space-y-2 my-4 pl-5 list-disc text-secondary text-[18px] leading-[1.75]">
          {items.map((it, i) => (
            <li key={i}>{renderFormattedText(it.trim().replace(/^[-*•–✔✓]\s+/, ""))}</li>
          ))}
        </ul>
      );
    }
  }

  // 3. Numbered list
  if (/^\d+[\.\)]\s+/.test(trimmed)) {
    const items = trimmed.split("\n").filter((l) => /^\d+[\.\)]\s+/.test(l.trim()));
    if (items.length > 0) {
      return (
        <ol key={keyPrefix} className="space-y-2 my-4 pl-5 list-decimal text-secondary text-[18px] leading-[1.75]">
          {items.map((it, i) => (
            <li key={i}>{renderFormattedText(it.trim().replace(/^\d+[\.\)]\s+/, ""))}</li>
          ))}
        </ol>
      );
    }
  }

  // 4. Blockquote
  if (trimmed.startsWith(">")) {
    const cleanQuote = trimmed.replace(/^>\s*/gm, "").trim();
    return (
      <blockquote
        key={keyPrefix}
        className="my-4 pl-4 border-l-4 border-navy/40 dark:border-accent/40 italic text-secondary text-[18px] leading-[1.75]"
      >
        {renderFormattedText(cleanQuote)}
      </blockquote>
    );
  }

  // Default Paragraph
  return (
    <p key={keyPrefix} className="font-sans text-[18px] leading-[1.75] text-secondary">
      {renderFormattedText(text)}
    </p>
  );
}

/**
 * Render structured step body text:
 * - Parses double newlines (\n\n) into separated, disciplined paragraphs with vertical margin
 * - Preserves soft single line breaks (\n) using whitespace-pre-line
 * - Automatically detects and styles bullet lists (- item, * item, • item)
 * - Automatically detects and styles numbered sub-lists (1. item, 2. item)
 * - Keeps inline markdown: bold, italic, code, links, highlights
 */
function renderStepBody(rawText: string, stepKey: string): React.ReactNode {
  if (!rawText) return null;

  // Split by double newlines into independent blocks/paragraphs
  const blocks = rawText
    .split(/\r?\n\s*\r?\n/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  if (blocks.length === 0) return null;

  return (
    <div className="space-y-3.5 text-secondary">
      {blocks.map((block, bIdx) => {
        const blockKey = `${stepKey}-b${bIdx}`;
        const lines = block
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => l.length > 0);

        // Check if block contains list items
        const hasBullets = lines.some((l) => /^[-*•–✔✓]\s+/.test(l));
        const hasNumbered = lines.some((l) => /^\d+[\.\)]\s+/.test(l));

        if (hasBullets && !hasNumbered) {
          const introLines: string[] = [];
          const bulletLines: string[] = [];
          let reachedBullets = false;

          for (const line of lines) {
            if (/^[-*•–✔✓]\s+/.test(line)) {
              reachedBullets = true;
              bulletLines.push(line.replace(/^[-*•–✔✓]\s+/, ""));
            } else if (!reachedBullets) {
              introLines.push(line);
            } else {
              bulletLines.push(line);
            }
          }

          return (
            <div key={blockKey} className="space-y-2.5">
              {introLines.length > 0 && (
                <p className="font-sans text-[17px] sm:text-[18px] leading-[1.8] text-secondary whitespace-pre-line">
                  {renderFormattedText(introLines.join("\n"))}
                </p>
              )}
              <ul className="space-y-2 pl-2">
                {bulletLines.map((bText, bIdx2) => (
                  <li
                    key={bIdx2}
                    className="flex items-start gap-2.5 text-[16px] sm:text-[17.5px] leading-[1.7] text-secondary"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-navy/80 dark:bg-accent shrink-0 mt-2.5" />
                    <span className="flex-1 whitespace-pre-line">
                      {renderFormattedText(bText)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        if (hasNumbered && !hasBullets) {
          const introLines: string[] = [];
          const numberedLines: { num: string; text: string }[] = [];
          let reachedNumbered = false;

          for (const line of lines) {
            const numMatch = line.match(/^(\d+)[\.\)]\s+(.*)$/);
            if (numMatch) {
              reachedNumbered = true;
              numberedLines.push({ num: numMatch[1], text: numMatch[2] });
            } else if (!reachedNumbered) {
              introLines.push(line);
            } else {
              numberedLines.push({ num: `${numberedLines.length + 1}`, text: line });
            }
          }

          return (
            <div key={blockKey} className="space-y-2.5">
              {introLines.length > 0 && (
                <p className="font-sans text-[17px] sm:text-[18px] leading-[1.8] text-secondary whitespace-pre-line">
                  {renderFormattedText(introLines.join("\n"))}
                </p>
              )}
              <ol className="space-y-2 pl-2">
                {numberedLines.map((nItem, nIdx) => (
                  <li
                    key={nIdx}
                    className="flex items-start gap-2.5 text-[16px] sm:text-[17.5px] leading-[1.7] text-secondary"
                  >
                    <span className="font-mono text-[13px] font-semibold text-navy dark:text-accent shrink-0 mt-1 min-w-[1.2rem]">
                      {nItem.num}.
                    </span>
                    <span className="flex-1 whitespace-pre-line">
                      {renderFormattedText(nItem.text)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          );
        }

        // Standard paragraph block (supports single enter breaks via whitespace-pre-line)
        return (
          <p
            key={blockKey}
            className="font-sans text-[17px] sm:text-[18px] leading-[1.8] text-secondary whitespace-pre-line"
          >
            {renderFormattedText(block)}
          </p>
        );
      })}
    </div>
  );
}

interface ArticleReaderViewProps {
  initialArticle: Article;
  slug: string;
}

export function ArticleReaderView({
  initialArticle,
  slug,
}: ArticleReaderViewProps) {
  const { articles, scrollToElement, showToast } = useSite();

  const article = useMemo(() => {
    const target = slug.toLowerCase().trim();
    return (
      articles.find(
        (a) =>
          a.slug.toLowerCase().trim() === target ||
          a.id === initialArticle.id ||
          a.slug === slug
      ) || initialArticle
    );
  }, [articles, slug, initialArticle]);

  const category = CATEGORIES[article.category];
  const readingTimeMinutes = Math.max(1, Math.ceil(article.wordCount / 200));

  const [activeHeadingId, setActiveHeadingId] =
    useState<string>("summary-takeaway");
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const tocItems = useMemo(() => {
    const items: { id: string; label: string }[] = [];
    const t = article.verifiedTakeaway;
    if (t?.symptom || t?.rootCause || t?.instantFix) {
      items.push({ id: "summary-takeaway", label: "Summary & Key Takeaway" });
    }
    if (article.howToSteps && article.howToSteps.length > 0) {
      items.push({ id: "step-by-step-runbook", label: "Step-by-Step Steps" });
    }
    (article.sections || []).forEach((sec) => {
      items.push({ id: sec.id, label: sec.heading });
    });
    if (article.faqs && article.faqs.length > 0) {
      items.push({ id: "article-faq", label: "Frequently Asked Questions" });
    }
    return items;
  }, [article]);

  useEffect(() => {
    const ids = tocItems.map((t) => t.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          setActiveHeadingId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-100px 0px -65% 0px",
        threshold: 0.1,
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [tocItems]);

  const relatedArticles = useMemo(() => {
    const published = articles.filter(
      (a) => a.status === "published" && a.slug !== article.slug
    );
    const byExplicitRelated = published.filter((a) =>
      article.relatedSlugs?.includes(a.slug)
    );
    if (byExplicitRelated.length >= 3) return byExplicitRelated.slice(0, 3);
    const bySameCategory = published.filter(
      (a) =>
        a.category === article.category &&
        !byExplicitRelated.some((r) => r.slug === a.slug)
    );
    return [...byExplicitRelated, ...bySameCategory, ...published].slice(0, 3);
  }, [articles, article]);

  const copyCommand = (
    code: string,
    key: string,
    label = "Code copied to clipboard"
  ) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    showToast(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          href={`/category/${article.category}`}
          className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-full bg-surface text-secondary hover:text-ink border border-hairline shadow-secondary text-[14px] font-medium transition-all"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          <span>Back to {category?.shortName || "Guides"}</span>
        </Link>
      </div>

      {/* Article Header */}
      <header className="max-w-[840px] space-y-5 mb-10">
        {/* Category Pill & Meta Row */}
        <div className="flex flex-wrap items-center gap-3 text-[14px]">
          <Link
            href={`/category/${article.category}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-badge-bg text-badge-text text-[13px] font-medium"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-badge-dot" />
            <span>{category?.name || "Guide"}</span>
          </Link>

          <span className="inline-flex items-center gap-1.5 text-muted">
            <Clock className="w-4 h-4" strokeWidth={1.5} />
            <span>{readingTimeMinutes} min read</span>
          </span>

          <span className="text-muted">&middot;</span>

          <time dateTime={article.publishedAt} className="text-muted">
            {formattedDate}
          </time>

          <span className="text-muted">&middot;</span>

          <Link
            href="/about"
            className="text-navy font-medium hover:underline"
          >
            By Zee
          </Link>
        </div>

        {/* H1 (clamp 32 to 48px) */}
        <h1 className="font-sans font-medium text-[clamp(32px,4.5vw,48px)] text-ink tracking-[-0.02em] leading-[1.12]">
          {article.title}
        </h1>

        <p className="text-[18px] text-secondary leading-[1.6] max-w-[68ch]">
          {article.subtitle}
        </p>
      </header>

      {/* Main 12-Column Reading Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left/Center 8-Column Article Body */}
        <article className="lg:col-span-8 space-y-10 min-w-0">
          {/* Wide Inset Vignette Panel as Cover */}
          <div className="rounded-[24px] bg-surface border border-hairline shadow-2 p-3 sm:p-4">
            <TechnicalDiagram
              image={article.coverImage}
              priority={true}
              showCaption={false}
            />
          </div>

          {/* Summary & Key Takeaway Card */}
          {(article.verifiedTakeaway?.symptom ||
            article.verifiedTakeaway?.rootCause ||
            article.verifiedTakeaway?.instantFix) && (
          <section
            id="summary-takeaway"
            aria-label="Summary and Key Takeaway"
            className="rounded-[24px] bg-surface border border-hairline shadow-2 p-6 sm:p-8 space-y-5 max-w-[68ch]"
          >
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-hairline">
              <h2 className="font-sans font-semibold text-[20px] text-ink">
                Summary &amp; Key Takeaway
              </h2>
            </div>

            <div className="space-y-4 text-[16px] leading-[1.6]">
              {article.verifiedTakeaway?.symptom && (
              <div>
                <span className="text-[14px] text-muted font-medium block">
                  Problem
                </span>
                <p className="text-ink mt-0.5">
                  {renderFormattedText(article.verifiedTakeaway.symptom)}
                </p>
              </div>
              )}
              {article.verifiedTakeaway?.rootCause && (
              <div>
                <span className="text-[14px] text-muted font-medium block">
                  Cause
                </span>
                <p className="text-ink mt-0.5">
                  {renderFormattedText(article.verifiedTakeaway.rootCause)}
                </p>
              </div>
              )}
              {article.verifiedTakeaway?.instantFix && (
              <div className="p-4 rounded-[18px] bg-badge-bg border border-hairline">
                <span className="text-[14px] text-badge-text font-semibold block">
                  Quick Fix
                </span>
                <p className="text-ink font-medium mt-0.5">
                  {renderFormattedText(article.verifiedTakeaway.instantFix)}
                </p>
              </div>
              )}
            </div>
          </section>
          )}

          {/* Step-by-Step How-To Steps */}
          {article.howToSteps && article.howToSteps.length > 0 && (
            <section
              id="step-by-step-runbook"
              className="space-y-6 pt-4 max-w-[68ch]"
            >
              <div className="space-y-2 border-b border-hairline/80 pb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-badge-bg border border-hairline text-xs font-mono font-medium text-muted uppercase tracking-wider">
                  <span>Actionable Runbook</span>
                  <span className="h-1 w-1 rounded-full bg-muted/60" />
                  <span>{article.howToSteps.length} {article.howToSteps.length === 1 ? "Step" : "Steps"}</span>
                </div>
                <h2 className="font-sans font-bold text-[clamp(26px,3.5vw,36px)] leading-[1.15] tracking-[-0.025em] text-ink">
                  Step-by-Step Instructions
                </h2>
              </div>

              <div className="space-y-5">
                {article.howToSteps.map((step) => {
                  const stepCopyKey = `step-${step.stepNumber}`;
                  return (
                    <div
                      key={step.stepNumber}
                      id={`step-${step.stepNumber}`}
                      className="rounded-[22px] bg-surface border border-hairline shadow-2 overflow-hidden transition-all duration-200 hover:border-hairline/90"
                    >
                      {/* Step Header */}
                      <div className="px-6 py-5 border-b border-hairline bg-page/50 flex items-start gap-4">
                        <div className="h-9 w-9 rounded-xl bg-ink text-white dark:bg-white dark:text-ink font-mono text-[15px] font-bold flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                          {step.stepNumber}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11.5px] font-mono uppercase tracking-wider text-muted font-semibold mb-1">
                            Step {step.stepNumber} of {article.howToSteps.length}
                          </div>
                          <h3 className="font-sans font-bold text-[20px] sm:text-[22px] leading-[1.3] text-ink tracking-[-0.015em]">
                            {step.name}
                          </h3>
                        </div>
                      </div>

                      {/* Step Body */}
                      <div className="p-6 sm:p-7 space-y-4">
                        {/* Disciplined Step Text with Spaced Paragraphs and List Support */}
                        {renderStepBody(step.text, `step-${step.stepNumber}`)}

                        {/* Step Command Box */}
                        {step.commandOrCode && (
                          <div className="rounded-[16px] bg-[#f1f5fe] dark:bg-[#0d152c] border border-hairline overflow-hidden mt-4">
                            <div className="px-4 py-2.5 border-b border-hairline flex items-center justify-between text-[13px] text-muted bg-surface/50">
                              <div className="flex items-center gap-2 font-mono font-medium text-ink">
                                <Terminal className="w-3.5 h-3.5 text-navy dark:text-accent" />
                                <span>Command / Execution</span>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  copyCommand(
                                    step.commandOrCode!,
                                    stepCopyKey,
                                    `Step ${step.stepNumber} command copied`
                                  )
                                }
                                className="inline-flex items-center gap-1.5 px-3 min-h-[32px] rounded-lg bg-surface text-ink border border-hairline text-[12.5px] font-medium hover:text-navy transition-colors duration-micro cursor-pointer shadow-xs"
                              >
                                {copiedKey === stepCopyKey ? (
                                  <>
                                    <Check
                                      className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"
                                      strokeWidth={2}
                                    />
                                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                      Copied
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Copy
                                      className="w-3.5 h-3.5"
                                      strokeWidth={1.5}
                                    />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="p-4 font-mono text-[13.5px] sm:text-[14px] leading-[1.65] overflow-x-auto text-ink whitespace-pre-wrap break-all sm:break-normal">
                              <code>{step.commandOrCode}</code>
                            </pre>
                          </div>
                        )}

                        {/* Step Pro Tip */}
                        {step.proTip && (
                          <div className="rounded-[14px] bg-badge-bg/90 border-l-4 border-navy dark:border-accent p-4 text-[15px] sm:text-[15.5px] text-secondary leading-[1.65] mt-4">
                            <strong className="font-semibold text-navy dark:text-accent font-mono text-xs uppercase tracking-wider block mb-1">
                              Pro Tip
                            </strong>
                            <div className="whitespace-pre-line">
                              {renderFormattedText(step.proTip)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Deep Long-Form Editorial Sections (68ch reading column) */}
          {article.sections.map((section, secIndex) => {
            const codeKey = `sec-${section.id}`;
            return (
              <section
                key={section.id}
                id={section.id}
                className="space-y-5 pt-4 max-w-[68ch]"
              >
                <h2 className="font-sans font-bold text-[clamp(26px,3.5vw,36px)] text-ink tracking-[-0.025em] leading-[1.15] pt-3">
                  {section.heading}
                </h2>

                {section.items && section.items.length > 0 ? (
                  section.items.map((item, itemIdx) => {
                    if (item.type === "paragraph") {
                      return renderContentBlock(item.text, `item-${secIndex}-${itemIdx}`);
                    }
                    if (item.type === "code") {
                      const itemCodeKey = `${codeKey}-${itemIdx}`;
                      return (
                        <div
                          key={itemIdx}
                          className="rounded-[18px] bg-[#f1f5fe] dark:bg-[#0d152c] border border-hairline overflow-hidden"
                        >
                          <div className="px-4 py-2.5 border-b border-hairline flex items-center justify-between text-[13px] text-muted">
                            <span className="font-medium">
                              {item.filename || item.language || "code"}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                copyCommand(
                                  item.code,
                                  itemCodeKey,
                                  "Code snippet copied to clipboard"
                                )
                              }
                              className="inline-flex items-center gap-1.5 px-3 min-h-[34px] rounded-full bg-surface text-ink border border-hairline text-[13px] font-medium hover:text-navy transition-colors duration-micro"
                            >
                              {copiedKey === itemCodeKey ? (
                                <>
                                  <Check
                                    className="w-3.5 h-3.5 text-navy"
                                    strokeWidth={1.5}
                                  />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy
                                    className="w-3.5 h-3.5"
                                    strokeWidth={1.5}
                                  />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-4 sm:p-5 font-mono text-[14px] leading-[1.65] overflow-x-auto text-ink">
                            <code>{item.code}</code>
                          </pre>
                        </div>
                      );
                    }
                    if (item.type === "callout") {
                      const isHighlight = /takeaway|highlight|tl;?dr|remember|important|key point|core concept/i.test(item.title);
                      return (
                        <aside
                          key={itemIdx}
                          role="note"
                          className={`rounded-[18px] p-5 space-y-1.5 ${
                            isHighlight
                              ? "bg-[#fef9c3]/40 dark:bg-[#ca8a04]/15 border-2 border-[#facc15]/80 dark:border-[#ca8a04]/50 shadow-sm"
                              : "bg-badge-bg border border-hairline"
                          }`}
                        >
                          <div className={`font-sans font-bold text-[16px] ${isHighlight ? "text-amber-800 dark:text-amber-300 flex items-center gap-2" : "text-navy"}`}>
                            {isHighlight && <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                            {item.title}
                          </div>
                          <p className="text-[16px] text-ink leading-[1.65]">
                            {renderFormattedText(item.body)}
                          </p>
                        </aside>
                      );
                    }
                    if (item.type === "subheading") {
                      return (
                        <h3
                          key={itemIdx}
                          className="font-sans font-bold text-[clamp(20px,2.5vw,26px)] text-ink tracking-[-0.015em] leading-[1.25] pt-2"
                        >
                          {item.title}
                        </h3>
                      );
                    }
                    return null;
                  })
                ) : (
                  <>
                    {section.paragraphs.map((p, pIdx) =>
                      renderContentBlock(p, `sec-${secIndex}-p-${pIdx}`)
                    )}

                    {section.inlineImage && (
                      <div className="rounded-[24px] bg-surface border border-hairline shadow-2 p-3">
                        <TechnicalDiagram
                          image={section.inlineImage}
                          priority={false}
                          showCaption={false}
                        />
                      </div>
                    )}

                    {section.callout && (() => {
                      const isHighlight = /takeaway|highlight|tl;?dr|remember|important|key point|core concept/i.test(section.callout.title);
                      return (
                        <aside
                          role="note"
                          className={`rounded-[18px] p-5 space-y-1.5 ${
                            isHighlight
                              ? "bg-[#fef9c3]/40 dark:bg-[#ca8a04]/15 border-2 border-[#facc15]/80 dark:border-[#ca8a04]/50 shadow-sm"
                              : "bg-badge-bg border border-hairline"
                          }`}
                        >
                          <div className={`font-sans font-bold text-[16px] ${isHighlight ? "text-amber-800 dark:text-amber-300 flex items-center gap-2" : "text-navy"}`}>
                            {isHighlight && <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                            {section.callout.title}
                          </div>
                          <p className="text-[16px] text-ink leading-[1.65]">
                            {renderFormattedText(section.callout.body)}
                          </p>
                        </aside>
                      );
                    })()}

                    {section.codeBlock && (
                      <div className="rounded-[18px] bg-[#f1f5fe] dark:bg-[#0d152c] border border-hairline overflow-hidden">
                        <div className="px-4 py-2.5 border-b border-hairline flex items-center justify-between text-[13px] text-muted">
                          <span className="font-medium">
                            {section.codeBlock.filename ||
                              section.codeBlock.language}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              copyCommand(
                                section.codeBlock!.code,
                                codeKey,
                                "Code snippet copied to clipboard"
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 min-h-[34px] rounded-full bg-surface text-ink border border-hairline text-[13px] font-medium hover:text-navy transition-colors duration-micro"
                          >
                            {copiedKey === codeKey ? (
                              <>
                                <Check
                                  className="w-3.5 h-3.5 text-navy"
                                  strokeWidth={1.5}
                                />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy
                                  className="w-3.5 h-3.5"
                                  strokeWidth={1.5}
                                />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-4 sm:p-5 font-mono text-[14px] leading-[1.65] overflow-x-auto text-ink">
                          <code>{section.codeBlock.code}</code>
                        </pre>
                      </div>
                    )}

                    {section.subheadings &&
                      section.subheadings.map((sub, sIdx) => (
                        <div key={sub.id || sIdx} className="space-y-4 pt-3">
                          <h3 className="font-sans font-medium text-[clamp(20px,2.4vw,26px)] text-ink tracking-[-0.015em] leading-[1.25]">
                            {sub.title}
                          </h3>
                          {sub.paragraphs.map((p, pIdx) => (
                            <p
                              key={pIdx}
                              className="font-sans text-[18px] leading-[1.75] text-secondary"
                            >
                              {renderFormattedText(p)}
                            </p>
                          ))}
                          {sub.codeBlock && (
                            <div className="rounded-[18px] bg-[#f1f5fe] dark:bg-[#0d152c] border border-hairline overflow-hidden">
                              <div className="px-4 py-2.5 border-b border-hairline flex items-center justify-between text-[13px] text-muted">
                                <span className="font-medium">
                                  {sub.codeBlock.filename ||
                                    sub.codeBlock.language}
                                </span>
                              </div>
                              <pre className="p-4 sm:p-5 font-mono text-[14px] leading-[1.65] overflow-x-auto text-ink">
                                <code>{sub.codeBlock.code}</code>
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                  </>
                )}

                {section.inlineImage && section.items && (
                  <div className="rounded-[24px] bg-surface border border-hairline shadow-2 p-3">
                    <TechnicalDiagram
                      image={section.inlineImage}
                      priority={false}
                      showCaption={false}
                    />
                  </div>
                )}

                {section.table && (
                  <div className="pt-2 space-y-2">
                    <div className="text-[14px] font-semibold text-secondary">
                      {section.table.caption}
                    </div>
                    <div className="overflow-x-auto rounded-[18px] bg-surface shadow-2 border border-hairline">
                      <table className="w-full text-left border-collapse text-[15px]">
                        <thead>
                          <tr className="border-b border-hairline bg-badge-bg">
                            {section.table.headers.map((header) => (
                              <th
                                key={header}
                                className="py-3.5 px-4 text-[14px] text-ink font-semibold"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-hairline">
                          {section.table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-page">
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className={`py-3.5 px-4 ${
                                    cIdx === 0
                                      ? "font-mono text-[13px] font-medium text-navy"
                                      : "text-[15px] text-secondary"
                                  }`}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {secIndex === 0 && (
                  <AdSlot
                    id={`article-mid-${article.id}`}
                    format="in-article"
                  />
                )}
              </section>
            );
          })}

          {/* FAQ Accordion Section */}
          {article.faqs && article.faqs.length > 0 && (
            <section
              id="article-faq"
              className="space-y-4 pt-6 border-t border-hairline max-w-[68ch]"
            >
              <h2 className="font-sans font-medium text-[clamp(24px,3.2vw,34px)] text-ink tracking-[-0.02em]">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {article.faqs.map((faq, idx) => {
                  const isOpen = openFaqIdx === idx;
                  return (
                    <div
                      key={faq.question}
                      className="rounded-[18px] bg-surface shadow-1 border border-hairline overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                        aria-expanded={isOpen}
                        className="w-full px-5 py-4 min-h-[48px] text-left flex items-center justify-between gap-4 font-sans font-semibold text-[16px] text-ink hover:text-navy transition-colors duration-micro"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown
                          className={`w-4 h-4 shrink-0 transition-transform duration-hover ease-out-expo ${
                            isOpen ? "rotate-180 text-navy" : "text-muted"
                          }`}
                          strokeWidth={1.5}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-[16px] text-secondary leading-[1.65] border-t border-hairline">
                          {renderFormattedText(faq.answer)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </article>

        {/* Right 4-Column Sticky Sidebar: Table of Contents + Contact Card */}
        <aside className="lg:col-span-4">
          <div className="sticky top-6 space-y-6">
            <nav
              aria-label="Table of Contents"
              className="rounded-[24px] bg-surface border border-hairline shadow-2 p-6 space-y-3"
            >
              <div className="text-[15px] font-semibold text-ink">
                On this page
              </div>
              <ul className="space-y-1 text-[14px]">
                {tocItems.map((item) => {
                  const isActive = activeHeadingId === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => scrollToElement(item.id)}
                        className={`w-full text-left px-3.5 py-2 min-h-[40px] rounded-[12px] transition-colors duration-micro flex items-center gap-2 ${
                          isActive
                            ? "bg-badge-bg text-badge-text font-medium"
                            : "text-secondary hover:text-ink hover:bg-page"
                        }`}
                      >
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-badge-dot shrink-0" />
                        )}
                        <span className="line-clamp-1">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="rounded-[24px] bg-surface border border-hairline shadow-2 p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-[10px] bg-surface border border-hairline shadow-1 flex items-center justify-center shrink-0">
                  <ZeeMark size={22} />
                </div>
                <h3 className="font-sans font-semibold text-[16px] text-ink leading-tight">
                  Questions or Corrections?
                </h3>
              </div>
              <p className="text-[14px] text-secondary leading-[1.6]">
                Spotted something that needs an update or have a question about
                these steps?
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-navy hover:underline pt-1"
              >
                <span>Send Zee a message</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Related Guides Grid */}
      {relatedArticles.length > 0 && (
        <section
          aria-labelledby="related-guides-heading"
          className="mt-16 pt-12 border-t border-hairline space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2
              id="related-guides-heading"
              className="font-sans font-medium text-[clamp(24px,3.5vw,36px)] text-ink tracking-[-0.02em]"
            >
              Related Guides
            </h2>
            <Link
              href={`/category/${article.category}`}
              className="inline-flex items-center gap-1.5 min-h-[44px] text-[15px] font-semibold text-navy hover:underline"
            >
              <span>View All in {category?.shortName}</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedArticles.map((rel) => (
              <ArticleCard key={rel.id} article={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
