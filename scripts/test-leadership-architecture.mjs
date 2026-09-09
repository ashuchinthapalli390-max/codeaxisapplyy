// Leadership CMS & Persistence Architecture Test Suite
import assert from "node:assert";
import {
  validateLeadershipInput,
} from "../src/lib/leadership/schema.ts";
import {
  mapDbRowToPublicDto,
  mapDbRowToAdminDto,
  mapMutationInputToDbRow,
  resolveLeadershipImageUrl,
} from "../src/lib/leadership/mapper.ts";
import {
  CANONICAL_INITIAL_PROFILES,
  getPublicLeadership,
  getAdminLeadership,
  saveLeadershipMember,
  deleteLeadershipMember,
  restoreLeadershipMember,
  reorderLeadershipMembers,
  LeadershipError,
} from "../src/lib/leadership/repository.ts";

console.log("==================================================================");
console.log("  CODEXA APPLY — LEADERSHIP SYNCHRONIZATION TEST SUITE");
console.log("==================================================================\n");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

async function run() {
  console.log("▶ [Test 1] Validating Canonical 5 Profiles Definition (including Varun)...");
  test("Exactly 5 canonical profiles are defined", () => {
    assert.strictEqual(CANONICAL_INITIAL_PROFILES.length, 5);
  });

  test("Canonical profiles include Arshad, Sanjay, Kishore, Bhanu, Varun", () => {
    const names = CANONICAL_INITIAL_PROFILES.map((p) => p.full_name);
    assert(names.includes("CH. Arshad"), "CH. Arshad exists");
    assert(names.includes("B. Sanjay"), "B. Sanjay exists");
    assert(names.includes("Kishore"), "Kishore exists");
    assert(names.includes("G. Bhanu Prasad"), "G. Bhanu Prasad exists");
    assert(names.includes("Parlapalli Varun"), "Parlapalli Varun exists");
  });

  test("Canonical profiles have deterministic sort_order 1 to 5", () => {
    assert.strictEqual(CANONICAL_INITIAL_PROFILES[0].sort_order, 1);
    assert.strictEqual(CANONICAL_INITIAL_PROFILES[1].sort_order, 2);
    assert.strictEqual(CANONICAL_INITIAL_PROFILES[2].sort_order, 3);
    assert.strictEqual(CANONICAL_INITIAL_PROFILES[3].sort_order, 4);
    assert.strictEqual(CANONICAL_INITIAL_PROFILES[4].sort_order, 5);
  });

  console.log("\n▶ [Test 2] Input Validation & Sanitization Layer...");
  test("Rejects empty full_name", () => {
    const res = validateLeadershipInput({ name: "", designation: "Lead" });
    assert.strictEqual(res.valid, false);
    assert(res.errors.name, "Flags missing name");
  });

  test("Rejects empty designation", () => {
    const res = validateLeadershipInput({ name: "Jane Doe", designation: "" });
    assert.strictEqual(res.valid, false);
    assert(res.errors.designation, "Flags missing designation");
  });

  test("Auto-generates stable URL slug from name", () => {
    const res = validateLeadershipInput({ name: "Jane Doe & Co", designation: "Lead" });
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.sanitized?.slug, "jane-doe-co");
  });

  test("Validates and constrains crop values (0-100)", () => {
    const res = validateLeadershipInput({
      name: "John",
      designation: "Dev",
      crop_x: 150, // exceeds 100
      crop_y: -20, // below 0
      crop_scale: 5, // exceeds 3
    });
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.sanitized?.crop_x, 100);
    assert.strictEqual(res.sanitized?.crop_y, 0);
    assert.strictEqual(res.sanitized?.crop_scale, 3);
  });

  test("Rejects malformed URLs", () => {
    const res = validateLeadershipInput({
      name: "John",
      designation: "Dev",
      linkedinUrl: "ftp://invalid-url.com",
    });
    assert.strictEqual(res.valid, false);
    assert(res.errors.linkedinUrl, "Flags invalid URL scheme");
  });

  console.log("\n▶ [Test 3] Typed Mapper & Public Data Protection...");
  const mockDbRow = {
    id: "team-test-01",
    slug: "ch-arshad",
    full_name: "CH. Arshad",
    display_name: "CH. Arshad",
    code_name: "SOUTH DEVELOPER",
    role_type: "Founder",
    primary_designation: "Founder & Technical Director",
    secondary_designation: "Systems Architect",
    department: "Engineering Architecture",
    tagline: "Building resilient systems.",
    short_tagline: "Building resilient systems.",
    short_bio: "Founder directing CodeXa Agency.",
    full_bio: "Comprehensive background in scalable systems.",
    quote: "Build with purpose.",
    focus_areas: ["Next.js", "AI Engineering"],
    email: "private-internal@codeaxisapply.xyz",
    whatsapp: "9999999999",
    whatsapp_url: "https://wa.me/919999999999",
    linkedin_url: "https://linkedin.com/in/arshad",
    github_url: "https://github.com/arshad",
    portfolio_url: "https://codxa-agency.online",
    external_url: "https://codxa-agency.online",
    image_bucket: "leadership",
    image_path: "profiles/arshad-v1.webp",
    image_alt: "CH. Arshad photo",
    crop_x: 50,
    crop_y: 50,
    crop_scale: 1,
    image_crop_x: 50,
    image_crop_y: 50,
    image_zoom: 1,
    status: "active",
    sort_order: 1,
    is_featured: true,
    is_active: true,
    is_archived: false,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-09T00:00:00Z",
    archived_at: null,
    archived_by: null,
  };

  test("mapDbRowToPublicDto strips internal fields and provides public DTO", () => {
    const pub = mapDbRowToPublicDto(mockDbRow);
    assert.strictEqual(pub.id, "team-test-01");
    assert.strictEqual(pub.displayName, "CH. Arshad");
    assert.strictEqual(pub.primaryDesignation, "Founder & Technical Director");
    assert.strictEqual(pub.roleType, "Founder");
    assert.strictEqual(pub.status, "active");
    assert.strictEqual(pub.sort_order, 1);
    assert.strictEqual(pub.isFeatured, true);
    assert(!("archived_by" in pub), "Internal archived_by omitted from public DTO");
  });

  test("mapDbRowToAdminDto provides full editable model", () => {
    const adm = mapDbRowToAdminDto(mockDbRow);
    assert.strictEqual(adm.id, "team-test-01");
    assert.strictEqual(adm.email, "private-internal@codeaxisapply.xyz");
    assert.strictEqual(adm.whatsapp, "9999999999");
    assert.strictEqual(adm.status, "active");
    assert.strictEqual(adm.isVisible, true);
    assert.strictEqual(adm.isArchived, false);
  });

  test("resolveLeadershipImageUrl constructs storage path", () => {
    const url = resolveLeadershipImageUrl(mockDbRow);
    assert(url.includes("profiles/arshad-v1.webp"), "Storage path correctly resolved");
  });

  console.log("\n▶ [Test 4] Query Parity & Single Source of Truth...");
  await testAsync("getPublicLeadership returns active members with 4 canonical identities", async () => {
    const publicList = await getPublicLeadership();
    assert(Array.isArray(publicList), "Returns array");
    assert(publicList.length >= 4, "Has at least 4 active members");
    const names = publicList.map((m) => m.name);
    assert(names.includes("CH. Arshad"), "Arshad in public");
    assert(names.includes("B. Sanjay"), "Sanjay in public");
    assert(names.includes("Kishore"), "Kishore in public");
    assert(names.includes("G. Bhanu Prasad"), "Bhanu in public");
    // Ensure no stale demo profiles exist in active public view
    assert(!names.includes("Deepak"), "Deepak is NOT in active public list");
    assert(!names.includes("Ashu"), "Ashu is NOT in active public list");
  });

  await testAsync("getAdminLeadership returns members with matching IDs and sort order", async () => {
    const adminList = await getAdminLeadership();
    const publicList = await getPublicLeadership();
    const activeAdmin = adminList.filter((m) => m.status === "active");
    assert.strictEqual(activeAdmin.length, publicList.length, "Active admin count equals public count");

    for (let i = 0; i < publicList.length; i++) {
      assert.strictEqual(publicList[i].id, activeAdmin[i].id, `ID matches at index ${i}`);
      assert.strictEqual(publicList[i].displayName, activeAdmin[i].displayName, `Name matches at index ${i}`);
      assert.strictEqual(publicList[i].sort_order, activeAdmin[i].sort_order, `Sort order matches at index ${i}`);
    }
  });

  console.log("\n▶ [Test 5] Mutation Mapping & Status Transformation...");
  test("mapMutationInputToDbRow preserves status and canonical fields", () => {
    const input = {
      name: "B. Sanjay",
      designation: "Co-Founder & Platform Lead",
      status: "hidden",
      sort_order: 2,
    };
    const row = mapMutationInputToDbRow(input, "team-02");
    assert.strictEqual(row.status, "hidden");
    assert.strictEqual(row.is_active, false);
    assert.strictEqual(row.is_archived, false);
    assert.strictEqual(row.sort_order, 2);
    assert.strictEqual(row.primary_designation, "Co-Founder & Platform Lead");
  });

  test("mapMutationInputToDbRow correctly maps archived status", () => {
    const input = {
      name: "Old Member",
      designation: "Advisor",
      status: "archived",
      isArchived: true,
    };
    const row = mapMutationInputToDbRow(input, "team-archived-99");
    assert.strictEqual(row.status, "archived");
    assert.strictEqual(row.is_active, false);
    assert.strictEqual(row.is_archived, true);
  });

  console.log("\n==================================================================");
  console.log(`  LEADERSHIP TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
