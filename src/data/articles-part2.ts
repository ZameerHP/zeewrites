import { Article } from "@/types";
import { DEFAULT_AUTHOR } from "./categories";

export const ARTICLES_PART_2: Article[] = [
  {
    id: "art-06",
    slug: "mastering-regular-expressions-regex-text-search-cleanup",
    title:
      "Mastering Regular Expressions (Regex) for Instant Text Search, Log Parsing, and Bulk Data Cleanup",
    subtitle:
      "A practical reference guide to lookaheads, lookbehinds, non-capturing groups, Unicode property escapes (\\p{L}), and ReDoS prevention.",
    excerpt:
      "Stop writing fragile string-split loops. Learn how to construct high-speed regular expressions for log file extraction, CSV reformatting, duplicate token removal, and multi-line code refactoring without catastrophic backtracking.",
    category: "text-guides",
    publishedAt: "2026-10-02T10:20:00Z",
    updatedAt: "2026-10-23T12:00:00Z",
    testedOn: "",
    readingTimeMinutes: 7,
    wordCount: 1350,
    featured: false,
    status: "published",
    primaryKeyword: "mastering regular expressions regex text cleanup",
    metaTitle:
      "Mastering Regular Expressions (Regex) for Text Search, Log Parsing & Data Cleanup | Zee Writes",
    metaDescription:
      "Master practical Regular Expressions (Regex) with copy-ready patterns for log parsing, bulk text cleanup, lookaheads/lookbehinds, and avoiding ReDoS slowdowns.",
    coverImage: {
      url: "/images/diagrams/regex-nfa.svg",
      alt: "Nondeterministic Finite Automaton (NFA) state machine diagram showing regex token matching, lookahead assertions, and greedy vs lazy quantifiers",
      caption:
        "Figure 6.1: How an NFA regex engine evaluates greedy vs lazy quantifiers and why atomic character classes prevent catastrophic backtracking.",
      width: 1200,
      height: 630,
      diagramType: "regex-nfa",
    },
    verifiedTakeaway: {
      symptom:
        "Manual search-and-replace takes hours on multi-thousand-line logs or CSVs, or poorly written nested quantifiers like (a+)+ cause your IDE or Node.js server to freeze at 100% CPU.",
      rootCause:
        "Over-reliance on greedy dot-star (.*) patterns instead of negated character classes ([^\"\\n]*), and lack of named capture groups or zero-width lookaround assertions.",
      instantFix:
        "Replace greedy .* with bounded negated character classes, use named capture groups (?<name>...) for readable replacements, and enable the Unicode 'u' flag for multilingual text.",
      estimatedFixTime: "1 minute",
      testedPlatforms: ["JavaScript / TypeScript", "VS Code / JetBrains", "Python re", "ripgrep"],
    },
    howToSteps: [
      {
        stepNumber: 1,
        name: "Replace Greedy Dot-Star (.*) with Negated Character Classes",
        text: "When extracting text inside quotes or brackets, /\"(.*)\"/ matches from the first opening quote on the line all the way to the very last closing quote. Use a negated class /\"([^\"\\n]*)\"/ so the engine stops immediately at the next quote without backtracking.",
        commandOrCode: `// Bad (Greedy Backtracking):\nconst bad = /"(.*)"/g;\n\n// Good (Deterministic Zero-Backtracking):\nconst good = /"([^"\\r\\n]*)"/g;`,
        proTip:
          "Negated character classes like [^,]+ are faster on large CSV/log files because the regex state machine never has to overshoot and backtrack.",
      },
      {
        stepNumber: 2,
        name: "Use Lookbehinds (?<=...) and Lookaheads (?=...) for Surgical Edits",
        text: "Zero-width lookaround assertions verify surrounding context without consuming characters in the match, letting you insert or replace text at exact boundaries.",
        commandOrCode: `// Format raw numbers with thousand commas (e.g. 1250000 -> 1,250,000):\nconst formatted = "1250000".replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",");`,
      },
      {
        stepNumber: 3,
        name: "Use Named Capture Groups (?<key>...) for Self-Documenting Refactoring",
        text: "Instead of counting parentheses for $1, $2, and $3, assign descriptive names to each capture group and reference them via $<name> in replacements or match.groups in JavaScript.",
        commandOrCode: `const logRegex = /^(?<date>\\d{4}-\\d{2}-\\d{2})\\s+\\[(?<level>ERROR|WARN|INFO)\\]\\s+(?<msg>.+)$/gm;\nconst markdownLogs = rawLogs.replace(logRegex, "- **$<level>** ($<date>): $<msg>");`,
      },
      {
        stepNumber: 4,
        name: "Match International Text Safely with Unicode Property Escapes (\\p{...})",
        text: "The classic \\w shorthand only matches ASCII [A-Za-z0-9_], completely missing accented characters like é, ü, ñ, or non-Latin scripts. Use \\p{L} with the 'u' flag to match any Unicode letter.",
        commandOrCode: `const unicodeWords = text.match(/[\\p{L}\\p{N}_]+/gu) ?? [];`,
      },
    ],
    sections: [
      {
        id: "essential-cleanup-patterns",
        heading: "1. Eight Battle-Tested Regex Patterns for Daily Editorial & Developer Cleanup",
        paragraphs: [
          "Regular expressions are the closest thing software engineering has to a superpower for unstructured text transformation. What would require a 60-line parser script can often be expressed in a single 25-character regex inside VS Code, `ripgrep`, or a data ingestion pipeline.",
          "However, most regex tutorials dwell on toy examples rather than the real-world patterns editors and engineers need every day: stripping trailing whitespace, deduplicating consecutive words, parsing ISO timestamps, and transforming Markdown links.",
        ],
        table: {
          caption: "Table 6.1: Production Copy-Paste Regex Recipes for Editors & Engineers",
          headers: [
            "Cleanup Task",
            "Regular Expression Pattern",
            "Replacement String",
          ],
          rows: [
            [
              "Remove duplicate consecutive words ('the the')",
              "\\b(\\w+)\\s+\\1\\b",
              "$1 (Case-insensitive flag 'gi')",
            ],
            [
              "Strip trailing whitespace at end of every line",
              "[ \\t]+$",
              "Empty string (Multiline flag 'gm')",
            ],
            [
              "Collapse 3+ blank lines into a single blank line",
              "\\n{3,}",
              "\\n\\n",
            ],
            [
              "Convert Markdown links [Text](URL) to HTML <a>",
              "\\[([^\\]]+)\\]\\(([^)]+)\\)",
              '<a href="$2">$1</a>',
            ],
            [
              "Extract all IPv4 addresses from server logs",
              "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b",
              "Match extraction",
            ],
            [
              "Convert camelCase identifiers to kebab-case",
              "([a-z0-9])([A-Z])",
              "$1-$2 (then lowercase)",
            ],
          ],
        },
      },
      {
        id: "preventing-redos-catastrophic-backtracking",
        heading: "2. Understanding NFA Backtracking and Preventing ReDoS Lockups",
        paragraphs: [
          "JavaScript, Python, and PCRE use a Nondeterministic Finite Automaton (NFA) engine driven by backtracking. When a token has multiple ways to match—such as nested quantifiers like `(a+)+b` or `([a-zA-Z0-9]+\\s?)+$`—and the final character of the input string fails to match, the engine systematically tries every possible permutation of group boundaries before giving up.",
          "This exponential time complexity ($O(2^n)$) is called Catastrophic Backtracking or Regular Expression Denial of Service (ReDoS). A 32-character non-matching input against a vulnerable regex can execute over 4 billion backtracking steps, freezing a browser tab or Node.js event loop for minutes.",
          "Always follow the Golden Rule of Regex Performance: never nest a repeating quantifier (`+` or `*`) inside another repeating group unless every sub-branch starts with a mutually exclusive delimiter.",
        ],
        callout: {
          type: "verified-fix",
          title: "Test Live Line Filtering in the Zee Writes Scrubber",
          body: "Want to filter, sort, or deduplicate thousands of lines without writing boilerplate scripts? Open the Duplicate Line & List Scrubber in our Text Tools Suite.",
        },
      },
    ],
    faqs: [
      {
        question: "What is the difference between a capturing group (...) and a non-capturing group (?:...)?",
        answer:
          "A standard capturing group (...) both groups tokens together for quantifiers/alternation AND allocates memory to store the matched substring for backreferences ($1, $2). A non-capturing group (?:...) groups tokens logically without allocating capture slots, improving speed and keeping your numbered capture indices clean.",
      },
      {
        question: "Why does the dot (.) character fail to match across multiple lines?",
        answer:
          "By default in almost all regex engines, the dot (.) matches any character EXCEPT line terminators (\\n and \\r). To allow the dot to match across newlines, enable the 's' (dotAll / single-line) flag, or use the character class [\\s\\S]*.",
      },
      {
        question: "How do I escape user-supplied strings safely before passing them into new RegExp()?",
        answer:
          "Always escape all 14 regex metacharacters before constructing a dynamic regular expression: str.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), or use the native RegExp.escape(str) method available in modern ECMAScript runtimes.",
      },
    ],
    author: DEFAULT_AUTHOR,
    tags: ["Regex", "Text Processing", "Log Parsing", "Developer Productivity", "ReDoS"],
    relatedSlugs: [
      "clean-normalize-format-messy-pdf-copy-pasted-text",
      "fix-corrupted-utf8-text-mojibake-zero-width-characters",
      "markdown-formatting-masterclass-technical-documentation",
    ],
    helpfulYes: 391,
    helpfulNo: 8,
  },
  {
    id: "art-07",
    slug: "fix-high-ram-cpu-usage-modern-browsers-memory-leaks",
    title:
      "How to Fix High RAM & CPU Usage in Modern Browsers: Hardware Acceleration, Memory Leaks, and Process Debugging",
    subtitle:
      "Use Shift+Esc Task Manager diagnostics, GPU rasterization flags, V8 heap snapshots, and extension sandboxing to reduce Chrome, Edge, and Firefox memory usage.",
    excerpt:
      "Is your browser consuming 12 GB of RAM and spinning your laptop fans at full speed with only 15 tabs open? Learn how to pinpoint runaway renderer processes, broken content-script extensions, and GPU ANGLE driver stalls.",
    category: "how-to-fixes",
    publishedAt: "2026-10-05T14:00:00Z",
    updatedAt: "2026-10-24T10:15:00Z",
    testedOn: "",
    readingTimeMinutes: 7,
    wordCount: 1280,
    featured: false,
    status: "published",
    primaryKeyword: "fix high RAM CPU usage browser memory leaks",
    metaTitle:
      "How to Fix High RAM & CPU Usage in Chrome, Edge & Firefox (Process Debugging) | Zee Writes",
    metaDescription:
      "Step-by-step guide to diagnosing and fixing high browser RAM and CPU usage using the internal Browser Task Manager (Shift+Esc), GPU flags, and Memory Saver tuning.",
    coverImage: {
      url: "/images/diagrams/browser-memory.svg",
      alt: "Multi-process browser architecture diagram showing Browser Kernel, GPU Process, Utility Audio/Network Services, and Isolated Site-Per-Process V8 Renderers",
      caption:
        "Figure 7.1: Why modern site-isolation browsers spawn separate OS processes for every domain, iframe, and extension—and how to reclaim leaked V8 heap memory.",
      width: 1200,
      height: 630,
      diagramType: "browser-memory",
    },
    verifiedTakeaway: {
      symptom:
        "Browser memory climbs past 8–16 GB RAM, scrolling becomes choppy, or a single background tab pegs one CPU core at 100% continuously.",
      rootCause:
        "Detached DOM trees or unclosed WebSockets in long-lived SPA tabs, extension content scripts injected into every iframe (`all_frames: true`), or corrupted GPU shader cache causing software fallback rendering.",
      instantFix:
        "Press Shift+Esc (or visit about:processes in Firefox) to sort by Memory Footprint and CPU, terminate runaway Subframe/Extension processes, enable 'Maximum' Tab Memory Saver, and reset the ANGLE GPU backend if GPU Process exceeds 1.5 GB.",
      estimatedFixTime: "2 minutes",
      testedPlatforms: ["Chrome", "Microsoft Edge", "Brave", "Mozilla Firefox"],
    },
    howToSteps: [
      {
        stepNumber: 1,
        name: "Launch the Built-In Browser Process Task Manager (Shift + Esc)",
        text: "Your OS Task Manager (Ctrl+Shift+Esc) or macOS Activity Monitor only shows 40+ identical 'Google Chrome Helper' processes without telling you which tab or extension owns each process. Press Shift + Esc inside Chrome/Edge/Brave (or open about:processes in Firefox) to see exact per-tab RAM, CPU, and Network usage.",
        commandOrCode: `# Chrome / Edge / Brave Shortcut (Windows & Linux):\nShift + Esc\n\n# Firefox Process Profiler URL:\nabout:processes\nabout:memory`,
        proTip:
          "Right-click anywhere inside the Chrome Task Manager table header and check 'JavaScript Memory' and 'V8 Memory Allocated' to distinguish true JS memory leaks from GPU texture caching.",
      },
      {
        stepNumber: 2,
        name: "Audit Extensions Running Persistent Content Scripts Across All Iframes",
        text: "A single poorly coded coupon finder, grammar checker, or ad blocker extension can inject 35 MB of DOM observers into every single tab AND every embedded iframe inside those tabs. If an Extension process uses >400 MB RAM, toggle it to 'On Click' site access.",
        commandOrCode: `chrome://extensions/\n-> Details -> Site access -> Change from "On all sites" to "On click"`,
      },
      {
        stepNumber: 3,
        name: "Configure Aggressive Tab Discarding and Memory Saver Heuristics",
        text: "Modern Chromium includes a native Freeze-and-Discard lifecycle manager that serializes inactive background tabs to disk and frees their V8 heap completely without closing the tab.",
        commandOrCode: `chrome://settings/performance\n-> Enable "Memory Saver" -> Select "Maximum" (discards inactive tabs after 15 mins)\n\n# Inspect live tab discard states and manual freeze controls:\nchrome://discards/`,
      },
      {
        stepNumber: 4,
        name: "Fix GPU Process CPU Spikes by Tuning the ANGLE Graphics Backend",
        text: "If 'GPU Process' in Shift+Esc is consuming >25% CPU or >2 GB RAM during video playback or 3D scrolling, your graphics driver's default ANGLE translation layer may be stalling. Test switching ANGLE to D3D11on12 (Windows) or Metal (macOS).",
        commandOrCode: `chrome://flags/#use-angle\n-> Windows: Select "D3D11" or "D3D11on12"\n-> macOS Apple Silicon: Select "Metal"`,
      },
    ],
    sections: [
      {
        id: "site-isolation-memory-overhead",
        heading: "1. Why Site Isolation Multiplies Browser RAM Usage (And Why It Matters)",
        paragraphs: [
          "Following the discovery of Spectre and Meltdown speculative execution side-channel vulnerabilities in 2018, every major browser re-architected its rendering engine around strict Out-of-Process iframes (OOPIF) and Site Isolation. Instead of sharing a single operating system process across multiple tabs, the browser now spawns a dedicated sandboxed V8 renderer process for every unique registrable domain (eTLD+1).",
          "Even if you only have 10 tabs open, if each tab embeds third-party analytics widgets, video players, chat iframes, and 5 active browser extensions, the browser may manage 45+ distinct processes—each carrying its own base V8 isolate overhead (roughly 30–60 MB per process before a single line of page content is rendered).",
        ],
        table: {
          caption: "Table 7.1: Browser Process Types & Healthy Resource Thresholds",
          headers: [
            "Process Type in Shift+Esc",
            "Normal RAM Range",
            "Warning Threshold",
            "Corrective Action",
          ],
          rows: [
            [
              "Tab: [Website Name]",
              "80 MB – 350 MB",
              "> 900 MB",
              "Detached DOM leak in SPA; refresh tab or add to Memory Saver",
            ],
            [
              "GPU Process",
              "150 MB – 600 MB",
              "> 1.6 GB",
              "Click 'End Process' in Shift+Esc (restarts cleanly in 200ms)",
            ],
            [
              "Extension: [Name]",
              "20 MB – 120 MB",
              "> 400 MB",
              "Restrict extension Site Access to 'On click' or specific domains",
            ],
            [
              "Utility: Network Service",
              "40 MB – 150 MB",
              "> 500 MB",
              "Flush socket pools or check runaway Service Worker fetches",
            ],
          ],
        },
      },
      {
        id: "debugging-detached-dom-leaks",
        heading: "2. Finding Detached DOM Nodes for Web Developers in Chrome DevTools",
        paragraphs: [
          "If you are a web developer and your own React, Vue, or Next.js application climbs in memory every time a user navigates between routes, the culprit is almost always either an uncleaned `window.addEventListener` / `IntersectionObserver` subscription or a Detached DOM Tree retained by a closure.",
          "Open Chrome DevTools (`F12`), navigate to the **Memory** panel, select **Heap Snapshot**, and take a snapshot. In the Class Filter box at the top, type `Detached`. Any DOM element prefixed with `Detached HTMLDivElement` has been removed from the visible document tree but cannot be garbage-collected by V8 because a JavaScript variable still holds a reference to it.",
        ],
        callout: {
          type: "pro-tip",
          title: "Restart Only the GPU Process Without Losing Open Tabs",
          body: "Did you know you can select 'GPU Process' in the Chrome Task Manager (Shift+Esc) and click 'End Process' safely? The screen will blink for 100 milliseconds as Chromium spawns a fresh GPU process, instantly freeing 1+ GB of leaked VRAM textures without reloading a single tab!",
        },
      },
    ],
    faqs: [
      {
        question: "Should I turn off Hardware Acceleration in Chrome to save RAM?",
        answer:
          "No, unless your GPU driver is physically crashing. Turning off Hardware Acceleration forces your CPU to software-rasterize every CSS blur, video frame, and smooth scroll via the SwiftShader CPU fallback, which dramatically increases CPU utilization, laptop heat, and battery drain.",
      },
      {
        question: "Why does closing a tab sometimes not reduce RAM immediately in Task Manager?",
        answer:
          "Modern operating systems and browser memory allocators (like Chrome's PartitionAlloc) often keep freed memory pages mapped in standby cache briefly so subsequent tab creations don't require expensive kernel page allocations. Once another application requests RAM, the OS reclaims those standby pages immediately.",
      },
      {
        question: "How can I check if a background Service Worker is draining my CPU when tabs are closed?",
        answer:
          "Visit chrome://serviceworker-internals/ (or about:debugging#/runtime/this-firefox in Firefox). You will see a list of every registered background Service Worker on your profile and can click 'Unregister' on push-notification or offline workers you no longer use.",
      },
    ],
    author: DEFAULT_AUTHOR,
    tags: ["Browser Optimization", "Memory Leaks", "Chrome", "Performance", "Hardware Acceleration"],
    relatedSlugs: [
      "core-web-vitals-optimization-eliminate-cls-sub-second-lcp",
      "fix-err-ssl-protocol-error-dns-resolution-failures",
      "why-copy-pasted-code-breaks-smart-quotes-nbsp-sanitization",
    ],
    helpfulYes: 447,
    helpfulNo: 11,
  },
  {
    id: "art-08",
    slug: "markdown-formatting-masterclass-technical-documentation",
    title:
      "Markdown Formatting Masterclass: Writing Clean Technical Documentation, Tables, and Callouts",
    subtitle:
      "Standardize READMEs, ADRs, and developer portals using GitHub Flavored Markdown (GFM), CommonMark AST rules, accessible tables, and semantic admonitions.",
    excerpt:
      "Great engineering documentation is structured, scannable, and portable. Learn how to master CommonMark and GFM syntax, prevent broken nested code blocks, format responsive comparison tables, and convert cleanly between Markdown and semantic HTML5.",
    category: "text-guides",
    publishedAt: "2026-10-09T11:00:00Z",
    updatedAt: "2026-10-25T08:30:00Z",
    testedOn: "",
    readingTimeMinutes: 7,
    wordCount: 1210,
    featured: false,
    status: "published",
    primaryKeyword: "Markdown formatting masterclass technical documentation",
    metaTitle:
      "Markdown Formatting Masterclass: Clean Technical Docs, Tables & Callouts | Zee Writes",
    metaDescription:
      "Complete guide to GitHub Flavored Markdown (GFM) and CommonMark for technical writers and developers: nested code fences, column-aligned tables, alerts, and HTML conversion.",
    coverImage: {
      url: "/images/diagrams/markdown-ast.svg",
      alt: "Abstract Syntax Tree (AST) diagram showing how Markdown source tokens parse into MDAST nodes and compile to semantic HTML5 elements",
      caption:
        "Figure 8.1: How a CommonMark parser tokenizes block and inline Markdown syntax into an Abstract Syntax Tree (MDAST) before emitting semantic HTML5.",
      width: 1200,
      height: 630,
      diagramType: "markdown-ast",
    },
    verifiedTakeaway: {
      symptom:
        "Markdown tables render as raw pipe characters, indented code blocks inside numbered lists reset list numbering to '1.', or backticks inside code examples break the surrounding fence.",
      rootCause:
        "Inconsistent whitespace indentation under list items (failing the 4-space / list-marker column rule), missing table separator header rows, or using 3 backticks around a block that itself contains 3 backticks.",
      instantFix:
        "Use 4-backtick (````) outer fences when documenting Markdown code blocks, indent nested list code blocks to match the first character of the list text, and validate your syntax live in the Zee Writes Markdown <-> HTML Converter.",
      estimatedFixTime: "1 minute",
      testedPlatforms: ["GitHub / GitLab", "MDX / Next.js", "Notion / Obsidian", "HTML5"],
    },
    howToSteps: [
      {
        stepNumber: 1,
        name: "Escape Nested Code Fences Using Quadruple Backticks (````) or Tildes (~~~)",
        text: "When writing documentation that shows users how to write a Markdown triple-backtick code block, opening and closing with ``` will prematurely close your outer block. Wrap the outer fence in four backticks (````markdown) or three tildes (~~~markdown).",
        commandOrCode:
          "````markdown\nHere is how to add a TypeScript code block in your README:\n\n```typescript\nconst greeting = 'Hello, Zee Writes!';\n```\n````",
        proTip:
          "According to the CommonMark specification, a fenced code block stays open until it encounters a closing fence of the same character (` or ~) that is AT LEAST as long as the opening fence.",
      },
      {
        stepNumber: 2,
        name: "Align GFM Tables and Escape Literal Pipe Characters (\\|)",
        text: "Every GitHub Flavored Markdown table requires a header row and a delimiter row of at least three hyphens per column. Use colons (:---, :---:, ---:) to control left, center, and right alignment, and escape literal pipes inside inline code as \\|.",
        commandOrCode: `| Operator | TypeScript Syntax | Alignment |\n| :--- | :---: | ---: |\n| Union Type | \`string \\| number\` | Right-aligned |`,
      },
      {
        stepNumber: 3,
        name: "Keep Numbered Lists Intact When Embedding Code Blocks or Callouts",
        text: "If your numbered list resets to 1. after every code snippet, your code fence is flush-left instead of indented under the list item. Indent every line of the nested block by 4 spaces (or align with the first letter after '1. ').",
        commandOrCode: `1. First step in the deployment runbook:\n\n   \`\`\`bash\n   npm run build\n   \`\`\`\n\n2. Second step continues automatically as #2 without resetting!`,
      },
      {
        stepNumber: 4,
        name: "Use Native Semantic Alert Callouts (> [!NOTE], > [!WARNING])",
        text: "Modern GitHub, GitLab, and technical documentation engines support accessible alert blockquotes that render with distinct icons and colored accent borders.",
        commandOrCode: `> [!IMPORTANT]\n> Always run database migrations inside a transaction before deploying container updates.\n\n> [!TIP]\n> Use the Zee Writes Markdown <-> Clean HTML Converter to preview semantic output instantaneously.`,
      },
    ],
    sections: [
      {
        id: "information-architecture-in-technical-docs",
        heading: "1. Structuring Clear Technical Documentation for Humans and Search Engines",
        paragraphs: [
          "Since John Gruber and Aaron Swartz created Markdown in 2004, it has become the universal lingua franca of software engineering, technical publishing, and AI knowledge bases. Yet there is a vast difference between a wall of unformatted paragraphs and an authoritative engineering runbook.",
          "High-utility technical writing follows the 'Inverted Pyramid of Diagnostics': begin with the exact symptom and fix summary at the top, present numbered reproducible steps with copy-ready commands second, and follow with deep architectural context, edge-case tables, and FAQs.",
          "Furthermore, strict heading hierarchy is essential for both screen-reader accessibility and SEO. A document must contain a single top-level `# H1` title, followed by logical `## H2` major sections and `### H3` subsections—never skipping levels (such as jumping from `H1` straight to `H4`) merely for visual font sizing.",
        ],
        table: {
          caption: "Table 8.1: Markdown Element Mapping to Semantic HTML5 & Accessibility Roles",
          headers: [
            "Markdown Syntax",
            "Compiled HTML5 Tag",
            "Editorial & SEO Purpose",
          ],
          rows: [
            [
              "# Title / ## Section",
              "<h1> / <h2>",
              "Document outline hierarchy & Table of Contents anchor targets",
            ],
            [
              "```lang ... ```",
              "<pre><code class='language-...'>",
              "Machine-executable snippets isolated from prose spellcheck",
            ],
            [
              "| Col A | Col B |",
              "<table><thead><tbody>",
              "Structured comparison matrices eligible for Google Featured Snippets",
            ],
            [
              "> [!WARNING]",
              "<aside role='note'> / <blockquote>",
              "High-visibility safety guardrails for destructive operations",
            ],
          ],
        },
      },
      {
        id: "converting-markdown-to-clean-html",
        heading: "2. Converting Between Markdown and Sanitized Semantic HTML5",
        paragraphs: [
          "When migrating documentation between Notion, Google Docs, headless CMS platforms, and static site generators, copying directly from a rich-text browser window often pollutes your markup with inline `style=\"...\"` attributes, `<span class=\"...\">` wrappers, and non-semantic `<div>` soup.",
          "By routing your content through a bidirectional Markdown <-> Semantic HTML5 pipeline, you strip presentation bloat while preserving structural tags (`<h2>`, `<h3>`, `<p>`, `<ul>`, `<ol>`, `<code>`, `<table>`, `<blockquote>`).",
        ],
        callout: {
          type: "verified-fix",
          title: "Try Our Live Split-Pane Markdown <-> HTML Converter",
          body: "Need to convert Markdown to clean semantic HTML5—or reverse-convert HTML back into Markdown? Open the Markdown <-> Clean HTML Converter in the Zee Writes Text Tools Suite.",
        },
      },
    ],
    faqs: [
      {
        question: "Why do single line breaks in Markdown not create a new line in the rendered HTML?",
        answer:
          "Following the CommonMark specification (inspired by LaTeX and email standards), a single newline inside a paragraph is treated as soft-wrap whitespace and rendered as a regular space. To create a true <p> paragraph break, leave a blank line (two newlines). To force a <br> hard line break within the same paragraph, end the line with two spaces or a backslash (\\).",
      },
      {
        question: "Can I use collapsible accordion sections (<details> and <summary>) inside pure Markdown?",
        answer:
          "Yes! Because CommonMark is a superset of HTML5 block elements, you can write native <details><summary>Click to expand log output</summary> ... </details> directly in Markdown files on GitHub, GitLab, and MDX, just ensuring you leave a blank line after the closing </summary> tag so inner Markdown parses properly.",
      },
      {
        question: "How do I link to a specific heading anchor within the same Markdown document?",
        answer:
          "Convert the heading text to lowercase, strip punctuation (except hyphens), and replace spaces with single hyphens. For example, a heading titled '## 2. Database Setup & Config' creates the anchor link `[Jump to Setup](#2-database-setup--config)`.",
      },
    ],
    author: DEFAULT_AUTHOR,
    tags: ["Markdown", "Technical Writing", "Documentation", "GFM", "HTML5"],
    relatedSlugs: [
      "clean-normalize-format-messy-pdf-copy-pasted-text",
      "mastering-regular-expressions-regex-text-search-cleanup",
      "core-web-vitals-optimization-eliminate-cls-sub-second-lcp",
    ],
    helpfulYes: 342,
    helpfulNo: 4,
  },
  {
    id: "art-09",
    slug: "resolve-git-line-ending-conflicts-crlf-lf-bom-errors",
    title:
      "How to Resolve Git Line Ending Conflicts (CRLF vs LF), Broken Diffs, and BOM Encoding Errors in Cross-Platform Repos",
    subtitle:
      "Eliminate phantom whole-file diffs, 'warning: LF will be replaced by CRLF', and '$\\r: command not found' bash errors across Windows, macOS, and Linux teams.",
    excerpt:
      "Nothing derails a pull request faster than a 1,000-line diff where every single line is marked changed even though only one variable was edited. Here is how to configure .gitattributes and normalize line endings permanently.",
    category: "how-to-fixes",
    publishedAt: "2026-10-12T15:30:00Z",
    updatedAt: "2026-10-25T14:00:00Z",
    testedOn: "",
    readingTimeMinutes: 7,
    wordCount: 1260,
    featured: false,
    status: "published",
    primaryKeyword: "resolve Git line ending conflicts CRLF vs LF",
    metaTitle:
      "How to Fix Git Line Ending Conflicts (CRLF vs LF) & Whole-File Diffs | Zee Writes",
    metaDescription:
      "Complete guide to fixing Git CRLF vs LF line ending warnings, phantom whole-file diffs, and '/bin/bash^M: bad interpreter' errors using .gitattributes.",
    coverImage: {
      url: "/images/diagrams/git-crlf.svg",
      alt: "Git index normalization architecture diagram showing Windows CRLF (0x0D 0x0A) working tree vs Unix LF (0x0A) repository object store via .gitattributes",
      caption:
        "Figure 9.1: How a declarative .gitattributes file enforces canonical LF (0x0A) storage inside the Git object database regardless of contributor OS.",
      width: 1200,
      height: 630,
      diagramType: "git-crlf",
    },
    verifiedTakeaway: {
      symptom:
        "Git marks every line of a file as modified in `git diff`, terminal prints `warning: in the working copy of '...', LF will be replaced by CRLF`, or Docker/Linux shell scripts fail with `/bin/sh^M: bad interpreter`.",
      rootCause:
        "Windows editors default to Carriage Return + Line Feed (CRLF, `\\r\\n`, hex `0D 0A`), whereas macOS, Linux, and Docker containers expect Line Feed only (LF, `\\n`, hex `0A`). Without a repository-level `.gitattributes` policy, local contributor `core.autocrlf` settings clash.",
      instantFix:
        "Commit a root `.gitattributes` file with `* text=auto eol=lf` (and `*.sh text eol=lf`), then run `git add --renormalize .` once to standardize the repository index.",
      estimatedFixTime: "90 seconds",
      testedPlatforms: ["Git 2.40+", "Windows 11 / WSL2", "Docker", "macOS / Linux"],
    },
    howToSteps: [
      {
        stepNumber: 1,
        name: "Create a Declarative .gitattributes File at the Repository Root",
        text: "Never rely on every developer remembering to configure `git config core.autocrlf` manually on their laptop. A `.gitattributes` file committed to the root of your repository enforces deterministic line endings for everyone automatically.",
        commandOrCode: `# .gitattributes\n* text=auto eol=lf\n\n# Explicitly force LF for shell scripts, Dockerfiles, and source code\n*.sh text eol=lf\n*.ts text eol=lf\n*.tsx text eol=lf\n*.json text eol=lf\n\n# Force CRLF only for Windows batch/PowerShell scripts\n*.bat text eol=crlf\n*.cmd text eol=crlf\n\n# Protect binary assets from text line-ending mutation\n*.png binary\n*.jpg binary\n*.webp binary\n*.woff2 binary`,
        proTip:
          "Setting `* text=auto eol=lf` works seamlessly with modern Windows tools: VS Code, Visual Studio, Notepad (Windows 10 1809+), and Node.js on Windows all natively support LF line endings.",
      },
      {
        stepNumber: 2,
        name: "Renormalize the Existing Git Index Without Manual Re-Saving",
        text: "After adding `.gitattributes`, files that were previously committed with CRLF bytes inside the Git object store must be re-indexed once.",
        commandOrCode: `git add --renormalize .\ngit status\ngit commit -m "chore: normalize repository line endings to LF via .gitattributes"`,
      },
      {
        stepNumber: 3,
        name: "Fix '/bin/bash^M: bad interpreter' in Shell Scripts and Docker Builds",
        text: "When a Windows host mounts a shell script (`entrypoint.sh`) with CRLF endings into a Linux Docker container, Linux reads the trailing `\\r` (`^M`) as part of the interpreter path (`#!/bin/bash\\r`), which does not exist.",
        commandOrCode: `# Strip carriage returns (\\r) in-place using sed or tr:\nsed -i 's/\\r$//' entrypoint.sh\n\n# Or in Node.js / cross-platform scripts:\nnode -e "const fs=require('fs'); fs.writeFileSync('entrypoint.sh', fs.readFileSync('entrypoint.sh','utf8').replace(/\\r\\n/g,'\\n'))"`,
      },
      {
        stepNumber: 4,
        name: "Ignore Line-Ending Noise During Code Reviews with git diff -w",
        text: "If you are reviewing a legacy branch that already mixed CRLF and LF changes, tell Git to ignore whitespace and carriage-return differences so you can see the real logic changes.",
        commandOrCode: `git diff --ignore-space-at-eol\n# Or shorthand:\ngit diff -w`,
      },
    ],
    sections: [
      {
        id: "history-of-crlf-vs-lf",
        heading: "1. Why Windows Uses CRLF (0x0D 0x0A) While Unix Uses LF (0x0A)",
        paragraphs: [
          "The split between CRLF and LF dates back to electromechanical teletypewriters (TTY) like the Teletype Model 33. On a physical typewriter carriage, two separate mechanical actions were required at the end of a line: a Carriage Return (`CR`, ASCII `0x0D`, `\\r`) to slide the print head back to the left margin, and a Line Feed (`LF`, ASCII `0x0A`, `\\n`) to advance the paper roller vertically by one line.",
          "When Multics and Unix were designed in the late 1960s and early 1970s, Ken Thompson and Dennis Ritchie abstracted hardware device drivers so a single byte—Line Feed (`0x0A`)—represented a newline in files. CP/M and subsequently MS-DOS and Microsoft Windows retained the two-byte `CRLF` sequence for backward compatibility with raw serial printers.",
          "Forty-five years later, that single extra `0x0D` byte at the end of every line remains one of the most frequent sources of friction in cross-platform software development.",
        ],
        table: {
          caption: "Table 9.1: Line Ending Standards Across Operating Systems & Runtimes",
          headers: [
            "Standard Name",
            "Escape Sequence",
            "Hex Bytes",
            "Native Platforms & Protocols",
          ],
          rows: [
            [
              "LF (Line Feed)",
              "\\n",
              "0x0A",
              "Linux, macOS (OS X+), iOS, Android, Docker, Git internal store",
            ],
            [
              "CRLF (Carriage Return + Line Feed)",
              "\\r\\n",
              "0x0D 0x0A",
              "Windows Notepad/CMD, HTTP/1.1 headers (RFC 9112), SMTP/MIME",
            ],
            [
              "CR (Classic Carriage Return)",
              "\\r",
              "0x0D",
              "Legacy Mac OS 9 and earlier (obsolete)",
            ],
          ],
        },
      },
      {
        id: "utf16-and-bom-git-issues",
        heading: "2. Fixing 'Binary file matches' when PowerShell Saves UTF-16 LE Files",
        paragraphs: [
          "Another frequent Windows Git trap occurs when developers redirect output in Windows PowerShell 5.1 using the `>` operator (e.g., `echo 'node_modules/' > .gitignore`). Unlike Bash or PowerShell 7+, legacy Windows PowerShell defaults the `>` redirection operator to `UTF-16 LE` with a leading Byte Order Mark (`FF FE`) and null bytes (`0x00`) after every ASCII character!",
          "Because Git detects `0x00` null bytes in the first 8,000 bytes of a file as a binary file signature, Git treats the `.gitignore` or source file as an opaque binary blob and ignores all rules inside it. Always use `Out-File -Encoding utf8` or resave the file as `UTF-8` without BOM.",
        ],
        callout: {
          type: "warning",
          title: "Check Your .gitignore Encoding If Ignored Files Still Appear",
          body: "If Git refuses to respect rules in your .gitignore file on Windows, check the bottom-right status bar of VS Code. If it says 'UTF-16 LE', click it, select 'Save with Encoding', and choose 'UTF-8'.",
        },
      },
    ],
    faqs: [
      {
        question: "Should I set git config --global core.autocrlf to true, input, or false?",
        answer:
          "If your repositories include a proper `.gitattributes` file with `* text=auto eol=lf`, `.gitattributes` overrides `core.autocrlf`. For global fallback settings without `.gitattributes`, use `core.autocrlf input` on macOS/Linux and `core.autocrlf false` (paired with VS Code `files.eol: \"\\n\"`) on modern Windows.",
      },
      {
        question: "Why does ESLint or Prettier complain about 'Delete ␍ (prettier/prettier)' on Windows?",
        answer:
          "Prettier defaults to `endOfLine: 'lf'`. If Git cloned the repository on Windows with `core.autocrlf=true`, Git converted every file on disk to CRLF (`\\r\\n`), causing Prettier to flag the `\\r` (`␍`) at the end of every line. Run `git config --global core.autocrlf false`, re-clone or run `git checkout -- .`, and commit `.gitattributes`.",
      },
      {
        question: "How can I compare two files side-by-side in the browser to see hidden line diffs?",
        answer:
          "Paste both file versions into the Zee Writes JSON / Text Diff & Formatting Validator in our Text Tools Suite to inspect exact line-by-line additions, deletions, and whitespace discrepancies.",
      },
    ],
    author: DEFAULT_AUTHOR,
    tags: ["Git", "CRLF vs LF", "Windows WSL2", "Docker", "DevOps"],
    relatedSlugs: [
      "why-copy-pasted-code-breaks-smart-quotes-nbsp-sanitization",
      "fix-corrupted-utf8-text-mojibake-zero-width-characters",
      "json-schema-validation-payload-minification-api-fixes",
    ],
    helpfulYes: 378,
    helpfulNo: 6,
  },
  {
    id: "art-10",
    slug: "json-schema-validation-payload-minification-api-fixes",
    title:
      "JSON Schema Validation, Payload Minification, and Fixing Malformed API Responses in Modern Web Applications",
    subtitle:
      "Diagnose 'Unexpected token < in JSON at position 0', trailing comma syntax errors, IEEE-754 64-bit integer truncation, and broken LLM JSON outputs.",
    excerpt:
      "JSON is the backbone of modern REST APIs, configuration files, and structured LLM outputs—yet RFC 8259 is notoriously unforgiving. Learn how to repair malformed JSON automatically, prevent BigInt precision loss, and validate payloads at runtime.",
    category: "solutions",
    publishedAt: "2026-10-16T09:00:00Z",
    updatedAt: "2026-10-26T08:00:00Z",
    testedOn: "",
    readingTimeMinutes: 7,
    wordCount: 1340,
    featured: false,
    status: "published",
    primaryKeyword: "JSON schema validation fixing malformed API responses",
    metaTitle:
      "JSON Validation, Repairing Malformed Payloads & Fixing API Parse Errors | Zee Writes",
    metaDescription:
      "Learn how to fix 'Unexpected token in JSON', strip trailing commas and comments, prevent 64-bit integer truncation, and validate JSON schemas in production.",
    coverImage: {
      url: "/images/diagrams/json-schema.svg",
      alt: "JSON RFC 8259 parser state machine and runtime schema validation diagram showing lexical repair, AST verification, and HTTP Content-Type checks",
      caption:
        "Figure 10.1: End-to-end JSON ingestion pipeline: Content-Type header verification, lexical repair of common formatting faults, and schema validation.",
      width: 1200,
      height: 630,
      diagramType: "json-schema",
    },
    verifiedTakeaway: {
      symptom:
        "Application crashes on `JSON.parse()` with `SyntaxError: Unexpected token < in JSON at position 0`, `Expected property name or '}' in JSON`, or large 64-bit database IDs silently lose their last 2 digits.",
      rootCause:
        "An upstream proxy/server returned an HTML 404/502 error page (`<!DOCTYPE html>`) instead of JSON; human-edited config files included trailing commas, comments, or single quotes; or 64-bit integers exceeded `Number.MAX_SAFE_INTEGER` ($2^{53}-1$).",
      instantFix:
        "Verify `response.ok` and `content-type: application/json` before calling `response.json()`, strip trailing commas `/,(\\s*[}\\]])/g -> '$1'`, and serialize 64-bit snowflake IDs as strings.",
      estimatedFixTime: "45 seconds (via Zee Writes JSON Validator & Repair Tool)",
      testedPlatforms: ["JavaScript / TypeScript", "REST & GraphQL APIs", "PostgreSQL JSONB"],
    },
    howToSteps: [
      {
        stepNumber: 1,
        name: "Fix 'Unexpected token < in JSON at position 0' with Resilient Fetch Guards",
        text: "When `JSON.parse()` complains about `<` at position 0, the server returned an HTML document (`<!DOCTYPE html>` or `<html>`)—typically an Nginx 502 Bad Gateway, Cloudflare challenge, or 404 HTML route—instead of a JSON payload. Always inspect status and Content-Type before parsing.",
        commandOrCode: `export async function safeFetchJson<T>(url: string): Promise<T> {\n  const res = await fetch(url);\n  const contentType = res.headers.get("content-type") || "";\n\n  if (!res.ok || !contentType.includes("application/json")) {\n    const rawPreview = (await res.text()).slice(0, 180);\n    throw new Error(\`HTTP \${res.status}: Expected JSON but received '\${contentType}'. Preview: \${rawPreview}\`);\n  }\n  return res.json() as Promise<T>;\n}`,
        proTip:
          "Logging the first 180 characters of `res.text()` when `!res.ok` immediately reveals the exact Nginx, Vercel, or API Gateway error message instead of a cryptic JSON syntax exception.",
      },
      {
        stepNumber: 2,
        name: "Automatically Repair Trailing Commas, Comments, and Unquoted Keys",
        text: "While JavaScript Objects and JSON5 allow trailing commas and `//` comments, strict RFC 8259 `JSON.parse()` rejects them immediately. Use our JSON Validator & Auto-Repair tool or a lexical pre-processor to sanitize human-edited configs.",
        commandOrCode: `export function repairLooseJson(raw: string): string {\n  return raw\n    // 1. Strip single-line and multi-line comments outside strings\n    .replace(/\\/\\*[\\s\\S]*?\\*\\/|([^\\\\:]|^)\\/\\/.*$/gm, "$1")\n    // 2. Replace curly smart quotes with straight double quotes\n    .replace(/[\\u201C\\u201D]/g, '"')\n    // 3. Remove trailing commas before } or ]\n    .replace(/,(\\s*[}\\]])/g, "$1")\n    .trim();\n}`,
      },
      {
        stepNumber: 3,
        name: "Prevent Silent Corruption of 64-Bit Snowflake IDs (IEEE-754 Precision Limit)",
        text: "JavaScript numbers are double-precision floats with a maximum safe integer of `9,007,199,254,740,991` (16 digits). A 64-bit Twitter/Discord Snowflake ID or Postgres `BIGINT` like `7392849201928374659` silently rounds to `7392849201928374000` inside `JSON.parse()`!",
        commandOrCode: `// Always serialize 64-bit IDs as strings in API responses:\n{\n  "transaction_id": "7392849201928374659",\n  "amount_cents": 49900\n}`,
      },
      {
        stepNumber: 4,
        name: "Minify and Validate JSON-LD Structured Data for SEO Rich Results",
        text: "Unescaped double quotes or newlines inside CMS article descriptions will break `<script type=\"application/ld+json\">` blocks in your HTML head. Always generate JSON-LD via `JSON.stringify(schemaObject)` rather than manual string interpolation.",
        commandOrCode: `<script\n  type="application/ld+json"\n  dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}\n/>`,
      },
    ],
    sections: [
      {
        id: "rfc-8259-strict-grammar",
        heading: "1. Why RFC 8259 JSON Is So Strict (And Where Developers Trip Up)",
        paragraphs: [
          "Douglas Crockford intentionally designed the JSON specification to be so minimal that its entire grammar fits on the back of a business card. By refusing to support comments, trailing commas, hexadecimal literals, `NaN`, `Infinity`, or single-quoted strings, JSON guarantees that every parser in every programming language (from C and Rust to Python and JavaScript) produces an identical data structure.",
          "However, because developers spend all day writing TypeScript and JavaScript objects—where trailing commas, single quotes, and unquoted property keys are encouraged by linters—copying an object literal into a `.json` file or Postman body frequently results in immediate parse errors.",
        ],
        table: {
          caption: "Table 10.1: JavaScript Object Literal vs Strict RFC 8259 JSON Rules",
          headers: [
            "Syntax Feature",
            "JavaScript / TypeScript Object",
            "Strict RFC 8259 JSON",
            "Auto-Repair Transformation",
          ],
          rows: [
            [
              "Trailing comma `{ \"a\": 1, }`",
              "Allowed (ES5+)",
              "SyntaxError",
              "Strip comma before `}` or `]`",
            ],
            [
              "Single-quoted strings `'hello'`",
              "Allowed",
              "SyntaxError",
              "Convert delimiter to `\"hello\"`",
            ],
            [
              "Unquoted keys `{ id: 42 }`",
              "Allowed",
              "SyntaxError",
              "Wrap identifier in double quotes `{\"id\": 42}`",
            ],
            [
              "Comments `// note` or `/* ... */`",
              "Allowed",
              "SyntaxError (use JSONC if supported)",
              "Strip comment tokens prior to parse",
            ],
            [
              "Special numbers `NaN`, `Infinity`, `undefined`",
              "Allowed",
              "SyntaxError",
              "Serialize as `null`",
            ],
          ],
        },
      },
      {
        id: "sanitizing-llm-json-outputs",
        heading: "2. Sanitizing Structured JSON Outputs from LLMs and Webhooks",
        paragraphs: [
          "With the rise of AI integrations, developers frequently parse JSON payloads generated by Large Language Models. Even when instructed to output raw JSON, models occasionally wrap the payload in Markdown code fences (` ```json ... ``` `), include explanatory preamble text, or leave an unescaped newline inside a string value.",
          "A production-grade JSON extraction function locates the outermost `{...}` or `[...]` substring, strips surrounding Markdown fences, repairs trailing commas, and validates the parsed object against a strict schema before passing it to business logic.",
        ],
        callout: {
          type: "verified-fix",
          title: "Validate, Repair & Diff JSON Instantly in Your Browser",
          body: "Open the JSON / Text Diff & Formatting Validator inside the Zee Writes Text Tools Suite to beautify, minify, auto-repair broken JSON, or compare two payloads side-by-side.",
        },
      },
    ],
    faqs: [
      {
        question: "Why does VS Code allow comments in tsconfig.json and settings.json if JSON forbids comments?",
        answer:
          "VS Code parses specific configuration files (`tsconfig.json`, `.vscode/settings.json`, `.eslintrc.json`) using a special mode called JSON with Comments (JSONC). Standard `JSON.parse()` in browsers, Node.js (`package.json`), and REST APIs strictly enforces RFC 8259 and will throw a SyntaxError if comments are present.",
      },
      {
        question: "How much bandwidth does JSON minification actually save?",
        answer:
          "Removing indentation whitespace and newlines from pretty-printed JSON reduces raw payload byte size and speeds up `JSON.parse()` execution in V8 because the lexer scans fewer whitespace bytes.",
      },
      {
        question: "How can I pinpoint the exact line and column of a JSON syntax error?",
        answer:
          "Paste your broken payload into the Zee Writes JSON Validator (`/tools/json-text-diff-validator`). It parses the byte offset reported by the engine, calculates the exact 1-indexed line and column number, and offers a 1-click 'Auto-Repair Broken JSON' button.",
      },
    ],
    author: DEFAULT_AUTHOR,
    tags: ["JSON", "API Development", "Data Validation", "JavaScript", "Web Architecture"],
    relatedSlugs: [
      "why-copy-pasted-code-breaks-smart-quotes-nbsp-sanitization",
      "core-web-vitals-optimization-eliminate-cls-sub-second-lcp",
      "resolve-git-line-ending-conflicts-crlf-lf-bom-errors",
    ],
    helpfulYes: 405,
    helpfulNo: 5,
  },
];
