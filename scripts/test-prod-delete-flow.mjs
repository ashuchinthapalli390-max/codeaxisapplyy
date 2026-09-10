async function testDeleteFlow() {
  console.log("=== TESTING LIVE PRODUCTION DELETE & RESTORE FLOW ===");
  
  // 1. Log in as admin
  const loginRes = await fetch("https://www.codeaxisapply.xyz/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessKey: "161217110311" }),
  });
  const cookieHeader = loginRes.headers.get("set-cookie");
  const cookie = cookieHeader ? cookieHeader.split(";")[0] : "";
  console.log("Logged in successfully. Cookie present:", Boolean(cookie));

  // 2. Test Deleting Founder (CH. Arshad) -> MUST RETURN 403
  console.log("\n[Step 1] Testing delete on Founder (CH. Arshad)...");
  const deleteFounderRes = await fetch("https://www.codeaxisapply.xyz/api/admin/team", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      action: "delete",
      id: "d63a0516-ab2f-4474-a3ca-8d549db5fbc2",
      reason: "Testing delete protection",
    }),
  });
  const deleteFounderData = await deleteFounderRes.json();
  console.log("Delete Founder status:", deleteFounderRes.status, "Response:", deleteFounderData);
  if (deleteFounderRes.status === 403) {
    console.log("✓ SUCCESS: Founder deletion rejected with 403 Protected Role!");
  } else {
    console.error("✗ FAILURE: Expected 403 for Founder deletion, got:", deleteFounderRes.status);
  }

  // 3. Test Deleting CEO (Kishore) -> MUST RETURN 403
  console.log("\n[Step 2] Testing delete on CEO (Kishore)...");
  const deleteCeoRes = await fetch("https://www.codeaxisapply.xyz/api/admin/team", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      action: "delete",
      id: "148ed82c-a0a1-40b1-b91f-9447726a0f9b",
      reason: "Testing CEO delete protection",
    }),
  });
  const deleteCeoData = await deleteCeoRes.json();
  console.log("Delete CEO status:", deleteCeoRes.status, "Response:", deleteCeoData);
  if (deleteCeoRes.status === 403) {
    console.log("✓ SUCCESS: CEO deletion rejected with 403 Protected Role!");
  } else {
    console.error("✗ FAILURE: Expected 403 for CEO deletion, got:", deleteCeoRes.status);
  }

  // 4. Test Soft Deleting COO (Varun) -> MUST RETURN 200
  console.log("\n[Step 3] Testing soft delete on COO (Parlapalli Varun)...");
  const deleteCooRes = await fetch("https://www.codeaxisapply.xyz/api/admin/team", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      action: "delete",
      id: "e7b92f15-8c34-4b52-9c1a-6d8e2f3a4b5c",
      reason: "Moved to Trash for COO delete testing",
    }),
  });
  const deleteCooData = await deleteCooRes.json();
  console.log("Delete COO status:", deleteCooRes.status, "Response:", deleteCooData);

  // 5. Check Public API -> Varun must NOT be in public active list
  console.log("\n[Step 4] Checking public API /api/team while Varun is in Trash...");
  const publicRes = await fetch("https://www.codeaxisapply.xyz/api/team");
  const publicData = await publicRes.json();
  const publicMembers = publicData.data || publicData;
  const isVarunInPublic = publicMembers.some((m) =>
    (m.name || m.full_name || m.displayName || "").includes("Varun")
  );
  console.log("Public members count:", publicMembers.length);
  console.log("Is Varun visible in public API?", isVarunInPublic);

  // 6. Check Admin API -> Varun must show deleted_at != null
  console.log("\n[Step 5] Checking admin API /api/admin/team...");
  const adminRes = await fetch("https://www.codeaxisapply.xyz/api/admin/team", {
    headers: { cookie },
  });
  const adminData = await adminRes.json();
  const varunAdmin = (adminData.data || []).find((m) => m.id === "e7b92f15-8c34-4b52-9c1a-6d8e2f3a4b5c");
  console.log("Varun in admin data:", varunAdmin ? {
    id: varunAdmin.id,
    name: varunAdmin.name,
    roleType: varunAdmin.roleType,
    canDelete: varunAdmin.canDelete,
    deleted_at: varunAdmin.deleted_at,
    status: varunAdmin.status,
  } : "Not found in admin list");

  // 7. Test Restoring COO (Varun) -> MUST RETURN 200
  console.log("\n[Step 6] Testing restore on COO (Parlapalli Varun)...");
  const restoreCooRes = await fetch("https://www.codeaxisapply.xyz/api/admin/team", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      action: "restore",
      id: "e7b92f15-8c34-4b52-9c1a-6d8e2f3a4b5c",
    }),
  });
  const restoreCooData = await restoreCooRes.json();
  console.log("Restore COO status:", restoreCooRes.status, "Response:", restoreCooData);

  // 8. Check Public API -> Varun must be restored in public active list
  console.log("\n[Step 7] Checking public API /api/team after restore...");
  const publicResAfter = await fetch("https://www.codeaxisapply.xyz/api/team");
  const publicDataAfter = await publicResAfter.json();
  const publicMembersAfter = publicDataAfter.data || publicDataAfter;
  const isVarunInPublicAfter = publicMembersAfter.some((m) =>
    (m.name || m.full_name || m.displayName || "").includes("Varun")
  );
  console.log("Public members count after restore:", publicMembersAfter.length);
  console.log("Is Varun visible in public API after restore?", isVarunInPublicAfter);
  console.log("Names:", publicMembersAfter.map((m) => m.name || m.full_name || m.displayName));
}

testDeleteFlow().catch(console.error);
