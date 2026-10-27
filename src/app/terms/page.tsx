import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms | Zee Writes",
  description:
    "Terms of use for Zee Writes guides, tech fixes, and browser text tools.",
  alternates: {
    canonical: "https://zeewrites.com/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-[68ch] mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
      <header className="space-y-2 border-b border-hairline pb-6">
        <h1 className="font-sans font-medium text-[clamp(30px,4.5vw,44px)] text-ink tracking-[-0.02em] leading-[1.12]">
          Terms of Use
        </h1>
        <p className="text-[14px] text-muted">
          Last updated: October 26, 2026
        </p>
      </header>

      <div className="space-y-5 font-sans text-[17px] leading-[1.75] text-secondary">
        <p>
          Welcome to <strong className="font-semibold text-ink">Zee Writes</strong>.
          By using this website, you agree to these terms:
        </p>
        <ul className="list-disc pl-6 space-y-2.5">
          <li>
            <strong className="font-semibold text-ink">
              Information only:
            </strong>{" "}
            All guides, tutorials, and articles on Zee Writes are provided for
            general informational purposes only.
          </li>
          <li>
            <strong className="font-semibold text-ink">
              Use at your own risk:
            </strong>{" "}
            System setups vary. You follow any troubleshooting steps, commands,
            or settings changes at your own risk. Always back up your important
            files and data before making changes to your computer or software.
          </li>
          <li>
            <strong className="font-semibold text-ink">Provided as-is:</strong>{" "}
            This site and all of its text tools are provided &ldquo;as-is&rdquo;
            without warranties of any kind. We are not liable for any data loss,
            downtime, or damages arising from the use of this site.
          </li>
          <li>
            <strong className="font-semibold text-ink">Copyright:</strong>{" "}
            Original articles and content on Zee Writes belong to Zee Writes and
            may not be copied or republished without permission. You are free to
            use the output generated from your own text in our text tools.
          </li>
        </ul>
        <p>
          If you have questions about these Terms, contact{" "}
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
