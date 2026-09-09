import { NextRequest, NextResponse } from "next/server";
import { getPublicLeadership, LeadershipError } from "@/lib/leadership/repository";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const publicMembers = await getPublicLeadership();

    return NextResponse.json(
      { success: true, data: publicMembers, count: publicMembers.length },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (err: any) {
    console.error("[Public Team API Error]:", err);
    if (err instanceof LeadershipError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch leadership profiles." },
      { status: 500 }
    );
  }
}
