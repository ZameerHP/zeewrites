import React from "react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Editorial Policy & Testing Standards | Zee Writes",
  description:
    "How Zee Writes researches, tests, verifies, and updates technical troubleshooting guides, AI prompting workflows, and browser utilities.",
  alternates: {
    canonical: "https://zeewrites.blog/editorial-policy",
  },
  openGraph: {
    title: "Editorial Policy & Testing Standards | Zee Writes",
    description:
      "How Zee Writes researches, tests, verifies, and updates technical troubleshooting guides, AI prompting workflows, and browser utilities.",
    url: "https://zeewrites.blog/editorial-policy",
    type: "website",
  },
};

export default function EditorialPolicyPage() {
  return (
    <div className="max-w-[68ch] mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
      <header className="space-y-2 border-b border-hairline pb-6">
        <div className="inline-flex items-center gap-2 h-[30px] px-[12px] mb-2 rounded-full bg-surface border border-hairline shadow-1 text-[12.5px] font-medium text-ink">
          <span className="w-[6px] h-[6px] rounded-full bg-accent" />
          <span>Publication Standards</span>
        </div>
        <h1 className="font-sans font-medium text-[clamp(30px,4.5vw,44px)] text-ink tracking-[-0.02em] leading-[1.12]">
          Editorial Policy &amp; Testing Standards
        </h1>
        <p className="text-[14px] text-muted">
          Last updated: November 19, 2026 &middot; Written and maintained by Zee
        </p>
      </header>

      <div className="space-y-8 font-sans text-[17px] leading-[1.75] text-secondary break-words">
        <section className="space-y-3">
          <h2 className="font-sans font-semibold text-[21px] text-ink">
            1. Purpose &amp; Editorial Focus
          </h2>
          <p>
            <strong className="font-semibold text-ink">Zee Writes</strong> (
            <Link
              href="/"
              className="text-navy font-medium underline underline-offset-4"
            >
              https://zeewrites.blog
            </Link>
            ) is an independent technical publication and browser utility hub
            created and maintained by Zee. Our mission is to publish clear,
            reproducible solutions for operating system errors, network and
            browser diagnostics, text encoding problems, and practical AI
            workflows—alongside privacy-first{" "}
            <Link
              href="/tools"
              className="text-navy font-medium underline underline-offset-4"
            >
              browser text tools
            </Link>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-sans font-semibold text-[21px] text-ink">
            2. How Guides Are Researched &amp; Verified
          </h2>
          <p>
            Every troubleshooting guide and tutorial on Zee Writes follows a
            five-step editorial workflow before publication:
          </p>
          <ol className="list-decimal pl-6 space-y-2.5">
            <li>
              <strong className="font-semibold text-ink">
                Problem Identification &amp; Root Cause:
              </strong>{" "}
              We explain why an error or formatting bug happens (for example,
              why UTF-8 bytes decoded as Windows-1252 produce mojibake, or why a
              stale DNS cache stalls TLS handshakes) rather than listing blind
              trial-and-error guesses.
            </li>
            <li>
              <strong className="font-semibold text-ink">
                Safe-First Ordering:
              </strong>{" "}
              Steps are ordered from the least intrusive check to advanced
              system or terminal actions, with explicit warnings whenever a
              command modifies system files, registry keys, or network adapters.
            </li>
            <li>
              <strong className="font-semibold text-ink">
                Limitations &amp; When Not to Use a Fix:
              </strong>{" "}
              Every guide explains when a specific tool, command, or method is{" "}
              <em>not</em> appropriate (for example, when a hardware or ISP
              outage cannot be solved by local OS commands, or when confidential
              data must never be pasted into cloud AI tools).
            </li>
            <li>
              <strong className="font-semibold text-ink">
                Primary Source Verification:
              </strong>{" "}
              Technical specifications, operating system lifecycle dates, and
              command parameters are cross-checked against official vendor
              documentation (such as Microsoft Learn, MDN Web Docs, IETF RFCs,
              Unicode Consortium tables, and official tool documentation).
            </li>
            <li>
              <strong className="font-semibold text-ink">
                Plain-Language Editing:
              </strong>{" "}
              We remove filler introductions, repetitive paragraphs, and
              unnecessary jargon so readers can apply the solution immediately.
            </li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="font-sans font-semibold text-[21px] text-ink">
            3. Policy on AI Tools &amp; Originality
          </h2>
          <p>
            We do not publish mass-generated, unreviewed AI articles, scraped
            competitor rewrites, or fabricated benchmarks. All guides are
            written, structured, and reviewed by Zee to ensure every command,
            prompt template, comparison table, and code snippet works as
            documented. We never invent statistics, test results, or fake user
            testimonials.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-sans font-semibold text-[21px] text-ink">
            4. Updates, Corrections &amp; Reader Feedback
          </h2>
          <p>
            Software interfaces, operating system versions, and web tools evolve
            constantly. When an article is updated to reflect a new OS release
            or tool change, we update its modification timestamp and review the
            affected steps.
          </p>
          <p>
            If you spot an outdated instruction, broken link, or technical
            inaccuracy in any guide, please report it via our{" "}
            <Link
              href="/contact"
              className="text-navy font-medium underline underline-offset-4"
            >
              Contact page
            </Link>{" "}
            or email{" "}
            <a
              href="mailto:zameerpanhwer67@gmail.com"
              className="text-navy font-medium underline underline-offset-4"
            >
              zameerpanhwer67@gmail.com
            </a>
            . Verified corrections are applied promptly.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-sans font-semibold text-[21px] text-ink">
            5. Independence &amp; Advertising Disclosure
          </h2>
          <p>
            Zee Writes is funded independently and may display advertisements
            through Google AdSense to support hosting and maintenance costs.
            Advertising does not influence which software, tools, or
            troubleshooting methods we recommend. We do not accept paid
            placements disguised as editorial tutorials.
          </p>
        </section>
      </div>
    </div>
  );
}
