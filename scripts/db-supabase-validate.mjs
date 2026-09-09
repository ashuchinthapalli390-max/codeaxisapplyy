// Supabase Configuration & Canonical Schema Validator
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

function loadEnv() {
  const paths = [".env.local", ".env"];
  for (const p of paths) {
    const fullPath = path.resolve(process.cwd(), p);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf8");
      content.split(/\r?\n/).forEach((line) => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || "";
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.substring(1, value.length - 1);
          }
          if (!process.env[key]) {
            process.env[key] = value.trim();
          }
        }
      });
      break;
    }
  }
}

async function validate() {
  loadEnv();
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)?.trim();
  const secret = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();

  if (!url || !secret) {
    console.log("[Validator Notice]: SUPABASE_URL or SUPABASE_SECRET_KEY is not configured locally.");
    return;
  }

  const supabase = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log("Checking Supabase tables and permissions...");
  const tables = [
    "internship_rounds",
    "applications",
    "team_members",
    "interviews",
    "offers",
    "offer_responses",
    "admin_sessions",
    "email_events",
    "audit_logs",
    "site_settings",
    "site_modules",
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).select("*").limit(1);
    if (error) {
      console.warn(`  [WARN] Table ${table}: ${error.message}`);
    } else {
      console.log(`  [PASS] Table ${table} accessible.`);
    }
  }
}

validate().catch(console.error);
