import { drizzle } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import Database from 'better-sqlite3';
import * as schemaSqlite from '../shared/schema-sqlite.js';
import * as schemaPostgres from '../shared/schema.js';
import ws from "ws";

// Configure neon for serverless
import { neonConfig } from '@neondatabase/serverless';
neonConfig.webSocketConstructor = ws;

async function migrateData() {
  console.log('🚀 Iniciando migração de SQLite para PostgreSQL (Supabase)...');
  
  try {
    // Connect to SQLite
    const sqlite = new Database('replit_db.sqlite');
    const sqliteDb = drizzle(sqlite, { schema: schemaSqlite });
    
    // Get all data from SQLite
    console.log('📖 Lendo dados do SQLite...');
    const establishments = await sqliteDb.select().from(schemaSqlite.establishments);
    const customers = await sqliteDb.select().from(schemaSqlite.customers);
    const categories = await sqliteDb.select().from(schemaSqlite.categories);
    const products = await sqliteDb.select().from(schemaSqlite.products);
    const orders = await sqliteDb.select().from(schemaSqlite.orders);
    const orderItems = await sqliteDb.select().from(schemaSqlite.orderItems);
    const coupons = await sqliteDb.select().from(schemaSqlite.coupons);
    
    console.log(`📊 Dados encontrados:`);
    console.log(`   • ${establishments.length} estabelecimentos`);
    console.log(`   • ${customers.length} clientes`);
    console.log(`   • ${categories.length} categorias`);
    console.log(`   • ${products.length} produtos`);
    console.log(`   • ${orders.length} pedidos`);
    console.log(`   • ${orderItems.length} itens de pedidos`);
    console.log(`   • ${coupons.length} cupons`);
    
    // Connect to PostgreSQL (Supabase)
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL não configurada');
    }
    
    console.log('🔗 Conectando ao Supabase...');
    const pool = new Pool({ connectionString: databaseUrl });
    const postgresDb = drizzleNeon({ client: pool, schema: schemaPostgres });
    
    // Transform and insert data
    console.log('💾 Migrando dados para PostgreSQL...');
    
    // Convert SQLite dates to PostgreSQL dates and boolean values
    const transformEstablishments = establishments.map(est => ({
      ...est,
      created_at: new Date(est.created_at),
      updated_at: new Date(est.updated_at),
      is_open: Boolean(est.is_open),
      is_active: Boolean(est.is_active)
    }));
    
    const transformCustomers = customers.map(cust => ({
      ...cust,
      created_at: new Date(cust.created_at),
      updated_at: new Date(cust.updated_at),
      last_order_at: cust.last_order_at ? new Date(cust.last_order_at) : null,
      is_active: Boolean(cust.is_active)
    }));
    
    const transformCategories = categories.map(cat => ({
      ...cat,
      created_at: new Date(cat.created_at),
      updated_at: new Date(cat.updated_at),
      is_active: Boolean(cat.is_active)
    }));
    
    const transformProducts = products.map(prod => ({
      ...prod,
      created_at: new Date(prod.created_at),
      updated_at: new Date(prod.updated_at),
      is_active: Boolean(prod.is_active),
      is_available: Boolean(prod.is_available)
    }));
    
    const transformOrders = orders.map(order => ({
      ...order,
      created_at: new Date(order.created_at),
      updated_at: new Date(order.updated_at),
      confirmed_at: order.confirmed_at ? new Date(order.confirmed_at) : null,
      preparing_at: order.preparing_at ? new Date(order.preparing_at) : null,
      ready_at: order.ready_at ? new Date(order.ready_at) : null,
      delivered_at: order.delivered_at ? new Date(order.delivered_at) : null,
      cancelled_at: order.cancelled_at ? new Date(order.cancelled_at) : null
    }));
    
    const transformOrderItems = orderItems.map(item => ({
      ...item,
      created_at: new Date(item.created_at),
      // Fix null values that violate constraints
      product_name: item.product_name || 'Produto sem nome',
      product_price: item.product_price || 0,
      product_description: item.product_description || null
    }));
    
    const transformCoupons = coupons.map(coupon => ({
      ...coupon,
      created_at: new Date(coupon.created_at),
      updated_at: new Date(coupon.updated_at),
      valid_from: new Date(coupon.valid_from),
      valid_until: new Date(coupon.valid_until),
      is_active: Boolean(coupon.is_active)
    }));
    
    // Insert data in correct order (respecting foreign key constraints)
    if (transformEstablishments.length > 0) {
      await postgresDb.insert(schemaPostgres.establishments).values(transformEstablishments);
      console.log('   ✅ Estabelecimentos migrados');
    }
    
    if (transformCustomers.length > 0) {
      await postgresDb.insert(schemaPostgres.customers).values(transformCustomers);
      console.log('   ✅ Clientes migrados');
    }
    
    if (transformCategories.length > 0) {
      await postgresDb.insert(schemaPostgres.categories).values(transformCategories);
      console.log('   ✅ Categorias migradas');
    }
    
    if (transformProducts.length > 0) {
      await postgresDb.insert(schemaPostgres.products).values(transformProducts);
      console.log('   ✅ Produtos migrados');
    }
    
    if (transformOrders.length > 0) {
      await postgresDb.insert(schemaPostgres.orders).values(transformOrders);
      console.log('   ✅ Pedidos migrados');
    }
    
    if (transformOrderItems.length > 0) {
      await postgresDb.insert(schemaPostgres.orderItems).values(transformOrderItems);
      console.log('   ✅ Itens de pedidos migrados');
    }
    
    if (transformCoupons.length > 0) {
      await postgresDb.insert(schemaPostgres.coupons).values(transformCoupons);
      console.log('   ✅ Cupons migrados');
    }
    
    console.log('🎉 Migração concluída com sucesso!');
    console.log('📱 Sua aplicação agora está usando PostgreSQL no Supabase');
    
    await pool.end();
    sqlite.close();
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  migrateData()
    .then(() => {
      console.log('✨ Script de migração finalizado!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Falha na migração:', error);
      process.exit(1);
    });
}