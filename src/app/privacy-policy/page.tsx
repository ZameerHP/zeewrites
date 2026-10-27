import React from "react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Zee Writes",
  description:
    "Privacy Policy for Zee Writes, covering information we collect, browser text tools, cookies, Google AdSense, and your privacy rights.",
  alternates: {
    canonical: "https://zeewrites.com/privacy-policy",
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
          Last updated: October 26, 2026
        </p>
      </header>

      <div className="space-y-8 font-sans text-[17px] leading-[1.75] text-secondary break-words">
        <section className="space-y-2">
          <h2 className="font-sans font-semibold text-[20px] text-ink">
            1. Who we are and how to contact us
          </h2>
          <p>
            <strong className="font-semibold text-ink">Zee Writes</strong> is
            run by Zee and provides guides, tech fixes, and simple text
            tools. You can contact us by email at{" "}
            <a
              href="mailto:zameerpanhwer67@gmail.com"
              className="text-navy font-medium underline underline-offset-4"
            >
              zameerpanhwer67@gmail.com
            </a>{" "}
            or by phone at{" "}
            <a
              href="tel:03353162656"
              className="text-navy font-medium underline underline-offset-4"
            >
              03353162656
            </a>
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
                Information you send through the contact form:
              </strong>{" "}
              When you contact us with your name, email address, subject, and
              message, we use that information only to reply to you.
            </li>
            <li>
              <strong className="font-semibold text-ink">
                Automatic data:
              </strong>{" "}
              When you visit the site, standard technical information such as
              your IP address, browser and device type, referring page, and
              pages visited may be recorded automatically through standard web
              hosting logs.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-sans font-semibold text-[20px] text-ink">
            3. Text tools
          </h2>
          <p>
            All text tools on Zee Writes run fully in your web browser. Text you
            paste into our{" "}
            <Link
              href="/tools"
              className="text-navy font-medium underline underline-offset-4"
            >
              text tools
            </Link>{" "}
            stays in your browser and is not uploaded to or stored by us.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-sans font-semibold text-[20px] text-ink">
            4. Cookies and similar technologies
          </h2>
          <p>
            Cookies and local storage are small pieces of data saved by your web
            browser. We use essential preference storage (specifically{" "}
            <code className="font-mono text-[15px] text-navy">
              localStorage
            </code>
            ) to remember your chosen light or dark theme. Third-party
            advertising partners may also set advertising cookies to show and
            measure ads. You can block or delete cookies at any time in your
            browser settings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-sans font-semibold text-[20px] text-ink">
            5. Advertising (Google AdSense)
          </h2>
          <p>
            We may display advertisements served by{" "}
            <strong className="font-semibold text-ink">Google AdSense</strong>:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Third-party vendors, including Google, use cookies to serve ads
              based on a visitor&apos;s previous visits to this website or other
              websites.
            </li>
            <li>
              Google&apos;s advertising cookies enable Google and its partners
              to serve ads to visitors based on their visits to this site and/or
              other sites on the internet.
            </li>
            <li>
              Visitors can opt out of personalized advertising by visiting{" "}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy font-medium underline underline-offset-4"
              >
                https://adssettings.google.com
              </a>{" "}
              and{" "}
              <a
                href="https://www.aboutads.info"
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy font-medium underline underline-offset-4"
              >
                https://www.aboutads.info
              </a>
              .
            </li>
            <li>
              To learn more about how Google uses data from sites and apps that
              use its services, please visit{" "}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy font-medium underline underline-offset-4"
              >
                https://policies.google.com/technologies/partner-sites
              </a>
              .
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-sans font-semibold text-[20px] text-ink">
            6. Analytics
          </h2>
          <p>We do not use any third-party analytics tools on this website.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-sans font-semibold text-[20px] text-ink">
            7. Third-party links
          </h2>
          <p>
            Our guides may link to external websites or documentation. We are
            not responsible for the content or privacy practices of third-party
            websites.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-sans font-semibold text-[20px] text-ink">
            8. Children
          </h2>
          <p>
            This site is not directed to children under 13, and we do not
            knowingly collect personal data from children under 13.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-sans font-semibold text-[20px] text-ink">
            9. Your rights
          </h2>
          <p>
            Depending on where you live (including under the GDPR/UK GDPR and
            the California CCPA), you have the right to ask to see, correct, or
            delete any personal data we hold about you, and to opt out of
            personalized advertising. You can exercise these rights by emailing
            us at{" "}
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
            10. Retention and security
          </h2>
          <p>
            Contact messages are kept only as long as needed to reply to your
            inquiry. We take reasonable care to protect information sent to us,
            but no method of transmission over the internet or electronic
            storage is 100% secure.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-sans font-semibold text-[20px] text-ink">
            11. Changes to this policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes
            will be posted on this page with an updated date at the top.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-sans font-semibold text-[20px] text-ink">
            12. Contact
          </h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            Zee at{" "}
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
