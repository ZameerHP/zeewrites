"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wrench,
  Sparkles,
  FileCode2,
  BookOpen,
  ArrowRight,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react";
import { useSite } from "@/components/providers/SiteProvider";
import { ZeeMark } from "@/components/ui/ZeeLogo";

const PILLARS = [
  {
    id: "how-to-fixes",
    title: "Tech & OS Fixes",
    description:
      "Step-by-step troubleshooting guides for Windows, network errors, SSL/DNS issues, and browser performance.",
    icon: Wrench,
    href: "/category/how-to-fixes",
  },
  {
    id: "text-guides",
    title: "Text, Encoding & Prompt Guides",
    description:
      "Practical manuals on UTF-8 encoding, regex patterns, Markdown formatting, and structured AI prompting.",
    icon: Sparkles,
    href: "/category/text-guides",
  },
  {
    id: "solutions",
    title: "Web Performance & Code Solutions",
    description:
      "Deep dives into Core Web Vitals (CLS/LCP), JSON validation, and sanitizing hidden characters in code.",
    icon: BookOpen,
    href: "/category/solutions",
  },
  {
    id: "text-tools",
    title: "Browser Text & Developer Tools",
    description:
      "100% client-side utilities for case formatting, invisible character cleanup, line deduplication, and JSON diffing.",
    icon: FileCode2,
    href: "/tools",
  },
];

const PROCESS_STEPS = [
  "Reproduce Issue",
  "Verify Root Cause",
  "Document Steps",
  "State Limitations",
  "Review & Update",
] as const;

const EDITORIAL_STANDARDS = [
  {
    title: "Root-Cause Explanations, Not Guesswork",
    body: "Every guide explains why an issue happens—whether it is a Windows update servicing error, a stale DNS cache, or UTF-8 bytes decoded as Windows-1252—so you know what a fix actually changes before running it.",
  },
  {
    title: "Clear Limitations & When Not to Use a Fix",
    body: "Not every command fits every machine. Our guides highlight prerequisites, potential side effects, and situations where a method should not be used (such as never pasting confidential data into cloud AI tools).",
  },
  {
    title: "Official Documentation References",
    body: "Command parameters, OS lifecycle dates, and web standards are cross-checked against primary sources including Microsoft Learn, MDN Web Docs, IETF RFCs, and the Unicode Standard.",
  },
  {
    title: "Privacy-First Browser Utilities",
    body: "Every interactive tool in our Text Tools suite runs locally in your browser using client-side JavaScript. Your text, logs, and JSON payloads are never uploaded to a server.",
  },
];

export function AboutBentoClient() {
  const { showToast } = useSite();
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("zameerpanhwer67@gmail.com");
    setCopied(true);
    showToast("Email copied: zameerpanhwer67@gmail.com");
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="space-y-16 pb-8">
      {/* 1. Small Stage Header */}
      <section className="px-[14px]">
        <div className="relative rounded-[32px] border border-hairline stage-panel-gradient overflow-hidden min-h-[260px] sm:min-h-[290px] flex flex-col items-center justify-center py-12 px-4 sm:px-6 text-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 stage-dot-pattern"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[18%] stage-bottom-fade"
          />

          <div className="relative z-10 max-w-[740px] mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 h-[32px] px-[14px] mb-[20px] rounded-full bg-surface border border-hairline shadow-1 text-[13px] font-medium text-ink">
              <span className="w-[6px] h-[6px] rounded-full bg-accent" />
              <span>About the publication</span>
            </div>

            <h1 className="font-sans font-medium text-[clamp(32px,5.2vw,52px)] leading-[1.08] tracking-[-0.025em] text-ink [text-wrap:balance]">
              About <span className="text-navy">Zee Writes</span>
            </h1>

            <p className="mt-[20px] text-[18px] leading-[1.55] text-secondary max-w-[600px] mx-auto [text-wrap:balance]">
              Practical operating system fixes, structured AI prompting
              workflows, text encoding guides, and privacy-first browser
              utilities—written clearly without filler.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Two Cards Side by Side */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Card A: What We Publish (7 cols) */}
          <div className="lg:col-span-7 rounded-[24px] bg-surface border border-hairline shadow-2 p-7 sm:p-10 flex flex-col justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 h-[32px] px-[14px] rounded-full bg-surface border border-hairline shadow-1 text-[13px] font-medium text-ink">
                <span className="w-[6px] h-[6px] rounded-full bg-accent" />
                <span>Our Editorial Mission</span>
              </div>

              <h2 className="font-sans font-semibold text-[24px] sm:text-[28px] leading-[1.2] tracking-[-0.02em] text-ink">
                Clear, Reproducible Answers for Real Technical Problems
              </h2>

              <p className="text-[17px] leading-[1.65] text-secondary">
                <strong className="text-ink font-semibold">Zee Writes</strong> (
                <code className="font-mono text-[15px] text-navy">
                  zeewrites.blog
                </code>
                ) is an independent technology publication and browser utility
                hub. We focus on four core areas: operating system and network
                troubleshooting, text encoding and developer workflows,
                structured AI prompting, and step-by-step tutorials for
                building and maintaining modern websites.
              </p>

              <p className="text-[16px] leading-[1.65] text-secondary">
                Every article is written to be directly usable: we start with a
                clear summary of the symptom, root cause, and resolution, follow
                with ordered steps and copyable commands or templates, and
                explicitly document common mistakes and limitations.
              </p>
            </div>

            {/* Five-step process as a clean horizontal stepper */}
            <div className="pt-6 border-t border-hairline">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="hidden sm:block absolute top-4 left-6 right-6 h-[1px] bg-hairline"
                />
                <ol className="relative z-10 grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {PROCESS_STEPS.map((step, index) => (
                    <li
                      key={step}
                      className="flex sm:flex-col items-center gap-2.5 text-center"
                    >
                      <span className="h-8 w-8 rounded-full bg-badge-bg text-badge-text border border-hairline text-[13px] font-semibold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-[14px] font-medium text-ink">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* Card B: Written by Zee (5 cols) */}
          <div className="lg:col-span-5 rounded-[24px] bg-surface border border-hairline shadow-2 p-7 sm:p-10 flex flex-col justify-between gap-8">
            <div className="space-y-5">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-[14px] bg-surface border border-hairline shadow-1 ring-1 ring-inset ring-white dark:ring-white/15 flex items-center justify-center shrink-0">
                  <ZeeMark size={30} />
                </div>
                <div>
                  <h2 className="font-sans font-semibold text-[20px] text-ink leading-tight">
                    Written by Zee
                  </h2>
                  <p className="text-[14px] text-muted mt-0.5">
                    Creator &amp; Technical Author, Zee Writes
                  </p>
                </div>
              </div>

              <p className="text-[17px] leading-[1.65] text-secondary">
                Hi, I&apos;m Zee. I build the browser text tools and write the
                guides on Zee Writes. I created this site because finding
                accurate, step-by-step solutions to everyday software, text
                formatting, and web development problems shouldn&apos;t require
                digging through vague forum threads or generic filler articles.
              </p>

              <p className="text-[16px] leading-[1.65] text-secondary">
                If you ever spot an instruction that needs an update after a
                software release—or if you have a question about any guide—you
                can reach me directly below.
              </p>
            </div>

            <div className="pt-6 border-t border-hairline space-y-3">
              <button
                type="button"
                onClick={handleCopyEmail}
                aria-label="Copy email address zameerpanhwer67@gmail.com"
                className="w-full flex items-center justify-between gap-2 px-4 min-h-[44px] rounded-[14px] bg-page border border-hairline shadow-1 text-[14px] text-ink hover:border-focus-blue transition-colors duration-micro"
              >
                <span className="font-medium truncate">
                  zameerpanhwer67@gmail.com
                </span>
                <span className="inline-flex items-center gap-1.5 text-navy font-semibold shrink-0">
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" strokeWidth={1.5} />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" strokeWidth={1.5} />
                      <span>Copy</span>
                    </>
                  )}
                </span>
              </button>

              <Link
                href="/contact"
                prefetch={true}
                className="w-full inline-flex items-center justify-center gap-2 px-6 min-h-[44px] text-[15px] font-medium btn-primary-pill"
              >
                <span>Contact Zee</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Editorial Standards & Content Integrity */}
      <section
        aria-labelledby="editorial-standards-heading"
        className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 h-[32px] px-[14px] rounded-full bg-surface border border-hairline shadow-1 text-[13px] font-medium text-ink">
              <ShieldCheck className="w-4 h-4 text-navy" strokeWidth={1.75} />
              <span>Content Standards &amp; Trust</span>
            </div>
            <h2
              id="editorial-standards-heading"
              className="font-sans font-medium text-[clamp(24px,3.5vw,36px)] leading-[1.15] tracking-[-0.02em] text-ink"
            >
              How We Maintain <span className="text-navy">Quality &amp; Accuracy</span>
            </h2>
          </div>

          <Link
            href="/editorial-policy"
            prefetch={true}
            className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-navy hover:underline"
          >
            <span>Read Full Editorial Policy</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {EDITORIAL_STANDARDS.map((item) => (
            <div
              key={item.title}
              className="rounded-[24px] bg-surface border border-hairline shadow-2 p-6 sm:p-7 space-y-2.5"
            >
              <h3 className="font-sans font-semibold text-[18px] text-ink">
                {item.title}
              </h3>
              <p className="text-[15.5px] text-secondary leading-[1.65]">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Core coverage pillars */}
      <section
        aria-labelledby="core-pillars-heading"
        className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6"
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 h-[32px] px-[14px] rounded-full bg-surface border border-hairline shadow-1 text-[13px] font-medium text-ink">
            <span className="w-[6px] h-[6px] rounded-full bg-accent" />
            <span>Topics &amp; Tools</span>
          </div>
          <h2
            id="core-pillars-heading"
            className="font-sans font-medium text-[clamp(24px,3.5vw,36px)] leading-[1.15] tracking-[-0.02em] text-ink"
          >
            What You&apos;ll Find on <span className="text-navy">Zee Writes</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Link
                key={pillar.id}
                href={pillar.href}
                prefetch={true}
                className="group rounded-[24px] bg-surface border border-hairline shadow-2 hover:shadow-3 hover:-translate-y-[2px] transition-[transform,box-shadow] duration-hover ease-out-expo p-6 flex flex-col justify-between gap-5"
              >
                <div className="flex items-center justify-between">
                  <div className="h-[36px] w-[36px] rounded-[10px] bg-badge-bg text-navy flex items-center justify-center">
                    <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                  </div>
                  <ArrowRight
                    className="w-4 h-4 text-muted group-hover:text-navy group-hover:translate-x-0.5 transition-all duration-hover ease-out-expo"
                    strokeWidth={1.5}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-sans font-semibold text-[18px] leading-[1.3] text-ink group-hover:text-navy transition-colors duration-micro">
                    {pillar.title}
                  </h3>
                  <p className="text-[15px] text-secondary leading-[1.6]">
                    {pillar.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
