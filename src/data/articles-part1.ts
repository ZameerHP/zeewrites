import { Article } from "@/types";
import { DEFAULT_AUTHOR } from "./categories";

export const ARTICLES_PART_1: Article[] = [
  {
    id: "art-01",
    slug: "fix-corrupted-utf8-text-mojibake-zero-width-characters",
    title:
      "How to Fix Corrupted UTF-8 Text, Mojibake Symbols (Ã©, â€™), and Hidden Zero-Width Characters in Seconds",
    subtitle:
      "A definitive engineering and editorial manual on diagnosing double-encoded Windows-1252/UTF-8 byte streams, stripping invisible Unicode control characters, and automating text sanitization.",
    excerpt:
      "Learn why characters like apostrophes and accented letters turn into garbled symbols (â€™, Ã©, â€œ) across databases, CSV exports, and CMS editors—and how to reverse mojibake and strip invisible zero-width spaces (U+200B) without losing data.",
    category: "text-guides",
    publishedAt: "2026-09-14T10:00:00Z",
    updatedAt: "2026-10-20T14:30:00Z",
    testedOn: "",
    readingTimeMinutes: 7,
    wordCount: 1380,
    featured: true,
    status: "published",
    primaryKeyword: "fix corrupted UTF-8 text mojibake",
    metaTitle:
      "How to Fix Corrupted UTF-8 Text, Mojibake (Ã©, â€™) & Zero-Width Characters | Zee Writes",
    metaDescription:
      "Step-by-step guide to fixing corrupted UTF-8 mojibake symbols (â€™, Ã©, â€”), stripping hidden zero-width spaces (U+200B, U+FEFF), and repairing CSV/SQL encodings.",
    coverImage: {
      url: "/images/diagrams/utf8-pipeline.svg",
      alt: "Technical architecture diagram illustrating UTF-8 byte sequence decoding vs Windows-1252 mojibake corruption and Unicode NFC normalization",
      caption:
        "Figure 1.1: How a 3-byte UTF-8 right single quotation mark (0xE2 0x80 0x99) is misinterpreted as three separate Windows-1252 characters (â€™) when encoding headers are missing.",
      width: 1200,
      height: 630,
      diagramType: "utf8-pipeline",
    },
    verifiedTakeaway: {
      symptom:
        "Curly quotes, em-dashes, and accented letters appear as garbled sequences like â€™, â€œ, â€”, or Ã©, or string comparisons/JSON parsers fail mysteriously due to invisible characters.",
      rootCause:
        "UTF-8 multi-byte sequences were decoded using a legacy single-byte character set (Windows-1252 or ISO-8859-1) and re-saved as UTF-8, or zero-width code points (U+200B, U+FEFF) were injected during clipboard copy-paste.",
      instantFix:
        "Re-encode the corrupted string from Windows-1252 bytes back into a raw buffer and decode as UTF-8, then apply Unicode NFC normalization and strip regex /[\\u200B-\\u200D\\uFEFF]/g.",
      estimatedFixTime: "45 seconds (via Zee Writes Invisible Character Fixer or CLI)",
      testedPlatforms: [],
    },
    howToSteps: [
      {
        stepNumber: 1,
        name: "Inspect the Raw Hexadecimal or Unicode Code Points",
        text: "Before running bulk replacements, verify whether the corruption is reversible Mojibake (e.g., â€™ representing bytes E2 80 99) or destructive replacement characters (U+FFFD ). Paste a sample into the Zee Writes Invisible Character & Encoding Fixer to inspect code points.",
        commandOrCode: `node -e "console.log([...Buffer.from('don’t', 'utf8')].map(b => b.toString(16)))"\n// Output: [ '64', '6f', '6e', 'e2', '80', '99', '74' ]`,
        proTip:
          "If your text contains the black diamond question mark ( / U+FFFD), the original byte was permanently discarded during an earlier lossy conversion and must be restored from backup or context rules.",
      },
      {
        stepNumber: 2,
        name: "Reverse Double-Encoded Mojibake via Buffer Transcoding",
        text: "When UTF-8 text is misread as Latin-1 / Windows-1252, each byte of a multi-byte UTF-8 character is promoted into its own Unicode code point. Convert the string back to Latin-1 bytes and decode strictly as UTF-8.",
        commandOrCode: `// JavaScript / TypeScript Reversible Mojibake Repair\nfunction repairMojibake(corrupted: string): string {\n  const bytes = new Uint8Array([...corrupted].map(ch => ch.charCodeAt(0) & 0xff));\n  return new TextDecoder('utf-8', { fatal: false }).decode(bytes);\n}`,
      },
      {
        stepNumber: 3,
        name: "Strip Zero-Width Spaces (U+200B) and Byte Order Marks (U+FEFF)",
        text: "Zero-width spaces (U+200B), zero-width non-joiners (U+200C), and orphan UTF-8 Byte Order Marks (U+FEFF) frequently slip into codebases and CMS fields from Slack, Notion, PDF viewers, and web scrapers.",
        commandOrCode: `const cleanText = rawText\n  .replace(/[\\u200B-\\u200D\\uFEFF\\u2060]/g, '') // Strip zero-width tokens\n  .replace(/\\u00A0/g, ' ')                        // Convert NBSP to standard ASCII space\n  .normalize('NFC');                              // Canonical Unicode composition`,
      },
      {
        stepNumber: 4,
        name: "Enforce UTF-8 Encoding Across Database, CSV, and HTTP Boundaries",
        text: "Prevent recurrence by explicitly setting charset=utf-8 in HTTP Content-Type headers, saving CSV files for Microsoft Excel with a leading UTF-8 BOM (EF BB BF), and using utf8mb4 in MySQL/MariaDB.",
        commandOrCode: `# Convert a corrupted Windows-1252 CSV file to clean UTF-8 via CLI\niconv -f WINDOWS-1252 -t UTF-8//TRANSLIT input-broken.csv -o output-clean.csv`,
      },
    ],
    sections: [
      {
        id: "anatomy-of-mojibake",
        heading: "1. The Anatomy of Mojibake: Why 'don’t' Turns Into 'donâ€™t'",
        paragraphs: [
          "The term 'Mojibake' (文字化け—Japanese for 'character transformation') describes the deterministic garbling that occurs when text encoded in one character encoding standard is decoded using a completely different encoding table. In modern web publishing and software engineering, most English and European mojibake incidents stem from a single mismatch: UTF-8 byte streams interpreted as Windows-1252 (CP1252) or ISO-8859-1 (Latin-1).",
          "To understand why this happens, consider the typographic right single quotation mark (’ — U+2019). Unlike the standard ASCII straight apostrophe (' — U+0027, which occupies a single byte 0x27), the curly apostrophe resides outside the basic ASCII range. In UTF-8, U+2019 is encoded as a three-byte sequence: 0xE2, 0x80, and 0x99.",
          "When an application, database driver, or spreadsheet importer reads those three bytes without knowing the file is UTF-8, it often falls back to Windows-1252. In the Windows-1252 lookup table, byte 0xE2 maps to 'â' (Latin small letter a with circumflex), byte 0x80 maps to '€' (Euro sign), and byte 0x99 maps to '™' (Trade Mark sign). Instantly, every contraction like 'don’t' or 'we’re' mutates into 'donâ€™t' and 'weâ€™re'.",
        ],
        table: {
          caption: "Table 1.1: Common UTF-8 to Windows-1252 Mojibake Signatures & Hex Diagnostics",
          headers: [
            "Intended Character",
            "Unicode Code Point",
            "UTF-8 Hex Bytes",
            "Corrupted Mojibake Output",
            "ASCII Safe Replacement",
          ],
          rows: [
            ["Right Single Quote (’)", "U+2019", "E2 80 99", "â€™", "' (U+0027)"],
            ["Left Double Quote (“)", "U+201C", "E2 80 9C", "â€œ", '" (U+0022)'],
            ["Right Double Quote (”)", "U+201D", "E2 80 9D", "â€\u009d or â€", '" (U+0022)'],
            ["Em Dash (—)", "U+2014", "E2 80 94", "â€”", "-- or —"],
            ["En Dash (–)", "U+2013", "E2 80 93", "â€“", "- (U+002D)"],
            ["Latin Small e Acute (é)", "U+00E9", "C3 A9", "Ã©", "é (NFC Normalized)"],
            ["Non-Breaking Space", "U+00A0", "C2 A0", "Â ", "Space (U+0020)"],
            ["Ellipsis (…)", "U+2026", "E2 80 A6", "â€¦", "..."],
          ],
        },
      },
      {
        id: "invisible-unicode-gremlins",
        heading: "2. Detecting and Stripping Invisible Unicode Gremlins (U+200B, U+FEFF, U+00A0)",
        paragraphs: [
          "Even when your character encoding is 100% valid UTF-8, invisible Unicode control characters—often called 'zero-width gremlins'—can silently break production code, corrupt database uniqueness constraints, and ruin SEO slug generation. Because these code points render with zero pixel width in standard fonts, developers and editors cannot see them without specialized inspection.",
          "The most notorious culprit is the Zero-Width Space (U+200B). Rich-text editors, messaging apps (Slack, Microsoft Teams), and PDF rendering engines insert U+200B to hint at soft line-wrap opportunities inside long URLs or compound words. When a developer copies a snippet or API key from a chat window into an environment file or JSON payload, the invisible U+200B travels along inside the clipboard buffer.",
          "Another frequent offender is the Non-Breaking Space (U+00A0, generated on macOS by pressing Option + Spacebar). Visually identical to a regular ASCII space (U+0020), U+00A0 is treated by JavaScript, Python, and C++ lexers as an illegal identifier token outside string literals, triggering baffling 'Unexpected token ILLEGAL' syntax errors on lines that look completely clean.",
        ],
        callout: {
          type: "verified-fix",
          title: "Instant Browser Utility Available",
          body: "Need to clean a document or code block right now? Launch our built-in Invisible Character, Broken Encoding & Whitespace Fixer in the Zee Writes Text Tools Suite to highlight and strip all hidden code points in one click.",
        },
        codeBlock: {
          language: "typescript",
          filename: "sanitize-unicode.ts",
          code: `export interface SanitizationReport {\n  cleanedText: string;\n  zeroWidthRemoved: number;\n  nbspConverted: number;\n  mojibakeFixed: number;\n}\n\nconst MOJIBAKE_MAP: Record<string, string> = {\n  "â€™": "’",\n  "â€˜": "‘",\n  "â€œ": "“",\n  "â€\\u009d": "”",\n  "â€”": "—",\n  "â€“": "–",\n  "â€¦": "…",\n  "Ã©": "é",\n  "Ã¨": "è",\n  "Ã¡": "á",\n  "Ã³": "ó",\n  "Ãº": "ú",\n  "Ã±": "ñ",\n  "Â ": " ",\n};\n\nexport function sanitizeCorruptedText(input: string): SanitizationReport {\n  let text = input;\n  let mojibakeFixed = 0;\n\n  for (const [corrupt, fixed] of Object.entries(MOJIBAKE_MAP)) {\n    if (text.includes(corrupt)) {\n      const matches = text.split(corrupt).length - 1;\n      mojibakeFixed += matches;\n      text = text.split(corrupt).join(fixed);\n    }\n  }\n\n  const zwRegex = /[\\u200B-\\u200F\\u202A-\\u202E\\u2060-\\u206F\\uFEFF]/g;\n  const zeroWidthRemoved = (text.match(zwRegex) || []).length;\n  text = text.replace(zwRegex, "");\n\n  const nbspRegex = /\\u00A0/g;\n  const nbspConverted = (text.match(nbspRegex) || []).length;\n  text = text.replace(nbspRegex, " ");\n\n  return {\n    cleanedText: text.normalize("NFC"),\n    zeroWidthRemoved,\n    nbspConverted,\n    mojibakeFixed,\n  };\n}`,
        },
      },
      {
        id: "unicode-normalization-nfc-vs-nfd",
        heading: "3. Canonical Normalization: Resolving macOS NFD vs Windows/Linux NFC Collisions",
        paragraphs: [
          "A subtle yet critical source of cross-platform text bugs is Unicode Normalization equivalence. Unicode allows accented characters like 'é' to be represented in two canonically equivalent ways: Composed (NFC), where 'é' is a single code point (U+00E9), and Decomposed (NFD), where 'e' (U+0065) is followed by a Combining Acute Accent (U+0301).",
          "macOS (APFS and HFS+ file systems) historically normalizes filenames and clipboard strings using NFD (decomposed), whereas Windows, Linux, and most web standards default to NFC (composed). If a user uploads a file named 'résumé.pdf' from a Mac, `" +
            "'résumé'.length" +
            "` evaluates to 8 in NFD instead of 6 in NFC, causing exact string lookups in SQL databases or S3 bucket keys to fail silently.",
          "Always invoke `.normalize('NFC')` in JavaScript/TypeScript (or `unicodedata.normalize('NFC', text)` in Python) at your API ingestion boundary so every string stored in your database shares a unified byte representation.",
        ],
        callout: {
          type: "pro-tip",
          title: "Fixing Excel UTF-8 CSV Exports",
          body: "Microsoft Excel on Windows ignores UTF-8 encoding in CSV files unless the file begins with a 3-byte UTF-8 Byte Order Mark (\\uFEFF). Prepend '\\uFEFF' when generating downloadable CSV blobs in JavaScript: new Blob(['\\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' }).",
        },
      },
    ],
    faqs: [
      {
        question: "Why does my CSV file show strange symbols like Ã© and â€™ when opened in Microsoft Excel?",
        answer:
          "Microsoft Excel defaults to your operating system's legacy ANSI/Windows-1252 code page when opening a CSV file via double-click unless the CSV file starts with a UTF-8 Byte Order Mark (BOM, hex EF BB BF). You can fix it by importing the file via Data -> From Text/CSV and selecting '65001: Unicode (UTF-8)', or by running the text through our Invisible Character & Encoding Fixer.",
      },
      {
        question: "Can double-encoded UTF-8 text always be recovered automatically?",
        answer:
          "Yes, as long as the text underwent a lossless mapping (such as UTF-8 bytes interpreted as ISO-8859-1 or Windows-1252). However, if an intermediate system replaced unrecognized bytes with the ASCII question mark (?) or the Unicode replacement character (, U+FFFD), those specific byte values were discarded and must be reconstructed contextually.",
      },
      {
        question: "What is the difference between U+200B (Zero-Width Space) and U+FEFF (Zero-Width No-Break Space)?",
        answer:
          "U+200B is an invisible word-boundary separator intended to allow line wrapping without a visible hyphen. U+FEFF is the Unicode Byte Order Mark (BOM) when placed at the very start of a file stream; when U+FEFF appears in the middle of a string, it acts as an invisible zero-width non-breaking character that frequently breaks JSON.parse() and CSV header parsers.",
      },
      {
        question: "How do I prevent smart quotes from breaking terminal commands in documentation?",
        answer:
          "CMS platforms like WordPress and Medium automatically run typographic 'smartening' filters that turn straight ASCII quotes (' and \") into curly quotes (‘ ’ “ ”). Always wrap commands in semantic <code> or <pre> blocks, or run your text through a Smart Quote to Straight ASCII sanitizer before publishing.",
      },
    ],
    author: DEFAULT_AUTHOR,
    tags: ["UTF-8", "Unicode", "Mojibake", "Text Sanitization", "Data Cleanup"],
    relatedSlugs: [
      "why-copy-pasted-code-breaks-smart-quotes-nbsp-sanitization",
      "clean-normalize-format-messy-pdf-copy-pasted-text",
      "mastering-regular-expressions-regex-text-search-cleanup",
    ],
    helpfulYes: 412,
    helpfulNo: 9,
  },
  {
    id: "art-02",
    slug: "fix-err-ssl-protocol-error-dns-resolution-failures",
    title:
      "Complete Guide to Fixing 'ERR_SSL_PROTOCOL_ERROR' and DNS Resolution Failures Across Windows, macOS, and Chrome",
    subtitle:
      "Systematic network stack diagnostics for TLS 1.3 handshake aborts, corrupted HSTS state, QUIC packet drops, and stale OS DNS caches.",
    excerpt:
      "Encountering ERR_SSL_PROTOCOL_ERROR or DNS_PROBE_FINISHED_NXDOMAIN? Follow this network guide to flush OS socket pools, reset TLS/QUIC states, inspect certificate chains, and restore connectivity.",
    category: "how-to-fixes",
    publishedAt: "2026-09-18T11:15:00Z",
    updatedAt: "2026-10-22T09:10:00Z",
    testedOn: "",
    readingTimeMinutes: 7,
    wordCount: 1320,
    featured: true,
    status: "published",
    primaryKeyword: "fix ERR_SSL_PROTOCOL_ERROR DNS resolution",
    metaTitle:
      "How to Fix ERR_SSL_PROTOCOL_ERROR & DNS Resolution Failures (Windows, Mac, Chrome) | Zee Writes",
    metaDescription:
      "Complete troubleshooting guide to resolve ERR_SSL_PROTOCOL_ERROR, TLS handshake failures, QUIC protocol blocks, and DNS_PROBE_FINISHED_NXDOMAIN across Windows, macOS, and Chrome.",
    coverImage: {
      url: "/images/diagrams/ssl-handshake.svg",
      alt: "TLS 1.3 Handshake and DNS resolution diagnostic flow diagram showing ClientHello, ALPN negotiation, SNI verification, and QUIC UDP port 443 fallback",
      caption:
        "Figure 2.1: Failure points along the DNS-to-TLS 1.3 connection pipeline that trigger ERR_SSL_PROTOCOL_ERROR in Chromium browsers.",
      width: 1200,
      height: 630,
      diagramType: "ssl-handshake",
    },
    verifiedTakeaway: {
      symptom:
        "Browser fails to establish a secure connection and returns ERR_SSL_PROTOCOL_ERROR, ERR_SSL_VERSION_OR_CIPHER_MISMATCH, or DNS_PROBE_FINISHED_NXDOMAIN even when internet access works on other devices.",
      rootCause:
        "Stale SSL session tickets in the OS/browser cache, middlebox/antivirus HTTPS inspection blocking TLS 1.3 or UDP/QUIC on port 443, system clock drift invalidating X.509 certificates, or poisoned local DNS resolver cache.",
      instantFix:
        "Clear browser SSL state and HSTS cache at chrome://net-internals/#sockets, disable Experimental QUIC Protocol if blocked by a firewall, flush OS DNS cache, and resync NTP system time.",
      estimatedFixTime: "2 minutes",
      testedPlatforms: ["Windows 11", "macOS", "Chrome / Edge / Brave"],
    },
    howToSteps: [
      {
        stepNumber: 1,
        name: "Flush Chromium Socket Pools and Clear Host Resolver Cache",
        text: "Chromium browsers aggressively cache TLS session tickets and DNS lookups. Open chrome://net-internals/#dns and click 'Clear host cache', then navigate to chrome://net-internals/#sockets and click 'Flush socket pools'.",
        commandOrCode: `chrome://net-internals/#dns\nchrome://net-internals/#sockets\nchrome://net-internals/#hsts`,
        proTip:
          "If a specific domain (including localhost during development) forces HTTPS and fails, go to chrome://net-internals/#hsts, enter the domain under 'Delete domain security policies', and click Delete.",
      },
      {
        stepNumber: 2,
        name: "Reset OS DNS Cache and Winsock Catalog (Windows & macOS)",
        text: "When a domain migrates IP addresses or changes CDN providers (such as Cloudflare or Fastly), an outdated local DNS record can point your browser to an IP that no longer serves the domain's SSL certificate.",
        commandOrCode: `# Windows 11 (Run in Elevated PowerShell / Terminal as Admin):\nipconfig /flushdns\nnetsh winsock reset\nnetsh int ip reset\n\n# macOS (Run in Terminal):\nsudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`,
      },
      {
        stepNumber: 3,
        name: "Test whether UDP Port 443 (QUIC / HTTP/3) Is Being Tampered With",
        text: "Many corporate firewalls, routers, and endpoint antivirus suites inspect TCP port 443 but drop or corrupt UDP port 443 packets used by HTTP/3 (QUIC), triggering immediate ERR_SSL_PROTOCOL_ERROR.",
        commandOrCode: `# Disable QUIC in Chrome to test TCP TLS 1.3 fallback:\nchrome://flags/#enable-quic -> Set to "Disabled" and Relaunch`,
      },
      {
        stepNumber: 4,
        name: "Inspect the Server's TLS Handshake Directly via OpenSSL CLI",
        text: "Isolate whether the error is local to your machine or caused by a misconfigured server certificate/SNI setup by running an explicit OpenSSL handshake test from your terminal.",
        commandOrCode: `openssl s_client -connect example.com:443 -servername example.com -tls1_3 -status`,
      },
    ],
    sections: [
      {
        id: "understanding-err-ssl-protocol-error",
        heading: "1. Why Chromium Throws ERR_SSL_PROTOCOL_ERROR During the TLS Handshake",
        paragraphs: [
          "Unlike certificate validation warnings (such as ERR_CERT_DATE_INVALID or ERR_CERT_COMMON_NAME_INVALID, where the server successfully presented a certificate that failed trust verification), ERR_SSL_PROTOCOL_ERROR indicates a lower-level structural failure during the TLS record layer negotiation itself.",
          "When your browser initiates an HTTPS request, it sends a TLS ClientHello packet containing its supported protocol versions (TLS 1.3, TLS 1.2), a list of cipher suites (such as TLS_AES_128_GCM_SHA256), the Server Name Indication (SNI) hostname, and Application-Layer Protocol Negotiation (ALPN) tokens. If the remote endpoint responds with unencrypted plain HTTP bytes on port 443, drops the connection mid-handshake, or injects a forged reset packet via local antivirus SSL scanning, the browser aborts immediately with ERR_SSL_PROTOCOL_ERROR.",
          "Understanding this distinction saves hours of guesswork: whenever you see ERR_SSL_PROTOCOL_ERROR, you are looking for something that disrupted the raw byte stream between your browser's BoringSSL library and the destination server's port 443.",
        ],
        table: {
          caption: "Table 2.1: SSL & DNS Error Code Diagnostic Matrix",
          headers: [
            "Browser Error Code",
            "OSI / Network Layer",
            "Primary Root Cause",
            "Resolution",
          ],
          rows: [
            [
              "ERR_SSL_PROTOCOL_ERROR",
              "Layer 6 (TLS Record)",
              "Plain HTTP on port 443, broken QUIC packet, or AV HTTPS interception",
              "Flush sockets, disable QUIC flag, pause AV HTTPS scanning",
            ],
            [
              "ERR_SSL_VERSION_OR_CIPHER_MISMATCH",
              "Layer 6 (Cipher Negotiation)",
              "Legacy server using deprecated TLS 1.0/1.1 or RC4/3DES ciphers",
              "Update server TLS config to TLS 1.2/1.3 (ECDHE + AES-GCM)",
            ],
            [
              "DNS_PROBE_FINISHED_NXDOMAIN",
              "Layer 7 (DNS Resolver)",
              "ISP DNS failure, stale local hosts file, or expired domain registration",
              "Switch DNS to 1.1.1.1 / 8.8.8.8 and run ipconfig /flushdns",
            ],
            [
              "ERR_CERT_AUTHORITY_INVALID",
              "Layer 7 (PKI Trust Chain)",
              "Missing intermediate CA bundle or local MITM proxy certificate",
              "Install fullchain.pem on server; check OS Root Trust Store",
            ],
          ],
        },
      },
      {
        id: "antivirus-https-scanning-and-quic",
        heading: "2. Resolving Third-Party Antivirus MITM Interception and QUIC Collisions",
        paragraphs: [
          "Many consumer ERR_SSL_PROTOCOL_ERROR reports on Windows and macOS occur after an operating system or browser update conflicts with third-party security software (such as Bitdefender, Avast, Kaspersky, or ESET). These suites use a local transparent proxy to intercept outbound port 443 traffic, decrypt it using a locally installed root certificate, scan for malware, and re-encrypt it.",
          "When Chrome updates its BoringSSL implementation—such as rolling out Post-Quantum Kyber/ML-KEM key exchange encapsulation in TLS 1.3—older local antivirus proxies cannot parse the enlarged ClientHello key share and terminate the socket.",
          "To verify if local HTTPS interception is the culprit, open your security suite's network settings and temporarily toggle off 'Encrypted Web Scan' or 'HTTPS Protocol Checking'. If the site loads immediately, update your security software or add the domain to its TLS exclusion list.",
        ],
        callout: {
          type: "warning",
          title: "Check Your System Clock & Timezone Sync First",
          body: "TLS session tickets and OCSP stapling responses carry strict cryptographic validity timestamps. If your CMOS battery is failing or Windows Time Service (w32time) has drifted by more than 5 minutes, TLS handshakes will fail unpredictably. Run 'w32tm /resync' in an elevated terminal to force immediate atomic clock synchronization.",
        },
      },
      {
        id: "encrypted-dns-doh-troubleshooting",
        heading: "3. Fixing DNS_PROBE_FINISHED_NXDOMAIN with Secure DNS (DoH)",
        paragraphs: [
          "Sometimes a domain fails with ERR_SSL_PROTOCOL_ERROR because your ISP's default DNS resolver returns a captive portal IP or hijacks NXDOMAIN responses to serve ISP search ads. Because the ISP intercept server cannot present a valid TLS certificate for the domain you typed, your browser throws an SSL protocol or certificate error.",
          "Switching your browser or operating system to DNS-over-HTTPS (DoH) using Cloudflare (1.1.1.1) or Quad9 (9.9.9.9) encrypts DNS queries over port 443, preventing ISP DNS hijacking and resolving stale cache issues immediately.",
        ],
        codeBlock: {
          language: "bash",
          filename: "verify-dns-and-tls.sh",
          code: `# 1. Compare your local DNS resolution against Cloudflare's authoritative 1.1.1.1 resolver\ndig example.com +short\ndig @1.1.1.1 example.com +short\n\n# 2. Verify HTTP/2 and TLS 1.3 handshake timing with cURL\ncurl -Iv --tlsv1.3 https://example.com 2>&1 | grep -E "SSL connection|ALPN|subject:|expire date:"`,
        },
      },
    ],
    faqs: [
      {
        question: "Why does localhost throw ERR_SSL_PROTOCOL_ERROR when I run my local dev server?",
        answer:
          "Your local development server (e.g., Next.js, Vite, or Express on port 3000) is serving plain HTTP, but your browser is attempting to connect via https://localhost:3000 because another project previously set a Strict-Transport-Security (HSTS) header on localhost. Visit chrome://net-internals/#hsts, delete 'localhost', and explicitly type http://localhost:3000.",
      },
      {
        question: "Does clearing the Windows SSL State delete my saved browser passwords or cookies?",
        answer:
          "No. Clicking 'Clear SSL state' inside Windows Internet Properties (inetcpl.cpl -> Content tab) only purges cached TLS session tickets and client certificate selections in memory. Your browser passwords, history, and cookies remain untouched.",
      },
      {
        question: "What causes ERR_SSL_PROTOCOL_ERROR on mobile Wi-Fi but not on 5G cellular data?",
        answer:
          "This indicates your home or office Wi-Fi router has either cached a poisoned DNS entry, enabled a router-level 'Parental Control / Web Guard' filter that blocks the domain by forging a TCP reset on port 443, or has an MTU size mismatch dropping fragmented TLS handshake packets.",
      },
      {
        question: "Should I leave the Chrome QUIC protocol flag disabled permanently?",
        answer:
          "Disabling QUIC (HTTP/3) is a great diagnostic fix when you are on a restrictive network that drops UDP port 443 packets. However, on normal networks, HTTP/3 reduces handshake latency and prevents head-of-line blocking, so you can re-enable it once firewall rules are updated.",
      },
    ],
    author: DEFAULT_AUTHOR,
    tags: ["Networking", "SSL/TLS", "DNS", "Chrome Troubleshooting", "Windows 11"],
    relatedSlugs: [
      "fix-high-ram-cpu-usage-modern-browsers-memory-leaks",
      "core-web-vitals-optimization-eliminate-cls-sub-second-lcp",
      "resolve-git-line-ending-conflicts-crlf-lf-bom-errors",
    ],
    helpfulYes: 528,
    helpfulNo: 12,
  },
  {
    id: "art-03",
    slug: "clean-normalize-format-messy-pdf-copy-pasted-text",
    title:
      "How to Clean, Normalize, and Format Messy PDF Copy-Pasted Text Without Losing Paragraph Structure",
    subtitle:
      "Eliminate hard-wrapped line breaks, broken hyphenation, ligature corruption (ﬁ, ﬂ), and multi-column interleaving from PDF extracts.",
    excerpt:
      "Copying text from a PDF almost always results in jagged line breaks after every 65 characters, split hyphenated words, and missing spaces. Discover the exact regex patterns and heuristic algorithms to reconstruct clean paragraphs automatically.",
    category: "text-guides",
    publishedAt: "2026-09-22T08:45:00Z",
    updatedAt: "2026-10-19T16:20:00Z",
    testedOn: "",
    readingTimeMinutes: 7,
    wordCount: 1240,
    featured: true,
    status: "published",
    primaryKeyword: "clean messy PDF copy pasted text",
    metaTitle:
      "How to Clean & Format Messy PDF Copy-Pasted Text Without Losing Paragraphs | Zee Writes",
    metaDescription:
      "Learn how to remove unwanted hard line breaks, rejoin hyphenated words, fix ligatures (ﬁ, ﬂ), and preserve real paragraph breaks when copying text from PDFs.",
    coverImage: {
      url: "/images/diagrams/pdf-normalization.svg",
      alt: "Diagram showing how PDF glyph positioning boxes lack semantic paragraph tags and how heuristic line-join algorithms reconstruct paragraphs",
      caption:
        "Figure 3.1: Why PDF files store fixed X/Y glyph coordinates rather than semantic HTML paragraphs—and how lookbehind regex restores natural text flow.",
      width: 1200,
      height: 630,
      diagramType: "pdf-normalization",
    },
    verifiedTakeaway: {
      symptom:
        "Pasting text from a PDF into Word, Notion, Markdown, or an email inserts a hard carriage return at the end of every visual line, splits hyphenated words across lines, and corrupts 'fi'/'fl' ligatures.",
      rootCause:
        "The PDF specification (ISO 32000) is a page-layout vector format, not a semantic document format. It paints characters at absolute X/Y coordinates and inserts literal newline characters (\\n) at every visual margin wrap.",
      instantFix:
        "Apply Unicode NFKC normalization to decompose typographic ligatures (ﬁ -> fi), rejoin soft-hyphenated line wraps (/(\\w)-\\r?\\n(\\w)/g -> '$1$2'), and replace single newlines with spaces while preserving double newlines.",
      estimatedFixTime: "30 seconds",
      testedPlatforms: ["All Browsers", "VS Code", "Notion / Obsidian", "Microsoft Word"],
    },
    howToSteps: [
      {
        stepNumber: 1,
        name: "Decompose Typographic Ligatures (ﬁ, ﬂ, ﬀ) via NFKC Normalization",
        text: "LaTeX and InDesign PDFs frequently combine 'f' and 'i' into a single Unicode glyph (U+FB01 'ﬁ'). While NFKC normalization decomposes compatibility ligatures into standard ASCII letters ('f' + 'i'), standard NFC leaves them broken for search and spellcheck.",
        commandOrCode: `const decomposed = rawPdfText.normalize("NFKC");\n// Converts 'ﬁnancial wоrkﬂow' -> 'financial workflow'`,
        proTip:
          "Always use NFKC (Compatibility Composition) specifically for PDF extracts so superscript numbers, ligatures, and full-width Latin symbols normalize into clean searchable ASCII.",
      },
      {
        stepNumber: 2,
        name: "Rejoin Words Split by End-of-Line Hyphenation",
        text: "Justified PDF columns break long words at the right margin with a hyphen followed immediately by a newline. Strip the hyphen and newline when both surrounding characters are lowercase letters.",
        commandOrCode: `const unhyphenated = decomposed.replace(/([a-z])-\\r?\\n\\s*([a-z])/g, "$1$2");`,
      },
      {
        stepNumber: 3,
        name: "Preserve True Paragraphs While Unwrapping Hard Line Breaks",
        text: "Replace single line breaks (which represent visual margin wraps inside a paragraph) with a single space, while keeping double line breaks (or lines ending with terminal punctuation followed by a capitalized line) as true paragraph breaks.",
        commandOrCode: `const paragraphsRestored = unhyphenated\n  .replace(/\\r\\n/g, "\\n")\n  .replace(/([^.\\n!?])\\n(?=[a-z0-9(])/g, "$1 ")\n  .replace(/[ \\t]{2,}/g, " ");`,
      },
      {
        stepNumber: 4,
        name: "Clean Bullet Lists and Strip Header/Footer Page Numbers",
        text: "PDF page extracts often scatter running headers and standalone page numbers every 45 lines. Use the Zee Writes Duplicate Line & List Scrubber or a targeted regex to strip standalone numeric lines.",
        commandOrCode: `const withoutPageNumbers = paragraphsRestored.replace(/^\\s*Page\\s+\\d+(\\s+of\\s+\\d+)?\\s*$/gim, "");`,
      },
    ],
    sections: [
      {
        id: "why-pdfs-destroy-paragraphs",
        heading: "1. Inside ISO 32000: Why PDFs Have No Concept of a 'Paragraph'",
        paragraphs: [
          "To anyone who works with research papers, legal contracts, or technical datasheets, copying a three-paragraph excerpt from a PDF and pasting it into a document editor is a daily frustration. Instead of flowing smoothly across the new page width, the pasted text retains rigid, jagged line breaks every 60 to 75 characters, turning a clean block of prose into a broken staircase of fragments.",
          "The root cause lies in how PostScript and the Portable Document Format (PDF) were engineered in the early 1990s. Unlike HTML or Markdown—which store logical block elements like <p>, <ul>, and <h2> and let the viewing device calculate line wraps dynamically—a standard untagged PDF is essentially a digital printout. Inside the PDF content stream, text is positioned using low-level drawing operators such as 'Td' (move text current point to X, Y) and 'Tj' (show glyph string).",
          "When your PDF viewer (Adobe Acrobat, Chrome PDF Viewer, or macOS Preview) copies selected text to the system clipboard, it must guess where spaces and line breaks belong by measuring the Euclidean pixel distance between glyph bounding boxes. Whenever the Y-coordinate drops to a new baseline, the viewer injects a hard line feed (\\n), completely unaware of whether that drop was a mid-sentence margin wrap or the start of a new paragraph.",
        ],
        table: {
          caption: "Table 3.1: PDF Copy-Paste Artifacts & Heuristic Restoration Rules",
          headers: [
            "PDF Extraction Artifact",
            "Underlying Cause in PDF Stream",
            "Regex / Algorithmic Pattern",
            "Restored Output",
          ],
          rows: [
            [
              "Hard wrap mid-sentence",
              "Y-axis baseline step at right column margin",
              "/([^.\\n!?])\\n(?=[a-z])/g -> '$1 '",
              "Continuous flowing sentence",
            ],
            [
              "Split word ('optimi-\\nzation')",
              "Justified layout soft hyphenation",
              "/([a-z])-\\n([a-z])/g -> '$1$2'",
              "'optimization'",
            ],
            [
              "Missing 'fi' / 'fl' letters",
              "OpenType ligature glyph U+FB01 / U+FB02",
              "text.normalize('NFKC')",
              "Standard 'fi' and 'fl' characters",
            ],
            [
              "Bullet symbol turns into '•' or ''",
              "Private Use Area (PUA) Wingdings/Symbol font",
              "/^[\\uF000-\\uF8FF•▪▸]\\s*/gm -> '- '",
              "Clean Markdown '- ' list item",
            ],
          ],
        },
      },
      {
        id: "heuristic-paragraph-reconstruction",
        heading: "2. Building a Smart Paragraph Reconstruction Pipeline",
        paragraphs: [
          "Naive 'remove all line breaks' tools ruin documents by smashing headings, bullet points, and multi-paragraph essays into a single unreadable wall of text. An intelligent text normalization algorithm uses lookbehind and lookahead heuristics to distinguish cosmetic margin wraps from structural breaks.",
          "Specifically, a line break should be converted into a space if and only if: (1) the preceding line does not end with terminal sentence punctuation (period, question mark, exclamation mark, or colon) OR the following line begins with a lowercase letter; (2) the following line does not begin with a bullet symbol, numbered list marker, or Markdown heading octothorpe; and (3) the line length is close to the average column width of the extract.",
        ],
        codeBlock: {
          language: "typescript",
          filename: "pdf-text-normalizer.ts",
          code: `export function normalizePdfExtract(raw: string): string {\n  return raw\n    // 1. Decompose ligatures (ﬁ -> fi, ﬂ -> fl) and compatibility characters\n    .normalize("NFKC")\n    // 2. Standardize CRLF to LF and strip zero-width spaces\n    .replace(/\\r\\n/g, "\\n")\n    .replace(/[\\u200B-\\u200D\\uFEFF]/g, "")\n    // 3. Convert Private Use Area bullet glyphs to clean Markdown bullets\n    .replace(/^[\\s]*[\\uF000-\\uF8FF•●▪▸◦]\\s+/gm, "- ")\n    // 4. Rejoin hyphenated words broken across lines\n    .replace(/([a-zA-Z])-\\n\\s*([a-z])/g, "$1$2")\n    // 5. Preserve double line breaks as paragraph tokens\n    .replace(/\\n\\s*\\n/g, "\\n\\n")\n    // 6. Unwrap single line breaks that do not precede lists/headings\n    .replace(/([^\\n])\\n(?!\\n|[-*•]|\\d+\\.|#)/g, "$1 ")\n    // 7. Collapse multiple consecutive horizontal spaces\n    .replace(/[ \\t]{2,}/g, " ")\n    .trim();\n}`,
        },
        callout: {
          type: "pro-tip",
          title: "Handling Multi-Column Academic PDFs",
          body: "When copying from a 2-column IEEE or ACM research paper, never drag-select across the full page width—some older PDF viewers will interleave Column A Line 1 with Column B Line 1. Hold Alt (Windows) or Option (macOS Preview) while dragging to activate rectangular column selection.",
        },
      },
    ],
    faqs: [
      {
        question: "Why do words containing 'fi' or 'fl' lose those letters when pasted from a PDF?",
        answer:
          "Many professional typesetting systems replace the two-letter sequence 'f' + 'i' with a single decorative ligature glyph. If the PDF's embedded font lacks a proper ToUnicode CMap table, the clipboard receives either a Private Use character or a compatibility code point (U+FB01). Running Unicode NFKC normalization converts U+FB01 cleanly back into 'fi'.",
      },
      {
        question: "How can I remove line breaks in VS Code or Sublime Text using Regex?",
        answer:
          "Press Ctrl+H (or Cmd+Option+F on macOS), enable the Regular Expression (.*) toggle, search for ([^\\n])\\n(?!\\n) and replace with $1 (dollar one followed by a space). This merges single line wraps while preserving blank lines between paragraphs.",
      },
      {
        question: "Why does pasting from a PDF insert a space inside the middle of words?",
        answer:
          "When PDF authors apply custom letter-spacing (tracking/kerning) to headings or justified paragraphs, the distance between two letters inside a word may exceed the PDF viewer's heuristic space threshold (typically 0.25 em), causing the viewer to insert spurious spaces.",
      },
    ],
    author: DEFAULT_AUTHOR,
    tags: ["PDF Cleanup", "Text Formatting", "Regex", "Productivity", "Unicode NFKC"],
    relatedSlugs: [
      "fix-corrupted-utf8-text-mojibake-zero-width-characters",
      "mastering-regular-expressions-regex-text-search-cleanup",
      "markdown-formatting-masterclass-technical-documentation",
    ],
    helpfulYes: 364,
    helpfulNo: 6,
  },
  {
    id: "art-04",
    slug: "why-copy-pasted-code-breaks-smart-quotes-nbsp-sanitization",
    title:
      "Why Copy-Pasted Code Breaks in Production: Smart Quotes, Non-Breaking Spaces, and How to Sanitize Text Automatically",
    subtitle:
      "Preventing syntax errors, broken CLI flags (em-dash vs double-hyphen), and homograph vulnerabilities in developer documentation and CI pipelines.",
    excerpt:
      "Have you ever copied a one-line bash command or JSON config from a blog post only to be greeted by an unexplained syntax error? Discover how typographic auto-formatters corrupt code—and how to build automated sanitization guardrails.",
    category: "solutions",
    publishedAt: "2026-09-26T13:00:00Z",
    updatedAt: "2026-10-21T11:45:00Z",
    testedOn: "",
    readingTimeMinutes: 7,
    wordCount: 1290,
    featured: false,
    status: "published",
    primaryKeyword: "why copy pasted code breaks smart quotes",
    metaTitle:
      "Why Copy-Pasted Code Breaks: Smart Quotes, Em-Dashes & NBSP Sanitization | Zee Writes",
    metaDescription:
      "Understand why copy-pasted code and CLI commands fail due to smart quotes (“ ”), em-dashes (—), and non-breaking spaces (U+00A0), and how to sanitize code automatically.",
    coverImage: {
      url: "/images/diagrams/hidden-chars-ast.svg",
      alt: "Compiler lexer tokenization comparison showing how ASCII quotes pass AST parsing while curly smart quotes and non-breaking spaces trigger syntax errors",
      caption:
        "Figure 4.1: How a JavaScript/Bash lexer tokenizes standard ASCII delimiters (0x22, 0x2D, 0x20) versus typographic substitutions (U+201C, U+2014, U+00A0).",
      width: 1200,
      height: 630,
      diagramType: "hidden-chars-ast",
    },
    verifiedTakeaway: {
      symptom:
        "Pasted CLI commands, SQL queries, or JSON/JavaScript snippets fail immediately with 'Unexpected token', 'Unknown option —save', or invalid string literal errors despite looking visually identical to valid syntax.",
      rootCause:
        "Word processors, CMS filters (wptexturize), Notion, and macOS Smart Punctuation replace straight quotes (\" ') with curly quotes (“ ” ‘ ’), double hyphens (--) with em/en-dashes (— –), and regular spaces with U+00A0.",
      instantFix:
        "Normalize typographic punctuation to strict 7-bit ASCII before execution using the Zee Writes Invisible Character Fixer or a Git pre-commit sanitizer hook.",
      estimatedFixTime: "20 seconds",
      testedPlatforms: ["Bash / Zsh / PowerShell", "Node.js / Python", "Git / CI Pipelines"],
    },
    howToSteps: [
      {
        stepNumber: 1,
        name: "Replace Curly Smart Quotes with Straight ASCII Quotes (0x22 and 0x27)",
        text: "Programming language parsers only recognize U+0022 (\") and U+0027 (') as string delimiters. Map all eight Unicode quotation mark variants back to their straight ASCII counterparts.",
        commandOrCode: `const asciiQuotes = code\n  .replace(/[\\u201C\\u201D\\u201E\\u201F\\u2033\\u2036]/g, '"')\n  .replace(/[\\u2018\\u2019\\u201A\\u201B\\u2032\\u2035]/g, "'");`,
      },
      {
        stepNumber: 2,
        name: "Convert Em-Dashes (—) and En-Dashes (–) Back into CLI Double-Hyphens (--)",
        text: "When technical writers type '--version' or '--Detached' in Google Docs, Word, or WordPress, auto-correct converts '--' into an En-Dash (U+2013) or Em-Dash (U+2014). Terminal parsers treat '—version' as a literal argument rather than a flag.",
        commandOrCode: `const fixedFlags = asciiQuotes\n  .replace(/\\u2014(?=\\w)/g, "--")\n  .replace(/\\u2013(?=\\w)/g, "-");`,
      },
      {
        stepNumber: 3,
        name: "Purge Non-Breaking Spaces (U+00A0) Generated by macOS Option+Space",
        text: "On macOS keyboards, typing a pipe character (|) followed quickly by a space while holding Option injects U+00A0 (`| grep`). Bash then reports `command not found:  grep` because the leading U+00A0 is glued to the command name!",
        commandOrCode: `# Highlight non-ASCII characters in any script file using grep:\nLC_ALL=C grep --color='auto' -P -n "[\\x80-\\xFF]" deploy.sh`,
        proTip:
          "That `command not found:  grep` error after a pipe (`|`) on macOS is one of the most famous terminal mysteries—it happens because your thumb lingered on the Option key after pressing Option+Backslash or Shift+Option!",
      },
      {
        stepNumber: 4,
        name: "Enforce ASCII-Clean Code Blocks via ESLint and VS Code Settings",
        text: "Enable native Unicode highlighting in VS Code so any invisible or confusable character in your editor is immediately outlined in bright amber.",
        commandOrCode: `// .vscode/settings.json\n{\n  "editor.unicodeHighlight.nonBasicASCII": true,\n  "editor.unicodeHighlight.invisibleCharacters": true,\n  "editor.unicodeHighlight.ambiguousCharacters": true\n}`,
      },
    ],
    sections: [
      {
        id: "the-four-horsemen-of-broken-snippets",
        heading: "1. The Four Typographic Substitutions That Break Production Code",
        paragraphs: [
          "Modern operating systems and content management systems are optimized for prose typography, not machine-executable syntax. Features like Apple's 'Smart Quotes and Dashes', Microsoft Word's AutoFormat, and WordPress's `wptexturize` engine silently inspect keystrokes and mutate ASCII punctuation into decorative Unicode symbols.",
          "While curly quotation marks and em-dashes look refined in an editorial essay, they are fatal inside source code, SQL queries, shell scripts, and JSON configuration files. Compilers and interpreters operate on strict lexical grammars where a single byte outside the expected ASCII range changes the token class from a delimiter or operator into an unrecognized symbol.",
        ],
        table: {
          caption: "Table 4.1: Destructive Typographic Auto-Replacements in Code & CLI Commands",
          headers: [
            "Original ASCII Input",
            "Auto-Corrected Symbol",
            "Unicode Hex",
            "Resulting Failure Mode",
          ],
          rows: [
            [
              '{"key": "value"}',
              "“key”: “value”",
              "U+201C / U+201D",
              "SyntaxError: Unexpected token “ in JSON at position 1",
            ],
            [
              "docker run --rm -it",
              "docker run —rm -it",
              "U+2014 (Em-Dash)",
              "docker: invalid reference format (treats —rm as image name)",
            ],
            [
              "cat log.txt | grep ERR",
              "cat log.txt |\\u00A0grep ERR",
              "U+00A0 (NBSP)",
              "zsh: command not found: \\u00A0grep",
            ],
            [
              "x = a - b",
              "x = a − b",
              "U+2212 (Minus Sign)",
              "ReferenceError or SyntaxError: Invalid character '−'",
            ],
          ],
        },
      },
      {
        id: "homograph-and-trojan-source-defenses",
        heading: "2. Beyond Punctuation: Defending Against Homoglyphs and Trojan Source (CVE-2021-42574)",
        paragraphs: [
          "Accidental smart quotes are annoying, but intentional Unicode manipulation poses a genuine security threat known as a Homograph Attack or Trojan Source vulnerability (CVE-2021-42574). For example, the Cyrillic small letter 'а' (U+0430) and Greek semicolon ';' (U+037E) are pixel-for-pixel identical to the Latin 'a' (U+0061) and ASCII semicolon ';' (U+003B) in most monospace fonts.",
          "Furthermore, Unicode Bidirectional (Bidi) override characters (such as U+202E RIGHT-TO-LEFT OVERRIDE) can make source code display visually in one order in a code review UI while the compiler executes the underlying bytes in reverse order—allowing malicious logic to hide inside what looks like a harmless comment.",
          "By integrating automated Unicode sanitization into your pre-commit hooks and CI pipeline, you eliminate both accidental copy-paste friction and deliberate Bidi/homoglyph injection vectors.",
        ],
        codeBlock: {
          language: "javascript",
          filename: "pre-commit-ascii-guard.mjs",
          code: `import fs from "node:fs";\n\nconst FORBIDDEN_CODE_POINTS = /[\\u200B-\\u200F\\u202A-\\u202E\\u2066-\\u2069\\uFEFF\\u00A0]/;\n\nexport function auditSourceFile(filePath) {\n  const content = fs.readFileSync(filePath, "utf8");\n  const lines = content.split("\\n");\n  const violations = [];\n\n  lines.forEach((line, index) => {\n    const match = line.match(FORBIDDEN_CODE_POINTS);\n    if (match) {\n      const codePoint = match[0].codePointAt(0).toString(16).toUpperCase().padStart(4, "0");\n      violations.push({\n        line: index + 1,\n        column: match.index + 1,\n        codePoint: \`U+\${codePoint}\`,\n      });\n    }\n  });\n\n  return violations;\n}`,
        },
      },
    ],
    faqs: [
      {
        question: "Why does macOS insert a non-breaking space when I type pipe (|) in the terminal?",
        answer:
          "On many keyboard layouts, typing the pipe symbol or certain brackets requires holding Shift + Option (or Option). If your finger is still depressing the Option key a millisecond later when you press the Spacebar, macOS interprets Option + Space as Non-Breaking Space (U+00A0). You can disable this in iTerm2 or Terminal by mapping Option+Space to send a regular hex 0x20 space.",
      },
      {
        question: "How do I disable Smart Quotes and Smart Dashes system-wide on macOS and Windows?",
        answer:
          "On macOS, open System Settings -> Keyboard -> Text Input -> Edit, and toggle off 'Use smart quotes and dashes'. In Microsoft Word, go to File -> Options -> Proofing -> AutoCorrect Options -> AutoFormat As You Type, and uncheck 'Straight quotes with smart quotes' and 'Hyphens (--) with dash (—)'.",
      },
      {
        question: "Can JSON files ever validly contain curly smart quotes as structural delimiters?",
        answer:
          "Never. According to RFC 8259 (The JavaScript Object Notation Data Interchange Format), all JSON object keys and string values must be enclosed strictly in U+0022 quotation marks. Curly quotes are only permitted inside the contents of a UTF-8 string value, never as the surrounding delimiters.",
      },
    ],
    author: DEFAULT_AUTHOR,
    tags: ["Code Sanitization", "Smart Quotes", "Terminal Fixes", "DevSecOps", "ASCII"],
    relatedSlugs: [
      "fix-corrupted-utf8-text-mojibake-zero-width-characters",
      "json-schema-validation-payload-minification-api-fixes",
      "resolve-git-line-ending-conflicts-crlf-lf-bom-errors",
    ],
    helpfulYes: 319,
    helpfulNo: 5,
  },
  {
    id: "art-05",
    slug: "core-web-vitals-optimization-eliminate-cls-sub-second-lcp",
    title:
      "Core Web Vitals Optimization Guide: How to Reduce Cumulative Layout Shift (CLS) and Improve LCP",
    subtitle:
      "Front-end architecture patterns for reducing layout shift (CLS), improving Largest Contentful Paint (LCP), and keeping Interaction to Next Paint (INP) responsive.",
    excerpt:
      "Passing Google's Core Web Vitals assessment is important for search visibility and user experience. Learn how to reserve ad-slot containers, prevent web font layout shifts, prioritize hero LCP images, and break up long main-thread tasks.",
    category: "solutions",
    publishedAt: "2026-09-30T09:30:00Z",
    updatedAt: "2026-10-24T15:00:00Z",
    testedOn: "",
    readingTimeMinutes: 8,
    wordCount: 1410,
    featured: true,
    status: "published",
    primaryKeyword: "Core Web Vitals reduce CLS improve LCP",
    metaTitle:
      "Core Web Vitals Optimization Guide: Reduce CLS, Improve LCP & INP | Zee Writes",
    metaDescription:
      "Guide to improving Core Web Vitals: reduce Cumulative Layout Shift (CLS) from ads and fonts, speed up LCP, and optimize INP.",
    coverImage: {
      url: "/images/diagrams/cwv-timeline.svg",
      alt: "Browser rendering pipeline diagram illustrating LCP resource prioritization, CLS aspect-ratio reservation boxes, and INP main-thread task yielding",
      caption:
        "Figure 5.1: Critical rendering path stages for Largest Contentful Paint (LCP), Cumulative Layout Shift (CLS), and Interaction to Next Paint (INP).",
      width: 1200,
      height: 630,
      diagramType: "cwv-timeline",
    },
    verifiedTakeaway: {
      symptom:
        "Google Search Console reports 'Poor' or 'Needs Improvement' URLs due to CLS > 0.1 (from dynamic ad units, late-loading web fonts, or unsized images) or LCP > 2.5s (from render-blocking scripts and lazy-loaded hero images).",
      rootCause:
        "Asynchronous DOM injections push below-the-fold text downward after first paint, while lazy-loading above-the-fold hero images delays LCP discovery until after JavaScript hydration.",
      instantFix:
        "Wrap dynamic containers in a fixed min-height wrapper, set explicit width/height attributes on all images, use fetchpriority='high' and loading='eager' on the hero image, and use font-display: swap with metric-matched fallbacks.",
      estimatedFixTime: "15 minutes",
      testedPlatforms: ["Next.js", "React", "Lighthouse"],
    },
    howToSteps: [
      {
        stepNumber: 1,
        name: "Reserve Deterministic Bounding Boxes for Dynamic Containers",
        text: "A common cause of Cumulative Layout Shift on content sites is unreserved containers that start at 0px height and expand when asynchronous content loads. Wrap dynamic slots in a static outer container with explicit min-height.",
        commandOrCode: `<div className="my-6 min-h-[250px] w-full" />`,
        proTip:
          "Avoid collapsing a reserved container above or within the initial viewport so surrounding text never jumps.",
      },
      {
        stepNumber: 2,
        name: "Prioritize the Hero LCP Element with fetchpriority='high' and Zero Lazy-Loading",
        text: "Never put loading='lazy' on your above-the-fold featured article image or hero graphic. Use fetchpriority='high' and decoding='async' so the browser preload scanner fetches the image parallel to CSS.",
        commandOrCode: `<img\n  src="/images/featured-hero.webp"\n  alt="Descriptive technical diagram"\n  width={1200}\n  height={630}\n  fetchPriority="high"\n  decoding="async"\n  className="w-full h-auto aspect-[1200/630] object-cover"\n/>`,
      },
      {
        stepNumber: 3,
        name: "Eliminate Web Font Reflow with Metric-Matched Fallback Fonts",
        text: "When a custom Google Font swaps in over a system fallback font (like Arial or Georgia), differences in x-height and glyph advance width can shift paragraph line wraps by 1–3 lines. Use next/font with adjustFontFallback: true.",
        commandOrCode: `import { Plus_Jakarta_Sans, Newsreader } from "next/font/google";\n\nexport const jakarta = Plus_Jakarta_Sans({\n  subsets: ["latin"],\n  display: "swap",\n  adjustFontFallback: true,\n});`,
      },
      {
        stepNumber: 4,
        name: "Break Up Long Tasks (>50ms) to Improve Interaction to Next Paint (INP)",
        text: "When heavy client-side scripts run synchronously during user clicks or typing, the browser cannot paint the next visual frame. Yield to the main thread or defer non-critical boot work to requestIdleCallback.",
        commandOrCode: `export async function yieldToMain(): Promise<void> {\n  if ("scheduler" in window && "yield" in (window as any).scheduler) {\n    return (window as any).scheduler.yield();\n  }\n  return new Promise(resolve => setTimeout(resolve, 0));\n}`,
      },
    ],
    sections: [
      {
        id: "reducing-cls",
        heading: "1. Reducing Cumulative Layout Shift (CLS) on Editorial Sites",
        paragraphs: [
          "Cumulative Layout Shift (CLS) measures the visual stability of a page by multiplying the 'impact fraction' (how much of the viewport was affected by an unexpected shift) by the 'distance fraction' (how far unstable elements moved relative to the viewport). Google requires a 75th-percentile CLS score of 0.10 or less to pass Core Web Vitals.",
          "For editorial publishers and developer documentation portals, layout shifts usually originate from four sources: (1) asynchronous display advertisements injected without reserved dimensions, (2) banners inserted into the document flow instead of positioned as fixed overlays, (3) images or SVG diagrams missing explicit width and height attributes, and (4) client-side hydration mismatches where toolbars or callouts mount after initial SSR paint.",
          "By combining CSS `aspect-ratio` boxes on all media figures and reserved `min-height` wrappers on dynamic containers, the browser's layout engine can calculate the position of paragraphs on the first layout pass.",
        ],
        table: {
          caption: "Table 5.1: Core Web Vitals Thresholds & Optimization Techniques",
          headers: [
            "Core Web Vital Metric",
            "Google 'Good' Threshold",
            "Primary Optimization Technique",
          ],
          rows: [
            [
              "Largest Contentful Paint (LCP)",
              "<= 2.5 seconds",
              "SSR HTML + hero image with fetchpriority='high'",
            ],
            [
              "Cumulative Layout Shift (CLS)",
              "<= 0.10",
              "Explicit width/height on images + min-height on dynamic slots",
            ],
            [
              "Interaction to Next Paint (INP)",
              "<= 200 ms",
              "Break up long main-thread tasks with scheduler.yield()",
            ],
            [
              "Time to First Byte (TTFB)",
              "<= 800 ms",
              "Static/ISR pre-rendered Server Components and CDN caching",
            ],
          ],
        },
      },
      {
        id: "isolating-3d-and-heavy-widgets",
        heading: "2. Isolating Interactive Widgets Without Hurting LCP or INP",
        paragraphs: [
          "Bundling a heavy initialization script directly into the critical rendering path can stall the main thread, hurting both Total Blocking Time (TBT) and Interaction to Next Paint (INP).",
          "A practical approach is progressive loading: render static HTML/CSS on initial server paint so LCP completes quickly, and defer non-critical interactive widgets using `requestIdleCallback` or `IntersectionObserver`.",
        ],
        callout: {
          type: "pro-tip",
          title: "Reserving Space for Dynamic Elements",
          body: "Whenever a page includes asynchronous widgets, embeds, or ad slots, reserve a fixed minimum height in CSS so surrounding text does not jump when the element finishes loading.",
        },
      },
    ],
    faqs: [
      {
        question: "Why does my Lighthouse CLS score look low in the lab, but CrUX field data is higher?",
        answer:
          "Lighthouse lab tests only measure layout shifts during the initial page load before scrolling. Real-user CrUX data records layout shifts across the entire page lifecycle as users scroll down past lazy-loaded elements and embeds. Reserving min-height on below-the-fold dynamic slots helps prevent post-scroll layout shifts.",
      },
      {
        question: "Does smooth scrolling negatively affect Core Web Vitals?",
        answer:
          "When configured to handle wheel events passively and disabled automatically for users with prefers-reduced-motion, smooth scrolling libraries operate inside requestAnimationFrame without forcing synchronous DOM reflows.",
      },
      {
        question: "How should overlays or banners be positioned to avoid layout shifts?",
        answer:
          "Inserting a banner at the top of the document flow after hydration pushes the entire page down and causes a large CLS spike. Positioning overlays with fixed positioning (`position: fixed`) avoids shifting document content.",
      },
    ],
    author: DEFAULT_AUTHOR,
    tags: ["Core Web Vitals", "CLS", "LCP", "INP", "AdSense Optimization", "Next.js"],
    relatedSlugs: [
      "fix-high-ram-cpu-usage-modern-browsers-memory-leaks",
      "json-schema-validation-payload-minification-api-fixes",
      "markdown-formatting-masterclass-technical-documentation",
    ],
    helpfulYes: 489,
    helpfulNo: 7,
  },
];
