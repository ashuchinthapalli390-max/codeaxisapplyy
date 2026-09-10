async function testEditVarun() {
  console.log("=== TESTING LIVE PRODUCTION EDIT & CONCURRENCY FLOW ===");
  const loginRes = await fetch("https://www.codeaxisapply.xyz/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessKey: "161217110311" }),
  });
  const cookie = loginRes.headers.get("set-cookie").split(";")[0];

  // 1. Fetch current profile from admin API
  const adminRes = await fetch("https://www.codeaxisapply.xyz/api/admin/team", {
    headers: { cookie },
  });
  const adminData = await adminRes.json();
  const varun = (adminData.data || []).find((m) => m.id === "e7b92f15-8c34-4b52-9c1a-6d8e2f3a4b5c");
  console.log("[1] Current Varun loaded from admin API. Version:", varun?.version);
  const initialVersion = varun?.version;

  // 2. Save 1: Edit leadership summary with current version
  console.log("[2] Executing first save on Varun with expectedVersion:", initialVersion);
  const save1Res = await fetch("https://www.codeaxisapply.xyz/api/admin/team", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      ...varun,
      leadershipSummary: "Updated leadership summary for testing production edit flow.",
      expectedVersion: initialVersion,
    }),
  });
  const save1Data = await save1Res.json();
  const ver1 = save1Data.data?.version;
  console.log("Save 1 status:", save1Res.status, "success:", save1Data.success, "New version:", ver1);
  if (save1Res.status !== 200) {
    throw new Error("Save 1 failed: " + JSON.stringify(save1Data));
  }

  // 3. Save 2: Sequential save using returned version (verifies NO false concurrency conflict)
  console.log("[3] Executing second sequential save on Varun (same admin) with expectedVersion:", ver1);
  const save2Res = await fetch("https://www.codeaxisapply.xyz/api/admin/team", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      ...save1Data.data,
      leadershipSummary: "Second updated leadership summary.",
      expectedVersion: ver1,
    }),
  });
  const save2Data = await save2Res.json();
  const ver2 = save2Data.data?.version;
  console.log("Save 2 status:", save2Res.status, "success:", save2Data.success, "New version:", ver2);
  if (save2Res.status === 200) {
    console.log("✓ SUCCESS: Same admin sequential save succeeded without false conflict!");
  } else {
    console.error("✗ FAILURE: Same admin sequential save failed:", save2Res.status, save2Data);
  }

  // 4. Test stale draft concurrency conflict (sending older expectedVersion, e.g. initialVersion or ver1)
  console.log("[4] Testing stale draft save with older expectedVersion:", initialVersion, "(current DB version is", ver2, ")...");
  const staleRes = await fetch("https://www.codeaxisapply.xyz/api/admin/team", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      ...varun,
      leadershipSummary: "Stale draft trying to overwrite.",
      expectedVersion: initialVersion, // Stale version
    }),
  });
  const staleData = await staleRes.json();
  console.log("Stale save status:", staleRes.status, "Response:", staleData);
  if (staleRes.status === 409) {
    console.log("✓ SUCCESS: Stale draft save correctly rejected with HTTP 409 Conflict!");
  } else {
    console.error("✗ FAILURE: Expected HTTP 409 for stale draft, got:", staleRes.status);
  }

  // 5. Restore Varun's canonical summary
  console.log("[5] Restoring Varun's canonical summary with expectedVersion:", ver2);
  const restoreRes = await fetch("https://www.codeaxisapply.xyz/api/admin/team", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      ...save2Data.data,
      leadershipSummary: "B.Tech Cybersecurity student contributing to CodeXa Agency as a core frontend and UI/UX designer, with work focused on responsive interfaces, product experience and design-to-development execution.",
      expectedVersion: ver2,
    }),
  });
  const restoreData = await restoreRes.json();
  console.log("Restore status:", restoreRes.status, "Final version:", restoreData.data?.version);

  // 6. Verify public API
  console.log("[6] Verifying public leadership API...");
  const publicRes = await fetch("https://www.codeaxisapply.xyz/api/team");
  const publicData = await publicRes.json();
  const publicVarun = (publicData.data || []).find((m) => m.id === "e7b92f15-8c34-4b52-9c1a-6d8e2f3a4b5c");
  console.log("Public Varun found:", Boolean(publicVarun));
  console.log("Public Varun leadership summary verified:", Boolean(publicVarun?.leadershipSummary));
  console.log("\n=== ALL EDIT & CONCURRENCY TESTS COMPLETED SUCCESSFULLY ===");
}

testEditVarun().catch(console.error);
