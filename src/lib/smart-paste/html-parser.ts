import { ArticleBlock } from "./types";
import { normalizeLanguageLabel } from "./code-detector";

let domPurifyInstance: any = null;

/**
 * Sanitize untrusted HTML safely in browser, with Node/SSR fallback.
 */
export function sanitizeHtml(dirtyHtml: string): string {
  if (typeof window === "undefined") {
    // Basic safety in SSR / Node.js
    return dirtyHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  }
  if (!domPurifyInstance) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const DOMPurify = require("dompurify");
      domPurifyInstance = DOMPurify.default || DOMPurify;
    } catch {
      return dirtyHtml;
    }
  }
  return domPurifyInstance.sanitize(dirtyHtml, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "rel"],
  });
}

/**
 * Check if a pasted HTML string has meaningful structure (e.g., from Word, Google Docs, Notion, web)
 */
export function hasRichHtmlStructure(html: string): boolean {
  if (!html || typeof html !== "string") return false;
  return /<(h[1-6]|table|pre|code|ul|ol|blockquote|p\b|div\b)/i.test(html);
}

/**
 * Parse structured HTML elements into clean Markdown text.
 */
export function parseHtmlToMarkdown(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== "string") return "";

  const clean = sanitizeHtml(rawHtml);
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    // Node.js / SSR regex-based converter
    return fallbackHtmlToMarkdown(clean);
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(clean, "text/html");
    const body = doc.body;
    if (!body) return fallbackHtmlToMarkdown(clean);

    return nodeToMarkdown(body).trim();
  } catch {
    return fallbackHtmlToMarkdown(clean);
  }
}

function nodeToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || "";
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();

  // Headings
  if (/^h[1-6]$/.test(tag)) {
    const level = parseInt(tag[1], 10);
    const hashes = "#".repeat(level);
    const text = getInlineMarkdown(el).trim();
    return `\n\n${hashes} ${text}\n\n`;
  }

  // Preformatted Code
  if (tag === "pre") {
    const codeEl = el.querySelector("code") || el;
    const text = codeEl.textContent || "";
    const classAttr = el.getAttribute("class") || codeEl.getAttribute("class") || "";
    const langMatch = classAttr.match(/language-([a-z0-9_-]+)/i);
    const lang = langMatch ? normalizeLanguageLabel(langMatch[1]) : "";
    return `\n\n\`\`\`${lang}\n${text.replace(/\r\n/g, "\n")}\n\`\`\`\n\n`;
  }

  // Paragraphs & Divs
  if (tag === "p" || tag === "div") {
    const text = getInlineMarkdown(el).trim();
    if (!text) return "";
    return `\n\n${text}\n\n`;
  }

  // Blockquotes
  if (tag === "blockquote") {
    const text = getInlineMarkdown(el).trim();
    return `\n\n> ${text.replace(/\n+/g, "\n> ")}\n\n`;
  }

  // Lists
  if (tag === "ul" || tag === "ol") {
    const isOrdered = tag === "ol";
    const items: string[] = [];
    let idx = 1;
    for (const child of Array.from(el.children)) {
      if (child.tagName.toLowerCase() === "li") {
        const itemText = getInlineMarkdown(child).trim();
        if (isOrdered) {
          items.push(`${idx++}. ${itemText}`);
        } else {
          items.push(`- ${itemText}`);
        }
      }
    }
    return `\n\n${items.join("\n")}\n\n`;
  }

  // Tables
  if (tag === "table") {
    const rows = Array.from(el.querySelectorAll("tr"));
    if (rows.length === 0) return "";

    const tableLines: string[] = [];
    const firstRowCells = Array.from(rows[0].querySelectorAll("th, td"));
    const headers = firstRowCells.map((c) => (c.textContent || "").trim() || "Column");

    tableLines.push(`| ${headers.join(" | ")} |`);
    tableLines.push(`| ${headers.map(() => "---").join(" | ")} |`);

    for (let r = 1; r < rows.length; r++) {
      const cells = Array.from(rows[r].querySelectorAll("td, th"));
      const rowValues = cells.map((c) => (c.textContent || "").trim().replace(/\|/g, "\\|"));
      // Pad to headers length
      while (rowValues.length < headers.length) rowValues.push("");
      tableLines.push(`| ${rowValues.slice(0, headers.length).join(" | ")} |`);
    }

    return `\n\n${tableLines.join("\n")}\n\n`;
  }

  // Horizontal Rule
  if (tag === "hr") {
    return `\n\n---\n\n`;
  }

  // Recurse children for general containers
  let result = "";
  for (const child of Array.from(el.childNodes)) {
    result += nodeToMarkdown(child);
  }
  return result;
}

function getInlineMarkdown(el: Element): string {
  let result = "";
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent || "";
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const child = node as Element;
      const tag = child.tagName.toLowerCase();
      const inner = getInlineMarkdown(child);

      if (tag === "strong" || tag === "b") {
        result += `**${inner.trim()}**`;
      } else if (tag === "em" || tag === "i") {
        result += `*${inner.trim()}*`;
      } else if (tag === "code") {
        result += `\`${inner}\``;
      } else if (tag === "a") {
        const href = child.getAttribute("href") || "#";
        result += `[${inner.trim() || href}](${href})`;
      } else if (tag === "br") {
        result += "\n";
      } else {
        result += inner;
      }
    }
  }
  return result;
}

/**
 * Lightweight regex-based fallback for SSR / Node tests where DOMParser isn't available
 */
function fallbackHtmlToMarkdown(html: string): string {
  let out = html
    .replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (_, code) => `\n\n\`\`\`\n${code}\n\`\`\`\n\n`)
    .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, code) => `\n\n\`\`\`\n${code}\n\`\`\`\n\n`)
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, lvl, txt) => `\n\n${"#".repeat(Number(lvl))} ${txt.trim()}\n\n`)
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, q) => `\n\n> ${q.trim()}\n\n`)
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, item) => `- ${item.trim()}\n`)
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, p) => `\n\n${p.trim()}\n\n`)
    .replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**")
    .replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, "*$2*")
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`")
    .replace(/<a\s+[^>]*href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ");

  return out;
}
