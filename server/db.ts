import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";

const databaseUrl = process.env.DATABASE_URL || './database.sqlite';

// Create SQLite database connection
const sqlite = new Database(databaseUrl);

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });