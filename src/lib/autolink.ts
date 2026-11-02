/**
 * Universal Auto-Link Utility for Zee Writes
 * Automatically detects bare URLs and website names (e.g. "zeewrites.blog",
 * "https://resend.com/domains", "github.com/facebook/react") and converts
 * them into clickable links while protecting existing markdown links, code blocks,
 * and inline code snippets.
 */

export const VALID_TLDS =
  "com|org|net|io|dev|app|ai|co|blog|edu|gov|xyz|info|me|tech|site|cloud|cc|gg|sh|to|tv|in|pk|uk|ca|de|fr|au|us|biz|online|store|agency|design|news|live|space|top|club|vip|pro|link|press|digital|world|life";

/**
 * Regex matching:
 * 1. Full URLs: https?://...
 * 2. www. prefixed domains: www.example.com...
 * 3. Bare domains ending in recognized web TLDs (e.g. "zeewrites.blog", "resend.com")
 *    - Not preceded by @ (avoids matching email addresses)
 *    - Not preceded by / or \w (avoids matching filenames like package.json or paths)
 *    - Followed by word boundary or slash before path
 */
export const BARE_URL_AND_DOMAIN_REGEX = new RegExp(
  `(https?:\\/\\/[^\\s<>()]+[^\\s<>()\\.,;:?!'\"\\]\\[]|` +
    `\\bwww\\.[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)+(?:\\/[^\\s<>()\\.,;:?!'\"\\]\\[]*)?|` +
    `(?<![@\\/\\w])(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+(?:${VALID_TLDS})\\b(?:\\/[^\\s<>()\\.,;:?!'\"\\]\\[]*)?)`,
  "gi"
);

/**
 * Normalize a bare domain or URL to have a valid protocol.
 * e.g. "zeewrites.blog" -> "https://zeewrites.blog"
 * "http://example.com" -> "http://example.com"
 */
export function normalizeWebsiteHref(url: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Scan a text string and auto-link any bare website names or URLs to markdown links:
 * e.g. "Visit zeewrites.blog for guides" -> "Visit [zeewrites.blog](https://zeewrites.blog) for guides"
 * Protects existing markdown links `[text](url)`, code blocks ` ``` `, and inline code ` ` `.
 */
export function autoLinkText(rawText: string): { text: string; count: number } {
  if (!rawText) return { text: "", count: 0 };

  const tokens: string[] = [];

  // Protect existing markdown links, code blocks, and inline code
  const tokenized = rawText.replace(
    /(\[([^\]]+)\]\(([^)]+)\)|`[^`]+`|```[\s\S]*?```)/g,
    (m) => {
      tokens.push(m);
      return `__ZEE_AUTOLINK_TOKEN_${tokens.length - 1}__`;
    }
  );

  let matchCount = 0;
  const replaced = tokenized.replace(BARE_URL_AND_DOMAIN_REGEX, (url) => {
    matchCount++;
    const href = normalizeWebsiteHref(url);
    return `[${url}](${href})`;
  });

  // Restore protected tokens
  const finalText = replaced.replace(
    /__ZEE_AUTOLINK_TOKEN_(\d+)__/g,
    (_, idx) => tokens[Number(idx)] || ""
  );

  return { text: finalText, count: matchCount };
}

/**
 * Real-time typing helper:
 * When the author presses Space or Enter in a textarea, checks if the word
 * immediately preceding the cursor is a website name/URL. If so, automatically
 * converts it into a markdown link and places the cursor right after it.
 */
export function handleTypingAutoLink(
  text: string,
  cursorPos: number,
  delimiter: " " | "\n" = " "
): { newText: string; newCursor: number } | null {
  if (cursorPos <= 0 || cursorPos > text.length) return null;

  const beforeCursor = text.slice(0, cursorPos);
  const match = beforeCursor.match(/(\S+)$/);
  if (!match) return null;

  const lastWord = match[1];
  const wordStart = cursorPos - lastWord.length;

  // Don't convert if already part of a markdown link [text](url) or inline code
  if (
    lastWord.startsWith("[") ||
    lastWord.startsWith("(") ||
    lastWord.startsWith("`") ||
    lastWord.endsWith(")") ||
    lastWord.endsWith("]")
  ) {
    return null;
  }

  // Ensure we are not inside an open inline code block
  const backtickCount = (beforeCursor.match(/`/g) || []).length;
  if (backtickCount % 2 === 1) return null;

  const { text: linked, count } = autoLinkText(lastWord);
  if (count === 0 || linked === lastWord) return null;

  const newBefore = text.slice(0, wordStart) + linked + delimiter;
  const newAfter = text.slice(cursorPos);

  return {
    newText: newBefore + newAfter,
    newCursor: newBefore.length,
  };
}
