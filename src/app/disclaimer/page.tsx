import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer | Zee Writes",
  description:
    "Disclaimer for Zee Writes guides, tech fixes, and browser text tools.",
  alternates: {
    canonical: "https://zeewrites.com/disclaimer",
  },
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-[68ch] mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
      <header className="space-y-2 border-b border-hairline pb-6">
        <h1 className="font-sans font-medium text-[clamp(30px,4.5vw,44px)] text-ink tracking-[-0.02em] leading-[1.12]">
          Disclaimer
        </h1>
        <p className="text-[14px] text-muted">
          Last updated: October 26, 2026
        </p>
      </header>

      <div className="space-y-5 font-sans text-[17px] leading-[1.75] text-secondary">
        <p>
          The content on{" "}
          <strong className="font-semibold text-ink">Zee Writes</strong> is
          published for general informational purposes only.
        </p>
        <p>
          Every computer, operating system, and browser environment is
          different. You follow any commands, settings adjustments, or
          troubleshooting steps on this site at your own risk. Always back up
          your files and system settings before making changes.
        </p>
        <p>
          The website and its browser text tools are provided &ldquo;as-is&rdquo;
          without any guarantees or warranties. All original content belongs to
          Zee Writes and may not be copied or redistributed without permission.
        </p>
        <p>
          For questions or corrections, please email{" "}
          <a
            href="mailto:zameerpanhwer67@gmail.com"
            className="text-navy font-medium underline underline-offset-4"
          >
            zameerpanhwer67@gmail.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
