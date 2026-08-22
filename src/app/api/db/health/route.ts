import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const supabaseOk = isSupabaseConfigured();

  if (supabaseOk && supabase) {
    try {
      const { data, error } = await supabase.from("applications").select("id").limit(1);
      if (error && error.code !== "PGRST116" && !error.message.includes("does not exist")) {
        return NextResponse.json({
          success: false,
          provider: "supabase",
          configured: true,
          error: error.message,
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        provider: "supabase",
        configured: true,
        message: "Supabase PostgreSQL connected successfully.",
      });
    } catch (err: any) {
      return NextResponse.json({
        success: false,
        provider: "supabase",
        configured: true,
        error: err?.message || "Supabase connection check failed",
      }, { status: 500 });
    }
  }

  return NextResponse.json({
    success: true,
    provider: "local_cache",
    configured: true,
    message: "Local persistent fallback store active.",
  });
}
