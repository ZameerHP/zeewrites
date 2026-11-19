import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TEXT_TOOLS } from "@/data/tools";
import { DEFAULT_SITE_SETTINGS } from "@/data/categories";
import { generateToolJsonLd } from "@/lib/schema";
import { TextToolWorkspace } from "@/components/tools/TextToolWorkspace";
import { ToolDocumentationSection } from "@/components/tools/ToolDocumentationSection";

interface ToolPageProps {
  params: Promise<{ slug: string }>;
}

function findToolBySlug(slug: string) {
  if (slug === "word-counter-readability-analyzer") {
    return TEXT_TOOLS.find((t) => t.slug === "word-counter-analyzer");
  }
  return TEXT_TOOLS.find((t) => t.slug === slug);
}

export async function generateStaticParams() {
  return TEXT_TOOLS.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params,
}: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = findToolBySlug(slug);

  if (!tool) {
    return {
      title: "Tool Not Found | Zee Writes",
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = `https://zeewrites.blog/tools/${tool.slug}`;

  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    keywords: [
      tool.name,
      tool.shortName,
      "Zee Writes text tools",
      "browser developer utilities",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: tool.metaTitle,
      description: tool.metaDescription,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: tool.metaTitle,
      description: tool.metaDescription,
    },
  };
}

export default async function ToolSlugPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = findToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const jsonLd = generateToolJsonLd(tool, DEFAULT_SITE_SETTINGS);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back Link */}
      <div>
        <Link
          href="/tools"
          prefetch={true}
          className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-full bg-surface text-secondary hover:text-ink border border-hairline shadow-1 text-[14px] font-medium transition-all"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          <span>Back to All Text Tools</span>
        </Link>
      </div>

      {/* Tool Header */}
      <header className="max-w-[820px] space-y-4">
        <div className="inline-flex items-center gap-2 h-[32px] px-[14px] rounded-full bg-badge-bg text-badge-text text-[13px] font-medium">
          <span className="w-[6px] h-[6px] rounded-full bg-badge-dot" />
          <span>{tool.badge} &middot; 100% Client-Side</span>
        </div>

        <h1 className="font-sans font-medium text-[clamp(30px,4.5vw,46px)] text-ink tracking-[-0.02em] leading-[1.12]">
          {tool.name}
        </h1>

        <p className="text-[18px] text-secondary leading-[1.6]">
          {tool.description}
        </p>
      </header>

      {/* Interactive Workspace */}
      <TextToolWorkspace slug={tool.slug} />

      {/* Deep Technical Documentation, Formula, Comparison Table & FAQs */}
      <ToolDocumentationSection tool={tool} />
    </div>
  );
}
