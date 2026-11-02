/**
 * Universal Auto-Link & Smart Website Name Converter for Zee Writes
 * Automatically turns any website URL into its clean, human-readable brand name
 * while making it clickable:
 *
 * e.g.:
 * - "https://resend.com/domains" -> "[Resend Domains](https://resend.com/domains)"
 * - "zeewrites.blog"             -> "[Zee Writes](https://zeewrites.blog)"
 * - "https://github.com/facebook"-> "[GitHub](https://github.com/facebook)"
 * - "console.supabase.com"       -> "[Supabase Console](https://console.supabase.com)"
 * - "[https://resend.com](...)"  -> "[Resend](https://resend.com)"
 */

export const KNOWN_BRANDS: Record<string, string> = {
  "github.com": "GitHub",
  "gitlab.com": "GitLab",
  "bitbucket.org": "Bitbucket",
  "google.com": "Google",
  "youtube.com": "YouTube",
  "resend.com": "Resend",
  "zeewrites.blog": "Zee Writes",
  "vercel.com": "Vercel",
  "vercel.app": "Vercel",
  "supabase.com": "Supabase",
  "supabase.co": "Supabase",
  "nextjs.org": "Next.js",
  "react.dev": "React",
  "reactjs.org": "React",
  "nodejs.org": "Node.js",
  "npmjs.com": "npm",
  "pypi.org": "PyPI",
  "openai.com": "OpenAI",
  "chatgpt.com": "ChatGPT",
  "anthropic.com": "Anthropic",
  "claude.ai": "Claude",
  "stackoverflow.com": "Stack Overflow",
  "stackexchange.com": "Stack Exchange",
  "docker.com": "Docker",
  "kubernetes.io": "Kubernetes",
  "amazon.com": "Amazon",
  "aws.amazon.com": "AWS",
  "microsoft.com": "Microsoft",
  "azure.com": "Azure",
  "cloudflare.com": "Cloudflare",
  "digitalocean.com": "DigitalOcean",
  "heroku.com": "Heroku",
  "render.com": "Render",
  "railway.app": "Railway",
  "stripe.com": "Stripe",
  "paypal.com": "PayPal",
  "postman.com": "Postman",
  "sentry.io": "Sentry",
  "datadog.com": "Datadog",
  "mongodb.com": "MongoDB",
  "redis.io": "Redis",
  "postgresql.org": "PostgreSQL",
  "mysql.com": "MySQL",
  "sqlite.org": "SQLite",
  "tailwindcss.com": "Tailwind CSS",
  "typescriptlang.org": "TypeScript",
  "developer.mozilla.org": "MDN Web Docs",
  "mozilla.org": "Mozilla",
  "figma.com": "Figma",
  "canva.com": "Canva",
  "notion.so": "Notion",
  "linear.app": "Linear",
  "slack.com": "Slack",
  "discord.com": "Discord",
  "telegram.org": "Telegram",
  "whatsapp.com": "WhatsApp",
  "twitter.com": "X (Twitter)",
  "x.com": "X",
  "linkedin.com": "LinkedIn",
  "facebook.com": "Facebook",
  "instagram.com": "Instagram",
  "reddit.com": "Reddit",
  "medium.com": "Medium",
  "dev.to": "DEV Community",
  "hashnode.com": "Hashnode",
  "substack.com": "Substack",
  "wikipedia.org": "Wikipedia",
  "w3schools.com": "W3Schools",
  "freecodecamp.org": "freeCodeCamp",
  "geeksforgeeks.org": "GeeksforGeeks",
  "vitejs.dev": "Vite",
  "webpack.js.org": "Webpack",
  "graphql.org": "GraphQL",
  "prisma.io": "Prisma",
  "drizzle.team": "Drizzle ORM",
  "eslint.org": "ESLint",
  "prettier.io": "Prettier",
  "jestjs.io": "Jest",
  "vitest.dev": "Vitest",
  "cypress.io": "Cypress",
  "playwright.dev": "Playwright",
  "auth0.com": "Auth0",
  "clerk.com": "Clerk",
  "firebase.google.com": "Firebase",
};

export const VALID_TLDS =
  "com|org|net|io|dev|app|ai|co|blog|edu|gov|xyz|info|me|tech|site|cloud|cc|gg|sh|to|tv|in|pk|uk|ca|de|fr|au|us|biz|online|store|agency|design|news|live|space|top|club|vip|pro|link|press|digital|world|life";

/**
 * Regex matching:
 * 1. Full URLs: https?://...
 * 2. www. prefixed domains: www.example.com...
 * 3. Bare domains ending in recognized web TLDs (e.g. "zeewrites.blog", "resend.com")
 */
export const BARE_URL_AND_DOMAIN_REGEX = new RegExp(
  `(https?:\\/\\/[^\\s<>()]+[^\\s<>()\\.,;:?!'\"\\]\\[]|` +
    `\\bwww\\.[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)+(?:\\/[^\\s<>()\\.,;:?!'\"\\]\\[]*)?|` +
    `(?<![@\\/\\w])(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+(?:${VALID_TLDS})\\b(?:\\/[^\\s<>()\\.,;:?!'\"\\]\\[]*)?)`,
  "gi"
);

function capitalize(s: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Checks if a string looks like a raw URL or bare domain (rather than friendly link text)
 */
export function isUrlLike(str: string): boolean {
  if (!str) return false;
  const trimmed = str.trim();
  if (/^https?:\/\//i.test(trimmed)) return true;
  if (/^www\./i.test(trimmed)) return true;
  return new RegExp(
    `^(?:[a-zA-Z0-9-]+\\.)+(?:${VALID_TLDS})(?:\\/.*)?$`,
    "i"
  ).test(trimmed);
}

/**
 * Converts any URL, domain, or website link into a clean, human-readable name.
 * e.g.
 * - "https://resend.com/domains" -> "Resend Domains"
 * - "https://github.com/facebook/react" -> "GitHub"
 * - "console.supabase.com" -> "Supabase Console"
 * - "zeewrites.blog" -> "Zee Writes"
 */
export function extractWebsiteName(rawUrl: string): string {
  if (!rawUrl) return "";
  let clean = rawUrl.trim();

  // Strip protocol
  clean = clean.replace(/^https?:\/\//i, "");

  // Separate hostname and path
  const slashIdx = clean.indexOf("/");
  let hostname = slashIdx !== -1 ? clean.slice(0, slashIdx) : clean;
  let path = slashIdx !== -1 ? clean.slice(slashIdx + 1) : "";

  // Strip www. and trailing slash/port
  hostname = hostname.replace(/^www\./i, "").replace(/:\d+$/, "").toLowerCase();

  // Strip query and hash from path
  path = path.split(/[?#]/)[0].replace(/\/+$/, "");

  // 1. Direct match in known brand dictionary
  let brand = KNOWN_BRANDS[hostname];

  // 2. Subdomain mapping (e.g. docs.github.com -> GitHub Docs)
  let subSuffix = "";
  if (!brand) {
    const parts = hostname.split(".");
    if (parts.length > 2) {
      const sub = parts[0];
      const root = parts.slice(1).join(".");
      if (KNOWN_BRANDS[root]) {
        brand = KNOWN_BRANDS[root];
        if (["docs", "documentation"].includes(sub)) subSuffix = " Docs";
        else if (["console", "app", "dashboard"].includes(sub))
          subSuffix = ` ${capitalize(sub)}`;
        else if (["api"].includes(sub)) subSuffix = " API";
        else if (["blog"].includes(sub)) subSuffix = " Blog";
      }
    }
  }

  // 3. Fallback generic brand extraction from domain
  if (!brand) {
    const parts = hostname.split(".");
    let domainName = parts[0];
    if (
      parts.length > 2 &&
      ["co", "com", "org", "net", "gov", "edu"].includes(parts[parts.length - 2])
    ) {
      domainName = parts[parts.length - 3] || parts[0];
    } else if (parts.length >= 2) {
      domainName = parts[parts.length - 2];
    }

    brand = domainName
      .replace(/[-_]+/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .split(" ")
      .map(capitalize)
      .join(" ");
  }

  let finalName = brand + subSuffix;

  // 4. Meaningful path addition (e.g. /domains -> "Resend Domains")
  if (path) {
    const firstSegment = path.split("/")[0].toLowerCase();
    if (["domains", "domain"].includes(firstSegment)) {
      finalName += " Domains";
    } else if (
      ["docs", "documentation"].includes(firstSegment) &&
      !finalName.includes("Docs")
    ) {
      finalName += " Docs";
    } else if (
      ["dashboard", "console"].includes(firstSegment) &&
      !finalName.includes("Dashboard") &&
      !finalName.includes("Console")
    ) {
      finalName += " Dashboard";
    } else if (["pricing", "plans"].includes(firstSegment)) {
      finalName += " Pricing";
    } else if (["download", "downloads"].includes(firstSegment)) {
      finalName += " Download";
    } else if (["settings", "account"].includes(firstSegment)) {
      finalName += " Settings";
    }
  }

  return finalName;
}

/**
 * Normalize a bare domain or URL to have a valid protocol.
 * e.g. "zeewrites.blog" -> "https://zeewrites.blog"
 */
export function normalizeWebsiteHref(url: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Scan a text string and auto-link any website names or URLs into:
 * `[Website Name](url)`
 *
 * Handles both bare URLs and markdown links where the text was a raw URL:
 * - "https://resend.com/domains" -> "[Resend Domains](https://resend.com/domains)"
 * - "[https://resend.com](https://resend.com)" -> "[Resend](https://resend.com)"
 * - "[Custom Title](https://example.com)" -> preserved as "[Custom Title](https://example.com)"
 */
export function autoLinkText(rawText: string): { text: string; count: number } {
  if (!rawText) return { text: "", count: 0 };

  let count = 0;

  // Step 1: Normalize any existing markdown links whose text is a raw URL
  const normalizedLinks = rawText.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (fullMatch, linkText, linkUrl) => {
      if (isUrlLike(linkText)) {
        count++;
        const brandName = extractWebsiteName(linkUrl || linkText);
        return `[${brandName}](${linkUrl})`;
      }
      return fullMatch;
    }
  );

  // Step 2: Protect markdown links, code blocks, and inline code
  const tokens: string[] = [];
  const tokenized = normalizedLinks.replace(
    /(\[([^\]]+)\]\(([^)]+)\)|`[^`]+`|```[\s\S]*?```)/g,
    (m) => {
      tokens.push(m);
      return `__ZEE_AUTOLINK_TOKEN_${tokens.length - 1}__`;
    }
  );

  // Step 3: Replace bare URLs with [Website Name](url)
  const replaced = tokenized.replace(BARE_URL_AND_DOMAIN_REGEX, (url) => {
    count++;
    const brandName = extractWebsiteName(url);
    const href = normalizeWebsiteHref(url);
    return `[${brandName}](${href})`;
  });

  // Step 4: Restore protected tokens
  const finalText = replaced.replace(
    /__ZEE_AUTOLINK_TOKEN_(\d+)__/g,
    (_, idx) => tokens[Number(idx)] || ""
  );

  return { text: finalText, count };
}

/**
 * Real-time typing helper:
 * When the author presses Space or Enter after writing a website URL,
 * converts it into `[Website Name](url)`.
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
