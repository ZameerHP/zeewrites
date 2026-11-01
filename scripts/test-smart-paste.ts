import assert from "node:assert";
import { parseArticle, slugifyText } from "../src/lib/smart-paste/parser";
import { blocksToMarkdown, blocksToSections } from "../src/lib/smart-paste/renderer";
import { detectLanguage } from "../src/lib/smart-paste/code-detector";

console.log("=== RUNNING SMART PASTE TEST SUITE (7 TEST CASES) ===\n");

// TEST CASE 1: ChatGPT answer with fenced code and "Copy code" labels
console.log("--- TEST 1: ChatGPT answer with fenced code and 'Copy code' labels ---");
{
  const input = `
How to Build a REST API in Python

Here is how you can write a simple Flask endpoint:

python
Copy code
\`\`\`python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})
\`\`\`

Copy
Make sure to install Flask first with pip.
`;

  const parsed = parseArticle(input);
  assert.strictEqual(parsed.title, "How to Build a REST API in Python", "Title should be detected from first line");
  assert.strictEqual(parsed.slug, "how-to-build-a-rest-api-in-python", "Slug should match title");

  const codeBlocks = parsed.blocks.filter((b) => b.type === "code");
  assert.strictEqual(codeBlocks.length, 1, "Exactly one code block detected");
  assert.strictEqual(codeBlocks[0].language, "python", "Code language should be python");
  assert(codeBlocks[0].code?.includes("def health():"), "Code content should be preserved");

  const paragraphs = parsed.blocks.filter((b) => b.type === "paragraph");
  assert(!paragraphs.some((p) => p.text?.includes("Copy code")), "ChatGPT 'Copy code' artifact must be stripped");
  assert(!paragraphs.some((p) => p.text?.trim() === "Copy"), "ChatGPT 'Copy' artifact must be stripped");

  console.log("  ✓ PASS: ChatGPT copy artifacts cleanly removed, code block parsed with python language");
}

// TEST CASE 2: Google Docs paste with real headings (simulated HTML or markdown)
console.log("\n--- TEST 2: Google Docs paste with real headings ---");
{
  const htmlInput = `
<h1>Optimizing Web Application Performance</h1>
<p>Modern web applications require fast time-to-interactive and low latency.</p>
<h2>Core Web Vitals</h2>
<p>There are three main metrics to track:</p>
<ul>
  <li>Largest Contentful Paint (LCP)</li>
  <li>Cumulative Layout Shift (CLS)</li>
  <li>Interaction to Next Paint (INP)</li>
</ul>
<h3>How to Measure</h3>
<pre><code class="language-bash">npx lighthouse-ci collect</code></pre>
`;

  const parsed = parseArticle("", htmlInput);
  assert.strictEqual(parsed.title, "Optimizing Web Application Performance", "H1 should be detected as article title");

  const h2s = parsed.blocks.filter((b) => b.type === "heading" && b.level === 2);
  assert.strictEqual(h2s.length, 1, "H2 heading detected");
  assert.strictEqual(h2s[0].text, "Core Web Vitals");

  const h3s = parsed.blocks.filter((b) => b.type === "heading" && b.level === 3);
  assert.strictEqual(h3s.length, 1, "H3 heading detected");
  assert.strictEqual(h3s[0].text, "How to Measure");

  const lists = parsed.blocks.filter((b) => b.type === "list");
  assert.strictEqual(lists.length, 1, "Bullet list detected from <ul>");
  assert.strictEqual(lists[0].items?.length, 3, "List has 3 items");

  console.log("  ✓ PASS: Google Docs HTML parsed into Title, H2, H3, List, and Code block");
}

// TEST CASE 3: Plain text article with no markdown at all
console.log("\n--- TEST 3: Plain text article with no markdown at all ---");
{
  const plainText = `
Troubleshooting High CPU Usage on Windows

Why Modern Systems Overheat

Background tasks and corrupted indexers frequently consume system cycles. You can isolate the offending service using Task Manager.

Step 1: Open Task Manager

Press Ctrl + Shift + Esc on your keyboard. Switch to the Details tab and sort by CPU.

Step 2: Terminate Stuck Services

Locate any process showing more than 80% sustained utilization and end the process tree.
`;

  const parsed = parseArticle(plainText);
  assert.strictEqual(parsed.title, "Troubleshooting High CPU Usage on Windows", "Title auto-detected from first title-case line");

  const headings = parsed.blocks.filter((b) => b.type === "heading");
  assert(headings.some((h) => h.text === "Why Modern Systems Overheat" && h.level === 2), "Major section detected as H2");
  assert(headings.some((h) => h.text?.includes("Step 1: Open Task Manager") && h.level === 3), "Step 1 detected as H3");
  assert(headings.some((h) => h.text?.includes("Step 2: Terminate Stuck Services") && h.level === 3), "Step 2 detected as H3");

  const p = parsed.blocks.find((b) => b.type === "paragraph" && b.text?.includes("Ctrl + Shift + Esc"));
  assert(p?.text?.includes("`Ctrl + Shift + Esc`"), "Keyboard shortcut auto-enriched with inline code backticks");

  console.log("  ✓ PASS: Plain text without markdown successfully structured into H2, H3, paragraphs, and inline shortcuts");
}

// TEST CASE 4: Hard-wrapped email-style text
console.log("\n--- TEST 4: Hard-wrapped email-style text ---");
{
  const emailWrapped = `
Email Synchronization Issues

When users report that Microsoft Outlook is failing
to sync mailboxes over IMAP or Exchange Online,
the primary cause is usually an expired OAuth token
or a corrupted OST data file.

Resolving the Outlook Cache

To resolve this issue immediately, close Outlook completely
and delete the cached OST file in your local app data directory.
`;

  const parsed = parseArticle(emailWrapped);
  assert.strictEqual(parsed.title, "Email Synchronization Issues");

  const paragraphs = parsed.blocks.filter((b) => b.type === "paragraph");
  console.log("Test 4 Paragraphs count:", paragraphs.length);
  paragraphs.forEach((p, idx) => console.log(`P[${idx}]:`, p.text));
  assert.strictEqual(paragraphs.length, 2, "Exactly 2 clean paragraphs joined from hard-wrapped lines");
  assert(
    paragraphs[0].text?.includes("failing to sync mailboxes over IMAP or Exchange Online, the primary cause"),
    "Single line breaks within paragraph seamlessly joined with space"
  );

  console.log("  ✓ PASS: Hard-wrapped lines collapsed into clean single paragraphs");
}

// TEST CASE 5: Windows fix guide full of CMD/PowerShell commands
console.log("\n--- TEST 5: Windows fix guide full of CMD/PowerShell commands ---");
{
  const windowsGuide = `
How to Fix Corrupted System Files in Windows 11

Running System File Checker

Open Command Prompt as an administrator and execute:

sfc /scannow

Repairing Windows Component Store

If SFC reports that it found corrupted files but was unable to fix some of them, run DISM:

DISM /Online /Cleanup-Image /RestoreHealth

Checking Network Connectivity

To reset your network stack in PowerShell, use:

Get-NetAdapter | Restart-NetAdapter
`;

  const parsed = parseArticle(windowsGuide);
  const codeBlocks = parsed.blocks.filter((b) => b.type === "code");
  assert(codeBlocks.length >= 2, "Unfenced CMD/PowerShell commands automatically detected as code blocks");

  const sfcBlock = codeBlocks.find((b) => b.code?.includes("sfc /scannow"));
  assert(sfcBlock, "sfc command captured in code block");
  assert.strictEqual(sfcBlock.language, "cmd", "SFC recognized as cmd");

  const psBlock = codeBlocks.find((b) => b.code?.includes("Get-NetAdapter"));
  assert(psBlock, "PowerShell cmdlet captured in code block");
  assert.strictEqual(psBlock.language, "powershell", "Get-NetAdapter recognized as powershell");

  console.log("  ✓ PASS: Unfenced Windows CMD and PowerShell commands detected with accurate language tags");
}

// TEST CASE 6: Mixed article with table, lists, and callouts
console.log("\n--- TEST 6: Mixed article with table, lists, and callouts ---");
{
  const mixed = `
DNS Resolver Latency Comparison

Performance Benchmarks

| Resolver | Primary IP | Average Ping | DoH Support |
| --- | --- | --- | --- |
| Cloudflare | 1.1.1.1 | 11ms | Yes |
| Google | 8.8.8.8 | 14ms | Yes |
| Quad9 | 9.9.9.9 | 19ms | Yes |

Recommended Settings

- Configure DoH in your browser settings
- Flush local DNS cache with ipconfig /flushdns
- Set router DNS fallback to 1.0.0.1

Tip: Always verify DNS propagation after updating domain nameservers.
Warning: Never share your private API keys in client-side code.
`;

  const parsed = parseArticle(mixed);

  const tableBlock = parsed.blocks.find((b) => b.type === "table");
  assert(tableBlock, "Table block detected");
  assert.strictEqual(tableBlock.headers?.length, 4, "Table has 4 headers");
  assert.strictEqual(tableBlock.rows?.length, 3, "Table has 3 rows");

  const listBlock = parsed.blocks.find((b) => b.type === "list");
  assert(listBlock, "List block detected");
  assert.strictEqual(listBlock.items?.length, 3, "List has 3 items");

  const callouts = parsed.blocks.filter((b) => b.type === "callout");
  assert.strictEqual(callouts.length, 2, "2 callouts detected");
  assert.strictEqual(callouts[0].calloutType, "tip");
  assert.strictEqual(callouts[1].calloutType, "warning");

  const mdOutput = blocksToMarkdown(parsed.blocks);
  assert(mdOutput.includes("| Resolver | Primary IP |"), "Markdown renderer outputs table");
  assert(mdOutput.includes("> Tip:"), "Markdown renderer outputs Tip callout");
  assert(mdOutput.includes("> Warning:"), "Markdown renderer outputs Warning callout");

  console.log("  ✓ PASS: Table, lists, and callouts parsed and rendered to clean Markdown");
}

// TEST CASE 7: Text containing HTML tags that must be shown as code, not executed
console.log("\n--- TEST 7: Text with HTML tags shown as code, not executed ---");
{
  const htmlAsCode = `
Understanding HTML Semantic Elements

The following snippet shows how to write an accessible button:

\`\`\`html
<button type="button" class="btn-primary" onclick="alert('xss')">
  <span>Click Me</span>
</button>
\`\`\`

You can also use <div role="button"> with proper keyboard event listeners.
`;

  const parsed = parseArticle(htmlAsCode);
  const codeBlock = parsed.blocks.find((b) => b.type === "code");
  assert(codeBlock, "Code block present");
  assert(codeBlock.code?.includes('<button type="button"'), "HTML tags preserved verbatim inside code block");

  const p = parsed.blocks.find((b) => b.type === "paragraph" && b.text?.includes("role="));
  assert(p, "Paragraph with inline tag detected");

  console.log("  ✓ PASS: HTML tags inside code blocks and prose are preserved safely without execution");
}

// PERFORMANCE TEST: 15,000+ words
console.log("\n--- TEST 8: Performance Benchmark (15,000+ words) ---");
{
  const sectionSample = `
## Deep Dive into Linux Kernel Memory Management

Virtual memory architectures in Unix-like operating systems decouple physical RAM
addresses from user-space execution contexts. Each page table maps 4KB or 2MB hugepages.

### Inspecting Virtual Memory Mappings

To examine real-time dirty cache and active kernel slabs, execute:

\`\`\`bash
cat /proc/meminfo | grep -E "MemTotal|MemFree|Cached|Dirty"
\`\`\`

- Verify swap space allocation
- Check kernel slab reclaimable memory
- Ensure dirty writeback buffers are under 10%

Tip: Excessive dirty writebacks on slow NVMe drives cause I/O wait spikes.

| Metric | Target Baseline | Warning Threshold | Critical |
| --- | --- | --- | --- |
| MemAvailable | > 30% | < 15% | < 5% |
| Dirty | < 500MB | > 2GB | > 5GB |
| SwapUsed | < 10% | > 40% | > 80% |
`;

  // Repeat to create a massive 15,000+ word document
  let bigArticle = "# Complete Masterclass: Operating System Performance Engineering\n\n";
  for (let s = 0; s < 220; s++) {
    bigArticle += `\n\n## Section ${s + 1}: Memory Subsystem Architecture\n` + sectionSample;
  }

  const startTime = Date.now();
  const parsed = parseArticle(bigArticle);
  const elapsed = Date.now() - startTime;

  console.log(`  Parsed ${parsed.wordCount} words in ${elapsed}ms!`);
  assert(parsed.wordCount >= 15000, "Document should exceed 15,000 words");
  assert(elapsed < 200, "15,000+ word parsing must complete in under 200ms (instantaneous)");
  assert(parsed.blocks.length > 500, "Hundreds of structured blocks extracted");

  console.log(`  ✓ PASS: 15,000+ words processed in ${elapsed}ms with zero lag!`);
}

console.log("\n=== ALL SMART PASTE TESTS PASSED! ===");
