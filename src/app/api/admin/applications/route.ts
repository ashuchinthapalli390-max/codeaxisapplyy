import { NextRequest, NextResponse } from "next/server";
import { getApplications } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const scoreBand = searchParams.get("scoreBand") || undefined;
    const commitment = searchParams.get("commitment") || undefined;
    const college = searchParams.get("college") || undefined;
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
    });

    return NextResponse.json({
      success: true,
      data: result.applications,
      total: result.total,
    });
  } catch (err) {
    console.error("Admin fetch applications error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch applications." }, { status: 500 });
  }
}
