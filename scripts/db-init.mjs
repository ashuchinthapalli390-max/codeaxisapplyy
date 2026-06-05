import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";

// Simple custom env file loader to support local running
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
      console.log(`Loaded environment configuration from: ${p}`);
      break;
    }
  }
}

async function main() {
  loadEnv();
  const dbUrl = process.env.DATABASE_URL?.trim();
  if (!dbUrl) {
    console.error("\x1b[31mError: DATABASE_URL environment variable is missing in .env files.\x1b[0m");
    process.exit(1);
  }

  const schemaPath = path.resolve(process.cwd(), "database/schema.sql");
  if (!fs.existsSync(schemaPath)) {
    console.error(`\x1b[31mError: Schema file not found at ${schemaPath}\x1b[0m`);
    process.exit(1);
  }

  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  console.log("Connecting to MySQL to execute database schema migrations...");

  try {
    const connConfig = {
      uri: dbUrl,
      multipleStatements: true
    };

    // Auto-detect if SSL is required (e.g. Aiven, AWS RDS, TiDB, Azure, etc.)
    const lowUrl = dbUrl.toLowerCase();
    if (
      lowUrl.includes("sslmode=") ||
      lowUrl.includes("ssl-mode=") ||
      lowUrl.includes("aivencloud.com") ||
      lowUrl.includes("tidbcloud.com") ||
      lowUrl.includes("database.azure.com") ||
      lowUrl.includes("rds.amazonaws.com")
    ) {
      connConfig.ssl = {
        rejectUnauthorized: false,
      };
    }

    const conn = await mysql.createConnection(connConfig);
    console.log("Connected. Executing database/schema.sql statements...");
    
    await conn.query(schemaSql);
    console.log("\x1b[32mDatabase schema migrations completed successfully!\x1b[0m");
    
    await conn.end();
  } catch (err) {
    console.error("\x1b[31mFailed to execute migrations:\x1b[0m", err.message);
    process.exit(1);
  }
}

main();
