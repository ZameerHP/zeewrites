import { ArticleBlock, ParsedArticleResult, TableOfContentsItem } from "./types";
import {
  isChatGptArtifact,
  isStandaloneLanguageLabel,
  scoreLineAsCode,
  detectLanguage,
  enrichInlineCode,
  normalizeLanguageLabel,
} from "./code-detector";
import { hasRichHtmlStructure, parseHtmlToMarkdown } from "./html-parser";

/**
 * Clean text of invisible zero-width characters and normalize spaces.
 */
function cleanRawText(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u200B\u200C\u200D\uFEFF\u2060]/g, "") // Zero-width spaces
    .replace(/\u00A0/g, " ") // Non-breaking space
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

/**
 * Generate a clean kebab-case slug from a title string.
 */
export function slugifyText(text: string): string {
  const clean = text
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (clean.length <= 80) return clean;
  const truncated = clean.slice(0, 80);
  const lastHyphen = truncated.lastIndexOf("-");
  return (lastHyphen > 30 ? truncated.slice(0, lastHyphen) : truncated).replace(/^-+|-+$/g, "");
}

/**
 * Fix straight quotes to proper curly quotes, avoiding code/tags.
 */
function toCurlyQuotes(text: string): string {
  // Replace quotes safely avoiding backticked segments
  const parts = text.split(/(`[^`]+`)/g);
  return parts
    .map((p) => {
      if (p.startsWith("`")) return p;
      return p
        // Double quotes
        .replace(/(^|[\s(\[{<])"/g, "$1“")
        .replace(/"/g, "”")
        // Single quotes / apostrophes
        .replace(/([a-zA-Z])'([a-zA-Z])/g, "$1’$2")
        .replace(/(^|[\s(\[{<])'/g, "$1‘")
        .replace(/'/g, "’");
    })
    .join("");
}

/**
 * Check if a line is a title-case, ALL-CAPS, or colon-terminated heading candidate.
 */
function isStandaloneHeadingCandidate(line: string, prevBlank: boolean, nextBlank: boolean): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 85) return false;

  // Never treat commands / code as headings
  if (scoreLineAsCode(trimmed).score >= 7) return false;

  // A standalone heading must have a blank line before it, and either a blank line after it or end with a colon
  if (!prevBlank) return false;
  if (!nextBlank && !/:$/.test(trimmed)) return false;

  // Never treat lists or quotes as heading candidates
  if (/^[-*•–>|`#]/.test(trimmed)) return false;
  if (/^\d+[\.\)]\s+/.test(trimmed)) {
    // Numbered line: check if it's "Step 1: ...", "Fix 2: ...", "Method 1: ..."
    return /^(Step|Fix|Method|Part|Phase|Stage|Way|Tip|Rule)\s+\d+[:\s]/i.test(trimmed);
  }

  // If ends with a period, usually a normal sentence
  if (/\.$/.test(trimmed)) return false;

  // Bold-only line: e.g. **Heading**
  if (/^\*\*[^*]+\*\*$/.test(trimmed) || /^<b>[^<]+<\/b>$/i.test(trimmed)) {
    return true;
  }

  // ALL CAPS: e.g. "OVERVIEW", "KEY TAKEAWAYS"
  if (/^[A-Z0-9\s\-:–—]{4,60}$/.test(trimmed) && /[A-Z]/.test(trimmed)) {
    return true;
  }

  // Step / Fix prefixes: e.g. "Step 1: Open Terminal", "Method A: Reinstall Driver"
  if (/^(Step|Fix|Method|Part|Option|Way|Phase)\s+[A-Za-z0-9]+[:\s]/i.test(trimmed)) {
    return true;
  }

  const words = trimmed.split(/\s+/);

  // Never treat introductory sentences (even with colons) as headings
  if (/^(there\s+(are|is)|here\s+(is|are)|below\s+(is|are)|in\s+this|for\s+example|note\s+that|please\s+note|make\s+sure|you\s+can|we\s+can|to\s+do\s+this)\b/i.test(trimmed)) {
    return false;
  }

  // Ends with a colon: only if short phrase (<= 5 words) without linking verbs
  if (/:$/.test(trimmed)) {
    if (words.length <= 5 && !/\b(are|is|were|was|can|will|should|have|has|could|to)\b/i.test(trimmed)) {
      return true;
    }
    return false;
  }

  // Title Case check: at least 2 words, words capitalized ignoring minor prepositions/articles
  const MINOR_WORDS = new Set(["a", "an", "the", "in", "on", "at", "to", "for", "with", "from", "by", "and", "or", "but", "nor", "of", "as", "is", "into"]);
  if (words.length >= 2 && words.length <= 15) {
    if (/^[A-Z0-9]/.test(words[0])) {
      const nonMinorWords = words.filter((w) => !MINOR_WORDS.has(w.toLowerCase()));
      const capCount = nonMinorWords.filter((w) => /^[A-Z0-9]/.test(w)).length;
      if (nonMinorWords.length > 0 && capCount / nonMinorWords.length >= 0.6) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Extract Callout / Highlight box info from text.
 * Auto-detects lines starting with:
 * - Highlight: / Key Takeaway: / Takeaway: / TL;DR: / Remember: / Core Concept: / Key Point:
 * - Tip: / Note: / Warning: / Important: / Pro-Tip: / Caution:
 * With or without markdown bold asterisks `**...**` or blockquote `>`.
 */
function extractCallout(text: string): { type: "tip" | "note" | "warning" | "important" | "highlight"; title: string; body: string } | null {
  const m = text.match(/^(?:>\s*)?(?:\*\*)?(Note|Tip|Warning|Important|Pro-Tip|Caution|Highlight|Key Takeaway|Takeaway|TL;DR|Remember|Core Concept|Key Point)(?:\*\*)?\s*[:\-]\s*(.+)$/i);
  if (!m) return null;

  const rawKind = m[1].toLowerCase();
  let type: "tip" | "note" | "warning" | "important" | "highlight" = "tip";
  let title = "Tip";

  if (rawKind === "warning" || rawKind === "caution") {
    type = "warning";
    title = "Warning";
  } else if (rawKind === "note") {
    type = "note";
    title = "Note";
  } else if (rawKind === "important") {
    type = "important";
    title = "Important";
  } else if (
    rawKind === "highlight" ||
    rawKind === "key takeaway" ||
    rawKind === "takeaway" ||
    rawKind === "tl;dr" ||
    rawKind === "remember" ||
    rawKind === "core concept" ||
    rawKind === "key point"
  ) {
    type = "highlight";
    title =
      rawKind === "tl;dr"
        ? "TL;DR"
        : rawKind === "remember"
        ? "Remember"
        : rawKind === "highlight"
        ? "Highlight"
        : "Key Takeaway";
  } else {
    type = "tip";
    title = "Pro Tip";
  }

  return { type, title, body: m[2].trim() };
}

/**
 * Pure parsing function: converts raw text (and optional HTML) into structured blocks.
 */
export function parseArticle(rawText: string, optionalHtml?: string): ParsedArticleResult {
  let sourceText = rawText || "";

  // If rich HTML is present and has structure, prioritize HTML structure
  if (optionalHtml && hasRichHtmlStructure(optionalHtml)) {
    const mdFromHtml = parseHtmlToMarkdown(optionalHtml);
    if (mdFromHtml.length > 50) {
      sourceText = mdFromHtml;
    }
  }

  const cleaned = cleanRawText(sourceText);
  const rawLines = cleaned.split("\n");

  // Step 1: Pre-process lines (clean ChatGPT artifacts)
  const filteredLines: string[] = [];
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (isChatGptArtifact(line)) {
      continue; // drop "Copy code", "Copy"
    }
    // Drop standalone language label if next line is a code fence
    if (isStandaloneLanguageLabel(line) && i + 1 < rawLines.length && rawLines[i + 1].trim().startsWith("```")) {
      continue;
    }
    filteredLines.push(line);
  }

  const blocks: ArticleBlock[] = [];
  let blockIdx = 1;
  const nextId = (prefix: string) => `${prefix}-${blockIdx++}`;

  let detectedTitle: string | undefined;
  let firstParagraphForExcerpt: string | undefined;

  let i = 0;
  while (i < filteredLines.length) {
    const rawLine = filteredLines[i];
    const trimmed = rawLine.trim();

    // Blank line
    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Horizontal Rule
    if (/^(---|___|\*\*\*)$/.test(trimmed)) {
      blocks.push({
        id: nextId("div"),
        type: "divider",
        confidence: "high",
      });
      i++;
      continue;
    }

    // 2. Fenced Code Block
    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      const fence = trimmed.slice(0, 3);
      const rawLang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;

      while (i < filteredLines.length) {
        const cur = filteredLines[i];
        if (cur.trim().startsWith(fence)) {
          i++;
          break;
        }
        codeLines.push(cur);
        i++;
      }

      const fullCode = codeLines.join("\n");
      const lang = normalizeLanguageLabel(rawLang) || detectLanguage(fullCode);

      blocks.push({
        id: nextId("code"),
        type: "code",
        language: lang,
        code: fullCode,
        confidence: "high",
        raw: fullCode,
      });
      continue;
    }

    // 3. Underline Headings (=== or ---)
    if (i + 1 < filteredLines.length) {
      const nextTrimmed = filteredLines[i + 1].trim();
      if (/^={3,}$/.test(nextTrimmed)) {
        const hText = trimmed.replace(/^#+\s*/, "").replace(/[:\s]+$/, "");
        if (!detectedTitle && blocks.length === 0) {
          detectedTitle = hText;
        } else {
          blocks.push({
            id: nextId("h2"),
            type: "heading",
            level: 2,
            text: hText,
            confidence: "high",
          });
        }
        i += 2;
        continue;
      } else if (/^-{3,}$/.test(nextTrimmed) && trimmed.length < 80 && !/^[-*•|]/.test(trimmed)) {
        const hText = trimmed.replace(/^#+\s*/, "").replace(/[:\s]+$/, "");
        blocks.push({
          id: nextId("h3"),
          type: "heading",
          level: 3,
          text: hText,
          confidence: "high",
        });
        i += 2;
        continue;
      }
    }

    // 4. Markdown Headings (#, ##, ###, ####)
    const mdHeadingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (mdHeadingMatch) {
      const rawLevel = mdHeadingMatch[1].length;
      let hText = mdHeadingMatch[2].trim().replace(/[:\s]+$/, "");
      // Remove trailing Markdown hashes if present
      hText = hText.replace(/\s+#+$/, "");

      if (rawLevel === 1 && !detectedTitle && blocks.length === 0) {
        detectedTitle = hText;
      } else {
        // In body, never use H1: promote level 1 to H2, level 2 to H2, level 3 to H3, 4+ to H4
        const targetLevel: 2 | 3 | 4 = rawLevel === 1 || rawLevel === 2 ? 2 : rawLevel === 3 ? 3 : 4;
        blocks.push({
          id: nextId(`h${targetLevel}`),
          type: "heading",
          level: targetLevel,
          text: hText,
          confidence: "high",
        });
      }
      i++;
      continue;
    }

    // 5. Callouts & Highlights (Highlight:, Key Takeaway:, Tip:, Note:, Warning:, Important:)
    const callout = extractCallout(trimmed);
    if (callout) {
      blocks.push({
        id: nextId("callout"),
        type: "callout",
        calloutType: callout.type,
        title: callout.title,
        body: enrichInlineCode(toCurlyQuotes(callout.body)),
        confidence: "high",
      });
      i++;
      continue;
    }

    // 6. Standalone Heading Candidate (Title Case, Step prefix, or bold-only line)
    const prevBlank = i === 0 || filteredLines[i - 1].trim() === "";
    const nextBlank = i + 1 >= filteredLines.length || filteredLines[i + 1].trim() === "";

    if (isStandaloneHeadingCandidate(trimmed, prevBlank, nextBlank)) {
      let hText = trimmed
        .replace(/^\*\*(.+)\*\*$/, "$1")
        .replace(/^<b>(.+)<\/b>$/i, "$1")
        .replace(/[:\s]+$/, "");

      if (!detectedTitle && blocks.length === 0) {
        detectedTitle = hText;
      } else {
        // Steps, sub-methods, or numbered decimals default to H3 (Subheading);
        // Major topics, title case sections, ALL CAPS headings, and bold lines default to H2 (Big Header)!
        const isSub = /^(Step|Method|Fix|Option|Part)\s+\d+[:\s]/i.test(hText) || /^\d+\.\d+\s+/.test(hText);
        const level: 2 | 3 = isSub ? 3 : 2;

        blocks.push({
          id: nextId(`h${level}`),
          type: "heading",
          level,
          text: hText,
          confidence: "high",
        });
      }
      i++;
      continue;
    }

    // 7. Markdown Pipe Table
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableLines: string[] = [];
      while (i < filteredLines.length && filteredLines[i].trim().startsWith("|") && filteredLines[i].trim().endsWith("|")) {
        tableLines.push(filteredLines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const parseCells = (line: string) =>
          line
            .slice(1, -1)
            .split("|")
            .map((c) => c.trim());

        const headers = parseCells(tableLines[0]);
        const startRow = tableLines[1].includes("---") ? 2 : 1;
        const rows: string[][] = [];

        for (let r = startRow; r < tableLines.length; r++) {
          rows.push(parseCells(tableLines[r]));
        }

        blocks.push({
          id: nextId("table"),
          type: "table",
          headers,
          rows,
          confidence: "high",
        });
        continue;
      }
    }

    // 8. Bullet or Numbered Lists
    const isBulletItem = /^[-*•–✔✓]\s+/.test(trimmed);
    const isNumberedItem = /^\d+[\.\)]\s+/.test(trimmed);

    if (isBulletItem || isNumberedItem) {
      const items: string[] = [];
      const ordered = isNumberedItem;

      while (i < filteredLines.length) {
        const cur = filteredLines[i];
        const curTrim = cur.trim();
        if (!curTrim) {
          // If followed by another list item, continue list; otherwise end
          if (i + 1 < filteredLines.length && /^([-*•–✔✓]|\d+[\.\)])\s+/.test(filteredLines[i + 1].trim())) {
            i++;
            continue;
          }
          break;
        }

        const match = curTrim.match(/^([-*•–✔✓]|\d+[\.\)])\s+(.+)$/);
        if (match) {
          items.push(enrichInlineCode(toCurlyQuotes(match[2])));
          i++;
        } else if (/^\s{2,}/.test(cur) && items.length > 0) {
          // Indented continuation of list item
          items[items.length - 1] += " " + curTrim;
          i++;
        } else {
          break;
        }
      }

      blocks.push({
        id: nextId("list"),
        type: "list",
        items,
        ordered,
        confidence: "high",
      });
      continue;
    }

    // 9. Blockquotes (> ...)
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < filteredLines.length && filteredLines[i].trim().startsWith(">")) {
        quoteLines.push(filteredLines[i].trim().replace(/^>\s*/, ""));
        i++;
      }

      const fullQuote = quoteLines.join(" ");
      blocks.push({
        id: nextId("quote"),
        type: "quote",
        text: toCurlyQuotes(fullQuote),
        confidence: "high",
      });
      continue;
    }

    // 10. Smart Detection for Unfenced Code
    const lineScore = scoreLineAsCode(rawLine);
    if (lineScore.score >= 7) {
      const codeLines: string[] = [];
      let totalScore = 0;

      while (i < filteredLines.length) {
        const cur = filteredLines[i];
        const curScore = scoreLineAsCode(cur);
        // If blank line in code, lookahead
        if (!cur.trim()) {
          if (i + 1 < filteredLines.length && scoreLineAsCode(filteredLines[i + 1]).score >= 5) {
            codeLines.push(cur);
            i++;
            continue;
          }
          break;
        }

        if (curScore.score >= 3) {
          codeLines.push(cur);
          totalScore += curScore.score;
          i++;
        } else {
          break;
        }
      }

      if (codeLines.length > 0 && (codeLines.length >= 2 || totalScore >= 8)) {
        const fullCode = codeLines.join("\n");
        const lang = lineScore.hintLang || detectLanguage(fullCode);
        blocks.push({
          id: nextId("code"),
          type: "code",
          language: lang,
          code: fullCode,
          confidence: totalScore >= 12 ? "high" : "low",
          raw: fullCode,
        });
        continue;
      }
    }

    // 11. Normal Paragraph (Join hard-wrapped lines)
    const paragraphLines: string[] = [];
    while (i < filteredLines.length) {
      const cur = filteredLines[i];
      const curTrim = cur.trim();
      if (!curTrim) {
        i++;
        break;
      }

      // Stop if next line is a heading, list, quote, code, table, or callout
      if (
        /^#{1,6}\s+/.test(curTrim) ||
        /^[-*•–✔✓]\s+/.test(curTrim) ||
        /^\d+[\.\)]\s+/.test(curTrim) ||
        curTrim.startsWith(">") ||
        curTrim.startsWith("```") ||
        (curTrim.startsWith("|") && curTrim.endsWith("|")) ||
        extractCallout(curTrim) ||
        isStandaloneHeadingCandidate(curTrim, false, true)
      ) {
        break;
      }

      paragraphLines.push(curTrim);
      i++;
    }

    if (paragraphLines.length > 0) {
      const joined = paragraphLines.join(" ");
      const enriched = enrichInlineCode(toCurlyQuotes(joined));

      if (!firstParagraphForExcerpt) {
        firstParagraphForExcerpt = enriched;
      }

      blocks.push({
        id: nextId("p"),
        type: "paragraph",
        text: enriched,
        confidence: "high",
        raw: joined,
      });
    } else {
      // Safety advance to guarantee no infinite loop
      i++;
    }
  }

  // Calculate metadata
  const fullTextForCount = blocks
    .map((b) => b.text || b.code || (b.items ? b.items.join(" ") : "") || b.body || "")
    .join(" ");
  const wordCount = fullTextForCount
    .trim()
    .split(/\s+/)
    .filter((w) => Boolean(w) && !/^[#>`*|\-]+$/.test(w)).length;

  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Table of contents from headings
  const tableOfContents: TableOfContentsItem[] = blocks
    .filter((b) => b.type === "heading" && (b.level === 2 || b.level === 3))
    .map((b) => ({
      id: slugifyText(b.text || "section"),
      title: b.text || "Section",
      level: b.level || 2,
    }));

  // Clean excerpt trimmed to ~150-155 characters at word boundary
  let excerpt: string | undefined;
  if (firstParagraphForExcerpt) {
    const cleanExcerpt = firstParagraphForExcerpt.replace(/[`*_[\]]/g, "").trim();
    if (cleanExcerpt.length <= 155) {
      excerpt = cleanExcerpt;
    } else {
      const truncated = cleanExcerpt.slice(0, 155);
      const lastSpace = truncated.lastIndexOf(" ");
      excerpt = (lastSpace > 100 ? truncated.slice(0, lastSpace) : truncated).trim() + "...";
    }
  }

  return {
    title: detectedTitle,
    slug: detectedTitle ? slugifyText(detectedTitle) : undefined,
    excerpt,
    readingTimeMinutes,
    wordCount,
    tableOfContents,
    blocks,
    rawText,
  };
}
