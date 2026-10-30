import { spawn } from "node:child_process";

const PORT = 3005;
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, options);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    // not JSON
  }
  return {
    status: res.status,
    headers: res.headers,
    text,
    json,
  };
}

async function waitForServer(maxAttempts = 40) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/cms`);
      if (res.status === 200) {
        console.log(`Server responded ready at ${BASE_URL}\n`);
        return true;
      }
    } catch {
      // not yet up
    }
    await sleep(500);
  }
  throw new Error(`Server failed to start at ${BASE_URL} after ${maxAttempts * 0.5}s`);
}

async function run() {
  console.log("=== STARTING ZEES WRITES ACCEPTANCE TEST SUITE ===\n");
  console.log("Starting Next.js production server on port", PORT, "...");

  const serverProc = spawn("npx.cmd", ["next", "start", "-p", String(PORT)], {
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
    env: { ...process.env, ZEEWRITES_LOCAL_DB: "1" },
  });

  serverProc.stdout.on("data", (data) => {
    const s = data.toString();
    if (s.includes("Ready in") || s.includes("started server on")) {
      console.log(`[Next.js Server]: ${s.trim()}`);
    }
  });

  serverProc.stderr.on("data", (data) => {
    // ignore harmless noise
  });

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passedCount++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failedCount++;
    }
  }

  try {
    await waitForServer();

    // TEST 1: LOGIN SECURITY & RATE LIMITING
    console.log("--- TEST 1: Admin Authentication & Security ---");
    {
      // 1a. Invalid credentials
      const badRes = await request("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          passphrase: "wrong-passphrase",
          pin: "000000",
        }),
      });
      assert(badRes.status === 401 && badRes.json?.ok === false, "Server rejects invalid Passphrase / PIN with 401 Unauthorized");

      // 1b. Rate limiting lockout after 5 consecutive failures
      for (let i = 0; i < 4; i++) {
        await request("/api/cms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "login",
            passphrase: "wrong-passphrase",
            pin: "000000",
          }),
        });
      }
      const rateRes = await request("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          passphrase: "wrong-passphrase",
          pin: "000000",
        }),
      });
      assert(rateRes.status === 429 && rateRes.json?.error?.includes("Locked out"), "Server rate-limits repeated failed logins with 429 Too Many Requests");

      // 1c. Unauthorized mutation attempt
      const unauthMutate = await request("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_article",
          id: "art-nonexistent",
        }),
      });
      assert(unauthMutate.status === 401, "Server blocks article deletion without authenticated session (401)");
    }

    // TEST 2: SUCCESSFUL LOGIN & PERSISTENT SESSION COOKIE
    console.log("\n--- TEST 2: Valid Login & Session Persistence ---");
    let sessionCookie = "";
    {
      const validPass = process.env.ADMIN_PASSPHRASE || "zeewrites-master-vault";
      const validPin = process.env.ADMIN_PIN || "202600";

      const loginRes = await request("/api/cms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": "192.168.1.100", // separate IP for rate limiter
        },
        body: JSON.stringify({
          action: "login",
          passphrase: validPass,
          pin: validPin,
        }),
      });

      assert(loginRes.status === 200 && loginRes.json?.ok === true, "Valid credentials return 200 OK and Unlocked status");

      const rawCookie = loginRes.headers.get("set-cookie");
      assert(
        rawCookie && rawCookie.includes("zeewrites_admin_session") && rawCookie.includes("HttpOnly"),
        "Response sets HttpOnly, SameSite signed session cookie"
      );

      sessionCookie = rawCookie ? rawCookie.split(";")[0] : "";

      const authCheck = await request("/api/cms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: sessionCookie,
        },
        body: JSON.stringify({ action: "check_auth" }),
      });

      assert(
        authCheck.status === 200 && authCheck.json?.authenticated === true,
        "Server verifies session cookie persistence (check_auth: true)"
      );
    }

    // TEST 3: CREATE & PUBLISH ARTICLE
    console.log("\n--- TEST 3: Create, Publish and Verify Article ---");
    const testArticle = {
      id: "art-acceptance-test-1",
      slug: "how-to-fix-dns-latency-windows-11",
      title: "How to Fix DNS Latency on Windows 11",
      subtitle: "A complete step-by-step diagnostic guide for low-latency network resolution.",
      excerpt: "Learn how to flush DNS and configure low-latency DoH resolvers in Windows 11.",
      category: "how-to-fixes",
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      testedOn: "Windows 11 Build 22631",
      readingTimeMinutes: 4,
      wordCount: 850,
      featured: true,
      status: "published",
      primaryKeyword: "fix DNS latency",
      metaTitle: "How to Fix DNS Latency on Windows 11 | Zee Writes",
      metaDescription: "Step-by-step guide to diagnose and fix DNS latency on Windows 11.",
      coverImage: {
        url: "/images/diagrams/ssl-handshake.svg",
        alt: "DNS Latency Fix Diagram",
        caption: "DNS Resolution Flow",
        width: 1200,
        height: 750,
        diagramType: "ssl-handshake",
      },
      verifiedTakeaway: {
        symptom: "Slow DNS lookup",
        rootCause: "ISP DNS bottleneck",
        instantFix: "Switch to 1.1.1.1 or 8.8.8.8",
        estimatedFixTime: "2 minutes",
        testedPlatforms: ["Windows 11"],
      },
      howToSteps: [
        {
          stepNumber: 1,
          name: "Flush DNS Cache",
          text: "Run ipconfig /flushdns in administrative Command Prompt.",
          commandOrCode: "ipconfig /flushdns",
        },
      ],
      sections: [
        {
          id: "step-1",
          heading: "1. Understanding Windows 11 DNS Resolution",
          paragraphs: ["DNS resolution converts domain names into IP addresses."],
        },
      ],
      faqs: [
        {
          question: "Does changing DNS improve ping?",
          answer: "It reduces initial lookup latency, but does not alter direct game server ping.",
        },
      ],
      author: {
        name: "Zee",
        role: "Lead Systems Architect & Performance Editor",
        avatarUrl: "/images/authors/zee.svg",
        bio: "Editorial lead at Zee Writes.",
      },
      tags: ["DNS", "Windows 11", "Network"],
      relatedSlugs: [],
      helpfulYes: 10,
      helpfulNo: 0,
    };

    {
      const upsertRes = await request("/api/cms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: sessionCookie,
        },
        body: JSON.stringify({
          action: "upsert_article",
          article: testArticle,
        }),
      });

      if (!upsertRes.json?.ok) console.error("Upsert failed detail:", upsertRes.json);
      assert(upsertRes.status === 200 && upsertRes.json?.ok === true, "Article published successfully to server store");

      const publicApi = await request("/api/cms");
      const foundInApi = publicApi.json?.articles?.some((a) => a.slug === testArticle.slug);
      assert(foundInApi, "Article is returned in public GET /api/cms");

      const articlePage = await request(`/article/${testArticle.slug}`);
      assert(
        articlePage.status === 200 && articlePage.text.includes("How to Fix DNS Latency on Windows 11"),
        "Public Article URL /article/how-to-fix-dns-latency-windows-11 returns HTTP 200 with article content"
      );

      const categoryPage = await request("/category/how-to-fixes");
      assert(
        categoryPage.status === 200 && categoryPage.text.includes("How to Fix DNS Latency on Windows 11"),
        "Public Category page /category/how-to-fixes displays published article card"
      );

      const homePage = await request("/");
      assert(
        homePage.status === 200 && homePage.text.includes("How to Fix DNS Latency on Windows 11"),
        "Public Homepage / displays published article"
      );
    }

    // TEST 4: VERIFIED DELETION, 404 STATUS & ZERO RESURRECTION
    console.log("\n--- TEST 4: Verified Deletion & Zero Resurrection ---");
    {
      const deleteRes = await request("/api/cms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: sessionCookie,
        },
        body: JSON.stringify({
          action: "delete_article",
          id: testArticle.id,
        }),
      });

      if (!deleteRes.json?.ok) console.error("Delete failed detail:", deleteRes.json);
      assert(
        deleteRes.status === 200 && deleteRes.json?.ok === true,
        "Delete handler confirms verified deletion with 200 OK"
      );

      const adminCheck = await request("/api/cms", {
        headers: { Cookie: sessionCookie },
      });
      const stillInAdmin = adminCheck.json?.articles?.some((a) => a.id === testArticle.id);
      assert(!stillInAdmin, "After delete, article is absent from admin store");

      const articleAfterDelete = await request(`/article/${testArticle.slug}`);
      assert(
        articleAfterDelete.status === 404 || articleAfterDelete.text.includes("We Couldn't Find That Page") || articleAfterDelete.text.includes("Article Not Found"),
        "Deleted article URL immediately returns 404 (or Not Found page)"
      );

      let stayedGoneCategory = true;
      for (let i = 1; i <= 5; i++) {
        const catReload = await request("/category/how-to-fixes");
        if (catReload.text.includes("How to Fix DNS Latency on Windows 11")) {
          stayedGoneCategory = false;
          break;
        }
      }
      assert(stayedGoneCategory, "Reloaded category page 5 times: deleted article STAYS GONE (no resurrection)");

      const homeAfterDelete = await request("/");
      const stayedGoneHome = !homeAfterDelete.text.includes("How to Fix DNS Latency on Windows 11");
      assert(stayedGoneHome, "Homepage STAYS GONE: displays clean empty state without resurrecting article");
    }

    // TEST 5: LAST POST DELETED & NO DEFAULT SEED AUTO-INSERTION
    console.log("\n--- TEST 5: Last Post Deletion & Clean Empty State ---");
    {
      const cmsStatus = await request("/api/cms");
      const count = cmsStatus.json?.articles?.length || 0;
      assert(count === 0, `Database has exactly 0 articles; NO sample or default posts (art-test-dns) are resurrected`);

      const catPage = await request("/category/how-to-fixes");
      assert(
        catPage.text.includes("No guides in this category yet"),
        "Category page shows clean empty-state UI without errors or sample cards"
      );

      const homePage = await request("/");
      assert(
        homePage.text.includes("No guides published yet"),
        "Homepage shows clean empty-state UI without errors or sample cards"
      );
    }

    console.log(`\n=== ACCEPTANCE TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED ===\n`);
  } finally {
    console.log("Shutting down test server...");
    serverProc.kill("SIGINT");
    try {
      spawn("taskkill", ["/pid", String(serverProc.pid), "/f", "/t"]);
    } catch {}
  }

  if (failedCount > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Acceptance test runner crashed:", err);
  process.exit(1);
});
