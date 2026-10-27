"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Check, Mail } from "lucide-react";
import { CATEGORY_LIST } from "@/data/categories";
import { useSite } from "@/components/providers/SiteProvider";
import { ZeeMark } from "@/components/ui/ZeeLogo";

export function Footer() {
  const { articles, showToast } = useSite();
  const [copiedEmail, setCopiedEmail] = useState(false);

  const activeCategories = useMemo(() => {
    const published = articles.filter((a) => a.status === "published");
    return CATEGORY_LIST.filter((cat) =>
      published.some((a) => a.category === cat.slug)
    );
  }, [articles]);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("zameerpanhwer67@gmail.com");
      setCopiedEmail(true);
      showToast("Email copied: zameerpanhwer67@gmail.com");
      setTimeout(() => setCopiedEmail(false), 2200);
    } catch {
      // ignore
    }
  };

  return (
    <footer className="mt-16 sm:mt-24 px-3.5 pb-4">
      <div className="relative rounded-[32px] border border-hairline stage-panel-gradient overflow-hidden">
        {/* Very faint dot pattern at 6% opacity */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 footer-dot-pattern"
        />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
            {/* Column 1: Brand, mission statement & copyright */}
            <div className="lg:col-span-4 space-y-4">
              <Link
                href="/"
                className="inline-flex items-center gap-3 group min-h-[44px]"
              >
                <div className="h-10 w-10 rounded-[12px] bg-surface text-ink border border-hairline shadow-1 ring-1 ring-inset ring-white dark:ring-white/15 flex items-center justify-center shrink-0">
                  <ZeeMark size={26} />
                </div>
                <div>
                  <div className="font-semibold text-[17px] tracking-[-0.02em] text-ink leading-tight">
                    Zee Writes
                  </div>
                  <div className="text-[13px] text-muted leading-tight">
                    Guides &amp; Fixes
                  </div>
                </div>
              </Link>

              <p className="text-[15px] text-secondary leading-relaxed max-w-sm">
                Independent technical publication of step-by-step operating
                system, browser, network, and text formatting fixes written by
                Zee.
              </p>
            </div>

            {/* Column 2: Directory */}
            <div className="lg:col-span-2 space-y-3">
              <h2 className="text-[14px] font-semibold text-ink">Directory</h2>
              <ul className="space-y-2 text-[15px]">
                {activeCategories.map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      href={`/category/${cat.slug}`}
                      className="inline-flex items-center min-h-[36px] text-secondary hover:text-navy transition-colors duration-micro"
                    >
                      {cat.shortName}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Publication */}
            <div className="lg:col-span-3 space-y-3">
              <h2 className="text-[14px] font-semibold text-ink">
                Publication
              </h2>
              <ul className="space-y-2 text-[15px]">
                {[
                  { href: "/about", label: "About Zee Writes" },
                  { href: "/contact", label: "Contact" },
                  { href: "/privacy-policy", label: "Privacy Policy" },
                  { href: "/terms", label: "Terms" },
                  { href: "/disclaimer", label: "Disclaimer" },
                  { href: "/sitemap-page", label: "Sitemap" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center min-h-[36px] text-secondary hover:text-navy transition-colors duration-micro"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div className="lg:col-span-3 space-y-4">
              <h2 className="text-[14px] font-semibold text-ink">Contact</h2>
              <p className="text-[14px] text-secondary leading-relaxed">
                Questions, technical corrections, or topic requests go directly
                to Zee.
              </p>

              <button
                type="button"
                onClick={handleCopyEmail}
                aria-label="Copy email address zameerpanhwer67@gmail.com"
                className="w-full text-left p-4 rounded-[18px] bg-surface border border-hairline shadow-1 hover:shadow-3 transition-all duration-hover ease-out-expo group"
              >
                <div className="flex items-center justify-between gap-2 text-[13px] font-medium text-muted mb-1">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-navy" strokeWidth={1.5} />
                    <span>Email</span>
                  </span>
                  {copiedEmail ? (
                    <span className="inline-flex items-center gap-1 text-navy font-semibold">
                      <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>Copied</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-secondary group-hover:text-navy">
                      <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>Copy</span>
                    </span>
                  )}
                </div>
                <div className="text-[14px] font-medium text-ink truncate">
                  zameerpanhwer67@gmail.com
                </div>
              </button>
            </div>
          </div>

          {/* Bottom row */}
          <div className="mt-12 pt-6 border-t border-hairline flex flex-wrap items-center justify-between gap-4 text-[14px] text-muted">
            <p>© 2026 Zee Writes</p>
            <div className="flex items-center gap-4">
              <span>By Zee</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
