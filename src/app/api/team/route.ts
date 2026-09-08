import { NextRequest, NextResponse } from "next/server";
import { getPublicTeam } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const publicMembers = await getPublicTeam();

    return NextResponse.json(
      { success: true, data: publicMembers },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
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
