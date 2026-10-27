"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Cpu,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";
import { TextToolDefinition } from "@/types";
import { TEXT_TOOLS } from "@/data/tools";
import { AdSlot } from "@/components/ui/AdSlot";

interface ToolDocumentationSectionProps {
  tool: TextToolDefinition;
}

export function ToolDocumentationSection({
  tool,
}: ToolDocumentationSectionProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const otherTools = TEXT_TOOLS.filter((t) => t.slug !== tool.slug);

  return (
    <section
      aria-labelledby="tool-guide-heading"
      className="mt-14 space-y-12 border-t border-obsidian/[0.08] dark:border-white/[0.08] pt-12"
    >
      {/* Section Header */}
      <div className="max-w-3xl space-y-3">
        <h2
          id="tool-guide-heading"
          className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-obsidian dark:text-pearl"
        >
          {tool.guideTitle}
        </h2>
        <p className="text-base sm:text-lg text-charcoal dark:text-cool-slate leading-relaxed">
          {tool.guideSubtitle}
        </p>
      </div>

      {/* Formula / Logic Box */}
      <div className="rounded-2xl border border-navy/25 dark:border-navy/30 bg-navy/[0.04] dark:bg-navy/[0.07] p-6 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-navy dark:text-navy">
          <Cpu className="w-4 h-4" />
          <span>{tool.formulaBox.title}</span>
        </div>
        <pre className="p-4 rounded-xl bg-obsidian text-emerald-300 font-mono text-[13px] sm:text-sm overflow-x-auto border border-white/10">
          <code>{tool.formulaBox.formula}</code>
        </pre>
        <p className="text-sm text-charcoal dark:text-cool-slate leading-relaxed">
          {tool.formulaBox.explanation}
        </p>
      </div>

      {/* Common Use Cases */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-xl text-obsidian dark:text-pearl">
          Common Use Cases
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tool.useCases.map((uc) => (
            <div
              key={uc.role}
              className="rounded-2xl border border-obsidian/[0.08] dark:border-white/[0.08] bg-ivory dark:bg-carbon-card p-5 space-y-2.5 shadow-sm"
            >
              <div className="text-[13px] font-semibold text-navy dark:text-navy">
                {uc.role}
              </div>
              <p className="text-sm font-medium text-obsidian dark:text-pearl leading-snug">
                {uc.scenario}
              </p>
              <p className="text-[13px] text-charcoal dark:text-cool-slate leading-relaxed">
                <strong>Result:</strong> {uc.outcome}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Long-Form Guide Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          {tool.guideSections.map((section) => (
            <article key={section.id} id={section.id} className="space-y-4">
              <h3 className="font-display font-bold text-xl sm:text-2xl text-obsidian dark:text-pearl tracking-tight">
                {section.heading}
              </h3>
              {section.paragraphs.map((para, idx) => (
                <p
                  key={idx}
                  className="font-sans text-[18px] leading-[1.78] text-obsidian/90 dark:text-pearl/90 max-w-prose"
                >
                  {para}
                </p>
              ))}
            </article>
          ))}

          {/* Reference Comparison Table */}
          <div className="pt-2">
            <h3 className="font-display font-bold text-xl text-obsidian dark:text-pearl mb-3">
              {tool.comparisonTable.caption}
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-obsidian/[0.08] dark:border-white/[0.08] bg-ivory dark:bg-carbon-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-obsidian/[0.08] dark:border-white/[0.08] bg-obsidian/[0.03] dark:bg-white/[0.03]">
                    {tool.comparisonTable.headers.map((h) => (
                      <th
                        key={h}
                        className="py-3 px-4 text-[13px] text-obsidian dark:text-pearl font-semibold"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-obsidian/[0.06] dark:divide-white/[0.06]">
                  {tool.comparisonTable.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-obsidian/[0.015] dark:hover:bg-white/[0.015]">
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className={`py-3 px-4 ${
                            cIdx === 0
                              ? "font-mono text-[13px] font-semibold text-navy dark:text-navy"
                              : cIdx === 1
                              ? "font-mono text-[13px] text-obsidian dark:text-pearl"
                              : "text-charcoal dark:text-cool-slate text-sm"
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

          {/* Single quiet reserved ad slot */}
          <AdSlot id={`tool-guide-${tool.slug}`} format="in-article" />

          {/* Interactive FAQ Accordion */}
          <div className="space-y-4 pt-2">
            <h3 className="font-display font-bold text-2xl text-obsidian dark:text-pearl">
              Frequently Asked Questions ({tool.shortName})
            </h3>
            <div className="space-y-3">
              {tool.faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={faq.question}
                    className="rounded-2xl border border-obsidian/[0.08] dark:border-white/[0.08] bg-ivory dark:bg-carbon-card overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-display font-semibold text-base text-obsidian dark:text-pearl hover:text-navy dark:hover:text-navy transition-colors"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isOpen ? "rotate-180 text-navy" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-sm sm:text-base text-charcoal dark:text-cool-slate leading-relaxed border-t border-obsidian/[0.05] dark:border-white/[0.05]">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sticky Sidebar: Other Utilities */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="rounded-2xl border border-obsidian/[0.08] dark:border-white/[0.08] bg-ivory dark:bg-carbon-card p-5 space-y-4">
              <div className="text-sm font-semibold text-obsidian dark:text-pearl">
                More Text Tools
              </div>
              <div className="space-y-2.5">
                {otherTools.map((other) => (
                  <Link
                    key={other.id}
                    href={`/tools/${other.slug}`}
                    className="block p-3 rounded-xl border border-obsidian/[0.06] dark:border-white/[0.06] hover:border-navy/40 bg-alabaster/70 dark:bg-carbon/60 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-obsidian dark:text-pearl group-hover:text-navy dark:group-hover:text-navy">
                        {other.shortName}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-charcoal dark:text-cool-slate group-hover:text-navy" />
                    </div>
                    <p className="text-[13px] text-charcoal dark:text-cool-slate line-clamp-2 mt-1">
                      {other.tagline}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

