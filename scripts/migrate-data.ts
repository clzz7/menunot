import { drizzle } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import Database from 'better-sqlite3';
import * as schemaSqlite from '../shared/schema-sqlite.js';
import * as schemaPostgres from '../shared/schema.js';

// Migration script to move data from SQLite to PostgreSQL
async function migrateData() {
  console.log('Starting data migration from SQLite to PostgreSQL...');
  
  // Connect to SQLite
  const sqlite = new Database('replit_db.sqlite');
  const sqliteDb = drizzle(sqlite, { schema: schemaSqlite });
  
  // Get all data from SQLite
  const establishments = await sqliteDb.select().from(schemaSqlite.establishments);
  const customers = await sqliteDb.select().from(schemaSqlite.customers);
  const categories = await sqliteDb.select().from(schemaSqlite.categories);
  const products = await sqliteDb.select().from(schemaSqlite.products);
  const orders = await sqliteDb.select().from(schemaSqlite.orders);
  const orderItems = await sqliteDb.select().from(schemaSqlite.orderItems);
  const coupons = await sqliteDb.select().from(schemaSqlite.coupons);
  
  console.log(`Found ${establishments.length} establishments`);
  console.log(`Found ${customers.length} customers`);
  console.log(`Found ${categories.length} categories`);
  console.log(`Found ${products.length} products`);
  console.log(`Found ${orders.length} orders`);
  console.log(`Found ${orderItems.length} order items`);
  console.log(`Found ${coupons.length} coupons`);
  
  // Connect to PostgreSQL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL not set');
  }
  
  const pool = new Pool({ connectionString: databaseUrl });
  const postgresDb = drizzleNeon({ client: pool, schema: schemaPostgres });
  
  try {
    // Insert data into PostgreSQL
    if (establishments.length > 0) {
      await postgresDb.insert(schemaPostgres.establishments).values(establishments);
      console.log('✓ Migrated establishments');
    }
    
    if (customers.length > 0) {
      await postgresDb.insert(schemaPostgres.customers).values(customers);
      console.log('✓ Migrated customers');
    }
    
    if (categories.length > 0) {
      await postgresDb.insert(schemaPostgres.categories).values(categories);
      console.log('✓ Migrated categories');
    }
    
    if (products.length > 0) {
      await postgresDb.insert(schemaPostgres.products).values(products);
      console.log('✓ Migrated products');
    }
    
    if (orders.length > 0) {
      await postgresDb.insert(schemaPostgres.orders).values(orders);
      console.log('✓ Migrated orders');
    }
    
    if (orderItems.length > 0) {
      await postgresDb.insert(schemaPostgres.orderItems).values(orderItems);
      console.log('✓ Migrated order items');
    }
    
    if (coupons.length > 0) {
      await postgresDb.insert(schemaPostgres.coupons).values(coupons);
      console.log('✓ Migrated coupons');
    }
    
    console.log('✅ Data migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await pool.end();
    sqlite.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  migrateData()
    .then(() => console.log('Migration script completed!'))
    .catch(console.error);
}