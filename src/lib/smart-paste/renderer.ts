import { ArticleBlock } from "./types";
import { ArticleSection } from "@/types";
import { slugifyText } from "./parser";

/**
 * Convert structured blocks back into clean Markdown string for the editor.
 */
export function blocksToMarkdown(blocks: ArticleBlock[]): string {
  const parts: string[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case "heading": {
        const hashes = "#".repeat(block.level || 2);
        parts.push(`${hashes} ${block.text || "Heading"}`);
        break;
      }

      case "paragraph": {
        if (block.text && block.text.trim()) {
          parts.push(block.text.trim());
        }
        break;
      }

      case "code": {
        const lang = block.language || "text";
        const code = block.code || "";
        parts.push(`\`\`\`${lang}\n${code}\n\`\`\``);
        break;
      }

      case "callout": {
        const label =
          block.calloutType === "warning"
            ? "Warning"
            : block.calloutType === "note"
            ? "Note"
            : block.calloutType === "important"
            ? "Important"
            : block.calloutType === "highlight"
            ? (block.title || "Key Takeaway")
            : "Tip";
        parts.push(`> ${label}: ${block.body || ""}`);
        break;
      }

      case "list": {
        if (block.items && block.items.length > 0) {
          const listLines = block.items.map((it, idx) => {
            return block.ordered ? `${idx + 1}. ${it}` : `- ${it}`;
          });
          parts.push(listLines.join("\n"));
        }
        break;
      }

      case "quote": {
        if (block.text) {
          const quoteLines = block.text
            .split("\n")
            .map((l) => `> ${l}`)
            .join("\n");
          parts.push(quoteLines);
        }
        break;
      }

      case "table": {
        if (block.headers && block.headers.length > 0) {
          const headerLine = `| ${block.headers.join(" | ")} |`;
          const sepLine = `| ${block.headers.map(() => "---").join(" | ")} |`;
          const rowsLines = (block.rows || []).map((row) => {
            const padded = [...row];
            while (padded.length < block.headers!.length) padded.push("");
            return `| ${padded.slice(0, block.headers!.length).join(" | ")} |`;
          });
          parts.push([headerLine, sepLine, ...rowsLines].join("\n"));
        }
        break;
      }

      case "divider": {
        parts.push("---");
        break;
      }
    }
  }

  return parts.join("\n\n");
}

/**
 * Convert structured blocks directly into site's ArticleSection[] storage model.
 */
export function blocksToSections(blocks: ArticleBlock[], fallbackHeading: string): ArticleSection[] {
  const sections: ArticleSection[] = [];
  const usedIds = new Set<string>();

  const makeId = (heading: string) => {
    const base = slugifyText(heading) || "section";
    let id = base;
    let n = 2;
    while (usedIds.has(id)) id = `${base}-${n++}`;
    usedIds.add(id);
    return id;
  };

  let current: ArticleSection | null = null;

  const ensureSection = () => {
    if (!current) {
      current = {
        id: makeId(fallbackHeading),
        heading: fallbackHeading,
        paragraphs: [],
        items: [],
      };
      sections.push(current);
    }
    return current;
  };

  for (const block of blocks) {
    if (block.type === "heading" && block.level === 2) {
      const heading = block.text?.trim() || fallbackHeading;
      current = {
        id: makeId(heading),
        heading,
        paragraphs: [],
        items: [],
      };
      sections.push(current);
      continue;
    }

    const sec = ensureSection();
    if (!sec.items) sec.items = [];

    switch (block.type) {
      case "heading": {
        // H3 or H4 subheading inside section
        const title = block.text?.trim() || "Subheading";
        sec.items.push({
          type: "subheading",
          title,
        });
        if (!sec.subheadings) sec.subheadings = [];
        sec.subheadings.push({
          id: makeId(title),
          title,
          paragraphs: [],
        });
        break;
      }

      case "paragraph": {
        if (block.text && block.text.trim()) {
          sec.paragraphs.push(block.text.trim());
          sec.items.push({
            type: "paragraph",
            text: block.text.trim(),
          });
        }
        break;
      }

      case "code": {
        const codeBlockObj = {
          language: block.language || "text",
          code: block.code || "",
        };
        sec.items.push({
          type: "code",
          ...codeBlockObj,
        });
        if (!sec.codeBlock) {
          sec.codeBlock = codeBlockObj;
        }
        break;
      }

      case "callout": {
        const kind: "tip" | "warning" | "note" | "pro-tip" =
          block.calloutType === "warning"
            ? "warning"
            : block.calloutType === "note"
            ? "note"
            : "tip";
        const title = block.title || (kind === "warning" ? "Warning" : kind === "note" ? "Note" : "Tip");
        const body = block.body || "";

        sec.items.push({
          type: "callout",
          kind,
          title,
          body,
        });
        if (!sec.callout) {
          sec.callout = {
            type: kind === "warning" ? "warning" : "pro-tip",
            title,
            body,
          };
        }
        break;
      }

      case "table": {
        if (block.headers && block.headers.length > 0) {
          sec.table = {
            caption: "Summary Table",
            headers: block.headers,
            rows: block.rows || [],
          };
        }
        break;
      }

      case "list": {
        if (block.items && block.items.length > 0) {
          // Format as list paragraphs or Markdown list
          const listText = block.items
            .map((it, idx) => (block.ordered ? `${idx + 1}. ${it}` : `- ${it}`))
            .join("\n");
          sec.paragraphs.push(listText);
          sec.items.push({
            type: "paragraph",
            text: listText,
          });
        }
        break;
      }

      case "quote": {
        if (block.text && block.text.trim()) {
          const quoteText = `> ${block.text.trim()}`;
          sec.paragraphs.push(quoteText);
          sec.items.push({
            type: "paragraph",
            text: quoteText,
          });
        }
        break;
      }
    }
  }

  return sections.filter((s) => {
    const hasExplicitHeading =
      Boolean(s.heading) && s.heading.trim().length > 0 && s.heading !== fallbackHeading;
    const hasContent =
      s.paragraphs.length > 0 ||
      s.codeBlock !== undefined ||
      s.callout !== undefined ||
      (s.items && s.items.length > 0) ||
      (s.subheadings && s.subheadings.length > 0) ||
      s.table !== undefined;
    return hasExplicitHeading || hasContent;
  });
}
