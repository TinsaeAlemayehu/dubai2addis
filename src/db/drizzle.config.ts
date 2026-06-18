import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables from .env file.
dotenv.config();

const sqlHost = process.env.SQL_HOST || "localhost";
const sqlDbName = process.env.SQL_DB_NAME || "postgres";
const user = process.env.SQL_ADMIN_USER || "postgres";
const password = process.env.SQL_ADMIN_PASSWORD || "postgres";

console.log(`Using user: ${user} to connect to database.`);

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle", // Output directory for migrations.
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: {
    host: sqlHost,
    user: user,
    password: password,
    database: sqlDbName,
    ssl: false, // Typically false when connecting via Cloud SQL Auth Proxy.
  },
  verbose: true, // Enable verbose output.
});
