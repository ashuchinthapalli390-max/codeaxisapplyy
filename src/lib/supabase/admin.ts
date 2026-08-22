import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let clientInstance: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (clientInstance) {
    return clientInstance;
  }

  const url = process.env.SUPABASE_URL?.trim();
  const secret = process.env.SUPABASE_SECRET_KEY?.trim();

  // Validate that it's a real Supabase URL and not the placeholder
  if (!url || !secret || url.includes("YOUR_CODEXA_APPLY_PROJECT") || secret.includes("REPLACE_WITH")) {
    return null;
  }

  try {
    clientInstance = createClient(url, secret, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return clientInstance;
  } catch (err) {
    console.error("[Supabase Admin] Failed to initialize client:", err);
    return null;
  }
}

export const isSupabaseConfigured = (): boolean => {
  const url = process.env.SUPABASE_URL?.trim();
  const secret = process.env.SUPABASE_SECRET_KEY?.trim();
  return Boolean(
    url &&
    secret &&
    !url.includes("YOUR_CODEXA_APPLY_PROJECT") &&
    !secret.includes("REPLACE_WITH")
  );
};
