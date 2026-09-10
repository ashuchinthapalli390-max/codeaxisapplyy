// Live Production Verification Script for https://www.codeaxisapply.xyz/
import assert from "node:assert";

const PROD_URL = "https://www.codeaxisapply.xyz";
const PASSKEY = "161217110311";

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function verifyProduction() {
  console.log("==================================================================");
  console.log(`  VERIFYING LIVE PRODUCTION: ${PROD_URL}`);
  console.log("==================================================================\n");

  let passed = 0;
  let failed = 0;

  function test(name, ok, details = "") {
    if (ok) {
      console.log(`  ✓ PASS: ${name} ${details}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${name} ${details}`);
      failed++;
    }
  }

  // Wait 15s to allow Vercel build deployment
  console.log("Waiting 20 seconds for Vercel deployment pipeline...");
  await wait(20000);

  // 1. Check Public Team API
  console.log("\n▶ [1] Testing Public Leadership API (/api/team)...");
  try {
    const res = await fetch(`${PROD_URL}/api/team`, { cache: "no-store" });
    test("HTTP status is 200", res.status === 200, `(${res.status})`);
    const json = await res.json();
    test("Response has success: true", json.success === true);
    test("Returns data array with members", Array.isArray(json.data) && json.data.length >= 4, `(count: ${json.data?.length})`);
    const names = json.data?.map((m) => m.name || m.displayName) || [];
    test("Includes Arshad", names.includes("CH. Arshad"));
    test("Includes Sanjay", names.includes("B. Sanjay"));
    test("Includes Kishore", names.includes("Kishore"));
    test("Includes Bhanu Prasad", names.includes("G. Bhanu Prasad"));
  } catch (err) {
    test("Public Team API exception", false, err.message);
  }

  // 2. Check Track Application API headers & paste protection
  console.log("\n▶ [2] Testing Track Application API (/api/applications/track)...");
  try {
    const res = await fetch(`${PROD_URL}/api/applications/track?ref=NONEXISTENT&email=nobody@example.com`, {
      cache: "no-store",
    });
    test("Returns 404 for invalid credentials", res.status === 404, `(${res.status})`);
    const cacheControl = res.headers.get("cache-control") || "";
    test("Cache-Control includes private and no-store", cacheControl.includes("private") && cacheControl.includes("no-store"), `(${cacheControl})`);
    const json = await res.json();
    test("Response contains safe error without PII leakage", json.success === false && Boolean(json.error));
  } catch (err) {
    test("Track API exception", false, err.message);
  }

  // 3. Check Track Application HTML for data-allow-paste
  console.log("\n▶ [3] Testing Status Tracking Page HTML (/status)...");
  try {
    const res = await fetch(`${PROD_URL}/status`, { cache: "no-store" });
    test("Status page loads HTTP 200", res.status === 200);
    const html = await res.text();
    test("HTML contains data-allow-paste='true'", html.includes('data-allow-paste="true"'));
    test("No global paste blocking script in status page", !html.includes('addEventListener("paste", function(e){e.preventDefault()'));
  } catch (err) {
    test("Status page HTML exception", false, err.message);
  }

  // 4. Authenticate Admin and test Admin APIs
  console.log("\n▶ [4] Testing Admin Authentication (/api/admin/login)...");
  let cookie = "";
  try {
    const loginRes = await fetch(`${PROD_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessKey: PASSKEY, rememberMe: true }),
    });
    test("Admin login succeeds (200)", loginRes.status === 200, `(${loginRes.status})`);
    const loginJson = await loginRes.json();
    test("Login payload has success: true", loginJson.success === true);
    const setCookie = loginRes.headers.get("set-cookie");
    if (setCookie) {
      cookie = setCookie.split(";")[0];
      test("Session cookie received", true);
    }
  } catch (err) {
    test("Admin login exception", false, err.message);
  }

  if (cookie) {
    // 5. Test Admin Team API and Protected Deletion Rule
    console.log("\n▶ [5] Testing Admin Team & Role Protection Policy (/api/admin/team)...");
    try {
      const teamRes = await fetch(`${PROD_URL}/api/admin/team`, {
        headers: { Cookie: cookie },
      });
      test("Admin team returns 200", teamRes.status === 200);
      const teamJson = await teamRes.json();
      if (teamJson.data && Array.isArray(teamJson.data)) {
        const arshad = teamJson.data.find((m) => m.name === "CH. Arshad" || m.displayName === "CH. Arshad");
        if (arshad) {
          test("Founder (Arshad) has canDelete: false", arshad.canDelete === false, `(canDelete: ${arshad.canDelete})`);
        }

        // Test calling delete on Founder
        if (arshad) {
          const delRes = await fetch(`${PROD_URL}/api/admin/team`, {
            method: "POST",
            headers: { Cookie: cookie, "Content-Type": "application/json" },
            body: JSON.stringify({ action: "delete", id: arshad.id }),
          });
          test("Deleting Founder is rejected with HTTP 403", delRes.status === 403, `(status: ${delRes.status})`);
          const delJson = await delRes.json();
          test("Rejection message clarifies protected profile", delJson.error?.includes("cannot be deleted") === true);
        }
      }
    } catch (err) {
      test("Admin team check exception", false, err.message);
    }

    // 6. Test Delete Route with invalid ID & zero-row rejection
    console.log("\n▶ [6] Testing Protected Delete Route Validation (/api/admin/delete)...");
    try {
      const delRes = await fetch(`${PROD_URL}/api/admin/delete`, {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify({ id: "00000000-0000-0000-0000-000000000000", reason: "Test validation" }),
      });
      test("Deleting non-existent application returns 404 (No fake success)", delRes.status === 404, `(status: ${delRes.status})`);
      const delJson = await delRes.json();
      test("Response indicates failure correctly", delJson.success === false);
    } catch (err) {
      test("Delete validation exception", false, err.message);
    }

    // 7. Test Restore Route with invalid ID
    console.log("\n▶ [7] Testing Restore Route Validation (/api/admin/restore)...");
    try {
      const restRes = await fetch(`${PROD_URL}/api/admin/restore`, {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify({ id: "00000000-0000-0000-0000-000000000000" }),
      });
      test("Restoring non-existent application returns 404 (No fake success)", restRes.status === 404, `(status: ${restRes.status})`);
      const restJson = await restRes.json();
      test("Response indicates failure correctly", restJson.success === false);
    } catch (err) {
      test("Restore validation exception", false, err.message);
    }
  }

  console.log("\n==================================================================");
  console.log(`  LIVE PRODUCTION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

verifyProduction().catch((e) => {
  console.error("Live verification crashed:", e);
  process.exit(1);
});
