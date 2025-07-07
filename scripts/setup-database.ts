import { promises as fs } from 'fs';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../shared/schema.js';
import * as schemaSqlite from '../shared/schema-sqlite.js';

async function setupDatabase() {
  console.log('Setting up database...');
  
  // If we have a DATABASE_URL, use PostgreSQL
  if (process.env.DATABASE_URL) {
    console.log('Using PostgreSQL with provided DATABASE_URL');
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle({ client: pool, schema });
    
    try {
      // Test the connection
      await pool.query('SELECT 1');
      console.log('✓ PostgreSQL connection successful');
      
      // You can run migrations here if needed
      console.log('✓ Database setup complete');
      
    } catch (error) {
      console.error('❌ PostgreSQL connection failed:', error);
      throw error;
    } finally {
      await pool.end();
    }
  } else {
    console.log('Using SQLite for development');
    
    // Ensure SQLite file exists
    const sqlite = new Database('replit_db.sqlite');
    const db = drizzleSqlite(sqlite, { schema: schemaSqlite });
    
    console.log('✓ SQLite setup complete');
    sqlite.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase()
    .then(() => console.log('Database setup completed!'))
    .catch(console.error);
}