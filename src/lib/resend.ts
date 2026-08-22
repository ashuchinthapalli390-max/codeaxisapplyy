import "server-only";
import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("[Resend Warning] RESEND_API_KEY is not defined in environment.");
}

export const resend = new Resend(
  process.env.RESEND_API_KEY || "re_dummy_fallback_key"
);
