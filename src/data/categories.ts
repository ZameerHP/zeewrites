import { AuthorProfile, CategoryInfo, CategorySlug, SiteSettings } from "@/types";

export const DEFAULT_AUTHOR: AuthorProfile = {
  name: "Zee",
  role: "",
  credentials: "",
  bio: "Zee writes the guides and maintains the text tools on Zee Writes.",
  avatarInitials: "Z",
  yearsExperience: 0,
  verifiedFixesPublished: 0,
};

export const CATEGORIES: Record<CategorySlug, CategoryInfo> = {
  "how-to-fixes": {
    slug: "how-to-fixes",
    name: "How-To & Tech Fixes",
    shortName: "How-To Fixes",
    tagline: "Step-by-step OS, browser, network and software error guides.",
    description:
      "Practical troubleshooting guides, terminal commands, SSL/DNS network fixes, and browser performance tips.",
    seoTitle: "How-To & Tech Fixes — OS, Browser & Network Guides | Zee Writes",
    seoDescription:
      "Step-by-step technical fixes, SSL/DNS troubleshooting guides, browser RAM optimization tips, and OS error guides on Zee Writes.",
    badgeColor: "emerald",
    iconName: "Wrench",
  },
  "text-guides": {
    slug: "text-guides",
    name: "Text & Productivity Guides",
    shortName: "Text Guides",
    tagline: "Unicode encoding, regex patterns, Markdown and text formatting.",
    description:
      "Guides on fixing UTF-8 mojibake corruption, cleaning copied PDF text, writing regular expressions, and formatting Markdown.",
    seoTitle: "Text & Productivity Guides — Encoding, Markdown & Regex | Zee Writes",
    seoDescription:
      "Guides on UTF-8 text encoding, regular expressions, PDF line-break cleanup, and Markdown formatting on Zee Writes.",
    badgeColor: "indigo",
    iconName: "FileText",
  },
  solutions: {
    slug: "solutions",
    name: "Digital Solutions & Deep Dives",
    shortName: "Solutions",
    tagline: "Web performance, code sanitization and JSON validation guides.",
    description:
      "Articles covering Core Web Vitals optimization, code text sanitization, and JSON validation.",
    seoTitle: "Digital Solutions & Technical Guides | Zee Writes",
    seoDescription:
      "Articles on Core Web Vitals optimization, code sanitization, JSON validation, and developer workflows on Zee Writes.",
    badgeColor: "violet",
    iconName: "Layers",
  },
  tutorials: {
    slug: "tutorials",
    name: "Tutorials",
    shortName: "Tutorials",
    tagline: "Beginner-friendly walkthroughs that teach a skill from start to finish.",
    description:
      "Longer step-by-step tutorials that walk through a complete task, written in plain language.",
    seoTitle: "Tutorials — Step-by-Step Walkthroughs | Zee Writes",
    seoDescription:
      "Plain-language, step-by-step tutorials on computers, browsers, text and everyday software on Zee Writes.",
    badgeColor: "sky",
    iconName: "BookOpen",
  },
  tools: {
    slug: "tools",
    name: "Text Tools",
    shortName: "Text Tools",
    tagline: "Simple browser-based text formatting, cleanup and diff utilities.",
    description:
      "Browser-based text utilities for case conversion, word counting, invisible character removal, line deduplication, Markdown conversion, and JSON/text diffing.",
    seoTitle: "Text Tools — Case Converter, Word Counter, Encoding Fixer & Diff | Zee Writes",
    seoDescription:
      "Simple browser-based text tools: Smart Case Converter, Word Counter, Invisible Character Fixer, Duplicate Line Scrubber, Markdown Converter, and JSON/Text Diff.",
    badgeColor: "amber",
    iconName: "FileCode2",
  },
};

// Only categories that have articles
export const CATEGORY_LIST: CategoryInfo[] = [
  CATEGORIES["how-to-fixes"],
  CATEGORIES["text-guides"],
  CATEGORIES["solutions"],
  CATEGORIES["tutorials"],
];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: "Zee Writes",
  siteUrl: "https://zeewrites.com",
  contactEmail: "zameerpanhwer67@gmail.com",
  publisherId: "",
  adsenseMode: "verification",
  adsTxtContent: "",
  gscVerification: "",
  ga4Id: "",
  cookieBannerEnabled: false,
  updatedAt: "2026-10-26T09:00:00Z",
};
