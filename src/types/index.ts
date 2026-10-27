export type CategorySlug =
  | "how-to-fixes"
  | "text-guides"
  | "solutions"
  | "tutorials"
  | "tools";

export interface CategoryInfo {
  slug: CategorySlug;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  badgeColor: string;
  iconName: string;
}

export interface ArticleImage {
  url: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  diagramType?:
    | "utf8-pipeline"
    | "ssl-handshake"
    | "pdf-normalization"
    | "hidden-chars-ast"
    | "cwv-timeline"
    | "regex-nfa"
    | "browser-memory"
    | "markdown-ast"
    | "git-crlf"
    | "json-schema"
    | "custom-upload";
}

export interface ArticleHowToStep {
  stepNumber: number;
  name: string;
  text: string;
  commandOrCode?: string;
  proTip?: string;
}

export interface ArticleFAQ {
  question: string;
  answer: string;
}

export interface ArticleCallout {
  type: "verified-fix" | "warning" | "pro-tip";
  title: string;
  body: string;
}

export interface ArticleTable {
  caption: string;
  headers: string[];
  rows: string[][];
}

export interface ArticleSection {
  id: string;
  heading: string;
  subheadings?: {
    id: string;
    title: string;
    paragraphs: string[];
    codeBlock?: {
      language: string;
      filename?: string;
      code: string;
    };
  }[];
  paragraphs: string[];
  callout?: ArticleCallout;
  codeBlock?: {
    language: string;
    filename?: string;
    code: string;
  };
  table?: ArticleTable;
  inlineImage?: ArticleImage;
}

export interface AuthorProfile {
  name: string;
  role: string;
  credentials: string;
  bio: string;
  avatarInitials: string;
  yearsExperience: number;
  verifiedFixesPublished: number;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  category: CategorySlug;
  publishedAt: string;
  updatedAt: string;
  testedOn: string;
  readingTimeMinutes: number;
  wordCount: number;
  featured: boolean;
  status: "published" | "draft";
  primaryKeyword: string;
  metaTitle: string;
  metaDescription: string;
  coverImage: ArticleImage;
  verifiedTakeaway: {
    symptom: string;
    rootCause: string;
    instantFix: string;
    estimatedFixTime: string;
    testedPlatforms: string[];
  };
  howToSteps: ArticleHowToStep[];
  sections: ArticleSection[];
  rawMarkdown?: string;
  faqs: ArticleFAQ[];
  author: AuthorProfile;
  tags: string[];
  relatedSlugs: string[];
  helpfulYes: number;
  helpfulNo: number;
}

export type ToolSlug =
  | "smart-case-formatter"
  | "word-counter-analyzer"
  | "invisible-character-fixer"
  | "duplicate-line-scrubber"
  | "markdown-html-converter"
  | "json-text-diff-validator";

export interface ToolGuideSection {
  id: string;
  heading: string;
  paragraphs: string[];
  codeExample?: string;
  bulletPoints?: string[];
}

export interface TextToolDefinition {
  id: string;
  slug: ToolSlug;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  badge: string;
  accentColor: string;
  features: string[];
  guideTitle: string;
  guideSubtitle: string;
  guideWordCount: number;
  guideSections: ToolGuideSection[];
  formulaBox: {
    title: string;
    formula: string;
    explanation: string;
  };
  useCases: {
    role: string;
    scenario: string;
    outcome: string;
  }[];
  comparisonTable: {
    caption: string;
    headers: string[];
    rows: string[][];
  };
  faqs: ArticleFAQ[];
}

export interface SiteSettings {
  siteName: string;
  siteUrl: string;
  contactEmail: string;
  publisherId: string;
  adsenseMode: "verification" | "preview" | "off";
  adsTxtContent: string;
  gscVerification: string;
  ga4Id: string;
  cookieBannerEnabled: boolean;
  updatedAt: string;
}

export interface SeoCheckItem {
  id: string;
  label: string;
  passed: boolean;
  points: number;
  maxPoints: number;
  hint: string;
}
