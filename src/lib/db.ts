import "server-only";
import mysql from "mysql2/promise";

export const DATABASE_CONFIG_ERROR_MESSAGE =
  "Database connection is not configured yet. Please contact CodeXa support.";

export class DatabaseConfigError extends Error {
  constructor() {
    super("DATABASE_URL environment variable is missing.");
    this.name = "DatabaseConfigError";
  }
}

type DbParam = string | number | boolean | null | Date | Buffer;

let pool: mysql.Pool | null = null;

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function isDatabaseConfigError(error: unknown) {
  return (
    error instanceof DatabaseConfigError ||
    (error instanceof Error && error.message.includes("DATABASE_URL"))
  );
}

export function getDbPool() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new DatabaseConfigError();
  }

  if (!pool) {
    const config: mysql.PoolOptions = {
      uri: databaseUrl,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };

    // Auto-detect if SSL is required (e.g. Aiven, AWS RDS, TiDB, Azure, etc.)
    const lowUrl = databaseUrl.toLowerCase();
    if (
      lowUrl.includes("sslmode=") ||
      lowUrl.includes("ssl-mode=") ||
      lowUrl.includes("aivencloud.com") ||
      lowUrl.includes("tidbcloud.com") ||
      lowUrl.includes("database.azure.com") ||
      lowUrl.includes("rds.amazonaws.com")
    ) {
      config.ssl = {
        rejectUnauthorized: false,
      };
    }

    pool = mysql.createPool(config);
  }

  return pool;
}

export async function dbQuery<T = mysql.QueryResult>(
  sql: string,
  params: DbParam[] = []
): Promise<T> {
  try {
    const [results] = await getDbPool().query(sql, params);
    return results as T;
  } catch (error) {
    if (isDatabaseConfigError(error)) {
      throw error;
    }

    console.error("Database query failed:", error);
    throw new Error(
      error instanceof Error
        ? `Database query failed: ${error.message}`
        : "Database query failed."
    );
  }
}
