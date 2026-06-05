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

  console.log("Found DATABASE_URL. Establishing connection to MySQL...");
  try {
    const connConfig = {
      uri: dbUrl
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
    console.log("\x1b[32mConnection established successfully!\x1b[0m");
    
    const [rows] = await conn.query("SELECT 1 as val");
    console.log("Query 'SELECT 1' output:", rows);
    
    await conn.end();
    console.log("\x1b[32mDatabase connection test passed.\x1b[0m");
  } catch (err) {
    console.error("\x1b[31mDatabase connection test failed:\x1b[0m", err.message);
    process.exit(1);
  }
}

main();
