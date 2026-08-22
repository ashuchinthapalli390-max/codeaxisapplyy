import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("codexa_admin_session")?.value;
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const isValid = await verifyAdminSessionToken(token);
    if (!isValid) {
      const res = NextResponse.json({ authenticated: false }, { status: 401 });
      res.cookies.delete("codexa_admin_session");
      return res;
    }

    return NextResponse.json({ authenticated: true });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
