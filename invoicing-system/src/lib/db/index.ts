import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";

// Initialize the SQLite database
const sqlite = new Database("sqlite.db");
export const db = drizzle(sqlite, { schema });

// Run migrations
// Note: This is a simplified version for demo purposes
// In a real app, you'd want to use Drizzle Kit for migrations
try {
  migrate(db, { migrationsFolder: "./migrations" });
  console.log("Migrations completed successfully");
} catch (error) {
  console.error("Error running migrations:", error);
}
