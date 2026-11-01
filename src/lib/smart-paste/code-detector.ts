/**
 * Pure code detection, syntax classification, and ChatGPT copy-artifact cleaning.
 */

// Well-known languages for detection
export type SupportedLanguage =
  | "bash"
  | "powershell"
  | "cmd"
  | "javascript"
  | "typescript"
  | "python"
  | "html"
  | "css"
  | "json"
  | "sql"
  | "yaml"
  | "text";

const CHATGPT_ARTIFACT_PATTERNS = [
  /^copy\s*code$/i,
  /^copy$/i,
  /^copy\s*snippet$/i,
  /^show\s*more$/i,
  /^edit\s*prompt$/i,
];

const KNOWN_LANG_LABELS = new Set([
  "bash",
  "sh",
  "shell",
  "zsh",
  "powershell",
  "ps1",
  "ps",
  "cmd",
  "batch",
  "bat",
  "javascript",
  "js",
  "typescript",
  "ts",
  "jsx",
  "tsx",
  "python",
  "py",
  "html",
  "xml",
  "css",
  "scss",
  "json",
  "sql",
  "yaml",
  "yml",
  "c",
  "cpp",
  "csharp",
  "java",
  "rust",
  "go",
  "php",
  "text",
  "plaintext",
]);

/**
 * Check if a single line is an artifact from ChatGPT/Claude (e.g., "Copy code")
 */
export function isChatGptArtifact(line: string): boolean {
  const trimmed = line.trim();
  return CHATGPT_ARTIFACT_PATTERNS.some((pat) => pat.test(trimmed));
}

/**
 * Check if a standalone line is purely a language label above a code block (e.g., "python" alone)
 */
export function isStandaloneLanguageLabel(line: string): boolean {
  const trimmed = line.trim().toLowerCase();
  return KNOWN_LANG_LABELS.has(trimmed);
}

/**
 * Score how likely a line of text is to be source code or a terminal command.
 * Returns a score from 0 (plain prose) to 10 (definitely code).
 */
export function scoreLineAsCode(line: string): { score: number; hintLang?: SupportedLanguage } {
  const trimmed = line.trim();
  if (!trimmed) return { score: 0 };

  // Shell prompts: "$ ...", "> ...", "PS C:\...>"
  if (/^(\$|#|>|PS\s+[A-Za-z]:\\[^>]*>)\s+/.test(trimmed)) {
    if (/PS\s+[A-Za-z]:\\/i.test(trimmed)) {
      return { score: 9, hintLang: "powershell" };
    }
    return { score: 8, hintLang: "bash" };
  }

  // Windows commands & cmdlets
  if (/^(sfc\s+\/scannow|dism(\.exe)?\s+\/|ipconfig(\s+\/[a-z]+)?|netsh\s+|chkdsk(\s+[a-z]:)?|tracert\s+|ping\s+[a-z0-9]|reg\s+(add|query|delete)|taskkill\s+|bcdedit|gpupdate)/i.test(trimmed)) {
    return { score: 9, hintLang: "cmd" };
  }

  // PowerShell cmdlets: Verb-Noun
  if (/^(Get|Set|New|Remove|Invoke|Start|Stop|Restart|Test|Clear|Enable|Disable|Install|Update)-[A-Za-z0-9]+(\s+|-)/.test(trimmed)) {
    return { score: 9, hintLang: "powershell" };
  }

  // Package managers & developer CLI
  if (/^(npm|npx|pnpm|yarn|pip|pip3|git|curl|docker|docker-compose|kubectl|cargo|brew|apt|apt-get|sudo|cd|mkdir|rm\s+-rf|chmod)\s+[a-z0-9_\-\.\/]/i.test(trimmed)) {
    return { score: 8, hintLang: "bash" };
  }

  // JavaScript / TypeScript syntax
  if (/^(const|let|var|function|import|export|class|interface|type)\s+[A-Za-z0-9_{$]/.test(trimmed)) {
    return { score: 8, hintLang: "typescript" };
  }
  if (/(console\.log|=>|===|!==|process\.env|document\.get|window\.)/.test(trimmed)) {
    return { score: 8, hintLang: "javascript" };
  }

  // Python syntax
  if (/^(def\s+[A-Za-z0-9_]+\s*\(|class\s+[A-Za-z0-9_]+(\s*\(|\s*:)|from\s+[A-Za-z0-9_\.]+\s+import|if\s+__name__\s*==\s*['"]__main__['"])/.test(trimmed)) {
    return { score: 9, hintLang: "python" };
  }
  if (/^(elif\s+|except\s+|finally:|raise\s+|print\()/.test(trimmed)) {
    return { score: 7, hintLang: "python" };
  }

  // SQL syntax
  if (/^(SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE)\s+/i.test(trimmed)) {
    return { score: 9, hintLang: "sql" };
  }

  // HTML / XML
  if (/^<(!DOCTYPE|html|head|body|div|span|p|a|ul|ol|li|table|tr|td|th|script|style|template|form|input)[\s>]/i.test(trimmed) || /<\/[a-z0-9]+>$/i.test(trimmed)) {
    return { score: 8, hintLang: "html" };
  }

  // CSS syntax
  if (/^([.#]?[a-z0-9_\-]+(\s*,\s*[.#]?[a-z0-9_\-]+)*\s*\{|@(media|keyframes|import)\s+)/i.test(trimmed) || /^[a-z\-]+:\s*[^;]+;$/i.test(trimmed)) {
    return { score: 7, hintLang: "css" };
  }

  // JSON syntax
  if (/^(\{|\}|\[|\]|"[A-Za-z0-9_$-]+":\s*.+,?)$/.test(trimmed)) {
    return { score: 7, hintLang: "json" };
  }

  // Indented programming constructs or lines ending with semicolons + braces
  let score = 0;
  if (/;\s*$/.test(trimmed)) score += 2;
  if (/[\{\}\(\)]/.test(trimmed)) score += 2;
  if (/^(\s{2,}|\t)[a-z0-9_]/i.test(line)) score += 1;
  if (/[=\+\*\/%&\|!><]=?/.test(trimmed)) score += 1;

  return { score: Math.min(score, 6) };
}

/**
 * Detect primary language from a body of code lines.
 */
export function detectLanguage(code: string): SupportedLanguage {
  const trimmed = code.trim();
  if (!trimmed) return "text";

  // Quick JSON check
  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {
      // not strict json
    }
  }

  // PowerShell
  if (/(Get|Set|New|Remove|Invoke|Restart|Test|Clear)-[A-Za-z0-9]+|\$env:|\$PSScriptRoot|\$PSVersionTable/i.test(code)) {
    return "powershell";
  }

  // CMD
  if (/(sfc\s+\/scannow|dism(\.exe)?\s+\/|ipconfig|netsh|bcdedit|chkdsk|reg\s+query|echo\s+off)/i.test(code)) {
    return "cmd";
  }

  // Python
  if (/def\s+[A-Za-z0-9_]+\s*\(|from\s+[A-Za-z0-9_]+\s+import|import\s+[A-Za-z0-9_]+|if\s+__name__|elif\s+|print\(/.test(code)) {
    return "python";
  }

  // TypeScript / JavaScript
  if (/interface\s+[A-Za-z0-9_]+|type\s+[A-Za-z0-9_]+\s*=|:\s*(string|number|boolean|any)\[\]/.test(code)) {
    return "typescript";
  }
  if (/const\s+|let\s+|function\s*\(|console\.log|=>|export\s+default/.test(code)) {
    return "javascript";
  }

  // HTML
  if (/<!DOCTYPE|<html|<div|<span|<\/div>|<\/body>/i.test(code)) {
    return "html";
  }

  // CSS
  if (/@media|\.[\w\-]+\s*\{|[a-z\-]+:\s*[^;]+;/i.test(code)) {
    return "css";
  }

  // SQL
  if (/\b(SELECT|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE)\b/i.test(code)) {
    return "sql";
  }

  // Bash / Shell
  if (/\b(npm|pnpm|yarn|npx|pip|git|sudo|apt|apt-get|brew|docker|curl|chmod|grep|export\s+\w+=)\b/i.test(code)) {
    return "bash";
  }

  return "text";
}

/**
 * Standardize language alias to a recognized canonical label.
 */
export function normalizeLanguageLabel(lang: string): string {
  const clean = lang.trim().toLowerCase();
  switch (clean) {
    case "js":
    case "javascript":
      return "javascript";
    case "ts":
    case "typescript":
      return "typescript";
    case "py":
    case "python":
      return "python";
    case "sh":
    case "bash":
    case "shell":
    case "zsh":
      return "bash";
    case "ps":
    case "ps1":
    case "powershell":
      return "powershell";
    case "cmd":
    case "batch":
    case "bat":
      return "cmd";
    case "html":
    case "xml":
      return "html";
    case "css":
    case "scss":
      return "css";
    case "json":
      return "json";
    case "sql":
      return "sql";
    case "yml":
    case "yaml":
      return "yaml";
    default:
      return clean || "text";
  }
}

/**
 * Automatically wrap short commands, file paths, keyboard shortcuts, and registry paths in inline code (`...`)
 * inside normal sentences, without touching existing backticks or markdown links.
 */
export function enrichInlineCode(text: string): string {
  if (!text) return "";

  // Split text by existing code spans (`...`) and links (`[...] (...)`) so we don't double-wrap
  const tokens = text.split(/(`[^`]+`|\[[^\]]+\]\([^\)]+\))/g);

  return tokens
    .map((token) => {
      // If token is already code or link, leave intact
      if (token.startsWith("`") || token.startsWith("[")) {
        return token;
      }

      let res = token;

      // Keyboard shortcuts: e.g. Ctrl + Shift + Esc, Windows + R, Alt + F4, Cmd + Space
      res = res.replace(
        /\b((?:Ctrl|Control|Alt|Option|Shift|Windows|Win|Cmd|Command)\s*\+\s*(?:Shift\s*\+\s*|Alt\s*\+\s*|Ctrl\s*\+\s*)?(?:[A-Za-z0-9]+|F\d{1,2}|Esc|Enter|Tab|Space|Delete|Backspace|Up|Down|Left|Right))\b/gi,
        "`$1`"
      );

      // Windows paths: e.g. C:\Windows\System32, %APPDATA%\npm
      res = res.replace(
        /(?<![A-Za-z0-9_`])([A-Za-z]:\\[A-Za-z0-9_.\-\\]+|%[A-Z0-9_]+%\\[A-Za-z0-9_.\-\\]+)/g,
        "`$1`"
      );

      // Unix paths: e.g. /etc/hosts, /usr/local/bin, ~/.bashrc
      res = res.replace(
        /(?<![A-Za-z0-9_`])((\/etc|\/usr|\/var|\/opt|\/bin|\/home|~\/)[A-Za-z0-9_.\-\/]+)/g,
        "`$1`"
      );

      // Common CLI commands in prose: e.g. "run ipconfig /flushdns", "use npm install"
      res = res.replace(
        /\b(ipconfig(\s+\/[a-z]+)?|netsh\s+[a-z\s]+|sfc\s+\/scannow|DISM\s+\/[a-z:\s\/]+|npm\s+(install|run|test|build|init|i|start)|npx\s+[a-z0-9_\-]+|git\s+(commit|push|pull|status|add|checkout|branch|merge|rebase)|pip\s+install\s+[a-z0-9_\-]+|docker\s+(run|build|compose|ps)|sudo\s+apt\s+(update|install))\b/g,
        "`$1`"
      );

      return res;
    })
    .join("");
}
