import mysql from "mysql2/promise";
import { ApplicationData } from "@/types/application";

// Extend globalThis to persist mock database in development reload cycles
declare global {
  var mockApplications: ApplicationData[] | undefined;
  var mockLogs: any[] | undefined;
}

const DATABASE_URL = process.env.DATABASE_URL;

let pool: mysql.Pool | null = null;

if (DATABASE_URL && DATABASE_URL.trim() !== "") {
  try {
    pool = mysql.createPool(DATABASE_URL);
    console.log("MySQL connection pool initialized.");
  } catch (err) {
    console.error("Failed to initialize MySQL connection pool, falling back to mock database:", err);
    pool = null;
  }
} else {
  console.warn("DATABASE_URL is not set. Falling back to persistent in-memory mock database.");
}

// Initialize mock global databases if not present
if (!globalThis.mockApplications) {
  globalThis.mockApplications = [];
}
if (!globalThis.mockLogs) {
  globalThis.mockLogs = [];
}

// Database query wrapper
export async function dbQuery(sql: string, params: any[] = []): Promise<any> {
  if (pool) {
    try {
      const [results] = await pool.query(sql, params);
      return results;
    } catch (err) {
      console.error("MySQL query error, running against in-memory fallback:", err);
      // Fallback to mock on query failure
      return runMockQuery(sql, params);
    }
  } else {
    return runMockQuery(sql, params);
  }
}

// In-memory mock SQL query executor
function runMockQuery(sql: string, params: any[]): any {
  const sqlClean = sql.trim().replace(/\s+/g, " ");

  // 1. SELECT * FROM applications
  if (sqlClean.toUpperCase().startsWith("SELECT * FROM APPLICATIONS")) {
    // Return mock data sorted by created_at DESC
    return [...(globalThis.mockApplications || [])].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });
  }

  // 2. SELECT id, email, phone_number, whatsapp_number, roll_number FROM applications WHERE ...
  if (sqlClean.toUpperCase().startsWith("SELECT ID, EMAIL, PHONE_NUMBER, WHATSAPP_NUMBER, ROLL_NUMBER FROM APPLICATIONS WHERE")) {
    const email = params[0];
    const phone = params[1];
    const whatsapp = params[2];
    const roll = params[3];

    // Find duplicates in mock store
    const matches = (globalThis.mockApplications || []).filter(
      (app) =>
        app.email.toLowerCase() === String(email).toLowerCase() ||
        app.phone_number === String(phone) ||
        (app.whatsapp_number && app.whatsapp_number === String(whatsapp)) ||
        app.roll_number.toLowerCase() === String(roll).toLowerCase()
    );

    return matches;
  }

  // 3. INSERT INTO applications
  if (sqlClean.toUpperCase().startsWith("INSERT INTO APPLICATIONS")) {
    // Extract column keys from query string: INSERT INTO applications (col1, col2) VALUES (?, ?)
    const colStart = sqlClean.indexOf("(");
    const colEnd = sqlClean.indexOf(")");
    const cols = sqlClean
      .substring(colStart + 1, colEnd)
      .split(",")
      .map((c) => c.trim());

    const newApp: any = {
      id: (globalThis.mockApplications || []).length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    cols.forEach((col, idx) => {
      let val = params[idx];
      // Convert tinyint representation of boolean from MySQL format back to JS boolean
      if (col.startsWith("agreement_") || col === "duplicate_warning") {
        newApp[col] = val === 1 || val === true;
      } else {
        newApp[col] = val;
      }
    });

    globalThis.mockApplications?.push(newApp as ApplicationData);
    return { insertId: newApp.id, affectedRows: 1 };
  }

  // 4. UPDATE applications SET manual_status = ?, admin_notes = ? WHERE id = ?
  if (sqlClean.toUpperCase().startsWith("UPDATE APPLICATIONS SET MANUAL_STATUS")) {
    const manualStatus = params[0];
    const adminNotes = params[1];
    const id = params[2];

    const idx = globalThis.mockApplications?.findIndex((app) => app.id === id);
    if (idx !== undefined && idx !== -1) {
      const app = globalThis.mockApplications![idx];
      app.manual_status = manualStatus;
      app.admin_notes = adminNotes;
      app.updated_at = new Date().toISOString();
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // 5. DELETE FROM applications WHERE id = ?
  if (sqlClean.toUpperCase().startsWith("DELETE FROM APPLICATIONS WHERE ID = ?")) {
    const id = params[0];
    const initialLen = globalThis.mockApplications?.length || 0;
    globalThis.mockApplications = globalThis.mockApplications?.filter((app) => app.id !== id);
    const deletedCount = initialLen - (globalThis.mockApplications?.length || 0);
    return { affectedRows: deletedCount };
  }

  // 6. INSERT INTO admin_audit_logs
  if (sqlClean.toUpperCase().startsWith("INSERT INTO ADMIN_AUDIT_LOGS")) {
    const newLog = {
      id: (globalThis.mockLogs || []).length + 1,
      action_type: params[0],
      application_id: params[1],
      details: params[2],
      created_at: new Date().toISOString(),
    };
    globalThis.mockLogs?.push(newLog);
    return { insertId: newLog.id, affectedRows: 1 };
  }

  // Generic empty return fallback
  return [];
}
