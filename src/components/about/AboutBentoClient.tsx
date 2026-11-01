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
} from "lucide-react";
import { useSite } from "@/components/providers/SiteProvider";
import { ZeeMark } from "@/components/ui/ZeeLogo";

const PILLARS = [
  {
    id: "how-to-fixes",
    title: "Tech & OS Fixes",
    description:
      "Step-by-step troubleshooting steps for Windows, OS settings, software errors, and updates.",
    icon: Wrench,
    href: "/category/how-to-fixes",
  },
  {
    id: "ai-prompts",
    title: "AI Prompting Methods",
    description:
      "Tested, copy-paste prompts and workflow frameworks for ChatGPT, Claude, and Gemini.",
    icon: Sparkles,
    href: "/category/tutorials",
  },
  {
    id: "text-tools",
    title: "Text & Productivity Tools",
    description:
      "Handy browser utilities for clean text formatting, case conversions, and Markdown cleanup.",
    icon: FileCode2,
    href: "/category/text-guides",
  },
  {
    id: "tutorials",
    title: "Practical Tutorials",
    description:
      "Actionable, jargon-free guides that solve real computer problems without filler or bloat.",
    icon: BookOpen,
    href: "/category/solutions",
  },
];

const PROCESS_STEPS = [
  "Reproduce",
  "Test Solution",
  "Cut Fluff",
  "Document",
  "Publish Free",
] as const;

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

            <p className="mt-[20px] text-[18px] leading-[1.55] text-secondary max-w-[580px] mx-auto [text-wrap:balance]">
              Practical tech fixes, tested AI prompting methods, and browser-based text utilities — written clearly without fluff.
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
                Clear Answers for Everyday Tech Problems
              </h2>

              <p className="text-[17px] leading-[1.65] text-secondary">
                <strong className="text-ink font-semibold">Zee Writes</strong> is an independent tech publication and utility hub. We publish straightforward, step-by-step solutions for everyday operating system errors, AI prompting strategies that actually work, and browser tools that make working with text faster.
              </p>

              <p className="text-[16px] leading-[1.65] text-secondary">
                Every guide published here is tested before going live. No clickbait, no AI-generated filler, and no confusing jargon — just clean, actionable instructions you can follow in minutes.
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
                    Creator &amp; Author, Zee Writes
                  </p>
                </div>
              </div>

              <p className="text-[17px] leading-[1.65] text-secondary">
                Hi, I&apos;m Zee. I build text tools and write the guides on this site. I started Zee Writes because finding genuine, verified solutions to tech issues shouldn&apos;t require digging through ad-choked sites or outdated forums.
              </p>

              <p className="text-[16px] leading-[1.65] text-secondary">
                Whether you need a quick Windows fix, want better results from AI chatbots, or need clean text formatting, I hope these resources help you.
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
                className="w-full inline-flex items-center justify-center gap-2 px-6 min-h-[44px] text-[15px] font-medium btn-primary-pill"
              >
                <span>Contact Zee</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core coverage pillars */}
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
