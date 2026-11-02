"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Fallback 404 view (no localStorage resurrection or background re-insertion).
 */
export function ArticleClientResolver() {
  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-[540px] w-full rounded-[32px] border border-hairline stage-panel-gradient p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 stage-dot-pattern"
        />
        <div className="relative z-10 flex flex-col items-center space-y-5">
          <div className="inline-flex items-center gap-2 h-[32px] px-[14px] rounded-full bg-surface border border-hairline shadow-1 text-[13px] font-medium text-ink">
            <span className="w-[6px] h-[6px] rounded-full bg-accent" />
            <span>404</span>
          </div>

          <h1 className="font-sans font-medium text-[clamp(28px,4.5vw,42px)] leading-[1.1] tracking-[-0.02em] text-ink [text-wrap:balance]">
            We Couldn&apos;t Find That Page
          </h1>

          <p className="text-[17px] text-secondary leading-[1.6] max-w-[420px] mx-auto">
            The guide or page you requested has been removed or moved. Use the
            link below to return to the frontpage.
          </p>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-7 min-h-[48px] text-[15px] font-semibold btn-primary-pill"
            >
              <span>Return to Frontpage</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
