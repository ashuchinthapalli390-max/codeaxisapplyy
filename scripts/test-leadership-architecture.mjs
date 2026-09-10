// Leadership CMS & Persistence Architecture Test Suite
import assert from "node:assert";
import {
  validateLeadershipInput,
  isDeleteProtected,
  normalizeRole,
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

  console.log("\n▶ [Test 6] Adaptive Missing Column Extraction...");
  test("extractMissingColumn parses PostgREST schema cache error", async () => {
    const { extractMissingColumn } = await import("../src/lib/leadership/repository.ts");
    const err = { message: "Could not find the 'responsibilities' column of 'team_members' in the schema cache" };
    assert.strictEqual(extractMissingColumn(err), "responsibilities");
  });

  test("extractMissingColumn parses Postgres relation column error", async () => {
    const { extractMissingColumn } = await import("../src/lib/leadership/repository.ts");
    const err = { message: 'column "education_summary" of relation "team_members" does not exist' };
    assert.strictEqual(extractMissingColumn(err), "education_summary");
  });

  console.log("\n▶ [Test 7] Canonical Overlay on Incomplete Database Rows...");
  test("mapDbRowToPublicDto overlays verified content when DB row has placeholders", () => {
    // Simulated DB row with old placeholder values
    const incompleteDbRow = {
      id: "d63a0516-ab2f-4474-a3ca-8d549db5fbc2",
      full_name: "CH. Arshad",
      display_name: "CH. Arshad",
      role_type: "Founder",
      designation: "Core Team",
      primary_designation: "Core Team",
      photo_url: "/logo.jpeg",
      responsibilities: [],
      quote: "",
    };

    const dto = mapDbRowToPublicDto(incompleteDbRow);
    assert.strictEqual(dto.primaryDesignation, "Founder & Technical Director", "Overlays real designation");
    assert.notStrictEqual(dto.photoUrl, "/logo.jpeg", "Replaces repeating logo.jpeg with verified photo");
    assert(dto.responsibilities.length >= 3, "Overlays verified responsibilities");
    assert.strictEqual(dto.quote, "Build with purpose, architect for resilience, and always ship production-grade code.", "Overlays quote");
    assert.strictEqual(dto.codename, "SOUTH DEVELOPER", "Overlays codename");
  });

  console.log("\n▶ [Test 8] Parlapalli Varun Profile & Privacy Protection...");
  test("Varun profile matches verified resume and strictly excludes private data", () => {
    const varun = CANONICAL_INITIAL_PROFILES.find((p) => p.slug === "p-varun");
    assert(varun, "Varun profile exists in canonical definitions");
    assert.strictEqual(varun.full_name, "Parlapalli Varun");
    assert.strictEqual(varun.display_name, "P. Varun");
    assert.strictEqual(varun.role_type, "COO");
    assert.strictEqual(varun.primary_designation, "Chief Operating Officer");
    assert.strictEqual(varun.secondary_designation, "Core Frontend & UI/UX Designer");
    assert(varun.education_summary?.includes("Cybersecurity"), "Education summary includes Cybersecurity");
    assert(varun.education_summary?.includes("Narasaraopeta Engineering College"), "Education summary includes college");
    assert.strictEqual(varun.linkedin_url, "https://linkedin.com/in/varun-parlapalli/");
    assert.strictEqual(varun.github_url, "https://github.com/varunparlapalli2008");

    // Strict privacy checks: ensure no private resume data exists
    const publicVarun = mapDbRowToPublicDto(varun);
    assert.strictEqual(publicVarun.phone, undefined, "No phone number in public DTO");
    assert.strictEqual(publicVarun.email, undefined, "No email in public DTO");
    assert.strictEqual(publicVarun.address, undefined, "No residential address in public DTO");
    assert.strictEqual(publicVarun.date_of_birth, undefined, "No DOB in public DTO");
    assert.strictEqual(publicVarun.dob, undefined, "No DOB in public DTO");
  });

  console.log("\n▶ [Test 9] G. Bhanu Prasad Full Name & Designation Wrapping...");
  test("G. Bhanu Prasad full name and designations are complete and untruncated", () => {
    const bhanu = CANONICAL_INITIAL_PROFILES.find((p) => p.slug === "g-bhanu-prasad");
    assert(bhanu, "Bhanu profile exists");
    assert.strictEqual(bhanu.display_name, "G. Bhanu Prasad");
    assert.strictEqual(bhanu.code_name, "HAKAI");
    assert.strictEqual(bhanu.primary_designation, "Chief Executive Officer");
    assert.strictEqual(bhanu.secondary_designation, "Technology Strategy & Talent Leadership");
    assert(!bhanu.display_name?.includes("..."), "Name is never truncated with ellipsis in data");
  });

  console.log("\n▶ [Test 10] All 5 Leadership Profiles Public Delivery...");
  await testAsync("getPublicLeadership guarantees all 5 verified profiles", async () => {
    const list = await getPublicLeadership();
    assert.strictEqual(list.length, 5, "Exactly 5 profiles returned in public leadership");
    const names = list.map((m) => m.displayName);
    assert(names.includes("CH. Arshad"), "Arshad present");
    assert(names.includes("B. Sanjay"), "Sanjay present");
    assert(names.includes("Kishore"), "Kishore present");
    assert(names.includes("G. Bhanu Prasad"), "Bhanu present");
    assert(names.includes("P. Varun"), "Varun present");

    for (const member of list) {
      assert(member.primaryDesignation, `Designation present for ${member.displayName}`);
      assert.notStrictEqual(member.primaryDesignation, "Core Team", `Designation not placeholder for ${member.displayName}`);
      assert(member.responsibilities.length >= 1, `Responsibilities present for ${member.displayName}`);
      assert(member.focus_areas.length >= 3, `At least 3 focus areas for ${member.displayName}`);
      assert.notStrictEqual(member.photoUrl, "/logo.jpeg", `Logo not used as portrait for ${member.displayName}`);
    }
  });

  console.log("\n▶ [Test 11] Protected Leadership Roles vs Deletable Roles...");
  test("isDeleteProtected accurately protects Founder, Co-Founder, and CEO", () => {
    assert.strictEqual(isDeleteProtected("Founder", "Founder & Technical Director"), true, "Founder is protected");
    assert.strictEqual(isDeleteProtected("Co-Founder", "Co-Founder & Platform Lead"), true, "Co-Founder is protected");
    assert.strictEqual(isDeleteProtected("CEO", "Chief Executive Officer"), true, "CEO is protected");
    assert.strictEqual(isDeleteProtected(null, "Chief Executive Officer (CEO)"), true, "CEO alias is protected");
  });

  test("isDeleteProtected permits deletion for CTO, HR, COO, and normal roles", () => {
    assert.strictEqual(isDeleteProtected("CTO", "Chief Technology Officer"), false, "CTO is deletable");
    assert.strictEqual(isDeleteProtected("HR", "Head of Human Resources"), false, "HR is deletable");
    assert.strictEqual(isDeleteProtected("COO", "Chief Operating Officer"), false, "COO is deletable");
    assert.strictEqual(isDeleteProtected("Developer", "Lead Developer"), false, "Developer is deletable");
    assert.strictEqual(isDeleteProtected("Core Team", "Operations Lead"), false, "Operations is deletable");
  });

  test("mapDbRowToAdminDto sets canDelete false for protected roles and true for normal roles", () => {
    const founderDto = mapDbRowToAdminDto({
      id: "test-f1",
      role_type: "Founder",
      primary_designation: "Founder",
    });
    assert.strictEqual(founderDto.canDelete, false, "Founder canDelete is false");
    assert.strictEqual(founderDto.is_delete_protected, true, "Founder is_delete_protected is true");

    const ctoDto = mapDbRowToAdminDto({
      id: "test-cto1",
      role_type: "CTO",
      primary_designation: "Chief Technology Officer",
    });
    assert.strictEqual(ctoDto.canDelete, true, "CTO canDelete is true");
    assert.strictEqual(ctoDto.is_delete_protected, false, "CTO is_delete_protected is false");
  });

  console.log("\n▶ [Test 12] Protected Role Deletion Enforcement...");
  await testAsync("deleteLeadershipMember rejects Founder, Co-Founder, and CEO with HTTP 403", async () => {
    // Attempt deleting canonical Founder (CH. Arshad)
    try {
      await deleteLeadershipMember("d63a0516-ab2f-4474-a3ca-8d549db5fbc2", true);
      assert.fail("Should have thrown error for Founder deletion");
    } catch (err) {
      assert(err instanceof LeadershipError, "Throws LeadershipError");
      assert.strictEqual(err.statusCode, 403, "HTTP 403 status code");
      assert(err.message.includes("cannot be deleted"), "Message indicates protected profile");
    }

    // Attempt deleting canonical Co-Founder (B. Sanjay)
    try {
      await deleteLeadershipMember("a5e3eb9c-e7ed-4bd7-8e4a-e073c502b359", true);
      assert.fail("Should have thrown error for Co-Founder deletion");
    } catch (err) {
      assert.strictEqual(err.statusCode, 403, "HTTP 403 status code for Co-Founder");
    }

    // Attempt deleting canonical CEO (Kishore)
    try {
      await deleteLeadershipMember("148ed82c-a0a1-40b1-b91f-9447726a0f9b", true);
      assert.fail("Should have thrown error for CEO deletion");
    } catch (err) {
      assert.strictEqual(err.statusCode, 403, "HTTP 403 status code for CEO");
    }
  });

  console.log("\n▶ [Test 13] Varun COO Role Protection & Deletability...");
  test("Varun canonical role is COO and is NOT delete protected", () => {
    const varunProfile = CANONICAL_INITIAL_PROFILES.find((p) => p.id === "e7b92f15-8c34-4b52-9c1a-6d8e2f3a4b5c");
    assert(varunProfile, "Varun profile exists in canonical definitions");
    assert.strictEqual(varunProfile.role_type, "COO", "Varun role is COO");
    assert.strictEqual(
      isDeleteProtected(varunProfile.role_type, varunProfile.primary_designation, varunProfile.secondary_designation),
      false,
      "Varun COO is not delete protected"
    );

    const adminDto = mapDbRowToAdminDto(varunProfile);
    assert.strictEqual(adminDto.canDelete, true, "Varun admin DTO has canDelete: true");
    assert.strictEqual(adminDto.is_delete_protected, false, "Varun admin DTO has is_delete_protected: false");
  });

  console.log("\n▶ [Test 14] Canonical Role Resolution (Founder, Co-Founder, CEO vs COO, CTO)...");
  test("Strict canonical role discrimination", () => {
    assert.strictEqual(isDeleteProtected("Founder", "Chief Executive Officer"), true);
    assert.strictEqual(isDeleteProtected("Co-Founder", "Chief Technology Officer"), true);
    assert.strictEqual(isDeleteProtected("CEO", "Director"), true);
    assert.strictEqual(isDeleteProtected("COO", "Chief Operating Officer"), false);
    assert.strictEqual(isDeleteProtected("CTO", "Chief Technology Officer"), false);
    assert.strictEqual(isDeleteProtected("HR", "Head of HR"), false);
    assert.strictEqual(isDeleteProtected("CFO", "Chief Financial Officer"), false);
    assert.strictEqual(isDeleteProtected("CMO", "Chief Marketing Officer"), false);
    assert.strictEqual(isDeleteProtected("Developer", "Senior Full-Stack Developer"), false);
    assert.strictEqual(isDeleteProtected("Designer", "UI/UX Designer"), false);
    assert.strictEqual(isDeleteProtected("Operations", "Operations Manager"), false);
    assert.strictEqual(isDeleteProtected("Advisor", "Technical Advisor"), false);
    assert.strictEqual(isDeleteProtected("Recruiter", "Lead Recruiter"), false);
  });

  console.log("\n▶ [Test 15] Leadership Summary Graceful Mapping & Coalescing...");
  test("leadership_summary falls back across full_bio, short_bio, bio, canonical", () => {
    const dtoWithSummary = mapDbRowToPublicDto({
      id: "test-1",
      full_name: "Test Leader",
      primary_designation: "Lead",
      leadership_summary: "Explicit leadership summary text",
    });
    assert.strictEqual(dtoWithSummary.leadershipSummary, "Explicit leadership summary text");

    const dtoFallbackBio = mapDbRowToPublicDto({
      id: "test-2",
      full_name: "Test Leader",
      primary_designation: "Lead",
      full_bio: "Full bio text used as summary fallback",
    });
    assert.strictEqual(dtoFallbackBio.leadershipSummary, "Full bio text used as summary fallback");
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
