import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let clientInstance: SupabaseClient | null = null;

export function getSupabaseUrl(): string | undefined {
  return (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)?.trim();
}

export function getSupabaseSecretKey(): string | undefined {
  return (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
}

export function getSupabaseProjectRef(): string | null {
  const url = getSupabaseUrl();
  if (!url) return null;
  try {
    const host = new URL(url).hostname;
    return host.split(".")[0] || null;
  } catch {
    const match = url.match(/https?:\/\/([^.]+)\.supabase\.co/);
    return match ? match[1] : null;
  }
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (clientInstance) {
    return clientInstance;
  }

  const url = getSupabaseUrl();
  const secret = getSupabaseSecretKey();

  // Validate that it's a real Supabase URL and not a placeholder
  if (
    !url ||
    !secret ||
    url.includes("YOUR_CODEXA_APPLY_PROJECT") ||
    url.includes("your-project.supabase.co") ||
    secret.includes("REPLACE_WITH") ||
    secret.includes("your-supabase-service-role")
  ) {
    return null;
  }

  try {
    clientInstance = createClient(url, secret, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: "public",
      },
    });
    return clientInstance;
  } catch (err) {
    console.error("[Supabase Admin] Failed to initialize client:", err);
    return null;
  }
}

export const isSupabaseConfigured = (): boolean => {
  const url = getSupabaseUrl();
  const secret = getSupabaseSecretKey();
  return Boolean(
    url &&
    secret &&
    !url.includes("YOUR_CODEXA_APPLY_PROJECT") &&
    !url.includes("your-project.supabase.co") &&
    !secret.includes("REPLACE_WITH") &&
    !secret.includes("your-supabase-service-role")
  );
};
