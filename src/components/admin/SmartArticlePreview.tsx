"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Code2,
  Heading2,
  Heading3,
  FileText,
  List,
  AlertTriangle,
  Lightbulb,
  Check,
  ChevronDown,
  Copy,
  Table as TableIcon,
  Quote,
} from "lucide-react";
import { ArticleBlock, ArticleBlockType } from "@/lib/smart-paste/types";
import { blocksToMarkdown } from "@/lib/smart-paste/renderer";

interface SmartArticlePreviewProps {
  blocks: ArticleBlock[];
  onUpdateBlocks: (updatedBlocks: ArticleBlock[]) => void;
}

function renderPreviewFormattedText(text: string): React.ReactNode {
  if (!text) return null;
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*|==([^=]+)==|<mark>([^<]+)<\/mark>/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIndex = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const [, linkText, linkUrl, codeText, boldText, italicText, highlight1, highlight2] = match;
    const highlightText = highlight1 || highlight2;

    if (linkText && linkUrl) {
      nodes.push(
        <span key={`l-${keyIndex++}`} className="text-[#4a74f0] underline underline-offset-2">
          {linkText}
        </span>
      );
    } else if (codeText) {
      nodes.push(
        <code
          key={`c-${keyIndex++}`}
          className="font-mono text-[0.88em] px-1.5 py-0.5 rounded-[6px] bg-[#f1f5fe] dark:bg-[#16203a] text-navy dark:text-accent border border-hairline"
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

  return nodes.length > 0 ? nodes : text;
}

export function SmartArticlePreview({ blocks, onUpdateBlocks }: SmartArticlePreviewProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const changeBlockType = (
    blockId: string,
    newType: ArticleBlockType,
    level?: 1 | 2 | 3 | 4,
    calloutType?: "tip" | "note" | "warning" | "important" | "highlight"
  ) => {
    const updated: ArticleBlock[] = blocks.map((b): ArticleBlock => {
      if (b.id !== blockId) return b;

      const baseText = b.text || b.code || (b.items ? b.items.join("\n") : "") || b.body || "";

      if (newType === "heading") {
        return {
          ...b,
          type: "heading" as const,
          level: level || 2,
          text: baseText.replace(/^#+\s*/, "").trim(),
          confidence: "high" as const,
        };
      }

      if (newType === "code") {
        return {
          ...b,
          type: "code" as const,
          language: b.language || "bash",
          code: baseText,
          confidence: "high" as const,
        };
      }

      if (newType === "callout") {
        const cType = calloutType || "tip";
        const title =
          cType === "highlight"
            ? "Key Takeaway"
            : cType === "warning"
            ? "Warning"
            : cType === "important"
            ? "Important"
            : cType === "note"
            ? "Note"
            : "Tip";
        return {
          ...b,
          type: "callout" as const,
          calloutType: cType,
          title,
          body: baseText,
          confidence: "high" as const,
        };
      }

      if (newType === "list") {
        const lines = baseText.split("\n").filter(Boolean);
        return {
          ...b,
          type: "list" as const,
          ordered: false,
          items: lines.length > 0 ? lines : [baseText],
          confidence: "high" as const,
        };
      }

      if (newType === "quote") {
        return {
          ...b,
          type: "quote" as const,
          text: baseText,
          confidence: "high" as const,
        };
      }

      // Default: paragraph
      return {
        ...b,
        type: "paragraph" as const,
        text: baseText,
        confidence: "high" as const,
      };
    });

    onUpdateBlocks(updated);
    setActiveMenuId(null);
  };

  if (blocks.length === 0) {
    return (
      <div className="py-12 px-4 text-center rounded-[18px] border border-dashed border-hairline bg-page text-muted">
        <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40 text-navy" />
        <p className="text-[15px] font-medium text-ink">No structured blocks yet</p>
        <p className="text-[13px] text-muted mt-1">Paste an article into the editor or type content to see the live preview.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[68ch] mx-auto py-2">
      <div className="flex items-center justify-between text-[12px] text-muted pb-2 border-b border-hairline">
        <span>Click any block badge to adjust its detected type</span>
        <span>{blocks.length} blocks detected</span>
      </div>

      {blocks.map((block) => {
        const isMenuOpen = activeMenuId === block.id;
        const isLowConfidence = block.confidence === "low";

        return (
          <div
            key={block.id}
            className={`group relative rounded-[16px] transition-all duration-150 p-2 sm:p-3 -mx-2 sm:-mx-3 ${
              isLowConfidence
                ? "border border-amber-300/80 bg-amber-50/40 dark:bg-amber-950/20"
                : "hover:bg-badge-bg/40 border border-transparent"
            }`}
          >
            {/* Block Type Badge & Controls */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setActiveMenuId(isMenuOpen ? null : block.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-colors shadow-sm ${
                    isLowConfidence
                      ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/60 dark:text-amber-200"
                      : "bg-surface text-secondary border-hairline hover:text-ink hover:border-[#4a74f0]"
                  }`}
                >
                  {block.type === "heading" && (
                    <>
                      {block.level === 3 ? <Heading3 className="w-3 h-3 text-navy" /> : <Heading2 className="w-3 h-3 text-navy" />}
                      <span>H{block.level || 2} Heading</span>
                    </>
                  )}
                  {block.type === "paragraph" && (
                    <>
                      <FileText className="w-3 h-3 text-muted" />
                      <span>Paragraph</span>
                    </>
                  )}
                  {block.type === "code" && (
                    <>
                      <Code2 className="w-3 h-3 text-navy" />
                      <span>Code ({block.language || "text"})</span>
                    </>
                  )}
                  {block.type === "callout" && (
                    <>
                      {block.calloutType === "highlight" ? (
                        <Sparkles className="w-3 h-3 text-amber-500" />
                      ) : (
                        <Lightbulb className="w-3 h-3 text-amber-600" />
                      )}
                      <span className="capitalize">{block.calloutType === "highlight" ? "Highlight Box" : `${block.calloutType || "Tip"} Box`}</span>
                    </>
                  )}
                  {block.type === "list" && (
                    <>
                      <List className="w-3 h-3 text-emerald-600" />
                      <span>{block.ordered ? "Numbered List" : "Bullet List"}</span>
                    </>
                  )}
                  {block.type === "table" && (
                    <>
                      <TableIcon className="w-3 h-3 text-indigo-600" />
                      <span>Table</span>
                    </>
                  )}
                  {block.type === "quote" && (
                    <>
                      <Quote className="w-3 h-3 text-muted" />
                      <span>Quote</span>
                    </>
                  )}
                  {block.type === "divider" && <span>Divider</span>}

                  <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                </button>

                {/* Quick Type Switcher Dropdown */}
                {isMenuOpen && (
                  <div className="absolute left-0 top-full mt-1.5 z-30 w-48 rounded-[14px] bg-surface border border-hairline shadow-lg py-1.5 text-[13px] animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1 text-[11px] font-semibold text-muted uppercase tracking-wider">Change Type</div>
                    <button
                      type="button"
                      onClick={() => changeBlockType(block.id, "heading", 2)}
                      className="w-full text-left px-3 py-1.5 hover:bg-page flex items-center gap-2 text-ink"
                    >
                      <Heading2 className="w-3.5 h-3.5 text-navy" /> Heading (H2)
                    </button>
                    <button
                      type="button"
                      onClick={() => changeBlockType(block.id, "heading", 3)}
                      className="w-full text-left px-3 py-1.5 hover:bg-page flex items-center gap-2 text-ink"
                    >
                      <Heading3 className="w-3.5 h-3.5 text-navy" /> Subheading (H3)
                    </button>
                    <button
                      type="button"
                      onClick={() => changeBlockType(block.id, "paragraph")}
                      className="w-full text-left px-3 py-1.5 hover:bg-page flex items-center gap-2 text-ink"
                    >
                      <FileText className="w-3.5 h-3.5 text-muted" /> Paragraph
                    </button>
                    <button
                      type="button"
                      onClick={() => changeBlockType(block.id, "code")}
                      className="w-full text-left px-3 py-1.5 hover:bg-page flex items-center gap-2 text-ink"
                    >
                      <Code2 className="w-3.5 h-3.5 text-navy" /> Code Box
                    </button>
                    <button
                      type="button"
                      onClick={() => changeBlockType(block.id, "callout", undefined, "highlight")}
                      className="w-full text-left px-3 py-1.5 hover:bg-page flex items-center gap-2 text-ink"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Highlight Box
                    </button>
                    <button
                      type="button"
                      onClick={() => changeBlockType(block.id, "callout", undefined, "tip")}
                      className="w-full text-left px-3 py-1.5 hover:bg-page flex items-center gap-2 text-ink"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-emerald-600" /> Tip Box
                    </button>
                    <button
                      type="button"
                      onClick={() => changeBlockType(block.id, "callout", undefined, "warning")}
                      className="w-full text-left px-3 py-1.5 hover:bg-page flex items-center gap-2 text-ink"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Warning Box
                    </button>
                    <button
                      type="button"
                      onClick={() => changeBlockType(block.id, "list")}
                      className="w-full text-left px-3 py-1.5 hover:bg-page flex items-center gap-2 text-ink"
                    >
                      <List className="w-3.5 h-3.5 text-indigo-600" /> List
                    </button>
                    <button
                      type="button"
                      onClick={() => changeBlockType(block.id, "quote")}
                      className="w-full text-left px-3 py-1.5 hover:bg-page flex items-center gap-2 text-ink"
                    >
                      <Quote className="w-3.5 h-3.5 text-muted" /> Quote
                    </button>
                  </div>
                )}
              </div>

              {isLowConfidence && (
                <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Unfenced code detected — verify language
                </span>
              )}
            </div>

            {/* Block Body Rendering */}
            {block.type === "heading" && (
              block.level === 3 ? (
                <h3 className="font-sans font-bold text-[22px] sm:text-[25px] text-ink tracking-[-0.015em] leading-[1.25] pt-1">
                  {renderPreviewFormattedText(block.text || "")}
                </h3>
              ) : (
                <h2 className="font-sans font-bold text-[28px] sm:text-[34px] text-ink tracking-[-0.025em] leading-[1.18] pt-2">
                  {renderPreviewFormattedText(block.text || "")}
                </h2>
              )
            )}

            {block.type === "paragraph" && (
              <p className="font-sans text-[17px] sm:text-[18px] leading-[1.75] text-secondary">
                {renderPreviewFormattedText(block.text || "")}
              </p>
            )}

            {block.type === "code" && (
              <div className="rounded-[16px] bg-[#0f172a] text-slate-100 border border-slate-800 overflow-hidden shadow-sm">
                <div className="px-4 py-2 border-b border-slate-800 bg-[#0b1120] flex items-center justify-between text-[12px] text-slate-400">
                  <span className="font-mono font-medium">{block.language || "text"}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(block.code || "", block.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition-colors"
                  >
                    {copiedId === block.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 font-mono text-[13.5px] leading-[1.65] overflow-x-auto text-slate-200">
                  <code>{block.code}</code>
                </pre>
              </div>
            )}

            {block.type === "callout" && (() => {
              const isHighlight =
                block.calloutType === "highlight" ||
                /takeaway|highlight|tl;?dr|remember|important|key point|core concept/i.test(block.title || "");
              return (
                <aside
                  role="note"
                  className={`rounded-[16px] border p-4 sm:p-5 space-y-1.5 ${
                    isHighlight
                      ? "bg-[#fef9c3]/50 dark:bg-[#ca8a04]/15 border-2 border-[#facc15]/80 dark:border-[#ca8a04]/50 shadow-sm"
                      : block.calloutType === "warning"
                      ? "bg-amber-50/70 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/60"
                      : block.calloutType === "note"
                      ? "bg-blue-50/70 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/60"
                      : "bg-badge-bg border-hairline"
                  }`}
                >
                  <div
                    className={`font-sans font-bold text-[15px] sm:text-[16px] flex items-center gap-1.5 ${
                      isHighlight ? "text-amber-800 dark:text-amber-300" : "text-navy dark:text-accent"
                    }`}
                  >
                    {isHighlight ? (
                      <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
                    ) : (
                      <Lightbulb className="w-4 h-4 shrink-0" />
                    )}
                    <span>{block.title || (isHighlight ? "Key Takeaway" : "Tip")}</span>
                  </div>
                  <p className="text-[15px] sm:text-[16px] text-ink leading-[1.65]">
                    {renderPreviewFormattedText(block.body || "")}
                  </p>
                </aside>
              );
            })()}

            {block.type === "list" && (
              block.ordered ? (
                <ol className="space-y-2 pl-5 list-decimal text-secondary text-[16px] sm:text-[17px] leading-[1.75]">
                  {block.items?.map((it, idx) => (
                    <li key={idx}>{renderPreviewFormattedText(it)}</li>
                  ))}
                </ol>
              ) : (
                <ul className="space-y-2 pl-5 list-disc text-secondary text-[16px] sm:text-[17px] leading-[1.75]">
                  {block.items?.map((it, idx) => (
                    <li key={idx}>{renderPreviewFormattedText(it)}</li>
                  ))}
                </ul>
              )
            )}

            {block.type === "table" && (
              <div className="overflow-x-auto rounded-[16px] bg-surface shadow-1 border border-hairline my-2">
                <table className="w-full text-left border-collapse text-[14px] sm:text-[15px]">
                  <thead>
                    <tr className="border-b border-hairline bg-badge-bg">
                      {block.headers?.map((h, idx) => (
                        <th key={idx} className="py-3 px-4 font-semibold text-ink">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {block.rows?.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-page transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-2.5 px-4 text-secondary">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {block.type === "quote" && (
              <blockquote className="my-2 pl-4 border-l-4 border-navy/40 italic text-secondary text-[16px] sm:text-[17px] leading-[1.7]">
                {block.text}
              </blockquote>
            )}

            {block.type === "divider" && <hr className="border-hairline my-3" />}
          </div>
        );
      })}
    </div>
  );
}
