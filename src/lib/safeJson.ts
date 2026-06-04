import { NextResponse } from "next/server";

export function safeParse<T>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString) as T;
  } catch (err) {
    console.error("JSON parsing error:", err);
    return fallback;
  }
}

export function jsonResponse(data: any, status = 200) {
  // Always return valid application/json body content, never an empty/plain response
  return NextResponse.json(data, {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
