import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, handleAdminAuthError } from "@/lib/admin/session";
import {
  getSupabaseAdmin,
  isSupabaseConfigured,
  getSupabaseProjectRef,
  getSupabaseUrl,
} from "@/lib/supabase/admin";
import fs from "fs";
import path from "path";
import { Client } from "pg";

export const dynamic = "force-dynamic";

const REQUIRED_TABLES = [
  "internship_rounds",
  "applications",
  "application_status_history",
  "team_members",
  "website_assets",
  "admin_sessions",
  "interviews",
  "email_logs",
  "offer_letters",
  "offer_responses",
  "audit_logs",
  "site_settings",
];

const REQUIRED_BUCKETS = [
  { name: "website-assets", public: true },
  { name: "resumes", public: false },
  { name: "offer-letters", public: false },
];

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const supabase = getSupabaseAdmin();
    const supabaseOk = isSupabaseConfigured();
    const projectRef = getSupabaseProjectRef();
    const hasDatabaseUrl = Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);

    const tableStatuses: Record<string, { exists: boolean; count?: number; error?: string }> = {};

    if (supabase) {
      for (const table of REQUIRED_TABLES) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select("*", { count: "exact", head: true });

          if (error) {
            tableStatuses[table] = {
              exists: false,
              error: error.message,
            };
          } else {
            tableStatuses[table] = {
              exists: true,
              count: count ?? 0,
            };
          }
        } catch (err: any) {
          tableStatuses[table] = {
            exists: false,
            error: err?.message || "Query exception",
          };
        }
      }
    }

    // Check buckets
    const bucketStatuses: Record<string, { exists: boolean; public?: boolean; error?: string }> = {};
    if (supabase) {
      try {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        if (error) {
          REQUIRED_BUCKETS.forEach((b) => {
            bucketStatuses[b.name] = { exists: false, error: error.message };
          });
        } else {
          const existingNames = new Set((buckets || []).map((b) => b.name));
          REQUIRED_BUCKETS.forEach((b) => {
            const found = (buckets || []).find((bucket) => bucket.name === b.name);
            bucketStatuses[b.name] = {
              exists: existingNames.has(b.name),
              public: found?.public,
            };
          });
        }
      } catch (bErr: any) {
        REQUIRED_BUCKETS.forEach((b) => {
          bucketStatuses[b.name] = { exists: false, error: bErr?.message };
        });
      }
    }

    return NextResponse.json({
      success: true,
      environment: {
        supabaseConfigured: supabaseOk,
        projectRef,
        hasDatabaseUrl,
        hasResendKey: Boolean(process.env.RESEND_API_KEY),
        adminPasskeyConfigured: Boolean(process.env.ADMIN_PASSKEY || process.env.ADMIN_KEY_HASH),
      },
      tables: tableStatuses,
      buckets: bucketStatuses,
    });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action || "migrate";
    const customSql = body.sql;

    const supabase = getSupabaseAdmin();
    const projectRef = getSupabaseProjectRef();

    // 1. Ensure Storage Buckets
    const bucketResults: Record<string, string> = {};
    if (supabase) {
      for (const bucketDef of REQUIRED_BUCKETS) {
        try {
          const { data: existing } = await supabase.storage.getBucket(bucketDef.name);
          if (!existing) {
            const { error: createErr } = await supabase.storage.createBucket(bucketDef.name, {
              public: bucketDef.public,
              fileSizeLimit: 5242880, // 5MB
            });
            bucketResults[bucketDef.name] = createErr ? `Error: ${createErr.message}` : "Created";
          } else {
            bucketResults[bucketDef.name] = "Already exists";
          }
        } catch (err: any) {
          bucketResults[bucketDef.name] = `Exception: ${err?.message}`;
        }
      }
    }

    // 2. Database Migration via direct connection or Supabase Management/SQL
    const dbUrl = body.databaseUrl || process.env.DATABASE_URL || process.env.POSTGRES_URL;
    let sqlExecutionResult: any = null;

    let migrationSql = "";
    if (customSql) {
      migrationSql = customSql;
    } else {
      const migrationPath = path.resolve(
        process.cwd(),
        "supabase/migrations/20260910140000_applications_soft_delete_repair.sql"
      );
      if (fs.existsSync(migrationPath)) {
        migrationSql = fs.readFileSync(migrationPath, "utf-8");
      }
    }

    if (dbUrl && migrationSql) {
      const client = new Client({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false },
      });

      await client.connect();
      try {
        await client.query(migrationSql);
        // Reload PostgREST schema cache
        await client.query("NOTIFY pgrst, 'reload schema';");
        sqlExecutionResult = {
          success: true,
          method: "pg_client",
          message: "Migration SQL executed and PostgREST schema cache reload signal dispatched.",
        };
      } finally {
        await client.end();
      }
    } else if (migrationSql) {
      // Attempt execution via Supabase pg/query endpoint with secret key
      const secret = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
      const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)?.trim();

      if (supabaseUrl && secret) {
        try {
          const pgRes = await fetch(`${supabaseUrl}/pg/query`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: secret,
              Authorization: `Bearer ${secret}`,
            },
            body: JSON.stringify({ query: migrationSql }),
          });
          const pgJson = await pgRes.json().catch(() => null);
          if (pgRes.ok) {
            sqlExecutionResult = {
              success: true,
              method: "supabase_pg_query",
              message: "Executed migration via Supabase pg/query API.",
              result: pgJson,
            };
          } else {
            sqlExecutionResult = {
              success: false,
              method: "supabase_pg_query_attempted",
              status: pgRes.status,
              response: pgJson,
              message:
                "DATABASE_URL not set and Supabase /pg/query endpoint returned non-200. Please execute migration SQL via Supabase SQL Editor or provide databaseUrl.",
            };
          }
        } catch (e: any) {
          sqlExecutionResult = {
            success: false,
            method: "none",
            error: e.message,
            message:
              "DATABASE_URL not set in server environment. To apply PostgreSQL migrations directly, execute 20260910140000_applications_soft_delete_repair.sql via Supabase SQL Editor.",
          };
        }
      } else {
        sqlExecutionResult = {
          success: false,
          method: "none",
          message:
            "DATABASE_URL not set in server environment. To apply PostgreSQL migrations directly, execute 20260910140000_applications_soft_delete_repair.sql via Supabase SQL Editor.",
        };
      }
    }

    return NextResponse.json({
      success: true,
      projectRef,
      action,
      buckets: bucketResults,
      migration: sqlExecutionResult,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Migration execution failed",
      },
      { status: 500 }
    );
  }
}
