"use client";

import React, { useMemo, useState } from "react";
import {
  Copy,
  Download,
  RotateCcw,
  FileCode2,
  CheckCircle2,
  AlertTriangle,
  Wand2,
  Eye,
  Code2,
  FileCode,
  ArrowLeftRight,
} from "lucide-react";
import { ToolSlug } from "@/types";
import { useSite } from "@/components/providers/SiteProvider";

interface TextToolWorkspaceProps {
  slug: ToolSlug;
}

const MINOR_WORDS_AP = new Set([
  "a",
  "an",
  "the",
  "and",
  "but",
  "or",
  "nor",
  "for",
  "yet",
  "so",
  "at",
  "by",
  "in",
  "of",
  "on",
  "to",
  "up",
  "as",
  "is",
  "if",
  "vs",
  "via",
]);

const MINOR_WORDS_CHICAGO = new Set([
  ...MINOR_WORDS_AP,
  "from",
  "into",
  "onto",
  "with",
  "over",
  "upon",
  "near",
  "like",
  "past",
  "off",
]);

const ENGLISH_STOP_WORDS = new Set([
  "the",
  "and",
  "to",
  "of",
  "in",
  "is",
  "it",
  "for",
  "that",
  "with",
  "on",
  "as",
  "are",
  "this",
  "by",
  "be",
  "at",
  "or",
  "from",
  "an",
  "not",
  "have",
  "has",
  "was",
  "were",
  "but",
  "can",
  "will",
  "your",
  "you",
  "we",
  "our",
  "their",
  "they",
  "which",
  "when",
  "how",
  "why",
  "what",
  "all",
  "any",
  "into",
]);

const MOJIBAKE_REPLACEMENTS: [string, string][] = [
  ["Ã¢â‚¬â„¢", "â€™"],
  ["Ã¢â‚¬Ëœ", "â€˜"],
  ["Ã¢â‚¬Å“", "â€œ"],
  ["Ã¢â‚¬\u009d", "â€"],
  ["Ã¢â‚¬â€", "â€”"],
  ["Ã¢â‚¬â€œ", "â€“"],
  ["Ã¢â‚¬Â¦", "â€¦"],
  ["Ã¢â‚¬Â¢", "â€¢"],
  ["ÃƒÂ©", "Ã©"],
  ["ÃƒÂ¨", "Ã¨"],
  ["ÃƒÂª", "Ãª"],
  ["ÃƒÂ«", "Ã«"],
  ["ÃƒÂ¡", "Ã¡"],
  ["Ãƒ ", "Ã "],
  ["ÃƒÂ¤", "Ã¤"],
  ["ÃƒÂ³", "Ã³"],
  ["ÃƒÂ¶", "Ã¶"],
  ["ÃƒÂº", "Ãº"],
  ["ÃƒÂ¼", "Ã¼"],
  ["ÃƒÂ±", "Ã±"],
  ["ÃƒÂ§", "Ã§"],
  ["Ã‚Â©", "Â©"],
  ["Ã‚Â®", "Â®"],
  ["Ã‚Â°", "Â°"],
  ["Ã‚ ", " "],
];

export function TextToolWorkspace({ slug }: TextToolWorkspaceProps) {
  switch (slug) {
    case "smart-case-formatter":
      return <SmartCaseTool />;
    case "word-counter-analyzer":
      return <WordAnalyzerTool />;
    case "invisible-character-fixer":
      return <InvisibleCharFixerTool />;
    case "duplicate-line-scrubber":
      return <DuplicateLineScrubberTool />;
    case "markdown-html-converter":
      return <MarkdownHtmlConverterTool />;
    case "json-text-diff-validator":
      return <JsonTextDiffValidatorTool />;
    default:
      return <SmartCaseTool />;
  }
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ============================================================================
 * TOOL 1: SMART CASE & TITLE FORMATTER
 * ========================================================================== */
function SmartCaseTool() {
  const { showToast } = useSite();
  const [input, setInput] = useState(
    "how to fix corrupted utf-8 text, mojibake symbols, and zero-width characters in seconds"
  );
  const [activeMode, setActiveMode] = useState<
    | "ap-title"
    | "chicago-title"
    | "sentence"
    | "upper"
    | "lower"
    | "camel"
    | "pascal"
    | "snake"
    | "kebab"
    | "constant"
    | "alternating"
  >("ap-title");

  const splitLexicalWords = (raw: string): string[] => {
    return raw
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
      .split(/[\s_\-./\\,:;|]+/)
      .map((w) => w.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, ""))
      .filter(Boolean);
  };

  const toTitleCase = (text: string, minorSet: Set<string>): string => {
    return text
      .split(/(\r?\n)/)
      .map((line) => {
        if (/^\r?\n$/.test(line)) return line;
        const tokens = line.trim().split(/\s+/);
        return tokens
          .map((token, idx) => {
            if (!token) return token;
            const prevToken = idx > 0 ? tokens[idx - 1] : "";
            const afterColonOrDash = /[:â€”â€“?!]$/.test(prevToken);
            const isFirst = idx === 0 || afterColonOrDash;
            const isLast = idx === tokens.length - 1;

            // Keep well-known uppercase technical acronyms
            const bare = token.replace(/[^a-zA-Z0-9-]/g, "");
            if (/^(UTF-8|SSL|TLS|DNS|HTML5?|CSS3?|JSON|SQL|API|URL|SEO|CWV|CLS|LCP|INP|PDF|CPU|RAM|GPU|CLI|IDE|AST)$/i.test(bare)) {
              const upperAcronym = bare.toUpperCase();
              return token.replace(new RegExp(bare, "i"), upperAcronym);
            }

            const lowerBare = bare.toLowerCase();
            if (!isFirst && !isLast && minorSet.has(lowerBare)) {
              return token.toLowerCase();
            }

            return token
              .toLowerCase()
              .replace(/(^|[-/(['"â€œâ€˜])([a-z])/g, (_, prefix, letter) => prefix + letter.toUpperCase());
          })
          .join(" ");
      })
      .join("");
  };

  const output = useMemo(() => {
    if (!input) return "";
    switch (activeMode) {
      case "ap-title":
        return toTitleCase(input, MINOR_WORDS_AP);
      case "chicago-title":
        return toTitleCase(input, MINOR_WORDS_CHICAGO);
      case "sentence":
        return input
          .toLowerCase()
          .replace(/(^\s*[a-z]|[.!?]\s+[a-z]|\n\s*[a-z])/g, (m) =>
            m.toUpperCase()
          );
      case "upper":
        return input.toUpperCase();
      case "lower":
        return input.toLowerCase();
      case "camel": {
        const words = splitLexicalWords(input);
        return words
          .map((w, i) =>
            i === 0
              ? w.toLowerCase()
              : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
          )
          .join("");
      }
      case "pascal": {
        const words = splitLexicalWords(input);
        return words
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join("");
      }
      case "snake":
        return splitLexicalWords(input)
          .map((w) => w.toLowerCase())
          .join("_");
      case "kebab":
        return splitLexicalWords(input)
          .map((w) => w.toLowerCase())
          .join("-");
      case "constant":
        return splitLexicalWords(input)
          .map((w) => w.toUpperCase())
          .join("_");
      case "alternating":
        return [...input]
          .map((ch, idx) => (idx % 2 === 0 ? ch.toLowerCase() : ch.toUpperCase()))
          .join("");
      default:
        return input;
    }
  }, [input, activeMode]);

  const modes: { id: typeof activeMode; label: string }[] = [
    { id: "ap-title", label: "AP Title Case" },
    { id: "chicago-title", label: "Chicago Title Case" },
    { id: "sentence", label: "Sentence case" },
    { id: "kebab", label: "kebab-case (SEO Slug)" },
    { id: "camel", label: "camelCase" },
    { id: "pascal", label: "PascalCase" },
    { id: "snake", label: "snake_case" },
    { id: "constant", label: "CONSTANT_CASE" },
    { id: "upper", label: "UPPERCASE" },
    { id: "lower", label: "lowercase" },
    { id: "alternating", label: "aLtErNaTiNg" },
  ];

  return (
    <div className="rounded-2xl border border-obsidian/[0.1] dark:border-white/[0.1] bg-ivory dark:bg-carbon-card shadow-editorial dark:shadow-editorial-dark p-5 sm:p-6 space-y-5">
      {/* Mode Selector Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setActiveMode(m.id)}
            className={`px-3 py-1.5 rounded-xl text-[13px] font-medium transition-all ${
              activeMode === m.id
                ? "bg-navy text-white shadow-sm"
                : "bg-obsidian/[0.04] dark:bg-white/[0.05] text-charcoal dark:text-cool-slate hover:text-obsidian dark:hover:text-pearl"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Input / Output Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-charcoal dark:text-cool-slate">
            <label htmlFor="case-input" className="font-semibold text-obsidian dark:text-pearl">
              Input text
            </label>
            <button
              type="button"
              onClick={() =>
                setInput(
                  "complete_guide_to_fixing_ERR_SSL_PROTOCOL_ERROR_in_windows_and_macos"
                )
              }
              className="text-[13px] text-navy dark:text-navy hover:underline"
            >
              Load sample
            </button>
          </div>
          <textarea
            id="case-input"
            rows={7}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste headline, paragraph, or variable identifier here..."
            className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon p-4 font-mono text-sm text-obsidian dark:text-pearl focus:outline-none focus:border-navy"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-charcoal dark:text-cool-slate">
            <span className="font-semibold text-obsidian dark:text-pearl">
              Formatted output ({output.length} chars)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(output);
                  showToast("Formatted output copied to clipboard!");
                }}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-navy text-white font-semibold text-[13px] hover:bg-navy/90"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy
              </button>
              <button
                type="button"
                onClick={() => downloadTextFile("zeewrites-formatted.txt", output)}
                aria-label="Download formatted output as .txt"
                className="p-1.5 rounded-lg border border-obsidian/[0.1] dark:border-white/[0.1] hover:bg-obsidian/[0.05]"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          <textarea
            readOnly
            rows={7}
            value={output}
            aria-label="Formatted case output"
            className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon p-4 font-mono text-sm text-obsidian dark:text-pearl focus:outline-none"
          />
        </div>
      </div>

      {/* Live Multi-Format Preview */}
      <div className="pt-3 border-t border-obsidian/[0.07] dark:border-white/[0.07] grid grid-cols-1 sm:grid-cols-3 gap-3 text-[13px]">
        <div className="rounded-xl bg-obsidian/[0.03] dark:bg-white/[0.03] p-3">
          <span className="text-charcoal dark:text-cool-slate block font-medium">
            URL Slug (kebab-case)
          </span>
          <span className="font-mono text-obsidian dark:text-pearl truncate block mt-0.5">
            /{splitLexicalWords(input).map((w) => w.toLowerCase()).join("-")}
          </span>
        </div>
        <div className="rounded-xl bg-obsidian/[0.03] dark:bg-white/[0.03] p-3">
          <span className="text-charcoal dark:text-cool-slate block font-medium">
            Property Name (camelCase)
          </span>
          <span className="font-mono text-obsidian dark:text-pearl truncate block mt-0.5">
            {splitLexicalWords(input)
              .map((w, i) =>
                i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
              )
              .join("")}
          </span>
        </div>
        <div className="rounded-xl bg-obsidian/[0.03] dark:bg-white/[0.03] p-3">
          <span className="text-charcoal dark:text-cool-slate block font-medium">
            Column Name (snake_case)
          </span>
          <span className="font-mono text-obsidian dark:text-pearl truncate block mt-0.5">
            {splitLexicalWords(input).map((w) => w.toLowerCase()).join("_")}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * TOOL 2: DEEP WORD, CHARACTER, READING TIME & KEYWORD DENSITY ANALYZER
 * ========================================================================== */
function WordAnalyzerTool() {
  const { showToast } = useSite();
  const [text, setText] = useState(
    "Clear technical writing helps readers solve software problems quickly. By keeping sentences concise and organizing steps in a logical order, guides become much easier to scan and follow."
  );
  const [ngramTab, setNgramTab] = useState<1 | 2 | 3>(1);
  const [filterStopWords, setFilterStopWords] = useState(true);

  const countSyllables = (word: string): number => {
    const clean = word.toLowerCase().replace(/[^a-z]/g, "");
    if (!clean) return 0;
    if (clean.length <= 3) return 1;
    const stripped = clean
      .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
      .replace(/^y/, "");
    const vowelMatches = stripped.match(/[aeiouy]{1,2}/g);
    return Math.max(1, vowelMatches ? vowelMatches.length : 1);
  };

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const charsWithSpaces = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const words = trimmed ? trimmed.match(/[\p{L}\p{N}_'-]+/gu) || [] : [];
    const wordCount = words.length;
    const sentences = trimmed
      ? trimmed.split(/[.!?]+(?:\s|$)/).filter((s) => s.trim().length > 0)
      : [];
    const sentenceCount = Math.max(wordCount > 0 ? 1 : 0, sentences.length);
    const paragraphs = trimmed
      ? trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
      : [];
    const paragraphCount = paragraphs.length;

    const totalSyllables = words.reduce((acc, w) => acc + countSyllables(w), 0);
    const asl = wordCount > 0 ? wordCount / sentenceCount : 0;
    const asw = wordCount > 0 ? totalSyllables / wordCount : 0;

    const fleschEase =
      wordCount > 0
        ? Math.max(0, Math.min(100, 206.835 - 1.015 * asl - 84.6 * asw))
        : 100;
    const fkGrade =
      wordCount > 0
        ? Math.max(0, 0.39 * asl + 11.8 * asw - 15.59)
        : 0;

    const readingMinutes = wordCount > 0 ? Math.ceil(wordCount / 200) : 0;
    const speakingSeconds = Math.ceil((wordCount / 130) * 60);

    // N-gram calculation
    const cleanTokens = words
      .map((w) => w.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, ""))
      .filter((w) => w.length > 1)
      .filter((w) => (filterStopWords ? !ENGLISH_STOP_WORDS.has(w) : true));

    const computeNgrams = (n: number) => {
      const counts = new Map<string, number>();
      for (let i = 0; i <= cleanTokens.length - n; i++) {
        const phrase = cleanTokens.slice(i, i + n).join(" ");
        counts.set(phrase, (counts.get(phrase) || 0) + 1);
      }
      const totalPossible = Math.max(1, cleanTokens.length - n + 1);
      return [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([phrase, count]) => ({
          phrase,
          count,
          density: ((count / totalPossible) * 100).toFixed(1),
        }));
    };

    return {
      wordCount,
      charsWithSpaces,
      charsNoSpaces,
      sentenceCount,
      paragraphCount,
      totalSyllables,
      asl: asl.toFixed(1),
      fleschEase: fleschEase.toFixed(1),
      fkGrade: fkGrade.toFixed(1),
      silentTime: `${readingMinutes} min`,
      speakingTime:
        speakingSeconds < 60
          ? `${speakingSeconds}s`
          : `${Math.floor(speakingSeconds / 60)}m ${speakingSeconds % 60}s`,
      ngrams: {
        1: computeNgrams(1),
        2: computeNgrams(2),
        3: computeNgrams(3),
      },
    };
  }, [text, filterStopWords]);

  return (
    <div className="rounded-2xl border border-obsidian/[0.1] dark:border-white/[0.1] bg-ivory dark:bg-carbon-card shadow-editorial dark:shadow-editorial-dark p-5 sm:p-6 space-y-6">
      {/* Top 6 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Words", val: stats.wordCount.toLocaleString() },
          { label: "Characters", val: stats.charsWithSpaces.toLocaleString() },
          { label: "No Spaces", val: stats.charsNoSpaces.toLocaleString() },
          { label: "Sentences", val: stats.sentenceCount },
          { label: "Reading Time", val: stats.silentTime },
          { label: "Speaking Time", val: stats.speakingTime },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-obsidian/[0.07] dark:border-white/[0.07] bg-alabaster dark:bg-carbon p-3.5"
          >
            <span className="text-[13px] font-medium text-charcoal dark:text-cool-slate block">
              {item.label}
            </span>
            <span className="text-xl font-display font-bold text-obsidian dark:text-pearl mt-1 block">
              {item.val}
            </span>
          </div>
        ))}
      </div>

      {/* Main Editor + Keyword Density Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="word-analyzer-input" className="font-semibold text-obsidian dark:text-pearl">
              Text input
            </label>
            <div className="flex items-center gap-3 text-[13px]">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(text);
                  showToast("Text copied to clipboard!");
                }}
                className="text-navy dark:text-navy hover:underline"
              >
                Copy Text
              </button>
              <button
                type="button"
                onClick={() => setText("")}
                className="text-charcoal dark:text-cool-slate hover:text-red-500"
              >
                Clear
              </button>
            </div>
          </div>
          <textarea
            id="word-analyzer-input"
            rows={11}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your article, essay, meta description, or script here..."
            className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon p-4 font-sans text-base leading-relaxed text-obsidian dark:text-pearl focus:outline-none focus:border-navy"
          />

          {/* Readability Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="rounded-xl border border-obsidian/[0.08] dark:border-white/[0.08] p-3">
              <div className="text-[13px] text-charcoal dark:text-cool-slate">
                Flesch Reading Ease
              </div>
              <div className="text-sm font-mono font-bold text-obsidian dark:text-pearl mt-0.5">
                {stats.fleschEase} / 100 (Grade {stats.fkGrade})
              </div>
            </div>
            <div className="rounded-xl border border-obsidian/[0.08] dark:border-white/[0.08] p-3">
              <div className="text-[13px] text-charcoal dark:text-cool-slate">
                Avg Sentence Length
              </div>
              <div className="text-sm font-mono font-bold text-obsidian dark:text-pearl mt-0.5">
                {stats.asl} words / sentence
              </div>
            </div>
            <div className="rounded-xl border border-obsidian/[0.08] dark:border-white/[0.08] p-3">
              <div className="text-[13px] text-charcoal dark:text-cool-slate">
                Paragraphs &amp; Syllables
              </div>
              <div className="text-sm font-mono font-bold text-obsidian dark:text-pearl mt-0.5">
                {stats.paragraphCount} paras â€¢ {stats.totalSyllables} syll
              </div>
            </div>
          </div>
        </div>

        {/* Keyword Density Panel */}
        <div className="rounded-xl border border-obsidian/[0.08] dark:border-white/[0.08] bg-alabaster/70 dark:bg-carbon/70 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-obsidian dark:text-pearl">
                Keyword Density
              </h3>
              <label className="flex items-center gap-1.5 text-[13px] text-charcoal dark:text-cool-slate cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterStopWords}
                  onChange={(e) => setFilterStopWords(e.target.checked)}
                  className="accent-navy"
                />
                Filter stop words
              </label>
            </div>

            <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-obsidian/[0.05] dark:bg-white/[0.05] mb-3">
              {([1, 2, 3] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNgramTab(n)}
                  className={`py-1 rounded text-[13px] font-medium ${
                    ngramTab === n
                      ? "bg-ivory dark:bg-carbon-card text-obsidian dark:text-pearl shadow-sm"
                      : "text-charcoal dark:text-cool-slate"
                  }`}
                >
                  {n}-Word
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              {stats.ngrams[ngramTab].length === 0 ? (
                <p className="text-[13px] text-charcoal dark:text-cool-slate py-6 text-center">
                  Add more words to compute {ngramTab}-word phrase frequency.
                </p>
              ) : (
                stats.ngrams[ngramTab].map((item) => (
                  <div
                    key={item.phrase}
                    className="flex items-center justify-between text-[13px] font-mono px-2.5 py-1.5 rounded-lg bg-ivory dark:bg-carbon-card border border-obsidian/[0.05] dark:border-white/[0.05]"
                  >
                    <span className="truncate max-w-[155px] text-obsidian dark:text-pearl font-medium">
                      {item.phrase}
                    </span>
                    <span className="text-navy dark:text-navy shrink-0">
                      {item.count}Ã— ({item.density}%)
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * TOOL 3: INVISIBLE CHARACTER, BROKEN ENCODING & WHITESPACE FIXER
 * ========================================================================== */
function InvisibleCharFixerTool() {
  const { showToast } = useSite();
  const [rawInput, setRawInput] = useState(
    "â€œDonÃ¢â‚¬â„¢t let hidden\u200B zero-width spaces\uFEFF or non-breaking\u00A0spaces break your RÃƒÂ©sumÃƒÂ© or production JSON!â€\n\n\nHere is a command â€”with broken em-dash flags."
  );
  const [fixMojibake, setFixMojibake] = useState(true);
  const [stripZeroWidth, setStripZeroWidth] = useState(true);
  const [convertNbsp, setConvertNbsp] = useState(true);
  const [straightenQuotes, setStraightenQuotes] = useState(true);
  const [collapseBlankLines, setCollapseBlankLines] = useState(true);
  const [viewMode, setViewMode] = useState<"clean" | "xray">("clean");

  const analysis = useMemo(() => {
    let text = rawInput;
    const zwMatches =
      rawInput.match(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF\u00AD]/g) || [];
    const nbspMatches = rawInput.match(/\u00A0/g) || [];
    const smartQuoteMatches =
      rawInput.match(/[\u2018\u2019\u201C\u201D\u2013\u2014]/g) || [];

    let mojibakeCount = 0;
    for (const [corrupt, fixed] of MOJIBAKE_REPLACEMENTS) {
      if (text.includes(corrupt)) {
        const occurrences = text.split(corrupt).length - 1;
        mojibakeCount += occurrences;
        if (fixMojibake) {
          text = text.split(corrupt).join(fixed);
        }
      }
    }

    if (stripZeroWidth) {
      text = text.replace(
        /[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF\u00AD]/g,
        ""
      );
    }

    if (convertNbsp) {
      text = text.replace(/\u00A0/g, " ");
    }

    if (straightenQuotes) {
      text = text
        .replace(/[\u201C\u201D\u201E]/g, '"')
        .replace(/[\u2018\u2019\u201A]/g, "'")
        .replace(/\u2014/g, "--")
        .replace(/\u2013/g, "-");
    }

    // Trim trailing spaces on each line
    text = text.replace(/[ \t]+$/gm, "");

    if (collapseBlankLines) {
      text = text.replace(/\n{3,}/g, "\n\n");
    }

    const xrayAnnotated = rawInput
      .replace(/\u200B/g, "⟦ZWSP U+200B⟧")
      .replace(/\u200C/g, "⟦ZWNJ U+200C⟧")
      .replace(/\u200D/g, "⟦ZWJ U+200D⟧")
      .replace(/\uFEFF/g, "⟦BOM U+FEFF⟧")
      .replace(/\u00AD/g, "⟦SHY U+00AD⟧")
      .replace(/\u00A0/g, "⟦NBSP U+00A0⟧");

    return {
      cleaned: text.normalize("NFC"),
      xrayAnnotated,
      zwCount: zwMatches.length,
      nbspCount: nbspMatches.length,
      mojibakeCount,
      smartQuoteCount: smartQuoteMatches.length,
    };
  }, [
    rawInput,
    fixMojibake,
    stripZeroWidth,
    convertNbsp,
    straightenQuotes,
    collapseBlankLines,
  ]);

  return (
    <div className="rounded-2xl border border-obsidian/[0.1] dark:border-white/[0.1] bg-ivory dark:bg-carbon-card shadow-editorial dark:shadow-editorial-dark p-5 sm:p-6 space-y-5">
      {/* Diagnostic Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-red-500/25 bg-red-500/[0.05] p-3">
          <span className="text-[13px] font-medium text-red-600 dark:text-red-400 block">
            Zero-Width Characters
          </span>
          <span className="text-lg font-mono font-bold text-obsidian dark:text-pearl">
            {analysis.zwCount} detected
          </span>
        </div>
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.05] p-3">
          <span className="text-[13px] font-medium text-amber-600 dark:text-amber-400 block">
            UTF-8 Mojibake
          </span>
          <span className="text-lg font-mono font-bold text-obsidian dark:text-pearl">
            {analysis.mojibakeCount} detected
          </span>
        </div>
        <div className="rounded-xl border border-navy/25 bg-navy/[0.05] p-3">
          <span className="text-[13px] font-medium text-navy dark:text-navy block">
            Non-Breaking Spaces
          </span>
          <span className="text-lg font-mono font-bold text-obsidian dark:text-pearl">
            {analysis.nbspCount} detected
          </span>
        </div>
        <div className="rounded-xl border border-emerald-signal/25 bg-emerald-signal/[0.05] p-3">
          <span className="text-[13px] font-medium text-emerald-700 dark:text-emerald-300 block">
            Smart Quotes &amp; Dashes
          </span>
          <span className="text-lg font-mono font-bold text-obsidian dark:text-pearl">
            {analysis.smartQuoteCount} detected
          </span>
        </div>
      </div>

      {/* Sanitization Rule Checkboxes */}
      <div className="flex flex-wrap items-center gap-4 text-[13px] pt-1">
        <label className="flex items-center gap-1.5 cursor-pointer font-medium">
          <input
            type="checkbox"
            checked={fixMojibake}
            onChange={(e) => setFixMojibake(e.target.checked)}
            className="accent-navy"
          />
          <span>Repair UTF-8 Mojibake (â€™ → ’, Ã© → é)</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer font-medium">
          <input
            type="checkbox"
            checked={stripZeroWidth}
            onChange={(e) => setStripZeroWidth(e.target.checked)}
            className="accent-navy"
          />
          <span>Strip Zero-Width (U+200B, U+FEFF)</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer font-medium">
          <input
            type="checkbox"
            checked={convertNbsp}
            onChange={(e) => setConvertNbsp(e.target.checked)}
            className="accent-navy"
          />
          <span>Convert NBSP (U+00A0) to Regular Space</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer font-medium">
          <input
            type="checkbox"
            checked={straightenQuotes}
            onChange={(e) => setStraightenQuotes(e.target.checked)}
            className="accent-navy"
          />
          <span>Convert Smart Quotes/Dashes to Straight ASCII</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer font-medium">
          <input
            type="checkbox"
            checked={collapseBlankLines}
            onChange={(e) => setCollapseBlankLines(e.target.checked)}
            className="accent-navy"
          />
          <span>Collapse Duplicate Blank Lines</span>
        </label>
      </div>

      {/* Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="fixer-raw" className="font-semibold text-obsidian dark:text-pearl">
              Input text
            </label>
            <button
              type="button"
              onClick={() => setRawInput("")}
              className="text-[13px] text-charcoal dark:text-cool-slate hover:text-red-500"
            >
              Clear
            </button>
          </div>
          <textarea
            id="fixer-raw"
            rows={8}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder="Paste corrupted UTF-8 text, PDF extract, or failing code snippet..."
            className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon p-4 font-mono text-sm text-obsidian dark:text-pearl focus:outline-none focus:border-navy"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[13px]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode("clean")}
                className={`px-2.5 py-1 rounded-lg font-semibold ${
                  viewMode === "clean"
                    ? "bg-emerald-signal text-white"
                    : "bg-obsidian/[0.05] dark:bg-white/[0.06] text-charcoal dark:text-cool-slate"
                }`}
              >
                Cleaned Output
              </button>
              <button
                type="button"
                onClick={() => setViewMode("xray")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold ${
                  viewMode === "xray"
                    ? "bg-amber-500 text-obsidian"
                    : "bg-obsidian/[0.05] dark:bg-white/[0.06] text-charcoal dark:text-cool-slate"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                X-Ray View
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(analysis.cleaned);
                showToast("Cleaned text copied to clipboard!");
              }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-navy text-white font-semibold"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy Text
            </button>
          </div>

          <textarea
            readOnly
            rows={8}
            value={
              viewMode === "clean" ? analysis.cleaned : analysis.xrayAnnotated
            }
            aria-label="Cleaned or X-Ray output"
            className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon p-4 font-mono text-sm text-obsidian dark:text-pearl focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * TOOL 4: DUPLICATE LINE & LIST SCRUBBER
 * ========================================================================== */
function DuplicateLineScrubberTool() {
  const { showToast } = useSite();
  const [input, setInput] = useState(
    "us-east-1\neu-central-1\nus-east-1\nap-southeast-2\nUS-EAST-1\n\neu-west-1\nap-southeast-2"
  );
  const [caseInsensitive, setCaseInsensitive] = useState(true);
  const [trimLines, setTrimLines] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [sortMode, setSortMode] = useState<
    "none" | "az" | "za" | "numeric" | "length"
  >("none");
  const [wrapMode, setWrapMode] = useState<
    "none" | "single-quote" | "double-quote" | "html-li" | "markdown-list"
  >("none");
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [filterQuery, setFilterQuery] = useState("");

  const result = useMemo(() => {
    const rawLines = input.replace(/\r\n/g, "\n").split("\n");
    const seen = new Set<string>();
    const uniqueLines: string[] = [];
    let duplicatesRemoved = 0;

    for (const rawLine of rawLines) {
      const line = trimLines ? rawLine.trim() : rawLine;
      if (removeEmpty && line.length === 0) continue;

      if (filterQuery.trim()) {
        try {
          const rx = new RegExp(filterQuery.trim(), "i");
          if (!rx.test(line)) continue;
        } catch {
          if (!line.toLowerCase().includes(filterQuery.toLowerCase())) continue;
        }
      }

      const key = caseInsensitive ? line.toLowerCase() : line;
      if (seen.has(key)) {
        duplicatesRemoved++;
      } else {
        seen.add(key);
        uniqueLines.push(line);
      }
    }

    const sorted = [...uniqueLines];
    const collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: "base",
    });

    if (sortMode === "az") sorted.sort((a, b) => a.localeCompare(b));
    if (sortMode === "za") sorted.sort((a, b) => b.localeCompare(a));
    if (sortMode === "numeric") sorted.sort(collator.compare);
    if (sortMode === "length") sorted.sort((a, b) => a.length - b.length);

    const wrapped = sorted.map((item, idx) => {
      const withAffix = `${prefix}${item}${suffix}`;
      const isLast = idx === sorted.length - 1;
      switch (wrapMode) {
        case "single-quote":
          return `'${withAffix}'${isLast ? "" : ","}`;
        case "double-quote":
          return `"${withAffix}"${isLast ? "" : ","}`;
        case "html-li":
          return `  <li>${withAffix}</li>`;
        case "markdown-list":
          return `- ${withAffix}`;
        default:
          return withAffix;
      }
    });

    const finalString =
      wrapMode === "html-li" && wrapped.length > 0
        ? `<ul>\n${wrapped.join("\n")}\n</ul>`
        : wrapped.join("\n");

    return {
      output: finalString,
      originalCount: rawLines.length,
      uniqueCount: sorted.length,
      duplicatesRemoved,
    };
  }, [
    input,
    caseInsensitive,
    trimLines,
    removeEmpty,
    sortMode,
    wrapMode,
    prefix,
    suffix,
    filterQuery,
  ]);

  return (
    <div className="rounded-2xl border border-obsidian/[0.1] dark:border-white/[0.1] bg-ivory dark:bg-carbon-card shadow-editorial dark:shadow-editorial-dark p-5 sm:p-6 space-y-5">
      {/* Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[13px]">
        <div>
          <label className="font-medium text-charcoal dark:text-cool-slate block mb-1">
            Sort Order
          </label>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as typeof sortMode)}
            className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon px-3 py-2 text-obsidian dark:text-pearl"
          >
            <option value="none">Preserve Original Order</option>
            <option value="az">Alphabetical (A → Z)</option>
            <option value="za">Reverse Alphabetical (Z → A)</option>
            <option value="numeric">Natural Numerical (1, 2, 10)</option>
            <option value="length">Line Length (Shortest First)</option>
          </select>
        </div>

        <div>
          <label className="font-medium text-charcoal dark:text-cool-slate block mb-1">
            Wrap Items In
          </label>
          <select
            value={wrapMode}
            onChange={(e) => setWrapMode(e.target.value as typeof wrapMode)}
            className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon px-3 py-2 text-obsidian dark:text-pearl"
          >
            <option value="none">Plain Lines (No Wrapper)</option>
            <option value="single-quote">SQL Single Quotes (&apos;item&apos;,)</option>
            <option value="double-quote">JSON Double Quotes (&quot;item&quot;,)</option>
            <option value="html-li">HTML &lt;ul&gt;&lt;li&gt;...&lt;/li&gt;&lt;/ul&gt;</option>
            <option value="markdown-list">Markdown Bullet (- item)</option>
          </select>
        </div>

        <div>
          <label className="font-medium text-charcoal dark:text-cool-slate block mb-1">
            Custom Prefix / Suffix
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="Prefix..."
              className="rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon px-2.5 py-2 text-obsidian dark:text-pearl font-mono"
            />
            <input
              type="text"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              placeholder="Suffix..."
              className="rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon px-2.5 py-2 text-obsidian dark:text-pearl font-mono"
            />
          </div>
        </div>

        <div>
          <label className="font-medium text-charcoal dark:text-cool-slate block mb-1">
            Filter by Keyword / Regex
          </label>
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="e.g. ^us- or ERROR"
            className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon px-3 py-2 text-obsidian dark:text-pearl font-mono"
          />
        </div>
      </div>

      {/* Checkboxes */}
      <div className="flex flex-wrap items-center gap-4 text-[13px]">
        <label className="flex items-center gap-1.5 cursor-pointer font-medium">
          <input
            type="checkbox"
            checked={caseInsensitive}
            onChange={(e) => setCaseInsensitive(e.target.checked)}
            className="accent-navy"
          />
          <span>Case-Insensitive Deduplication</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer font-medium">
          <input
            type="checkbox"
            checked={trimLines}
            onChange={(e) => setTrimLines(e.target.checked)}
            className="accent-navy"
          />
          <span>Trim Leading &amp; Trailing Whitespace</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer font-medium">
          <input
            type="checkbox"
            checked={removeEmpty}
            onChange={(e) => setRemoveEmpty(e.target.checked)}
            className="accent-navy"
          />
          <span>Remove Empty Lines</span>
        </label>
      </div>

      {/* Input / Output Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-obsidian dark:text-pearl">
              Input list ({result.originalCount} lines)
            </span>
            <button
              type="button"
              onClick={() => setInput("")}
              className="text-[13px] text-charcoal dark:text-cool-slate hover:text-red-500"
            >
              Clear
            </button>
          </div>
          <textarea
            rows={9}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste list of lines, emails, URLs, or IDs..."
            className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon p-4 font-mono text-sm text-obsidian dark:text-pearl focus:outline-none focus:border-navy"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-obsidian dark:text-pearl">
              Cleaned list ({result.uniqueCount} unique •{" "}
              {result.duplicatesRemoved} duplicates removed)
            </span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(result.output);
                showToast("Deduplicated list copied to clipboard!");
              }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-navy text-white font-semibold text-[13px]"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy List
            </button>
          </div>
          <textarea
            readOnly
            rows={9}
            value={result.output}
            aria-label="Deduplicated list output"
            className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon p-4 font-mono text-sm text-obsidian dark:text-pearl focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * TOOL 5: MARKDOWN <-> CLEAN HTML & RICH TEXT CONVERTER
 * ========================================================================== */
function MarkdownHtmlConverterTool() {
  const { showToast } = useSite();
  const [direction, setDirection] = useState<"md-to-html" | "html-to-md">(
    "md-to-html"
  );
  const [rightTab, setRightTab] = useState<"preview" | "code">("preview");
  const [source, setSource] = useState(
    `## Network Troubleshooting Steps\n\nFollow this checklist to resolve **ERR_SSL_PROTOCOL_ERROR**:\n\n1. Flush Chromium socket pools at \`chrome://net-internals/#sockets\`\n2. Reset local OS DNS resolver cache\n3. Check TLS 1.3 negotiation\n\n| Layer | Protocol | Port |\n| :--- | :--- | :--- |\n| DNS | DoH (1.1.1.1) | 443 |\n| HTTPS | TLS 1.3 | 443 |\n\n> [!TIP]\n> Always reserve space for dynamic elements to prevent layout shift.`
  );

  const compileMarkdownToHtml = (md: string): string => {
    let html = md.replace(/\r\n/g, "\n");

    // 1. Fenced code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      const escaped = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .trimEnd();
      const cls = lang ? ` class="language-${lang}"` : "";
      return `<pre><code${cls}>${escaped}</code></pre>`;
    });

    // 2. GFM Tables
    html = html.replace(
      /^\|(.+)\|\n\|([-:| ]+)\|\n((?:\|.*\|\n?)+)/gm,
      (_, headerLine, _alignLine, bodyBlock) => {
        const headers = headerLine
          .split("|")
          .map((c: string) => c.trim())
          .filter(Boolean);
        const rows = bodyBlock
          .trim()
          .split("\n")
          .map((r: string) =>
            r
              .replace(/^\||\|$/g, "")
              .split("|")
              .map((c: string) => c.trim())
          );
        const thead = `  <thead>\n    <tr>\n${headers
          .map((h: string) => `      <th>${h}</th>`)
          .join("\n")}\n    </tr>\n  </thead>`;
        const tbody = `  <tbody>\n${rows
          .map(
            (r: string[]) =>
              `    <tr>\n${r
                .map((c: string) => `      <td>${c}</td>`)
                .join("\n")}\n    </tr>`
          )
          .join("\n")}\n  </tbody>`;
        return `<table>\n${thead}\n${tbody}\n</table>`;
      }
    );

    // 3. Blockquotes / Alerts
    html = html.replace(/^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\n>\s*(.+)$/gm, (_, type, body) => {
      return `<aside role="note" data-alert="${type.toLowerCase()}">\n  <strong>${type}:</strong> ${body}\n</aside>`;
    });
    html = html.replace(/^>\s*(.+)$/gm, "<blockquote><p>$1</p></blockquote>");

    // 4. Headings
    html = html
      .replace(/^####\s+(.+)$/gm, "<h4>$1</h4>")
      .replace(/^###\s+(.+)$/gm, "<h3>$1</h3>")
      .replace(/^##\s+(.+)$/gm, "<h2>$1</h2>")
      .replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");

    // 5. Lists
    html = html.replace(/(?:^\d+\.\s+.+\n?)+/gm, (block) => {
      const items = block
        .trim()
        .split("\n")
        .map((l) => `  <li>${l.replace(/^\d+\.\s+/, "")}</li>`)
        .join("\n");
      return `<ol>\n${items}\n</ol>`;
    });
    html = html.replace(/(?:^[-*]\s+.+\n?)+/gm, (block) => {
      const items = block
        .trim()
        .split("\n")
        .map((l) => `  <li>${l.replace(/^[-*]\s+/, "")}</li>`)
        .join("\n");
      return `<ul>\n${items}\n</ul>`;
    });

    // 6. Inline tokens
    html = html
      .replace(/`([^`\n]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // 7. Paragraphs for remaining lines
    const blocks = html.split(/\n\n+/);
    return blocks
      .map((b) => {
        const t = b.trim();
        if (!t) return "";
        if (/^<(h[1-6]|ul|ol|pre|table|blockquote|aside)/i.test(t)) return t;
        return `<p>${t}</p>`;
      })
      .filter(Boolean)
      .join("\n\n");
  };

  const compileHtmlToMarkdown = (rawHtml: string): string => {
    return rawHtml
      .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "# $1\n\n")
      .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "## $1\n\n")
      .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "### $1\n\n")
      .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "#### $1\n\n")
      .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**")
      .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**")
      .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*")
      .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*")
      .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`")
      .replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
      .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n")
      .replace(/<\/?(ul|ol|p|div|span|section|article)[^>]*>/gi, "\n")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  const compiledOutput = useMemo(() => {
    return direction === "md-to-html"
      ? compileMarkdownToHtml(source)
      : compileHtmlToMarkdown(source);
  }, [source, direction]);

  return (
    <div className="rounded-2xl border border-obsidian/[0.1] dark:border-white/[0.1] bg-ivory dark:bg-carbon-card shadow-editorial dark:shadow-editorial-dark p-5 sm:p-6 space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDirection("md-to-html")}
            className={`px-3 py-1.5 rounded-xl text-[13px] font-semibold ${
              direction === "md-to-html"
                ? "bg-navy text-white"
                : "bg-obsidian/[0.05] dark:bg-white/[0.06] text-charcoal dark:text-cool-slate"
            }`}
          >
            Markdown → Clean HTML5
          </button>
          <button
            type="button"
            onClick={() => {
              setSource(compiledOutput);
              setDirection((d) =>
                d === "md-to-html" ? "html-to-md" : "md-to-html"
              );
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-medium border border-obsidian/[0.12] dark:border-white/[0.12] text-obsidian dark:text-pearl hover:bg-obsidian/[0.04]"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Swap Direction
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRightTab("preview")}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[13px] font-medium ${
              rightTab === "preview"
                ? "bg-emerald-signal text-white"
                : "bg-obsidian/[0.05] dark:bg-white/[0.06] text-charcoal dark:text-cool-slate"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Visual Preview
          </button>
          <button
            type="button"
            onClick={() => setRightTab("code")}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[13px] font-medium ${
              rightTab === "code"
                ? "bg-emerald-signal text-white"
                : "bg-obsidian/[0.05] dark:bg-white/[0.06] text-charcoal dark:text-cool-slate"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Output Code
          </button>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(compiledOutput);
              showToast("Compiled markup copied to clipboard!");
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-navy text-white text-[13px] font-semibold"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy Output
          </button>
        </div>
      </div>

      {/* Split Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="text-sm font-semibold text-obsidian dark:text-pearl mb-2">
            {direction === "md-to-html"
              ? "Markdown input"
              : "HTML input"}
          </div>
          <textarea
            rows={13}
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon p-4 font-mono text-sm text-obsidian dark:text-pearl focus:outline-none focus:border-navy"
          />
        </div>

        <div>
          <div className="text-sm font-semibold text-obsidian dark:text-pearl mb-2">
            {rightTab === "preview"
              ? "Preview"
              : "Output code"}
          </div>
          {rightTab === "code" ? (
            <textarea
              readOnly
              rows={13}
              value={compiledOutput}
              aria-label="Compiled HTML or Markdown code"
              className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon p-4 font-mono text-sm text-obsidian dark:text-pearl focus:outline-none"
            />
          ) : (
            <div
              className="h-[312px] overflow-y-auto rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon p-5 prose-sm space-y-3 text-obsidian dark:text-pearl [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_code]:font-mono [&_code]:bg-obsidian/[0.07] dark:[&_code]:bg-white/[0.1] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_table]:w-full [&_th]:text-left [&_th]:border-b [&_th]:pb-1 [&_td]:py-1 [&_aside]:p-3 [&_aside]:rounded-lg [&_aside]:bg-emerald-500/10 [&_ol]:list-decimal [&_ol]:pl-5"
              dangerouslySetInnerHTML={{
                __html:
                  direction === "md-to-html"
                    ? compiledOutput
                    : compileMarkdownToHtml(compiledOutput),
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * TOOL 6: JSON / TEXT DIFF & FORMATTING VALIDATOR
 * ========================================================================== */
function JsonTextDiffValidatorTool() {
  const { showToast } = useSite();
  const [tab, setTab] = useState<"json" | "diff">("json");

  // JSON State
  const [jsonInput, setJsonInput] = useState(
    `{\n  // Broken config with comment, smart quotes & trailing comma\n  â€œserviceâ€: "zeewrites-api",\n  "port": 8080,\n  "features": ["utf8-repair", "json-format",],\n}`
  );
  const [indentSpaces] = useState<2 | 4>(2);
  const [sortKeys, setSortKeys] = useState(false);

  // Diff State
  const [leftText, setLeftText] = useState(
    `{\n  "site": "Zee Writes",\n  "port": 3000,\n  "timeout": 5000,\n  "mode": "development"\n}`
  );
  const [rightText, setRightText] = useState(
    `{\n  "site": "Zee Writes",\n  "port": 8080,\n  "timeout": 5000,\n  "retries": 3,\n  "mode": "production"\n}`
  );

  const sortObjectKeysRecursively = (val: unknown): unknown => {
    if (Array.isArray(val)) return val.map(sortObjectKeysRecursively);
    if (val !== null && typeof val === "object") {
      const sortedEntries = Object.entries(val as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, sortObjectKeysRecursively(v)]);
      return Object.fromEntries(sortedEntries);
    }
    return val;
  };

  const jsonValidation = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonInput);
      const normalized = sortKeys ? sortObjectKeysRecursively(parsed) : parsed;
      const pretty = JSON.stringify(normalized, null, indentSpaces);
      const minified = JSON.stringify(normalized);
      return {
        valid: true as const,
        pretty,
        minified,
        savedBytes: Math.max(0, pretty.length - minified.length),
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid JSON syntax";
      const posMatch = msg.match(/position\s+(\d+)/i);
      let line = 1;
      let col = 1;
      if (posMatch) {
        const pos = Number(posMatch[1]);
        const upToPos = jsonInput.slice(0, pos);
        const lines = upToPos.split("\n");
        line = lines.length;
        col = (lines[lines.length - 1]?.length || 0) + 1;
      }
      return {
        valid: false as const,
        error: msg,
        line,
        col,
      };
    }
  }, [jsonInput, indentSpaces, sortKeys]);

  const handleAutoRepairJson = () => {
    const repaired = jsonInput
      .replace(/^```(?:json)?\s*|\s*```$/g, "")
      .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "$1")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
      .replace(/:\s*'([^']*)'/g, ': "$1"')
      .replace(/,(\s*[}\]])/g, "$1")
      .trim();

    setJsonInput(repaired);
    showToast("Auto-repaired comments, smart quotes, and trailing commas!");
  };

  // Line-by-line LCS Diff calculation
  const diffLines = useMemo(() => {
    const a = leftText.replace(/\r\n/g, "\n").split("\n");
    const b = rightText.replace(/\r\n/g, "\n").split("\n");
    const m = a.length;
    const n = b.length;

    const dp: number[][] = Array.from({ length: m + 1 }, () =>
      Array(n + 1).fill(0)
    );
    for (let i = m - 1; i >= 0; i--) {
      for (let j = n - 1; j >= 0; j--) {
        if (a[i] === b[j]) {
          dp[i][j] = 1 + dp[i + 1][j + 1];
        } else {
          dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
      }
    }

    const result: {
      type: "same" | "added" | "removed";
      text: string;
      leftLine?: number;
      rightLine?: number;
    }[] = [];

    let i = 0;
    let j = 0;
    while (i < m && j < n) {
      if (a[i] === b[j]) {
        result.push({
          type: "same",
          text: a[i],
          leftLine: i + 1,
          rightLine: j + 1,
        });
        i++;
        j++;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        result.push({ type: "removed", text: a[i], leftLine: i + 1 });
        i++;
      } else {
        result.push({ type: "added", text: b[j], rightLine: j + 1 });
        j++;
      }
    }
    while (i < m) {
      result.push({ type: "removed", text: a[i], leftLine: i + 1 });
      i++;
    }
    while (j < n) {
      result.push({ type: "added", text: b[j], rightLine: j + 1 });
      j++;
    }

    return result;
  }, [leftText, rightText]);

  return (
    <div className="rounded-2xl border border-obsidian/[0.1] dark:border-white/[0.1] bg-ivory dark:bg-carbon-card shadow-editorial dark:shadow-editorial-dark p-5 sm:p-6 space-y-5">
      {/* Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab("json")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[13px] font-semibold ${
              tab === "json"
                ? "bg-navy text-white"
                : "bg-obsidian/[0.05] dark:bg-white/[0.06] text-charcoal dark:text-cool-slate"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            JSON Validator, Beautifier &amp; Auto-Repair
          </button>
          <button
            type="button"
            onClick={() => setTab("diff")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[13px] font-semibold ${
              tab === "diff"
                ? "bg-navy text-white"
                : "bg-obsidian/[0.05] dark:bg-white/[0.06] text-charcoal dark:text-cool-slate"
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Side-by-Side Text &amp; Code Diff
          </button>
        </div>

        {tab === "json" && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAutoRepairJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-obsidian text-[13px] font-semibold"
            >
              <Wand2 className="w-3.5 h-3.5" />
              Auto-Repair Broken JSON
            </button>
            <label className="flex items-center gap-1.5 text-[13px] cursor-pointer">
              <input
                type="checkbox"
                checked={sortKeys}
                onChange={(e) => setSortKeys(e.target.checked)}
                className="accent-navy"
              />
              <span>Sort Keys A–Z</span>
            </label>
          </div>
        )}
      </div>

      {tab === "json" ? (
        <div className="space-y-4">
          {/* Validation Status Banner */}
          {jsonValidation.valid ? (
            <div className="rounded-xl border border-emerald-signal/30 bg-emerald-signal/10 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[13px]">
              <span className="inline-flex items-center gap-2 font-mono font-semibold text-emerald-700 dark:text-emerald-300">
                Valid RFC 8259 JSON • Minify saves {jsonValidation.savedBytes} bytes
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setJsonInput(jsonValidation.pretty)}
                  className="px-2.5 py-1 rounded-lg bg-ivory dark:bg-carbon text-obsidian dark:text-pearl font-mono text-[13px]"
                >
                  Beautify ({indentSpaces}-Space)
                </button>
                <button
                  type="button"
                  onClick={() => setJsonInput(jsonValidation.minified)}
                  className="px-2.5 py-1 rounded-lg bg-ivory dark:bg-carbon text-obsidian dark:text-pearl font-mono text-[13px]"
                >
                  Minify (1-Line)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(jsonValidation.pretty);
                    showToast("Valid JSON copied to clipboard!");
                  }}
                  className="px-2.5 py-1 rounded-lg bg-navy text-white font-semibold text-[13px]"
                >
                  Copy JSON
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-[13px]">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Syntax Fault near Line {jsonValidation.line}, Column{" "}
                  {jsonValidation.col}: {jsonValidation.error}
                </span>
              </div>
              <button
                type="button"
                onClick={handleAutoRepairJson}
                className="px-3 py-1 rounded-lg bg-red-600 text-white font-semibold"
              >
                Fix Syntax Automatically
              </button>
            </div>
          )}

          <textarea
            rows={11}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            aria-label="JSON payload editor"
            className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon p-4 font-mono text-sm text-obsidian dark:text-pearl focus:outline-none focus:border-navy"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-obsidian dark:text-pearl block mb-1.5">
                Original text
              </label>
              <textarea
                rows={7}
                value={leftText}
                onChange={(e) => setLeftText(e.target.value)}
                className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon p-3.5 font-mono text-[13px] text-obsidian dark:text-pearl"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-obsidian dark:text-pearl block mb-1.5">
                Modified text
              </label>
              <textarea
                rows={7}
                value={rightText}
                onChange={(e) => setRightText(e.target.value)}
                className="w-full rounded-xl border border-obsidian/[0.12] dark:border-white/[0.12] bg-alabaster dark:bg-carbon p-3.5 font-mono text-[13px] text-obsidian dark:text-pearl"
              />
            </div>
          </div>

          {/* Unified Line-by-Line Diff Output */}
          <div className="rounded-xl border border-obsidian/[0.1] dark:border-white/[0.1] bg-alabaster dark:bg-carbon overflow-hidden">
            <div className="px-4 py-2 border-b border-obsidian/[0.08] dark:border-white/[0.08] flex items-center justify-between text-[13px]">
              <span className="font-semibold text-obsidian dark:text-pearl">
                Line-by-line differences
              </span>
              <div className="flex items-center gap-3 font-mono">
                <span className="text-emerald-600 dark:text-emerald-400">
                  +{diffLines.filter((d) => d.type === "added").length} Added
                </span>
                <span className="text-red-600 dark:text-red-400">
                  −{diffLines.filter((d) => d.type === "removed").length} Removed
                </span>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto font-mono text-[13px] divide-y divide-obsidian/[0.04] dark:divide-white/[0.04]">
              {diffLines.map((line, idx) => (
                <div
                  key={idx}
                  className={`flex items-start px-3 py-1 ${
                    line.type === "added"
                      ? "bg-emerald-500/15 text-emerald-900 dark:text-emerald-200"
                      : line.type === "removed"
                      ? "bg-red-500/15 text-red-900 dark:text-red-200"
                      : "text-charcoal dark:text-cool-slate"
                  }`}
                >
                  <span className="w-8 shrink-0 opacity-50 select-none">
                    {line.leftLine ?? ""}
                  </span>
                  <span className="w-8 shrink-0 opacity-50 select-none">
                    {line.rightLine ?? ""}
                  </span>
                  <span className="w-5 shrink-0 font-bold select-none">
                    {line.type === "added"
                      ? "+"
                      : line.type === "removed"
                      ? "−"
                      : " "}
                  </span>
                  <span className="whitespace-pre-wrap break-all">
                    {line.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

