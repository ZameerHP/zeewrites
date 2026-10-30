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
} from "lucide-react";
import { Article } from "@/types";
import { CATEGORIES } from "@/data/categories";
import { useSite } from "@/components/providers/SiteProvider";
import { TechnicalDiagram } from "@/components/ui/TechnicalDiagram";
import { AdSlot } from "@/components/ui/AdSlot";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { ZeeMark } from "@/components/ui/ZeeLogo";

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
    if (t.symptom || t.rootCause || t.instantFix) {
      items.push({ id: "summary-takeaway", label: "Summary & Key Takeaway" });
    }
    if (article.howToSteps && article.howToSteps.length > 0) {
      items.push({ id: "step-by-step-runbook", label: "Step-by-Step Steps" });
    }
    article.sections.forEach((sec) => {
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

  const formattedDate = new Date(article.publishedAt).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

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
          {(article.verifiedTakeaway.symptom ||
            article.verifiedTakeaway.rootCause ||
            article.verifiedTakeaway.instantFix) && (
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
              {article.verifiedTakeaway.symptom && (
              <div>
                <span className="text-[14px] text-muted font-medium block">
                  Problem
                </span>
                <p className="text-ink mt-0.5">
                  {article.verifiedTakeaway.symptom}
                </p>
              </div>
              )}
              {article.verifiedTakeaway.rootCause && (
              <div>
                <span className="text-[14px] text-muted font-medium block">
                  Cause
                </span>
                <p className="text-ink mt-0.5">
                  {article.verifiedTakeaway.rootCause}
                </p>
              </div>
              )}
              {article.verifiedTakeaway.instantFix && (
              <div className="p-4 rounded-[18px] bg-badge-bg border border-hairline">
                <span className="text-[14px] text-badge-text font-semibold block">
                  Quick Fix
                </span>
                <p className="text-ink font-medium mt-0.5">
                  {article.verifiedTakeaway.instantFix}
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
              className="space-y-6 pt-2 max-w-[68ch]"
            >
              <h2 className="font-sans font-medium text-[clamp(26px,3.5vw,36px)] leading-[1.15] tracking-[-0.02em] text-ink">
                Step-by-Step Instructions
              </h2>

              <div className="space-y-4">
                {article.howToSteps.map((step) => {
                  const stepCopyKey = `step-${step.stepNumber}`;
                  return (
                    <div
                      key={step.stepNumber}
                      className="rounded-[24px] bg-surface border border-hairline shadow-2 p-6 sm:p-7 space-y-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <span className="h-8 w-8 rounded-full bg-badge-bg text-badge-text text-[14px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                          {step.stepNumber}
                        </span>
                        <h3 className="font-sans font-semibold text-[20px] leading-[1.3] text-ink">
                          {step.name}
                        </h3>
                      </div>

                      <p className="font-sans text-[18px] leading-[1.75] text-secondary">
                        {step.text}
                      </p>

                      {step.commandOrCode && (
                        <div className="rounded-[18px] bg-[#f1f5fe] dark:bg-[#0d152c] border border-hairline overflow-hidden">
                          <div className="px-4 py-2.5 border-b border-hairline flex items-center justify-between text-[13px] text-muted">
                            <span className="font-medium">Command</span>
                            <button
                              type="button"
                              onClick={() =>
                                copyCommand(
                                  step.commandOrCode!,
                                  stepCopyKey,
                                  `Step ${step.stepNumber} command copied`
                                )
                              }
                              className="inline-flex items-center gap-1.5 px-3 min-h-[34px] rounded-full bg-surface text-ink border border-hairline text-[13px] font-medium hover:text-navy transition-colors duration-micro"
                            >
                              {copiedKey === stepCopyKey ? (
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
                          <pre className="p-4 font-mono text-[14px] leading-[1.65] overflow-x-auto text-ink">
                            <code>{step.commandOrCode}</code>
                          </pre>
                        </div>
                      )}

                      {step.proTip && (
                        <div className="rounded-[14px] bg-badge-bg border border-hairline px-4 py-3 text-[15px] text-secondary leading-[1.6]">
                          <strong className="font-semibold text-navy">
                            Tip:{" "}
                          </strong>
                          <span>{step.proTip}</span>
                        </div>
                      )}
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
                <h2 className="font-sans font-medium text-[clamp(24px,3.2vw,34px)] text-ink tracking-[-0.02em] leading-[1.18]">
                  {section.heading}
                </h2>

                {section.paragraphs.map((p, pIdx) => (
                  <p
                    key={pIdx}
                    className="font-sans text-[18px] leading-[1.75] text-secondary"
                  >
                    {p}
                  </p>
                ))}

                {section.inlineImage && (
                  <div className="rounded-[24px] bg-surface border border-hairline shadow-2 p-3">
                    <TechnicalDiagram
                      image={section.inlineImage}
                      priority={false}
                      showCaption={false}
                    />
                  </div>
                )}

                {section.callout && (
                  <aside
                    role="note"
                    className="rounded-[18px] bg-badge-bg border border-hairline p-5 space-y-1.5"
                  >
                    <div className="font-sans font-semibold text-[16px] text-navy">
                      {section.callout.title}
                    </div>
                    <p className="text-[16px] text-secondary leading-[1.65]">
                      {section.callout.body}
                    </p>
                  </aside>
                )}

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
                            <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
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
                          {faq.answer}
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
