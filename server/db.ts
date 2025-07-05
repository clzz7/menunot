import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import ws from "ws";
import * as schema from "../shared/schema.js";
import * as schemaSqlite from "../shared/schema-sqlite.js";

neonConfig.webSocketConstructor = ws;

// For development, use SQLite if no DATABASE_URL is provided
let db: any;

if (!process.env.DATABASE_URL) {
  console.log('No DATABASE_URL found, using SQLite for development');
  const sqlite = new Database('replit_db.sqlite');
  db = drizzleSqlite(sqlite, { schema: schemaSqlite });
} else {
  console.log('Using PostgreSQL with DATABASE_URL');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
}

export { db };