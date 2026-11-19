import React from "react";
import { Metadata } from "next";
import { ToolsHubClient } from "@/components/tools/ToolsHubClient";

export const metadata: Metadata = {
  title: "Browser Text & Developer Tools — Case Formatter, Encoding Fixer & Diff | Zee Writes",
  description:
    "Free client-side browser utilities for developers and writers: Smart Case Formatter, Word & Readability Analyzer, Invisible Character & UTF-8 Mojibake Fixer, Duplicate Line Scrubber, Markdown/HTML Converter, and JSON/Text Diff Validator.",
  alternates: {
    canonical: "https://zeewrites.blog/tools",
  },
  openGraph: {
    title: "Browser Text & Developer Tools | Zee Writes",
    description:
      "Privacy-first, client-side text formatting, UTF-8 mojibake repair, Markdown conversion, and JSON diff utilities.",
    url: "https://zeewrites.blog/tools",
    type: "website",
  },
};

export default function ToolsHubPage() {
  return (
    <div className="space-y-12 pb-8">
      {/* Stage Header matching ZeeWrites visual identity */}
      <section className="px-[14px]">
        <div className="relative rounded-[32px] border border-hairline stage-panel-gradient overflow-hidden min-h-[250px] sm:min-h-[280px] flex flex-col items-center justify-center py-12 px-4 sm:px-6 text-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 stage-dot-pattern"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[18%] stage-bottom-fade"
          />

          <div className="relative z-10 max-w-[760px] mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 h-[32px] px-[14px] mb-[20px] rounded-full bg-surface border border-hairline shadow-1 text-[13px] font-medium text-ink">
              <span className="w-[6px] h-[6px] rounded-full bg-accent" />
              <span>100% Client-Side Browser Utilities</span>
            </div>

            <h1 className="font-sans font-medium text-[clamp(30px,5vw,48px)] leading-[1.08] tracking-[-0.025em] text-ink [text-wrap:balance]">
              Free Text &amp; <span className="text-navy">Developer Tools</span>
            </h1>

            <p className="mt-[20px] text-[18px] leading-[1.55] text-secondary max-w-[600px] mx-auto [text-wrap:balance]">
              Format identifiers, clean invisible Unicode characters, deduplicate
              logs, convert Markdown, and diff JSON directly in your browser.
              Your text never leaves your device.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <ToolsHubClient />
      </div>
    </div>
  );
}
