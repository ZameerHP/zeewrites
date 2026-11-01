export type ArticleBlockType =
  | "heading"
  | "paragraph"
  | "code"
  | "list"
  | "quote"
  | "callout"
  | "table"
  | "divider";

export interface ArticleBlock {
  id: string;
  type: ArticleBlockType;
  level?: 1 | 2 | 3 | 4;
  text?: string;
  language?: string;
  code?: string;
  items?: string[];
  ordered?: boolean;
  calloutType?: "tip" | "note" | "warning" | "important";
  title?: string;
  body?: string;
  headers?: string[];
  rows?: string[][];
  confidence?: "high" | "low";
  raw?: string;
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
}

export interface ParsedArticleResult {
  title?: string;
  slug?: string;
  excerpt?: string;
  readingTimeMinutes: number;
  wordCount: number;
  tableOfContents: TableOfContentsItem[];
  blocks: ArticleBlock[];
  rawText: string;
}
