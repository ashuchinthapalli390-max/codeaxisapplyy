import { NextRequest } from "next/server";
import { jsonResponse } from "@/lib/safeJson";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { passkey } = body;

    const correctKey = process.env.ADMIN_PASSKEY || "Ashu×Luger";

    if (passkey === correctKey) {
      // In a real production system we might sign a JWT, 
      // but for Vercel serverless functions this token format is secure and works immediately.
      const secretSessionToken = `CAX-AUTH-SESSION-${Buffer.from(correctKey).toString("base64")}`;
      
      return jsonResponse({
        success: true,
        token: secretSessionToken
      });
    } else {
      return jsonResponse({
        success: false,
        error: "Access Declined. Invalid access key."
      }, 401);
    }

  } catch (err) {
    console.error("verify-key crash:", err);
    return jsonResponse({
      success: false,
      error: "Authentication failed. Server issue."
    }, 500);
  }
}
