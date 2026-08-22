import { randomBytes, scryptSync } from "node:crypto";

const key = "CAX-" + randomBytes(24).toString("base64url");
const salt = randomBytes(16).toString("hex");
const hash = scryptSync(key, salt, 64).toString("hex");
const sessionSecret = randomBytes(48).toString("base64url");

console.log("");
console.log("============================================================");
console.log("🔑 CODEXA ADMIN MASTER KEY (SAVE THIS KEY SOMEWHERE SAFE!)");
console.log("============================================================");
console.log(key);
console.log("");
console.log("IT WILL NEVER BE STORED IN THE APP OR GITHUB.");
console.log("ONLY THE SCRYPT HASH BELOW GOES INTO .env.local");
console.log("============================================================");
console.log("");
console.log("ADMIN_KEY_HASH=");
console.log(`scrypt$${salt}$${hash}`);
console.log("");
console.log("ADMIN_SESSION_SECRET=");
console.log(sessionSecret);
console.log("");
