import { TextToolDefinition, ToolSlug } from "@/types";

export const TEXT_TOOLS: TextToolDefinition[] = [
  {
    id: "tool-01",
    slug: "smart-case-formatter",
    name: "Smart Case & Title Formatter",
    shortName: "Smart Case Formatter",
    tagline: "Convert between AP/Chicago Title Case, Sentence case, camelCase, snake_case, kebab-case & PascalCase.",
    description:
      "An intelligent, rule-aware capitalization and developer identifier transformation engine that preserves acronyms, respects AP/Chicago minor-word prepositions, and generates clean code slugs instantaneously.",
    metaTitle:
      "Smart Case & Title Formatter — AP Title Case, Sentence, camelCase & snake_case | Zee Writes",
    metaDescription:
      "Convert text between Sentence case, AP/Chicago Title Case, camelCase, snake_case, kebab-case, PascalCase, and CONSTANT_CASE with our free client-side formatter.",
    badge: "Editorial & Dev Naming",
    accentColor: "indigo",
    features: [
      "AP & Chicago Manual of Style Title Case with minor-word exception dictionary",
      "Sentence case parser that respects proper nouns and terminal punctuation (. ! ?)",
      "Developer identifier modes: camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE",
      "Alternating & Inverse case + 1-click Copy and .txt file export",
    ],
    guideTitle: "Complete Engineering & Editorial Guide to Text Capitalization and Identifier Naming Conventions",
    guideSubtitle:
      "How grammatical title casing algorithms differ from lexical code tokenizers, and when to apply each convention in publishing and software architecture.",
    guideWordCount: 920,
    formulaBox: {
      title: "Title Case & Lexical Boundary Tokenization Logic",
      formula:
        "Tokens = Split(Input, /(?=[A-Z][a-z])|[\\s_\\-]+/) → Map(Token, Index => IsFirstOrLast(Index) || !MinorWords.has(Lower(Token)) ? Capitalize(Token) : Lower(Token))",
      explanation:
        "Unlike naive CSS text-transform: capitalize (which blindly capitalizes every word including 'of', 'in', 'the', and 'and'), our Smart Case engine splits compound boundaries first, checks each token against a curated set of articles, coordinating conjunctions, and short prepositions, and forces capitalization on the first word, last word, and any word following a colon or em-dash.",
    },
    useCases: [
      {
        role: "Technical Editors & Content Strategists",
        scenario: "Standardizing 50+ article headlines and H2 subheadings to strict AP or Chicago Title Case before publication.",
        outcome: "Eliminates manual capitalization errors on prepositions ('a', 'an', 'the', 'for', 'to', 'in') while keeping acronyms like 'UTF-8', 'API', and 'JSON' intact.",
      },
      {
        role: "Full-Stack Software Engineers",
        scenario: "Converting human-readable database column descriptions or Figma component labels into camelCase TypeScript props, snake_case SQL fields, and kebab-case URL slugs.",
        outcome: "Generates deterministic, collision-free variable identifiers across SQL, GraphQL, React, and CSS in one click.",
      },
      {
        role: "Data Analysts & CRM Administrators",
        scenario: "Fixing ALL-CAPS customer name or product title imports exported from legacy ERP mainframes.",
        outcome: "Restores natural Sentence case or Title Case readability across thousands of rows without spreadsheet formula chains.",
      },
    ],
    comparisonTable: {
      caption: "Standard Capitalization & Naming Conventions Reference Matrix",
      headers: ["Case Style", "Example Output", "Primary Industry Standard / Use Case"],
      rows: [
        [
          "Title Case (AP / Chicago)",
          "How to Fix Errors in the Cloud",
          "Editorial headlines, book titles, H1/H2 article headers, navigation labels",
        ],
        [
          "Sentence case",
          "How to fix errors in the cloud.",
          "UI microcopy (Linear/Stripe style), documentation body text, FAQ questions",
        ],
        [
          "camelCase",
          "howToFixErrorsInTheCloud",
          "JavaScript/TypeScript variables, React props, JSON keys, Java methods",
        ],
        [
          "PascalCase (UpperCamel)",
          "HowToFixErrorsInTheCloud",
          "React/Vue components, TypeScript interfaces, C# classes, Rust structs",
        ],
        [
          "snake_case",
          "how_to_fix_errors_in_the_cloud",
          "PostgreSQL/MySQL table & column names, Python functions (PEP 8), Rust modules",
        ],
        [
          "kebab-case (Slug)",
          "how-to-fix-errors-in-the-cloud",
          "SEO URLs, HTML data-* attributes, CSS class names, npm package names",
        ],
        [
          "CONSTANT_CASE",
          "HOW_TO_FIX_ERRORS_IN_THE_CLOUD",
          "Environment variables (.env), C/C++ macros, global configuration constants",
        ],
      ],
    },
    guideSections: [
      {
        id: "why-css-capitalize-is-not-title-case",
        heading: "1. Why CSS 'text-transform: capitalize' Fails Editorial Standards",
        paragraphs: [
          "A common shortcut in web development is applying `text-transform: capitalize` in CSS to format blog titles or navigation headers automatically. However, browser rendering engines implement CSS capitalization using a strictly mechanical rule: uppercase the first letter of every whitespace-delimited sequence. As a result, a headline like 'Working with an API in the Cloud' renders awkwardly as 'Working With An Api In The Cloud'.",
          "True editorial Title Case—governed by style manuals such as the Associated Press (AP) Stylebook, the Chicago Manual of Style (CMOS), and the MLA Handbook—distinguishes between major content words (nouns, verbs, adjectives, adverbs, pronouns) and minor structural words (articles like 'a', 'an', 'the'; coordinating conjunctions like 'and', 'but', 'or', 'nor', 'for', 'yet', 'so'; and short prepositions like 'in', 'on', 'at', 'to', 'by', 'of').",
          "Our Smart Case & Title Formatter parses sentence structure contextually. It keeps minor words lowercase when they appear in the interior of a phrase, while automatically capitalizing the very first word, the very last word, and the first word immediately following a colon (`:`), em-dash (`—`), or question mark (`?`).",
        ],
      },
      {
        id: "lexical-boundary-detection-for-developers",
        heading: "2. Lexical Word-Boundary Splitting Across camelCase, snake_case, and kebab-case",
        paragraphs: [
          "In modern full-stack software engineering, a single domain entity often crosses four syntactic boundaries in a single HTTP request: a PostgreSQL database stores `user_billing_address` in `snake_case`, a Prisma or GraphQL serializer maps it to `userBillingAddress` in `camelCase`, a React component renders `<UserBillingAddress />` in `PascalCase`, and the browser route points to `/settings/user-billing-address` in `kebab-case`.",
          "Converting between these formats requires an accurate lexical tokenizer that detects case transitions (such as a lowercase character followed immediately by an uppercase character `([a-z0-9])([A-Z])`) as well as non-alphanumeric delimiters (spaces, underscores, hyphens, and dots). Once decomposed into an array of normalized lowercase root tokens, the engine can reassemble the tokens into any target convention with zero data loss.",
        ],
      },
      {
        id: "privacy-and-local-execution",
        heading: "3. Client-Side Execution in Your Browser",
        paragraphs: [
          "Whether you are formatting product roadmaps, article headlines, or database schemas, your text stays in your browser tab. Every transformation in the Zee Writes Smart Case Formatter runs locally inside your device's JavaScript engine.",
        ],
      },
    ],
    faqs: [
      {
        question: "What is the difference between AP Style and Chicago Style Title Case?",
        answer:
          "Both style guides capitalize the first and last words of a title along with all nouns, pronouns, verbs, adjectives, and adverbs, while lowercasing articles ('a', 'an', 'the') and coordinating conjunctions. The primary difference lies in prepositions: Chicago Style lowercases all prepositions regardless of length (unless they are the first or last word), whereas AP Style capitalizes prepositions of four or more letters (such as 'With', 'From', 'Between', and 'Through').",
      },
      {
        question: "How does Sentence case handle multi-sentence paragraphs?",
        answer:
          "Our Sentence case converter scans for terminal punctuation boundaries—specifically periods (.), exclamation marks (!), question marks (?), and newline breaks—and capitalizes the first alphabetic character of each new sentence while normalizing the rest of the sentence to lowercase.",
      },
      {
        question: "Why should URLs always use kebab-case instead of snake_case?",
        answer:
          "Google's search crawler (Googlebot) explicitly treats hyphens (-) in URLs as word separators, whereas underscores (_) are historically treated as word joiners. Therefore, `/category/how-to-fixes` is indexed as three distinct keywords ('how', 'to', 'fixes'), while `/category/how_to_fixes` may be tokenized as a single concatenated string.",
      },
      {
        question: "Can I convert camelCase code directly into human-readable Sentence or Title Case?",
        answer:
          "Yes! Our lexical splitter detects uppercase transitions inside camelCase and PascalCase strings (e.g., `fetchUserAccountDetails`) and automatically inserts spaces before each capital transition to produce `Fetch User Account Details` or `Fetch user account details`.",
      },
    ],
  },
  {
    id: "tool-02",
    slug: "word-counter-analyzer",
    name: "Deep Word, Character, Reading Time & Keyword Density Analyzer",
    shortName: "Word & SEO Analyzer",
    tagline: "Real-time word/character counts, Flesch-Kincaid readability grade, speaking time & 1/2/3-word n-gram keyword density.",
    description:
      "A comprehensive editorial and SEO text telemetry dashboard that calculates exact word, character, sentence, paragraph, and syllable counts alongside Flesch Reading Ease scores and n-gram keyword density tables.",
    metaTitle:
      "Word Counter, Readability Score & SEO Keyword Density Analyzer | Zee Writes",
    metaDescription:
      "Analyze word count, character limits, Flesch-Kincaid readability score, reading/speaking time, and 1-word, 2-word, and 3-word SEO keyword density in real time.",
    badge: "SEO & Editorial Telemetry",
    accentColor: "emerald",
    features: [
      "Instant words, characters (with & without spaces), sentences, paragraphs & average sentence length",
      "Flesch Reading Ease (0–100) & Flesch-Kincaid Grade Level calculation via syllable counting",
      "Silent Reading Time (200 WPM) & Public Speaking Time (130 WPM) estimators",
      "1-Word, 2-Word (Bigram) & 3-Word (Trigram) SEO Keyword Density tables with stop-word filtering",
    ],
    guideTitle: "Understanding Text Readability Formulas, Reading Speed Psychophysics, and N-Gram Keyword Density",
    guideSubtitle:
      "How Flesch-Kincaid syllable ratios, cognitive reading benchmarks, and TF/n-gram frequency analysis shape high-performing technical and editorial writing.",
    guideWordCount: 950,
    formulaBox: {
      title: "Flesch Reading Ease & Keyword Density Mathematical Formulas",
      formula:
        "FRE = 206.835 − 1.015 × (Total Words / Total Sentences) − 84.6 × (Total Syllables / Total Words)  |  Density(%) = (N-Gram Count / Total Filtered Words) × 100",
      explanation:
        "Developed by Rudolf Flesch and J. Peter Kincaid for the U.S. Navy in 1975, the Flesch Reading Ease formula penalizes overly long sentences (syntactic complexity) and polysyllabic words (lexical complexity). A score between 60 and 75 represents crisp, accessible journalism and technical documentation.",
    },
    useCases: [
      {
        role: "Writers & Content Editors",
        scenario: "Checking that long-form articles maintain a natural primary keyword density without repeating terms unnaturally.",
        outcome: "Ensures comprehensive topic coverage and balanced 2-word and 3-word semantic phrases.",
      },
      {
        role: "Copywriters & Social Media Managers",
        scenario: "Checking strict character budgets for HTML <title> tags (55–60 chars), <meta name='description'> tags (150–160 chars), and X/LinkedIn posts.",
        outcome: "Prevents SERP ellipsis truncation in Google Search results.",
      },
      {
        role: "Keynote Speakers, Podcasters & Video Creators",
        scenario: "Timing a teleprompter script or voiceover narration before recording.",
        outcome: "Accurately predicts spoken duration at 130 words per minute.",
      },
    ],
    comparisonTable: {
      caption: "Flesch Reading Ease Score & Character Length Benchmarks",
      headers: ["Metric / Platform", "Target Range", "Editorial Interpretation"],
      rows: [
        [
          "Flesch Score: 70 – 80",
          "7th–8th Grade Level",
          "Ideal for consumer how-to guides, product copy, and broad journalism",
        ],
        [
          "Flesch Score: 50 – 69",
          "10th–12th Grade Level",
          "Ideal for technical tutorials, developer documentation, and B2B explainers",
        ],
        [
          "Flesch Score: 30 – 49",
          "College / Academic",
          "Dense legal policies, RFC specifications, or academic papers (split long sentences)",
        ],
        [
          "Google SEO Title Tag",
          "50 – 60 Characters",
          "Displays in full on desktop and mobile SERPs without pixel truncation",
        ],
        [
          "Google Meta Description",
          "145 – 160 Characters",
          "Optimal snippet length for search results",
        ],
        [
          "Long-Form Guide Word Count",
          "900 – 1,500+ Words",
          "Covers topics thoroughly for step-by-step guides and tutorials",
        ],
      ],
    },
    guideSections: [
      {
        id: "how-word-and-syllable-tokenization-works",
        heading: "1. How Accurate Word, Sentence, and Syllable Tokenization Works",
        paragraphs: [
          "Counting words sounds trivial until you encounter real-world technical prose containing hyphenated compounds (`client-side`, `UTF-8`), version numbers (`v24.18.0`), contractions (`don't`), and code snippets. A naive `text.split(' ').length` count inflates word counts whenever double spaces or newline breaks occur.",
          "Our analyzer strips invisible formatting artifacts, normalizes whitespace, and extracts lexical word tokens using Unicode-aware boundary matching. To compute Flesch-Kincaid readability scores in real time, the engine evaluates English vowel-group heuristics—accounting for silent trailing `-e` endings, `-le` suffixes, and diphthong pairs (`ea`, `ou`, `ai`)—to estimate syllable density per word alongside average sentence length (ASL).",
        ],
      },
      {
        id: "reading-time-vs-speaking-time",
        heading: "2. The Science of Silent Reading Speed (238 WPM) vs Speaking Speed (130 WPM)",
        paragraphs: [
          "A meta-analysis of 190 eye-tracking studies published by Marc Brysbaert in the Journal of Memory and Language established that the average adult silent reading speed for non-fiction English prose is **238 words per minute (WPM)**. Technical articles containing code blocks or mathematical notation are typically read slightly more deliberately (around 200–220 WPM).",
          "By contrast, when reading a script aloud for a YouTube tutorial, podcast, or conference keynote, human articulation and natural pause cadence limit comfortable speaking speed to **130 to 150 WPM**. Our analyzer calculates both metrics simultaneously so writers and presenters get exact minute-and-second durations.",
        ],
      },
      {
        id: "ngram-keyword-density-for-seo",
        heading: "3. Using 1-Word, 2-Word, and 3-Word N-Gram Tables to Prevent Keyword Stuffing",
        paragraphs: [
          "Modern search engines evaluate topical relevance through term frequency and multi-word co-occurrence (bigrams and trigrams) rather than single-word repetition. If a single non-stop word exceeds 3.5%–4% of your total word count, the prose often reads unnaturally and risks triggering over-optimization filters.",
          "By automatically filtering out common grammatical stop words ('the', 'and', 'to', 'of', 'in', 'is', 'for', 'that', 'with') and grouping your text into 1-word unigrams, 2-word bigrams (e.g., `core web`), and 3-word trigrams (e.g., `core web vitals`), you can audit your semantic topic distribution at a glance.",
        ],
      },
    ],
    faqs: [
      {
        question: "What is a healthy keyword density percentage for an SEO article?",
        answer:
          "For primary 1-word and 2-word terms, a natural frequency between 0.8% and 2.2% is ideal. Rather than repeating the exact same phrase mechanically, focus on including natural semantic variations, troubleshooting error codes, and related technical terminology.",
      },
      {
        question: "Why does my Flesch Reading Ease score drop when I write technical documentation?",
        answer:
          "Technical terminology inherently uses multi-syllable words ('authentication', 'configuration', 'synchronization', 'serialization'—each 5 to 6 syllables). Because the Flesch formula multiplies average syllables per word by 84.6, you can keep technical writing highly readable by keeping your average sentence length short (under 18–20 words per sentence) and using bulleted lists.",
      },
      {
        question: "Does the character counter include or exclude spaces and line breaks?",
        answer:
          "We display both metrics side-by-side in real time: 'Characters (with spaces)'—which is the strict byte/character limit enforced by Google title tags, meta descriptions, and social networks—and 'Characters (no spaces)' for academic and translation billing standards.",
      },
    ],
  },
  {
    id: "tool-03",
    slug: "invisible-character-fixer",
    name: "Invisible Character, Broken Encoding & Whitespace Fixer",
    shortName: "Invisible Char & Encoding Fixer",
    tagline: "Detect and strip zero-width spaces (U+200B), NBSP, UTF-8 mojibake (â€™, Ã©), smart quotes & duplicate blank lines.",
    description:
      "A diagnostic Unicode inspector and 1-click text sanitizer that reveals hidden zero-width characters, repairs corrupted Windows-1252/UTF-8 mojibake sequences, converts curly quotes to straight ASCII, and normalizes line breaks.",
    metaTitle:
      "Invisible Character Viewer, Zero-Width Space Remover & UTF-8 Mojibake Fixer | Zee Writes",
    metaDescription:
      "Detect and remove hidden zero-width spaces (U+200B, U+FEFF), non-breaking spaces (U+00A0), UTF-8 mojibake symbols (â€™, Ã©), and smart quotes instantly.",
    badge: "Unicode Diagnostics",
    accentColor: "violet",
    features: [
      "Visual X-Ray Inspector highlighting U+200B, U+200C, U+200D, U+FEFF (BOM), and U+00A0 (NBSP)",
      "Automatic UTF-8 / Windows-1252 Mojibake dictionary & byte-stream repair (â€™ → ’, Ã© → é)",
      "Smart Quote & Em-Dash to strict 7-bit ASCII code sanitizer",
      "Trailing whitespace trimmer, PDF hard-wrap unwrapper & Unicode NFC normalizer",
    ],
    guideTitle: "How to Diagnose Hidden Unicode Control Characters, Non-Breaking Spaces, and Mojibake Text Corruption",
    guideSubtitle:
      "A deep dive into invisible Unicode code points, why copy-pasted text breaks parsers, and how deterministic sanitization restores clean UTF-8.",
    guideWordCount: 910,
    formulaBox: {
      title: "Unicode Sanitization & Code-Point Inspection Pipeline",
      formula:
        "Clean(S) = NFC( MojibakeRepair(S).replace(/[\\u200B-\\u200F\\u202A-\\u202E\\u2060-\\u206F\\uFEFF]/g, '').replace(/\\u00A0/g, ' ') )",
      explanation:
        "The sanitizer scans the UTF-16 code unit stream in three passes: first repairing multi-character UTF-8/CP1252 mojibake sequences, second stripping zero-width formatting and bidirectional control characters, and finally applying Canonical Decomposition followed by Canonical Composition (NFC).",
    },
    useCases: [
      {
        role: "Software Developers & DevOps Engineers",
        scenario: "Debugging mysterious 'Unexpected token ILLEGAL' or JSON parse errors caused by a hidden U+200B zero-width space or U+00A0 non-breaking space in copied code.",
        outcome: "Visual X-Ray mode pinpoints the exact hidden character and strips it in one click.",
      },
      {
        role: "Database & E-Commerce Managers",
        scenario: "Cleaning product catalogs and CSV imports polluted with mojibake sequences like 'Menâ€™s Café & RÃ©sumÃ©'.",
        outcome: "Restores clean typographic punctuation and accented characters across thousands of lines.",
      },
      {
        role: "Academic Researchers & Technical Writers",
        scenario: "Sanitizing excerpts copied from PDFs, Notion, Slack, or AI chat interfaces before pasting into LaTeX, Markdown, or CMS editors.",
        outcome: "Guarantees 100% clean, standard UTF-8/ASCII prose with normalized paragraph breaks.",
      },
    ],
    comparisonTable: {
      caption: "Directory of Common Invisible & Corrupting Unicode Characters",
      headers: ["Code Point", "Official Unicode Name", "Visual Appearance", "Why It Causes Bugs"],
      rows: [
        [
          "U+200B",
          "Zero-Width Space (ZWSP)",
          "Completely invisible (0px)",
          "Breaks string equality checks, JSON keys, URLs, and code identifiers",
        ],
        [
          "U+FEFF",
          "Zero-Width No-Break Space (BOM)",
          "Completely invisible (0px)",
          "Causes 'Unexpected token' at index 0 in JSON.parse() and shell scripts",
        ],
        [
          "U+00A0",
          "No-Break Space (NBSP)",
          "Looks like regular space",
          "Rejected by JS/Python/SQL/Bash lexers outside string literals",
        ],
        [
          "U+200C / U+200D",
          "Zero-Width Non-Joiner / Joiner",
          "Completely invisible (0px)",
          "Alters ligature joining and inflates string .length unexpectedly",
        ],
        [
          "U+00AD",
          "Soft Hyphen (SHY)",
          "Invisible unless line-wrapped",
          "Corrupts search indexing and keyword matching inside words",
        ],
        [
          "U+202E",
          "Right-to-Left Override (RLO)",
          "Reverses visual text direction",
          "Used in Trojan Source (CVE-2021-42574) to disguise malicious code",
        ],
      ],
    },
    guideSections: [
      {
        id: "why-invisible-characters-exist",
        heading: "1. Why Invisible Characters Exist in the Unicode Standard",
        paragraphs: [
          "Invisible characters are not bugs in Unicode—they were engineered for legitimate international typesetting needs. For example, languages like Thai, Burmese, and Khmer do not use visible spaces between words, so typesetting engines rely on `U+200B` (Zero-Width Space) to know where a line is allowed to wrap. Similarly, Persian and Arabic scripts use `U+200C` (Zero-Width Non-Joiner) to prevent two adjacent letters from cursively ligating when they belong to separate morphemes, and `U+200D` (Zero-Width Joiner) combines multiple emojis into family or profession sequences.",
          "The problem arises when rich-text web applications, PDF viewers, and chat apps inject these invisible layout hints into English prose, URLs, or source code snippets—and preserve them inside the operating system clipboard when you press `Ctrl+C`.",
        ],
      },
      {
        id: "how-visual-xray-inspection-works",
        heading: "2. How Our Visual X-Ray Inspector Exposes Hidden Gremlins",
        paragraphs: [
          "Because standard fonts render `U+200B`, `U+200C`, `U+FEFF`, and `U+00AD` with a zero-width glyph advance, staring at your screen will never reveal them. Our **Visual X-Ray Preview** scans every code point in your pasted text and replaces invisible control characters with high-contrast diagnostic badges (such as `[ZWSP U+200B]`, `[NBSP U+00A0]`, and `[BOM U+FEFF]`) while counting exact occurrences by category.",
          "You can then toggle individual sanitization switches—such as stripping zero-width characters, converting non-breaking spaces to standard ASCII spaces (`0x20`), repairing UTF-8 mojibake (`â€™` → `’`), or converting smart curly quotes into straight code quotes—and copy the cleaned output immediately.",
        ],
      },
      {
        id: "fixing-double-encoded-utf8",
        heading: "3. Repairing Double-Encoded UTF-8 / Windows-1252 Mojibake",
        paragraphs: [
          "When a UTF-8 file containing curly apostrophes, em-dashes, or accented European letters is opened by software expecting legacy Windows-1252 (CP1252) encoding, every multi-byte UTF-8 character splits into 2 or 3 garbled symbols (`â€™`, `â€œ`, `â€”`, `Ã©`, `Ã±`). Our built-in Mojibake Repair pass detects these deterministic byte patterns and restores the original intended characters without harming surrounding text.",
        ],
      },
    ],
    faqs: [
      {
        question: "How do I know if my text has hidden zero-width characters?",
        answer:
          "Paste your text into the workspace above. Look at the diagnostic telemetry bar: if 'Zero-Width Gremlins' or 'Non-Breaking Spaces' shows a number greater than 0, click the 'X-Ray View' tab to see the exact position of every hidden character highlighted in red and amber.",
      },
      {
        question: "What is the difference between 'Keep Smart Typography' and 'Convert to Straight ASCII'?",
        answer:
          "If you are editing an article, essay, or book, keep smart typography so curly quotes (‘ ’ “ ”) and em-dashes (—) remain intact after mojibake repair. If you are sanitizing source code, JSON, SQL queries, or terminal commands, enable 'Convert Smart Quotes/Dashes to Straight ASCII' so all delimiters become strict 7-bit ASCII (' \" --).",
      },
      {
        question: "Does this tool fix the black diamond question mark () character?",
        answer:
          "The Unicode Replacement Character (, U+FFFD) indicates that an earlier system permanently discarded an unrecognized byte and replaced it with U+FFFD. While reversible mojibake like 'â€™' still contains all three original byte values and is repaired 100% automatically, U+FFFD tokens must be replaced contextually.",
      },
    ],
  },
  {
    id: "tool-04",
    slug: "duplicate-line-scrubber",
    name: "Duplicate Line & List Scrubber",
    shortName: "Duplicate Line Scrubber",
    tagline: "Deduplicate lines, sort A–Z / numerically / by length, trim prefixes, and wrap items in quotes or HTML <li> tags.",
    description:
      "A high-speed list manipulation and deduplication workbench for cleaning log files, email/URL lists, CSV columns, and SQL IN(...) clauses in milliseconds.",
    metaTitle:
      "Duplicate Line Remover, List Sorter & HTML/SQL Wrapper Tool | Zee Writes",
    metaDescription:
      "Remove duplicate lines (case-sensitive or insensitive), sort lists alphabetically or numerically, strip blank lines, and wrap items in quotes or HTML <li> tags.",
    badge: "Bulk Data & List Ops",
    accentColor: "amber",
    features: [
      "O(n) Hash-Set deduplication (Case-Sensitive or Case-Insensitive preserving first occurrence)",
      "Multi-mode sorting: Alphabetical (A–Z / Z–A), Natural Numerical, Line Length, or Reverse",
      "Bulk line wrappers: Single Quotes ('item',), Double Quotes (\"item\",), HTML <li>, or Markdown bullets",
      "Custom Prefix / Suffix injector + Regex line filter (Keep or Remove matching lines)",
    ],
    guideTitle: "High-Speed Set Deduplication, Natural Alphanumeric Sorting, and Bulk List Formatting for Engineers & Analysts",
    guideSubtitle:
      "How O(n) hash sets outperform spreadsheet deduplication, why ASCII sort breaks numbered lists, and how to format SQL and JSON arrays in seconds.",
    guideWordCount: 890,
    formulaBox: {
      title: "O(n) Order-Preserving Hash-Set Deduplication & Natural Sort Logic",
      formula:
        "Unique(L) = L.filter(line => { const k = CaseInsensitive ? line.toLowerCase() : line; return Seen.has(k) ? false : (Seen.add(k), true); })",
      explanation:
        "By indexing normalized line keys in an in-memory ES6 Set hash table, our scrubber processes 50,000+ lines in linear O(n) time (< 15ms) while strictly preserving the original order of first appearance—or sorting via Intl.Collator({ numeric: true }) for natural human numbering.",
    },
    useCases: [
      {
        role: "Backend & Database Engineers",
        scenario: "Turning a raw list of 500 user IDs or UUIDs copied from a ticket into a comma-separated, single-quoted SQL `WHERE id IN ('id1', 'id2', ...)` clause.",
        outcome: "Deduplicates the IDs, trims whitespace, wraps each in `'...',`, and removes the trailing comma in 2 seconds.",
      },
      {
        role: "SEO Specialists & Digital Marketers",
        scenario: "Consolidating keyword lists, backlink URLs, or sitemap exports from multiple crawls and removing case-insensitive duplicates.",
        outcome: "Produces a clean, sorted master URL/keyword list with exact duplicate removal counts.",
      },
      {
        role: "Front-End Developers & Content Editors",
        scenario: "Converting a plain-text feature list from a client document into semantic HTML `<li>...</li>` items or Markdown bullet points.",
        outcome: "Wraps every non-empty line in clean markup automatically.",
      },
    ],
    comparisonTable: {
      caption: "Sorting & Deduplication Modes Comparison",
      headers: ["Operation Mode", "Input Example", "Output Result", "Best Used For"],
      rows: [
        [
          "Deduplicate (Case-Insensitive)",
          "Apple\\napple\\nBanana",
          "Apple\\nBanana",
          "Email lists, keyword lists, domain names, tags",
        ],
        [
          "Deduplicate (Case-Sensitive)",
          "id_A1\\nid_a1\\nid_A1",
          "id_A1\\nid_a1",
          "Base64 tokens, case-sensitive Linux paths, hash keys",
        ],
        [
          "Natural Numeric Sort",
          "Item 10\\nItem 2\\nItem 1",
          "Item 1\\nItem 2\\nItem 10",
          "Version numbers, numbered chapters, IP addresses, invoices",
        ],
        [
          "SQL / JSON Array Wrapper",
          "us-east-1\\neu-west-1",
          "'us-east-1',\\n'eu-west-1'",
          "SQL IN() queries, TypeScript string union arrays, CSV lists",
        ],
      ],
    },
    guideSections: [
      {
        id: "linear-time-hash-deduplication",
        heading: "1. Why O(n) Hash-Set Deduplication Beats Nested Loops and Spreadsheets",
        paragraphs: [
          "When cleaning large log extracts, URL inventories, or keyword lists, traditional tools often sort the entire dataset first to group duplicates together—destroying the chronological or priority order of your original list. Worse, naive nested-loop comparisons scale quadratically ($O(n^2)$), performing 100 million comparisons on a 10,000-line file.",
          "The Zee Writes Duplicate Line Scrubber uses an order-preserving Hash Set algorithm. As it iterates through your lines from top to bottom, it trims optional leading/trailing whitespace, computes a lookup key (either exact UTF-16 code units for case-sensitive mode or `.toLowerCase()` for case-insensitive mode), and checks the hash table in $O(1)$ constant time. The very first occurrence of each unique line is kept in its exact original sequence while subsequent duplicates are discarded and tallied.",
        ],
      },
      {
        id: "natural-sort-vs-lexicographical-ascii-sort",
        heading: "2. Solving the '1, 10, 2' Problem with Natural Alphanumeric Collation",
        paragraphs: [
          "Standard programming sort functions (`Array.prototype.sort()`) compare strings lexicographically by raw UTF-16 code unit value. Because the character `'1'` (`0x31`) comes before `'2'` (`0x32`), standard sorting places `'Chapter 10'` and `'Chapter 100'` ahead of `'Chapter 2'`. ",
          "Our Numerical / Natural Sort mode uses the ECMAScript Internationalization API (`Intl.Collator` with `numeric: true` and `sensitivity: 'base'`). Multi-digit sequences embedded inside strings are evaluated as atomic integer values, sorting `'v1.2'`, `'v1.9'`, and `'v1.10'` in the exact order humans expect.",
        ],
      },
      {
        id: "bulk-wrapping-for-sql-and-html",
        heading: "3. Automating SQL IN() Clauses, JSON Arrays, and HTML Lists",
        paragraphs: [
          "One of the most repetitive chores in software development is reformatting a vertical list of values into syntactic code structures. Using the Wrapper & Prefix/Suffix controls in this tool, you can wrap every line in single quotes with a trailing comma (`'value',`), double quotes (`\"value\",`), HTML list tags (`<li>value</li>`), or custom prefix/suffix templates in a single click.",
        ],
      },
    ],
    faqs: [
      {
        question: "Does Case-Insensitive deduplication change the capitalization of my remaining lines?",
        answer:
          "No! When Case-Insensitive mode is active, only the internal lookup comparison is lowercased. The tool preserves the exact capitalization of the first occurrence in your list (so if 'GitHub' appears on line 1 and 'github' appears on line 40, 'GitHub' is kept and line 40 is removed).",
      },
      {
        question: "Why were two visually identical lines not removed as duplicates?",
        answer:
          "Almost always because one of the lines has trailing spaces at the end or a hidden zero-width space. Keep the 'Trim leading & trailing whitespace' checkbox enabled (it is on by default) so `'apple '` and `'apple'` are recognized as identical.",
      },
      {
        question: "Can I extract ONLY the lines that match a specific keyword or regular expression?",
        answer:
          "Yes. Use the 'Filter Lines by Keyword / Regex' input in the toolbar to either keep only matching lines (e.g., `ERROR|WARN`) or strip out matching lines from your output.",
      },
    ],
  },
  {
    id: "tool-05",
    slug: "markdown-html-converter",
    name: "Markdown <-> Clean HTML & Rich Text Converter",
    shortName: "Markdown <-> HTML Converter",
    tagline: "Live split-pane bidirectional converter transforming Markdown to semantic HTML5 and HTML back to clean Markdown.",
    description:
      "Write or paste GitHub Flavored Markdown (GFM) to compile clean, classless semantic HTML5 with live visual preview—or reverse-convert HTML markup into portable Markdown.",
    metaTitle:
      "Markdown to Clean HTML5 & HTML to Markdown Bidirectional Converter | Zee Writes",
    metaDescription:
      "Convert GitHub Flavored Markdown (GFM) to semantic HTML5 or convert HTML back to clean Markdown with live split-pane preview, tables, callouts, and code blocks.",
    badge: "Bidirectional AST Compiler",
    accentColor: "indigo",
    features: [
      "Real-time Markdown → Semantic HTML5 compilation with GFM tables, task lists & fenced code blocks",
      "Reverse HTML → Clean Markdown converter that strips inline style bloat and span soup",
      "3-Tab Live Output: Rendered Editorial Preview, Raw Indented HTML5 Code, or Reverse Markdown",
      "1-Click Copy HTML, Copy Markdown, or Download .html / .md document",
    ],
    guideTitle: "How Markdown-to-HTML Compilers Work and Why Semantic HTML5 Matters for SEO and Accessibility",
    guideSubtitle:
      "Inside lexical block parsing, stripping rich-text CMS bloat, and generating clean document hierarchies for modern web publishing.",
    guideWordCount: 905,
    formulaBox: {
      title: "Bidirectional Markdown <-> Semantic HTML Transformation Pipeline",
      formula:
        "Markdown Source → Block Tokenizer (Headings, Fences, Tables, Lists) → Inline Parser (Strong, Em, Code, Links) → Clean Semantic HTML5 DOM",
      explanation:
        "By parsing block-level containers first (fenced code blocks, GFM pipe tables, blockquotes, and ordered/unordered lists) before evaluating inline spans, the compiler avoids false-positive formatting inside code literals and emits strictly valid HTML5 tags without bloated inline CSS.",
    },
    useCases: [
      {
        role: "Technical Writers & Documentation Engineers",
        scenario: "Drafting articles in Markdown and exporting clean, semantic HTML5 (`<h2>`, `<p>`, `<pre><code>`, `<table>`) to paste directly into a headless CMS, WordPress HTML block, or static template.",
        outcome: "Produces 100% clean markup free of noisy `<span style='...'>` wrappers.",
      },
      {
        role: "Developers Migrating Legacy Blogs to MDX / Next.js",
        scenario: "Converting existing HTML blog posts into clean Markdown (`.md` / `.mdx`) files for Git-based repositories.",
        outcome: "Reverse-converts headings, paragraphs, links, lists, and code blocks into readable CommonMark syntax.",
      },
      {
        role: "Email & Newsletter Publishers",
        scenario: "Previewing how Markdown release notes and tables render visually before sending.",
        outcome: "Live split-pane preview verifies table alignment, callout blockquotes, and link targets instantaneously.",
      },
    ],
    comparisonTable: {
      caption: "Clean Semantic HTML5 vs Rich-Text WYSIWYG Bloat Comparison",
      headers: ["Document Element", "Bloated Rich-Text Copy-Paste", "Zee Writes Clean Semantic Output"],
      rows: [
        [
          "Section Heading",
          '<p class="MsoNormal"><span style="font-size:18pt;font-weight:700">Title</span></p>',
          "<h2>Title</h2>",
        ],
        [
          "Inline Code Token",
          '<span style="font-family:Courier;background:#eee">npm install</span>',
          "<code>npm install</code>",
        ],
        [
          "Bold Emphasis",
          '<span style="font-weight:bold">critical fix</span>',
          "<strong>critical fix</strong>",
        ],
        [
          "Data Table",
          '<table border="0" cellpadding="0" style="width:500px">...',
          "<table><thead><tr><th>...</th></tr></thead><tbody>...</tbody></table>",
        ],
      ],
    },
    guideSections: [
      {
        id: "two-phase-markdown-parsing",
        heading: "1. Two-Phase Parsing: How CommonMark Compiles Block and Inline Syntax",
        paragraphs: [
          "Unlike HTML—which requires explicit opening and closing tags around every element—Markdown was designed to be effortlessly readable as plain text. To achieve this, a Markdown compiler executes a two-phase parsing strategy: **Phase 1 (Block Structure)** scans line-by-line to identify structural boundaries such as ATX headings (`#` to `######`), fenced code blocks (` ``` `), pipe tables (`|...|`), blockquotes (`>`), and list items (`-` or `1.`).",
          "Once the block tree is constructed, **Phase 2 (Inline Tokenization)** evaluates text nodes inside paragraphs and headings—resolving escaped characters, inline code spans (`` `...` ``), hyperlinks (`[label](url)`), images (`![alt](src)`), bold (`**...**`), and italics (`*...*`) while leaving the interior of `<pre><code>` blocks completely untouched.",
        ],
      },
      {
        id: "why-semantic-html-improves-seo-and-cwv",
        heading: "2. Why Classless Semantic HTML5 Boosts SEO and Core Web Vitals",
        paragraphs: [
          "When authors copy content directly from Google Docs, Microsoft Word, or Notion into a web CMS, the clipboard often transfers thousands of bytes of proprietary inline styles (`style=\"font-family: Calibri; mso-bidi-font-size: 11pt\"`), nested `<div>` wrappers, and empty `<span>` tags. This markup bloat increases HTML document transfer size, breaks dark-mode theme inheritance, and confuses assistive screen readers.",
          "Compiling through clean Markdown guarantees that every heading uses an authentic `<h2>` or `<h3>` tag, every emphasis uses `<strong>` or `<em>`, and every table uses proper `<thead>` and `<tbody>` scoping—maximizing accessibility and Google Featured Snippet eligibility.",
        ],
      },
    ],
    faqs: [
      {
        question: "Does the converter escape HTML entities inside fenced code blocks automatically?",
        answer:
          "Yes! When compiling a Markdown code block (` ```html ... ``` `), characters like `<`, `>`, and `&` inside the code block are safely escaped to `&lt;`, `&gt;`, and `&amp;` inside the `<pre><code>` tag so browsers display the literal code instead of executing it as live DOM elements.",
      },
      {
        question: "How do I convert existing HTML back into Markdown?",
        answer:
          "Switch the mode toggle at the top of the workspace to 'HTML → Markdown Mode', paste your HTML markup on the left, and the engine will strip unnecessary wrapper attributes while translating `<h1>`–`<h6>`, `<p>`, `<strong>`, `<em>`, `<a href>`, `<ul>/<ol>/<li>`, `<blockquote>`, and `<pre><code>` into clean Markdown.",
      },
      {
        question: "Are GitHub Flavored Markdown (GFM) tables and task lists supported?",
        answer:
          "Yes, both pipe tables (`| Header | Header |`) and interactive task list checkboxes (`- [x] Completed`, `- [ ] Pending`) are supported out of the box.",
      },
    ],
  },
  {
    id: "tool-06",
    slug: "json-text-diff-validator",
    name: "JSON / Text Diff & Formatting Validator",
    shortName: "JSON Validator & Text Diff",
    tagline: "Beautify, minify, validate & auto-repair broken JSON—or compare two text/code blocks side-by-side with line diffs.",
    description:
      "A dual-engine developer utility combining an RFC 8259 JSON Formatter, Minifier, Error Locator & Auto-Repair engine with a line-by-line Text & Code Diff Comparator.",
    metaTitle:
      "JSON Formatter, Validator, Auto-Repair & Side-by-Side Text Diff Tool | Zee Writes",
    metaDescription:
      "Beautify, minify, validate, and auto-repair broken JSON (trailing commas, comments, smart quotes) or compare two text/code blocks with highlighted line differences.",
    badge: "JSON AST & Line Diff",
    accentColor: "emerald",
    features: [
      "RFC 8259 JSON Validator with exact 1-indexed Line & Column syntax error locator",
      "1-Click Auto-Repair for broken JSON (strips trailing commas, // comments, smart quotes & unquoted keys)",
      "JSON Beautifier (2-space / 4-space indent, optional alphabetical key sorting) & Minifier",
      "Side-by-Side & Unified Line-by-Line Text Diff Comparator with Added/Removed/Unchanged metrics",
    ],
    guideTitle: "RFC 8259 JSON Validation, Lexical Error Recovery, and Longest Common Subsequence (LCS) Text Diffing",
    guideSubtitle:
      "How JSON parsers pinpoint byte-offset syntax errors, how deterministic heuristics repair malformed payloads, and how line diff algorithms compare file revisions.",
    guideWordCount: 940,
    formulaBox: {
      title: "LCS Dynamic Programming Diff & JSON Byte-Offset Coordinate Mapping",
      formula:
        "LCS[i][j] = (A[i] === B[j]) ? 1 + LCS[i-1][j-1] : max(LCS[i-1][j], LCS[i][j-1])  |  ErrorCoord(Offset) = CountNewlines(Input[0..Offset])",
      explanation:
        "In JSON mode, native V8 parse exceptions report a character offset that our engine maps to exact 1-indexed (Line, Column) coordinates. In Diff mode, an LCS matrix compares lines between Original (A) and Modified (B) texts to compute the minimal edit script of insertions (+) and deletions (−).",
    },
    useCases: [
      {
        role: "API & Full-Stack Developers",
        scenario: "Debugging a malformed JSON webhook payload, LLM structured output, or config file that fails `JSON.parse()` due to a trailing comma or smart quote.",
        outcome: "Pinpoints the exact line/column of the syntax error and fixes it in 1 click via Auto-Repair.",
      },
      {
        role: "DevOps & Cloud Engineers",
        scenario: "Comparing two versions of an `.env`, `package.json`, Nginx config, or Kubernetes YAML/JSON manifest before deploying to production.",
        outcome: "Highlights every added, removed, or modified line with optional whitespace-ignore toggles.",
      },
      {
        role: "Technical Editors & Legal Reviewers",
        scenario: "Comparing an original article draft against a revised draft to audit exact paragraph and line edits.",
        outcome: "Provides a color-coded unified or split diff view with exact line change statistics.",
      },
    ],
    comparisonTable: {
      caption: "Common JSON Syntax Errors & Automatic Repair Capabilities",
      headers: ["JSON Error Pattern", "Broken Input Example", "Repaired RFC 8259 Output"],
      rows: [
        [
          "Trailing Comma in Object/Array",
          '{ "status": 200, "ok": true, }',
          '{\n  "status": 200,\n  "ok": true\n}',
        ],
        [
          "JavaScript Single/Multi-Line Comments",
          '{\n  // API port\n  "port": 8080\n}',
          '{\n  "port": 8080\n}',
        ],
        [
          "Unquoted Identifier Keys",
          "{ userId: 42, active: true }",
          '{\n  "userId": 42,\n  "active": true\n}',
        ],
        [
          "Curly Smart Quotes or Single Quotes",
          "{ ‘name’: 'Zee Writes' }",
          '{\n  "name": "Zee Writes"\n}',
        ],
      ],
    },
    guideSections: [
      {
        id: "diagnosing-json-parse-exceptions",
        heading: "1. Diagnosing and Auto-Repairing Broken JSON Payloads",
        paragraphs: [
          "Because RFC 8259 is a strict subset of JavaScript object literal syntax, developers and AI tools frequently produce 'almost-JSON' that crashes standard parsers. A single trailing comma after the last item in an array, an explanatory `// comment`, an unquoted property key, or a curly quotation mark copied from documentation will cause `JSON.parse()` to throw an immediate `SyntaxError`.",
          "Our **JSON Validator & Auto-Repair Engine** first validates your input against the strict native parser. If an error occurs, it calculates the exact 1-indexed line and column number and displays the surrounding code context. Clicking **Auto-Repair Broken JSON** runs a multi-stage lexical sanitizer that strips comments, normalizes curly/single quotes, quotes bare identifier keys, removes trailing commas, and strips markdown ```json code fences.",
        ],
      },
      {
        id: "deterministic-key-sorting-and-minification",
        heading: "2. Canonical JSON Key Sorting and Payload Minification",
        paragraphs: [
          "When comparing two JSON API responses whose keys were serialized in different orders by different backend languages (such as Go maps vs Python dicts), a standard line diff will flag the entire file as changed even if the underlying data is identical.",
          "By enabling **Sort Object Keys Alphabetically** in our JSON Beautifier before switching to the **Text Diff** tab, both JSON trees are recursively normalized so keys appear in deterministic A–Z order at every nesting depth—making structural diffs effortless.",
        ],
      },
      {
        id: "how-lcs-line-diffing-works",
        heading: "3. How Longest Common Subsequence (LCS) Line Diffing Works",
        paragraphs: [
          "Inspired by the classic Hunt–McIlroy and Myers diff algorithms used in `git diff`, our **Text Diff Comparator** splits both the Original (Left) and Modified (Right) text blocks into line arrays and solves the Longest Common Subsequence problem. Lines present in the LCS are marked as unchanged context, while lines unique to Left are highlighted in crimson (`− Removed`) and lines unique to Right are highlighted in emerald (`+ Added`).",
        ],
      },
    ],
    faqs: [
      {
        question: "Is my JSON or code sent to any external server during validation or diffing?",
        answer:
          "Never. 100% of JSON parsing, auto-repair, beautification, minification, and diff comparison executes locally inside your browser's memory. It is completely safe to validate API payloads, configuration files, and proprietary code snippets.",
      },
      {
        question: "How can I compare two JSON objects when their keys are in different orders?",
        answer:
          "First, format both JSON objects in the JSON Validator tab with 'Sort Keys A–Z' checked, then click 'Send to Diff Left' and 'Send to Diff Right'. Because both JSON payloads now share canonical alphabetical key ordering, the Diff tab will highlight only true value additions, deletions, or modifications.",
      },
      {
        question: "How much size does JSON Minify save?",
        answer:
          "Minifying a 2-space or 4-space indented JSON payload strips all non-essential whitespace and newlines outside string literals, reducing byte size (displayed live in our Bytes Saved counter).",
      },
    ],
  },
];

export function getToolBySlug(slug: string): TextToolDefinition | undefined {
  return TEXT_TOOLS.find((t) => t.slug === (slug as ToolSlug));
}
