import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../shared/schema.js";

const sqlite = new Database("database.sqlite");
const db = drizzle(sqlite, { schema });

// Create tables manually using the SQL from the migration
const createTables = `
CREATE TABLE IF NOT EXISTS "categories" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "description" text,
        "image" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "sort_order" integer DEFAULT 0 NOT NULL,
        "establishment_id" text NOT NULL,
        "created_at" timestamp DEFAULT (datetime('now')) NOT NULL,
        "updated_at" timestamp DEFAULT (datetime('now')) NOT NULL
);

CREATE TABLE IF NOT EXISTS "coupons" (
        "id" text PRIMARY KEY NOT NULL,
        "code" text NOT NULL,
        "description" text,
        "type" text DEFAULT 'PERCENTAGE' NOT NULL,
        "value" numeric(10, 2) NOT NULL,
        "minimum_order" numeric(10, 2),
        "max_discount" numeric(10, 2),
        "is_active" boolean DEFAULT true NOT NULL,
        "usage_limit" integer,
        "usage_count" integer DEFAULT 0 NOT NULL,
        "valid_from" timestamp NOT NULL,
        "valid_until" timestamp NOT NULL,
        "establishment_id" text NOT NULL,
        "created_at" timestamp DEFAULT (datetime('now')) NOT NULL,
        "updated_at" timestamp DEFAULT (datetime('now')) NOT NULL,
        CONSTRAINT "coupons_code_unique" UNIQUE("code")
);

CREATE TABLE IF NOT EXISTS "customers" (
        "id" text PRIMARY KEY NOT NULL,
        "whatsapp" text NOT NULL,
        "name" text NOT NULL,
        "email" text,
        "address" text NOT NULL,
        "number" text NOT NULL,
        "complement" text,
        "neighborhood" text NOT NULL,
        "city" text NOT NULL,
        "state" text NOT NULL,
        "zip_code" text NOT NULL,
        "reference" text,
        "default_payment_method" text DEFAULT 'CASH' NOT NULL,
        "total_orders" integer DEFAULT 0 NOT NULL,
        "total_spent" numeric(10, 2) DEFAULT '0' NOT NULL,
        "last_order_at" timestamp,
        "created_at" timestamp DEFAULT (datetime('now')) NOT NULL,
        "updated_at" timestamp DEFAULT (datetime('now')) NOT NULL,
        CONSTRAINT "customers_whatsapp_unique" UNIQUE("whatsapp")
);

CREATE TABLE IF NOT EXISTS "establishments" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "description" text,
        "logo" text,
        "address" text NOT NULL,
        "phone" text NOT NULL,
        "email" text,
        "delivery_fee" numeric(10, 2) DEFAULT '0' NOT NULL,
        "minimum_order" numeric(10, 2) DEFAULT '0' NOT NULL,
        "delivery_time" text DEFAULT '30-45 min' NOT NULL,
        "is_open" boolean DEFAULT true NOT NULL,
        "opening_hours" text,
        "payment_methods" text,
        "created_at" timestamp DEFAULT (datetime('now')) NOT NULL,
        "updated_at" timestamp DEFAULT (datetime('now')) NOT NULL
);

CREATE TABLE IF NOT EXISTS "order_items" (
        "id" text PRIMARY KEY NOT NULL,
        "order_id" text NOT NULL,
        "product_id" text NOT NULL,
        "quantity" integer NOT NULL,
        "unit_price" numeric(10, 2) NOT NULL,
        "total_price" numeric(10, 2) NOT NULL,
        "observations" text,
        "options" text,
        "created_at" timestamp DEFAULT (datetime('now')) NOT NULL,
        "updated_at" timestamp DEFAULT (datetime('now')) NOT NULL
);

CREATE TABLE IF NOT EXISTS "orders" (
        "id" text PRIMARY KEY NOT NULL,
        "order_number" text NOT NULL,
        "customer_id" text NOT NULL,
        "establishment_id" text NOT NULL,
        "status" text DEFAULT 'PENDING' NOT NULL,
        "total_amount" numeric(10, 2) NOT NULL,
        "delivery_fee" numeric(10, 2) DEFAULT '0' NOT NULL,
        "discount_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
        "coupon_code" text,
        "payment_method" text NOT NULL,
        "delivery_address" text NOT NULL,
        "observations" text,
        "estimated_delivery" timestamp,
        "confirmed_at" timestamp,
        "prepared_at" timestamp,
        "delivered_at" timestamp,
        "created_at" timestamp DEFAULT (datetime('now')) NOT NULL,
        "updated_at" timestamp DEFAULT (datetime('now')) NOT NULL,
        CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);

CREATE TABLE IF NOT EXISTS "products" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "description" text,
        "price" numeric(10, 2) NOT NULL,
        "image" text,
        "category_id" text NOT NULL,
        "establishment_id" text NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "sort_order" integer DEFAULT 0 NOT NULL,
        "preparation_time" text DEFAULT '15 min' NOT NULL,
        "options" text,
        "created_at" timestamp DEFAULT (datetime('now')) NOT NULL,
        "updated_at" timestamp DEFAULT (datetime('now')) NOT NULL
);

CREATE TABLE IF NOT EXISTS "users" (
        "id" text PRIMARY KEY NOT NULL,
        "username" text NOT NULL,
        "email" text NOT NULL,
        "password_hash" text NOT NULL,
        "created_at" timestamp DEFAULT (datetime('now')) NOT NULL,
        "updated_at" timestamp DEFAULT (datetime('now')) NOT NULL,
        CONSTRAINT "users_username_unique" UNIQUE("username"),
        CONSTRAINT "users_email_unique" UNIQUE("email")
);
`;

// Execute the table creation
const statements = createTables.split(';').filter(stmt => stmt.trim());
statements.forEach(stmt => {
    if (stmt.trim()) {
        sqlite.exec(stmt);
    }
});

console.log("Database tables created successfully!");

// Create a default establishment
const establishmentId = "est_1";
const establishment = {
    id: establishmentId,
    name: "Restaurante Exemplo",
    description: "Seu restaurante favorito",
    address: "Rua das Flores, 123",
    phone: "(11) 99999-9999",
    email: "contato@exemplo.com",
    delivery_fee: 5.00,
    minimum_order: 20.00,
    delivery_time: "30-45 min",
    is_open: true,
    opening_hours: "18:00-23:00",
    payment_methods: "PIX,Cartão,Dinheiro",
    created_at: new Date(),
    updated_at: new Date()
};

try {
    sqlite.prepare(`
        INSERT INTO establishments (id, name, description, address, phone, email, delivery_fee, minimum_order, delivery_time, is_open, opening_hours, payment_methods, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        establishment.id,
        establishment.name,
        establishment.description,
        establishment.address,
        establishment.phone,
        establishment.email,
        establishment.delivery_fee,
        establishment.minimum_order,
        establishment.delivery_time,
        establishment.is_open,
        establishment.opening_hours,
        establishment.payment_methods,
        establishment.created_at.toISOString(),
        establishment.updated_at.toISOString()
    );
    console.log("Default establishment created!");
} catch (error) {
    console.log("Establishment already exists or error:", error.message);
}

sqlite.close();