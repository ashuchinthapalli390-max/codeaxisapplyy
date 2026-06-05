import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    return NextResponse.json(
      {
        success: false,
        configured: false,
        error: "DATABASE_URL is missing"
      },
      { status: 500 }
    );
  }

  let connection;
  try {
    connection = await mysql.createConnection({
      uri: databaseUrl,
      connectTimeout: 5000 // 5 seconds timeout
    });

    await connection.query("SELECT 1");
    await connection.end();

    return NextResponse.json({
      success: true,
      configured: true,
      message: "Database connected"
    });
  } catch (err) {
    console.error("Health check database connection failed:", err);
    if (connection) {
      try {
        await connection.end();
      } catch (_) {}
    }
    return NextResponse.json(
      {
        success: false,
        configured: true,
        error: err instanceof Error ? `Database connection failed: ${err.message}` : "Database connection failed"
      },
      { status: 500 }
    );
  }
}
