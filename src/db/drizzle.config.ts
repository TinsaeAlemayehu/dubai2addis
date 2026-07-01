import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables from .env file.
dotenv.config();

const sqlHost = process.env.SQL_HOST || "localhost";
const sqlDbName = process.env.SQL_DB_NAME || "postgres";
const user = process.env.SQL_ADMIN_USER || "postgres";
const password = process.env.SQL_ADMIN_PASSWORD || "postgres";
const dbUrl = process.env.DATABASE_URL;

if (dbUrl) {
  console.log("Using DATABASE_URL connection string for drizzle-kit.");
} else {
  console.log(`Using user: ${user} to connect to database.`);
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle", // Output directory for migrations.
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: dbUrl ? {
    url: dbUrl,
    ssl: dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1') ? false : { rejectUnauthorized: false },
  } : {
    host: sqlHost,
    user: user,
    password: password,
    database: sqlDbName,
    ssl: false, // Typically false when connecting via Cloud SQL Auth Proxy.
  },
  verbose: true, // Enable verbose output.
});
