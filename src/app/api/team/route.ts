import { NextRequest, NextResponse } from "next/server";
import { getTeamMembers } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const allMembers = await getTeamMembers(false);
    const publicMembers = allMembers.filter((m) => m.isVisible !== false && !m.isArchived);

    return NextResponse.json(
      { success: true, data: publicMembers },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch leadership profiles." },
      { status: 500 }
    );
  }
}
