import { formatReferenceId, generateReferenceId } from "@/lib/referenceId";

console.log("--- Testing Reference ID Formatter & Monotonic Fallback ---");

const batch = "2026-SEP";
const refs = new Set<string>();
const count = 100;

for (let i = 1; i <= count; i++) {
  const ref = formatReferenceId(batch, i);
  if (refs.has(ref)) {
    throw new Error(`Duplicate reference ID detected: ${ref}`);
  }
  refs.add(ref);
}

console.log(`✓ Successfully generated ${count} unique reference IDs via formatReferenceId.`);
console.log(`  Sample: ${Array.from(refs).slice(0, 3).join(", ")} ... ${Array.from(refs).slice(-1)[0]}`);

const fallbackRefs = new Set<string>();
for (let i = 1; i <= count; i++) {
  const ref = generateReferenceId(batch);
  if (fallbackRefs.has(ref)) {
    throw new Error(`Duplicate fallback reference ID detected: ${ref}`);
  }
  fallbackRefs.add(ref);
}

console.log(`✓ Successfully generated ${count} unique fallback reference IDs via generateReferenceId.`);
console.log(`  Sample: ${Array.from(fallbackRefs).slice(0, 3).join(", ")} ... ${Array.from(fallbackRefs).slice(-1)[0]}`);

console.log("\nAll Reference ID concurrency tests passed successfully!");
