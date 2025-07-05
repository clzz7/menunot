import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from "ws";
import * as schema from '../shared/schema.js';

neonConfig.webSocketConstructor = ws;

async function setupPostgresDatabase() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool, schema });

  try {
    // Create tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS establishments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        phone TEXT NOT NULL,
        email TEXT,
        address TEXT NOT NULL,
        logo TEXT,
        delivery_fee REAL NOT NULL DEFAULT 0,
        minimum_order REAL NOT NULL DEFAULT 0,
        is_open BOOLEAN NOT NULL DEFAULT TRUE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        number TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        whatsapp TEXT NOT NULL UNIQUE,
        email TEXT,
        address TEXT NOT NULL,
        complement TEXT,
        neighborhood TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        zip_code TEXT NOT NULL,
        default_payment_method TEXT NOT NULL DEFAULT 'pix',
        total_orders INTEGER NOT NULL DEFAULT 0,
        total_spent REAL NOT NULL DEFAULT 0,
        last_order_at TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        establishment_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        establishment_id TEXT NOT NULL,
        category_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        preparation_time TEXT,
        options TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        establishment_id TEXT NOT NULL,
        customer_id TEXT NOT NULL,
        order_number TEXT NOT NULL UNIQUE,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_email TEXT,
        customer_address TEXT NOT NULL,
        customer_complement TEXT,
        customer_neighborhood TEXT NOT NULL,
        customer_city TEXT NOT NULL,
        customer_state TEXT NOT NULL,
        customer_zip_code TEXT NOT NULL,
        subtotal REAL NOT NULL,
        delivery_fee REAL NOT NULL DEFAULT 0,
        discount_amount REAL NOT NULL DEFAULT 0,
        coupon_code TEXT,
        total REAL NOT NULL,
        payment_method TEXT NOT NULL DEFAULT 'pix',
        payment_status TEXT NOT NULL DEFAULT 'pending',
        status TEXT NOT NULL DEFAULT 'pending',
        observations TEXT,
        estimated_delivery_time TEXT,
        mercadopago_payment_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        confirmed_at TIMESTAMP WITH TIME ZONE,
        preparing_at TIMESTAMP WITH TIME ZONE,
        ready_at TIMESTAMP WITH TIME ZONE,
        delivered_at TIMESTAMP WITH TIME ZONE,
        cancelled_at TIMESTAMP WITH TIME ZONE
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total REAL NOT NULL,
        options TEXT,
        observations TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS coupons (
        id TEXT PRIMARY KEY,
        establishment_id TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        description TEXT,
        type TEXT NOT NULL DEFAULT 'percentage',
        value REAL NOT NULL,
        minimum_order REAL NOT NULL DEFAULT 0,
        usage_limit INTEGER,
        usage_count INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        free_delivery BOOLEAN NOT NULL DEFAULT FALSE,
        valid_from TIMESTAMP WITH TIME ZONE,
        valid_until TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        establishment_id TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Insert sample data
    const establishmentId = '1';
    
    // Insert establishment
    await db.execute(sql`
      INSERT INTO establishments (id, name, description, phone, email, address, delivery_fee, minimum_order)
      VALUES (${establishmentId}, 'Pizzaria Bella Vista', 'Authentic Italian pizza and pasta', '(11) 99999-9999', 'contato@bellavista.com.br', 'Rua das Flores, 123 - Centro', 5.0, 25.0)
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insert categories
    const categories = [
      { id: '1', name: 'Pizzas', description: 'Traditional and specialty pizzas' },
      { id: '2', name: 'Pasta', description: 'Homemade pasta dishes' },
      { id: '3', name: 'Appetizers', description: 'Starters and appetizers' },
      { id: '4', name: 'Beverages', description: 'Drinks and beverages' }
    ];

    for (const category of categories) {
      await db.execute(sql`
        INSERT INTO categories (id, establishment_id, name, description)
        VALUES (${category.id}, ${establishmentId}, ${category.name}, ${category.description})
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    // Insert products
    const products = [
      { id: '1', categoryId: '1', name: 'Margherita', description: 'Fresh tomatoes, mozzarella, basil', price: 35.0, prepTime: '25-30 min' },
      { id: '2', categoryId: '1', name: 'Pepperoni', description: 'Pepperoni, mozzarella, tomato sauce', price: 40.0, prepTime: '25-30 min' },
      { id: '3', categoryId: '1', name: 'Quattro Stagioni', description: 'Ham, mushrooms, artichokes, olives', price: 45.0, prepTime: '30-35 min' },
      { id: '4', categoryId: '2', name: 'Spaghetti Carbonara', description: 'Eggs, bacon, parmesan, black pepper', price: 28.0, prepTime: '20-25 min' },
      { id: '5', categoryId: '2', name: 'Penne Arrabiata', description: 'Spicy tomato sauce, garlic, chili', price: 25.0, prepTime: '20-25 min' },
      { id: '6', categoryId: '3', name: 'Bruschetta', description: 'Toasted bread, tomatoes, basil', price: 15.0, prepTime: '10-15 min' },
      { id: '7', categoryId: '3', name: 'Mozzarella Sticks', description: 'Breaded mozzarella with marinara', price: 18.0, prepTime: '15-20 min' },
      { id: '8', categoryId: '4', name: 'Coca-Cola', description: 'Classic cola drink', price: 8.0, prepTime: '2-3 min' },
      { id: '9', categoryId: '4', name: 'Fresh Orange Juice', description: 'Freshly squeezed orange juice', price: 12.0, prepTime: '5-8 min' }
    ];

    for (const product of products) {
      await db.execute(sql`
        INSERT INTO products (id, establishment_id, category_id, name, description, price, preparation_time)
        VALUES (${product.id}, ${establishmentId}, ${product.categoryId}, ${product.name}, ${product.description}, ${product.price}, ${product.prepTime})
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    // Insert sample user
    await db.execute(sql`
      INSERT INTO users (id, username, password, establishment_id)
      VALUES ('1', 'admin', 'password123', ${establishmentId})
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insert sample coupons
    await db.execute(sql`
      INSERT INTO coupons (id, establishment_id, code, description, type, value, minimum_order)
      VALUES ('1', ${establishmentId}, 'WELCOME10', 'Welcome discount 10%', 'percentage', 10.0, 30.0)
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insert recurring customer
    const customerId = 'customer-1';
    await db.execute(sql`
      INSERT INTO customers (id, number, name, whatsapp, email, address, complement, neighborhood, city, state, zip_code, default_payment_method, total_orders, total_spent)
      VALUES (${customerId}, '0001', 'João Silva', '+5511999887766', 'joao@email.com', 'Rua das Palmeiras, 456', 'Apto 302', 'Jardim Paulista', 'São Paulo', 'SP', '01234-567', 'pix', 3, 127.50)
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('PostgreSQL database setup completed successfully!');
    console.log('Sample data inserted:');
    console.log('- 1 establishment');
    console.log('- 4 categories');
    console.log('- 9 products');
    console.log('- 1 user');
    console.log('- 1 coupon');
    console.log('- 1 recurring customer (João Silva)');

  } catch (error) {
    console.error('Error setting up PostgreSQL database:', error);
  } finally {
    await pool.end();
  }
}

setupPostgresDatabase();