import { NextRequest, NextResponse } from "next/server";
import { getApplications } from "@/lib/storage";
import { requireAdmin, handleAdminAuthError } from "@/lib/admin/session";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  let adminId = "unknown";

  try {
    const admin = await requireAdmin(req);
    adminId = (admin as any)?.email || admin?.id || "admin";

    const { searchParams } = new URL(req.url);

    // Optional debug inspection for production schema validation
    if (searchParams.get("debug") === "true") {
      const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
      const supabase = getSupabaseAdmin();
      if (!supabase) return NextResponse.json({ error: "No supabase configured" }, { status: 500 });
      const rawRes = await supabase.from("applications").select("*").limit(1);
      const query1 = await supabase.from("applications").select("*").is("deleted_at", null).limit(1);
      const query2 = await supabase.from("applications").select("*").or("is_test_record.is.null,is_test_record.eq.false").limit(1);
      const fullRes = await supabase.from("applications").select("*").limit(5);
      return NextResponse.json({
        rawSampleKeys: rawRes.data?.[0] ? Object.keys(rawRes.data[0]) : [],
        rawSample: rawRes.data?.[0] || null,
        rawError: rawRes.error,
        deletedAtQueryError: query1.error,
        testRecordQueryError: query2.error,
        totalSampleCount: fullRes.data?.length,
        requestId,
      });
    }

    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const scoreBand = searchParams.get("scoreBand") || undefined;
    const commitment = searchParams.get("commitment") || undefined;
    const college = searchParams.get("college") || undefined;
    const view = (searchParams.get("view") || "active") as "active" | "trash" | "test";
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const result = await getApplications({
      search,
      status,
      scoreBand,
      commitment,
      college,
      limit,
      offset,
      view,
    });

    const elapsedMs = Date.now() - startTime;
    console.log(
      `[SafeAdminLog] requestId=${requestId} route=/api/admin/applications op=GET_APPLICATIONS admin=${adminId} count=${result.applications.length} total=${result.total} elapsed=${elapsedMs}ms`
    );

    const page = Math.floor(offset / limit) + 1;
    const hasMore = offset + limit < result.total;

    return NextResponse.json({
      success: true,
      data: result.applications,
      total: result.total,
      pagination: {
        page,
        pageSize: limit,
        total: result.total,
        hasMore,
      },
      requestId,
    });
  } catch (err: any) {
    const elapsedMs = Date.now() - startTime;
    const isAuthErr = err?.statusCode === 401 || err?.statusCode === 403 || err?.message?.includes("session") || err?.message?.includes("Unauthorized");

    if (isAuthErr) {
      return handleAdminAuthError(err);
    }

    console.error(
      `[SafeAdminLog Error] requestId=${requestId} route=/api/admin/applications op=GET_APPLICATIONS admin=${adminId} error="${err?.message || "Unknown error"}" elapsed=${elapsedMs}ms`
    );

    return NextResponse.json(
      {
        success: false,
        data: [],
        total: 0,
        error: {
          code: "APPLICATION_READ_FAILED",
          message: "Unable to load applications. Database query failed.",
        },
        requestId,
      },
      { status: 500 }
    );
  }
}
