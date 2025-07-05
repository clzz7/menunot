import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../shared/schema-sqlite.js';

async function setupDatabase() {
  const sqlite = new Database('replit_db.sqlite');
  const db = drizzle(sqlite, { schema });

  try {
    // Create tables
    sqlite.exec(`
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
        is_open INTEGER NOT NULL DEFAULT 1,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
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
        last_order_at TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        establishment_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        establishment_id TEXT NOT NULL,
        category_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image TEXT,
        is_available INTEGER NOT NULL DEFAULT 1,
        is_active INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0,
        preparation_time TEXT,
        options TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        establishment_id TEXT NOT NULL,
        customer_id TEXT NOT NULL,
        order_number TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'pending',
        total REAL NOT NULL,
        subtotal REAL NOT NULL,
        delivery_fee REAL NOT NULL DEFAULT 0,
        discount REAL NOT NULL DEFAULT 0,
        coupon_code TEXT,
        payment_method TEXT NOT NULL DEFAULT 'pix',
        payment_status TEXT NOT NULL DEFAULT 'pending',
        notes TEXT,
        delivery_address TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        accepted_at TEXT,
        prepared_at TEXT,
        delivered_at TEXT,
        cancelled_at TEXT
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total REAL NOT NULL,
        observations TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
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
        is_active INTEGER NOT NULL DEFAULT 1,
        valid_from TEXT,
        valid_until TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        establishment_id TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert sample data
    const establishmentId = '1';
    const timestamp = new Date().toISOString();

    // Insert establishment
    sqlite.exec(`
      INSERT OR IGNORE INTO establishments (id, name, description, phone, email, address, delivery_fee, minimum_order, created_at, updated_at)
      VALUES ('${establishmentId}', 'Pizzaria Bella Vista', 'Authentic Italian pizza and pasta', '(11) 99999-9999', 'contato@bellavista.com.br', 'Rua das Flores, 123 - Centro', 5.0, 25.0, '${timestamp}', '${timestamp}');
    `);

    // Insert categories
    const categories = [
      { id: '1', name: 'Pizzas', description: 'Traditional and specialty pizzas' },
      { id: '2', name: 'Pasta', description: 'Homemade pasta dishes' },
      { id: '3', name: 'Appetizers', description: 'Starters and appetizers' },
      { id: '4', name: 'Beverages', description: 'Drinks and beverages' }
    ];

    for (const category of categories) {
      sqlite.exec(`
        INSERT OR IGNORE INTO categories (id, establishment_id, name, description, created_at, updated_at)
        VALUES ('${category.id}', '${establishmentId}', '${category.name}', '${category.description}', '${timestamp}', '${timestamp}');
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
      sqlite.exec(`
        INSERT OR IGNORE INTO products (id, establishment_id, category_id, name, description, price, preparation_time, created_at, updated_at)
        VALUES ('${product.id}', '${establishmentId}', '${product.categoryId}', '${product.name}', '${product.description}', ${product.price}, '${product.prepTime}', '${timestamp}', '${timestamp}');
      `);
    }

    // Insert a sample user
    sqlite.exec(`
      INSERT OR IGNORE INTO users (id, username, password, establishment_id, created_at, updated_at)
      VALUES ('1', 'admin', 'password123', '${establishmentId}', '${timestamp}', '${timestamp}');
    `);

    // Insert sample coupons
    sqlite.exec(`
      INSERT OR IGNORE INTO coupons (id, establishment_id, code, description, type, value, minimum_order, created_at, updated_at)
      VALUES ('1', '${establishmentId}', 'WELCOME10', 'Welcome discount 10%', 'percentage', 10.0, 30.0, '${timestamp}', '${timestamp}');
    `);

    // Insert recurring customer for testing
    const customerId = 'customer-1';
    const customerNumber = '0001';
    sqlite.exec(`
      INSERT OR IGNORE INTO customers (id, number, name, whatsapp, email, address, complement, neighborhood, city, state, zip_code, default_payment_method, total_orders, total_spent, last_order_at, created_at, updated_at)
      VALUES ('${customerId}', '${customerNumber}', 'João Silva', '+5511999887766', 'joao@email.com', 'Rua das Palmeiras, 456', 'Apto 302', 'Jardim Paulista', 'São Paulo', 'SP', '01234-567', 'pix', 3, 127.50, '${timestamp}', '${timestamp}', '${timestamp}');
    `);

    // Insert sample orders for the recurring customer
    const orders = [
      { id: 'order-1', orderNumber: '001', total: 42.50, status: 'delivered', deliveredAt: new Date(Date.now() - 86400000 * 7).toISOString() },
      { id: 'order-2', orderNumber: '002', total: 35.00, status: 'delivered', deliveredAt: new Date(Date.now() - 86400000 * 3).toISOString() },
      { id: 'order-3', orderNumber: '003', total: 50.00, status: 'preparing', deliveredAt: null }
    ];

    for (const order of orders) {
      sqlite.exec(`
        INSERT OR IGNORE INTO orders (id, establishment_id, customer_id, order_number, status, total, subtotal, delivery_fee, discount, payment_method, payment_status, delivery_address, created_at, updated_at, delivered_at)
        VALUES ('${order.id}', '${establishmentId}', '${customerId}', '${order.orderNumber}', '${order.status}', ${order.total}, ${order.total - 5.0}, 5.0, 0, 'pix', 'approved', 'Rua das Palmeiras, 456, Apto 302', '${timestamp}', '${timestamp}', ${order.deliveredAt ? `'${order.deliveredAt}'` : 'NULL'});
      `);
    }

    // Insert order items for the orders
    const orderItems = [
      { id: 'item-1', orderId: 'order-1', productId: '1', quantity: 1, unitPrice: 35.0, total: 35.0 },
      { id: 'item-2', orderId: 'order-1', productId: '8', quantity: 1, unitPrice: 8.0, total: 8.0 },
      { id: 'item-3', orderId: 'order-2', productId: '2', quantity: 1, unitPrice: 40.0, total: 40.0 },
      { id: 'item-4', orderId: 'order-3', productId: '3', quantity: 1, unitPrice: 45.0, total: 45.0 }
    ];

    for (const item of orderItems) {
      sqlite.exec(`
        INSERT OR IGNORE INTO order_items (id, order_id, product_id, quantity, unit_price, total, created_at)
        VALUES ('${item.id}', '${item.orderId}', '${item.productId}', ${item.quantity}, ${item.unitPrice}, ${item.total}, '${timestamp}');
      `);
    }

    console.log('Database setup completed successfully!');
    console.log('Sample data inserted:');
    console.log('- 1 establishment');
    console.log('- 4 categories');
    console.log('- 9 products');
    console.log('- 1 user');
    console.log('- 1 coupon');
    console.log('- 1 recurring customer (João Silva)');
    console.log('- 3 sample orders with items');

  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    sqlite.close();
  }
}

setupDatabase();