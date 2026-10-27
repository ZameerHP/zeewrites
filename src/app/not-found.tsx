import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ZeeMark } from "@/components/ui/ZeeLogo";

export default function NotFound() {
  return (
    <section className="px-[14px] pb-12">
      <div className="relative rounded-[32px] border border-hairline stage-panel-gradient overflow-hidden min-h-[480px] flex flex-col items-center justify-center py-16 px-4 sm:px-6 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 stage-dot-pattern"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[18%] stage-bottom-fade"
        />

        <div className="relative z-10 max-w-[540px] mx-auto flex flex-col items-center">
          <div className="w-[64px] h-[64px] rounded-[18px] bg-surface shadow-2 border border-hairline ring-1 ring-inset ring-white dark:ring-white/15 flex items-center justify-center mb-5">
            <ZeeMark size={34} />
          </div>

          <div className="inline-flex items-center gap-2 h-[32px] px-[14px] mb-[20px] rounded-full bg-surface border border-hairline shadow-1 text-[13px] font-medium text-ink">
            <span className="w-[6px] h-[6px] rounded-full bg-accent" />
            <span>404 Page not found</span>
          </div>

          <h1 className="font-sans font-medium text-[clamp(30px,5vw,48px)] leading-[1.08] tracking-[-0.025em] text-ink [text-wrap:balance]">
            We Couldn&apos;t Find <span className="text-navy">That Page</span>
          </h1>

          <p className="mt-[20px] mb-[28px] text-[18px] text-secondary leading-[1.55] [text-wrap:balance]">
            The guide or page you requested may have moved. Use the link below
            to return to the frontpage.
          </p>

          <div className="flex items-center justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-7 min-h-[44px] text-[15px] font-medium btn-primary-pill"
            >
              <span>Return Home</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
