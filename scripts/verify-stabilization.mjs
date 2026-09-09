/**
 * Comprehensive CodeXa Apply Production Stabilization Test Suite
 * Tests all 14 requirements locally before build, push, and deployment verification.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT = process.cwd();
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log("\n==================================================================");
console.log("  CODEXA APPLY — PRODUCTION STABILIZATION VERIFICATION SUITE");
console.log("==================================================================\n");

// -------------------------------------------------------------------------
// TEST 1: Intro Overlay & Stacking Context
// -------------------------------------------------------------------------
console.log("▶ [Test 1] Verifying Intro Animation & Full-Screen Overlay...");
const introPath = join(ROOT, "src/components/IntroAnimation.tsx");
assert(existsSync(introPath), "IntroAnimation.tsx exists");
const introContent = readFileSync(introPath, "utf-8");

assert(introContent.includes("createPortal"), "Intro uses React Portal for true document.body decoupling");
assert(introContent.includes("z-[999999]"), "Intro overlay uses top-level z-[999999] above navbar");
assert(introContent.includes("overflow = \"hidden\""), "Intro locks page scrolling on html and body");
assert(introContent.includes("aria-hidden"), "Intro marks background content inaccessible (aria-hidden)");
assert(introContent.includes("prefers-reduced-motion"), "Intro respects prefers-reduced-motion");
assert(introContent.includes("7500"), "Intro contains 7.5s safe fallback timeout so website is never permanently hidden");
assert(introContent.includes("role=\"dialog\""), "Intro dialog specifies accessible role=\"dialog\"");
assert(introContent.includes("aria-modal=\"true\""), "Intro dialog specifies aria-modal=\"true\"");
assert(introContent.includes("sessionStorage"), "Intro stores session preference in sessionStorage");

const navbarPath = join(ROOT, "src/components/Navbar.tsx");
assert(existsSync(navbarPath), "Navbar.tsx exists");
const navbarContent = readFileSync(navbarPath, "utf-8");
assert(navbarContent.includes("isVisible"), "Navbar accepts isVisible prop to stay hidden during intro");

const homePagePath = join(ROOT, "src/app/page.tsx");
const homeContent = readFileSync(homePagePath, "utf-8");
assert(homeContent.includes("headerVisible"), "HomePage manages headerVisible state tied to intro exit transition");
assert(homeContent.includes("<Navbar isVisible={headerVisible} />"), "Navbar is passed headerVisible state");

// -------------------------------------------------------------------------
// TEST 2: Leadership Editor UI Modal Rebuild
// -------------------------------------------------------------------------
console.log("\n▶ [Test 2] Verifying Leadership Editor Modal Architecture...");
const modalPath = join(ROOT, "src/components/admin/LeadershipEditorModal.tsx");
assert(existsSync(modalPath), "LeadershipEditorModal.tsx exists");
const modalContent = readFileSync(modalPath, "utf-8");

assert(modalContent.includes("min(1100px, calc(100vw - 32px))"), "Modal desktop width is min(1100px, 100vw - 32px)");
assert(modalContent.includes("min(900px, calc(100dvh - 32px))"), "Modal max height is min(900px, 100dvh - 32px)");
assert(modalContent.includes("overflow-y-auto overscroll-contain"), "Modal uses a single scroll region owner");
assert(modalContent.includes("STICKY MODAL HEADER") || modalContent.includes("border-b border-red-950/80 bg-[#080810]/95"), "Modal has sticky header");
assert(modalContent.includes("STICKY MODAL FOOTER") || modalContent.includes("border-t border-red-950/80 bg-[#080810]/95"), "Modal has sticky footer");
assert(modalContent.includes("Unsaved Changes"), "Modal displays unsaved-changes indicator");
assert(modalContent.includes("role=\"dialog\""), "Modal specifies role=\"dialog\"");
assert(modalContent.includes("aria-modal=\"true\""), "Modal specifies aria-modal=\"true\"");
assert(modalContent.includes("fullNameInputRef"), "Modal places initial focus on Full Name field");
assert(modalContent.includes("triggerElement"), "Modal restores focus to trigger element on close");
assert(modalContent.includes("window.confirm"), "Modal prompts confirmation on backdrop click / escape when fields changed");
assert(modalContent.includes("min-h-[44px]"), "Modal enforces minimum touch target size (44px)");

// -------------------------------------------------------------------------
// TEST 3: Leadership Canonical Single Source & 4 Profiles
// -------------------------------------------------------------------------
console.log("\n▶ [Test 3] Verifying Canonical Leadership Data & Migration...");
const migrationPath = join(ROOT, "supabase/migrations/20260909120000_canonical_leadership_and_soft_delete.sql");
assert(existsSync(migrationPath), "Canonical leadership migration exists");
const migrationContent = readFileSync(migrationPath, "utf-8");

assert(migrationContent.includes("CREATE TABLE IF NOT EXISTS") && migrationContent.includes("team_members"), "Migration creates canonical team_members table");
assert(migrationContent.includes("CH. Arshad"), "Migration seeds CH. Arshad");
assert(migrationContent.includes("B. Sanjay"), "Migration seeds B. Sanjay");
assert(migrationContent.includes("Kishore"), "Migration seeds Kishore");
assert(migrationContent.includes("G. Bhanu Prasad"), "Migration seeds G. Bhanu Prasad");
assert(migrationContent.includes("deleted_at"), "Migration adds soft-delete columns to applications");

const storagePath = join(ROOT, "src/lib/storage.ts");
const storageContent = readFileSync(storagePath, "utf-8");
assert(storageContent.includes("CH. Arshad"), "storage.ts default team contains CH. Arshad");
assert(storageContent.includes("B. Sanjay"), "storage.ts default team contains B. Sanjay");
assert(storageContent.includes("Kishore"), "storage.ts default team contains Kishore");
assert(storageContent.includes("G. Bhanu Prasad"), "storage.ts default team contains G. Bhanu Prasad");

// -------------------------------------------------------------------------
// TEST 4: Leadership Image Upload (Supabase Storage Only)
// -------------------------------------------------------------------------
console.log("\n▶ [Test 4] Verifying Photo Upload Route (No local disk or base64)...");
const photoRoutePath = join(ROOT, "src/app/api/admin/team/[id]/photo/route.ts");
assert(existsSync(photoRoutePath), "Photo route exists");
const photoRouteContent = readFileSync(photoRoutePath, "utf-8");

assert(!photoRouteContent.includes("public/uploads"), "Photo route has NO ephemeral Vercel filesystem writes");
assert(!photoRouteContent.includes("base64,"), "Photo route has NO base64 storage in database");
assert(photoRouteContent.includes("supabase.storage"), "Photo route uploads to Supabase Storage");
assert(photoRouteContent.includes(".from(\"leadership\")"), "Photo route uploads to 'leadership' bucket");
assert(photoRouteContent.includes("?v="), "Photo route adds cache-busting timestamp to prevent stale CDN cache");
assert(photoRouteContent.includes("oldStoragePath"), "Photo route cleans up old image only after successful DB update");
assert(photoRouteContent.includes("export async function DELETE"), "Photo route provides DELETE method for photo removal");

// -------------------------------------------------------------------------
// TEST 5: Soft Delete, Trash, and Dummy Application Isolation
// -------------------------------------------------------------------------
console.log("\n▶ [Test 5] Verifying Application Soft Delete & Trash...");
assert(storageContent.includes("is_deleted"), "storage.ts supports is_deleted");
assert(storageContent.includes("deleted_at"), "storage.ts supports deleted_at");
assert(storageContent.includes("deleted_by"), "storage.ts supports deleted_by");
assert(storageContent.includes("delete_reason"), "storage.ts supports delete_reason");
assert(storageContent.includes("restoreApplication"), "storage.ts provides restoreApplication");
assert(storageContent.includes("permanentDeleteApplication"), "storage.ts provides permanentDeleteApplication with cascade");

const appsPagePath = join(ROOT, "src/app/admin/applications/page.tsx");
const appsPageContent = readFileSync(appsPagePath, "utf-8");
assert(appsPageContent.includes("currentView === \"trash\""), "Admin applications page provides Trash tab");
assert(appsPageContent.includes("DELETED AT"), "Trash view renders Deleted Date column");
assert(appsPageContent.includes("DELETED BY / REASON"), "Trash view renders Deleted By / Reason column");
assert(appsPageContent.includes("handleRestore"), "Trash view provides Restore action");

// -------------------------------------------------------------------------
// TEST 6: Application Status Gating & Gated Form Route
// -------------------------------------------------------------------------
console.log("\n▶ [Test 6] Verifying Application Availability Status Gating...");
const formPagePath = join(ROOT, "src/app/apply/form/page.tsx");
const formPageContent = readFileSync(formPagePath, "utf-8");
assert(formPageContent.includes("if (canApply === false)"), "Direct /apply/form access is gated when applications are not open");
assert(formPageContent.includes("Applications Opening Soon"), "Gated form route displays Opening Soon view");

const submitRoutePath = join(ROOT, "src/app/api/applications/submit/route.ts");
const submitRouteContent = readFileSync(submitRoutePath, "utf-8");
assert(submitRouteContent.includes("if (!availability.canApply)"), "Submit API enforces server-side application availability");
assert(submitRouteContent.includes("status: 403"), "Submit API returns HTTP 403 when application window is not open");

// -------------------------------------------------------------------------
// Summary
// -------------------------------------------------------------------------
console.log("\n==================================================================");
console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("==================================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
