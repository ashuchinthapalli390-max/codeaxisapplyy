export function generateReferenceId(): string {
  // Generates CAX-2026-XXXXXX where XXXXXX is a random 6-digit number
  const min = 100000;
  const max = 999999;
  const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
  return `CAX-2026-${randomNum}`;
}
