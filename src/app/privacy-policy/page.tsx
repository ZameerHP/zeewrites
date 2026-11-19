import React from "react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Zee Writes",
  description:
    "Privacy Policy for Zee Writes, covering information we collect, browser text tools, cookies, Google Analytics 4, Google AdSense, and your privacy rights.",
  alternates: {
    canonical: "https://zeewrites.blog/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-[68ch] mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
      <header className="space-y-2 border-b border-hairline pb-6">
        <h1 className="font-sans font-medium text-[clamp(30px,4.5vw,44px)] text-ink tracking-[-0.02em] leading-[1.12]">
          Privacy Policy
        </h1>
        <p className="text-[14px] text-muted">
          Last updated: November 19, 2026
        </p>
      </header>

      <div className="space-y-8 font-sans text-[17px] leading-[1.75] text-secondary break-words">
        <section className="space-y-2">
          <h2 className="font-sans font-semibold text-[20px] text-ink">
            1. Who we are and how to contact us
          </h2>
          <p>
            <strong className="font-semibold text-ink">Zee Writes</strong> (
            <Link
              href="/"
              className="text-navy font-medium underline underline-offset-4"
            >
              https://zeewrites.blog
            </Link>
            ) is an independent technical publication run by Zee that provides
            troubleshooting guides, tutorials, and browser-based text utilities.
            You can contact us by email at{" "}
            <a
              href="mailto:zameerpanhwer67@gmail.com"
              className="text-navy font-medium underline underline-offset-4"
            >
              zameerpanhwer67@gmail.com
            </a>
            , by phone at{" "}
            <a
              href="tel:03353162656"
              className="text-navy font-medium underline underline-offset-4"
            >
              03353162656
            </a>
            , or via our{" "}
            <Link
              href="/contact"
              className="text-navy font-medium underline underline-offset-4"
            >
              Contact page
            </Link>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-sans font-semibold text-[20px] text-ink">
            2. Information we collect
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="font-semibold text-ink">
                Information you submit through the contact form:
              </strong>{" "}
              When you send us a message with your name, email address, topic,
              subject, and message body, we transmit and use that information
              solely to read and reply to your inquiry. We do not sell or share
              your contact details with marketers.
            </li>
            <li>
              <strong className="font-semibold text-ink">
                Automatic technical and usage data:
              </strong>{" "}
              When you visit Zee Writes, standard technical information—such as
              your IP address, browser type, operating system, referring URL,
              pages viewed, and timestamps—is processed automatically by our
              hosting infrastructure (Vercel) and analytics tools to deliver
              pages securely and measure site performance.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-sans font-semibold text-[20px] text-ink">
            3. Browser text tools (100% client-side processing)
          </h2>
          <p>
            All interactive utilities in our{" "}
            <Link
              href="/tools"
              className="text-navy font-medium underline underline-offset-4"
            >
              Text &amp; Developer Tools Suite
            </Link>{" "}
            (including the Smart Case Formatter, Word &amp; Readability
            Analyzer, Invisible Character Fixer, Duplicate Line Scrubber,
            Markdown/HTML Converter, and JSON/Text Diff Validator) execute
            entirely inside your web browser using client-side JavaScript. Text
            or data you paste into any tool stays in your browser&apos;s memory
            and is never transmitted to, logged by, or stored on our servers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-sans font-semibold text-[20px] text-ink">
            4. Cookies and local storage
          </h2>
          <p>
            Cookies and browser{" "}
            <code className="font-mono text-[15px] text-navy">
              localStorage
            </code>{" "}
            are small data records saved by your browser:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="font-semibold text-ink">
                Essential preferences:
              </strong>{" "}
              We use browser storage to remember basic interface settings.
            </li>
            <li>
              <strong className="font-semibold text-ink">
                Analytics cookies:
              </strong>{" "}
              Google Analytics sets first-party cookies (such as{" "}
              <code className="font-mono text-[14px] text-navy">_ga</code>) to
              distinguish unique visitors and understand which guides are
              helpful.
            </li>
            <li>
              <strong className="font-semibold text-ink">
                Advertising cookies:
              </strong>{" "}
              Google AdSense and its partners may set cookies to display
              relevant ads, limit how often an ad is shown, and measure ad
              effectiveness.
            </li>
          </ul>
          <p>
            You can block, restrict, or delete cookies at any time through your
            browser settings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-sans font-semibold text-[20px] text-ink">
            5. Advertising (Google AdSense)
          </h2>
          <p>
            We use <strong className="font-semibold text-ink">Google AdSense</strong>{" "}
            to display advertisements on Zee Writes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Third-party vendors, including Google, use cookies to serve ads
              based on a visitor&apos;s prior visits to this website or other
              websites on the internet.
            </li>
            <li>
              Google&apos;s use of advertising cookies enables Google and its
              partners to serve ads to visitors based on their visit to Zee
              Writes and/or other sites on the internet.
            </li>
            <li>
              Visitors may opt out of personalized advertising at any time by
              visiting{" "}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy font-medium underline underline-offset-4"
              >
                Google Ads Settings (adssettings.google.com)
              </a>{" "}
              or{" "}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy font-medium underline underline-offset-4"
              >
                www.aboutads.info
              </a>
              .
            </li>
            <li>
              To learn more about how Google collects and processes data when
              you visit partner sites, please read{" "}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy font-medium underline underline-offset-4"
              >
                How Google uses information from sites or apps that use our
                services
              </a>
              .
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-sans font-semibold text-[20px] text-ink">
            6. Analytics (Google Analytics 4)
          </h2>
          <p>
            We use{" "}
            <strong className="font-semibold text-ink">
              Google Analytics 4 (GA4)
            </strong>{" "}
            ( via Google&apos;s official{" "}
            <code className="font-mono text-[14px] text-navy">gtag.js</code>{" "}
            script) to understand aggregate website traffic, such as which
            articles are read most often, how long visitors stay on a page, and
            general device categories (desktop or mobile).
          </p>
          <p>
            Google Analytics 4 does not log or store individual IP addresses for
            reporting, and we do not combine analytics metrics with personally
            identifiable information. You can prevent your data from being used
            by Google Analytics by blocking cookies in your browser or by
            installing the official{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy font-medium underline underline-offset-4"
            >
              Google Analytics Opt-out Browser Add-on
            </a>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-sans font-semibold text-[20px] text-ink">
            7. Third-party links
          </h2>
          <p>
            Our articles link to official software documentation, repositories,
            and external websites for reference. We do not control and are not
            responsible for the content or privacy practices of third-party
            websites.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-sans font-semibold text-[20px] text-ink">
            8. Children&apos;s privacy
          </h2>
          <p>
            This website is not directed to children under 13, and we do not
            knowingly collect personal information from children under 13.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-sans font-semibold text-[20px] text-ink">
            9. Your privacy rights (GDPR, UK GDPR &amp; CCPA)
          </h2>
          <p>
            Depending on your jurisdiction (including under the European
            Union/UK GDPR and the California CCPA/CPRA), you have the right to
            request access to, correction of, or deletion of any personal data
            we hold about you, as well as the right to withdraw consent or opt
            out of personalized advertising. To exercise any of these rights,
            email{" "}
            <a
              href="mailto:zameerpanhwer67@gmail.com"
              className="text-navy font-medium underline underline-offset-4"
            >
              zameerpanhwer67@gmail.com
            </a>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-sans font-semibold text-[20px] text-ink">
            10. Data retention and security
          </h2>
          <p>
            Messages submitted via our contact form are retained only as long as
            necessary to respond to your inquiry. We use HTTPS/TLS encryption
            across the entire website and restrict administrative access, though
            no method of transmission over the internet is 100% immune to risk.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-sans font-semibold text-[20px] text-ink">
            11. Changes to this policy
          </h2>
          <p>
            We may update this Privacy Policy periodically to reflect technical
            or legal changes. Any updates will be published on this page with a
            revised &ldquo;Last updated&rdquo; date at the top.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-sans font-semibold text-[20px] text-ink">
            12. Contact
          </h2>
          <p>
            If you have questions about this Privacy Policy, please contact Zee
            at{" "}
            <a
              href="mailto:zameerpanhwer67@gmail.com"
              className="text-navy font-medium underline underline-offset-4"
            >
              zameerpanhwer67@gmail.com
            </a>{" "}
            or{" "}
            <a
              href="tel:03353162656"
              className="text-navy font-medium underline underline-offset-4"
            >
              03353162656
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
