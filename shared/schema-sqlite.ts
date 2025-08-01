import { 
  sqliteTable, 
  text, 
  integer, 
  real,
  blob
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Establishments table
export const establishments = sqliteTable("establishments", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address").notNull(),
  logo: text("logo"),
  delivery_fee: real("delivery_fee").notNull().default(0),
  minimum_order: real("minimum_order").notNull().default(0),
  is_open: integer("is_open", { mode: "boolean" }).notNull().default(true),
  is_active: integer("is_active", { mode: "boolean" }).notNull().default(true),
  created_at: text("created_at").notNull().default(new Date().toISOString()),
  updated_at: text("updated_at").notNull().default(new Date().toISOString())
});

// Customers table
export const customers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  number: text("number").notNull().unique(),
  name: text("name").notNull(),
  whatsapp: text("whatsapp").notNull().unique(),
  email: text("email"),
  address: text("address").notNull(),
  complement: text("complement"),
  neighborhood: text("neighborhood").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip_code: text("zip_code").notNull(),
  default_payment_method: text("default_payment_method").notNull().default("pix"),
  total_orders: integer("total_orders").notNull().default(0),
  total_spent: real("total_spent").notNull().default(0),
  last_order_at: text("last_order_at"),
  is_active: integer("is_active", { mode: "boolean" }).notNull().default(true),
  created_at: text("created_at").notNull().default(new Date().toISOString()),
  updated_at: text("updated_at").notNull().default(new Date().toISOString())
});

// Categories table
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  establishment_id: text("establishment_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  is_active: integer("is_active", { mode: "boolean" }).notNull().default(true),
  sort_order: integer("sort_order").notNull().default(0),
  created_at: text("created_at").notNull().default(new Date().toISOString()),
  updated_at: text("updated_at").notNull().default(new Date().toISOString())
});

// Products table
export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  establishment_id: text("establishment_id").notNull(),
  category_id: text("category_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  image: text("image"),
  is_available: integer("is_available", { mode: "boolean" }).notNull().default(true),
  is_active: integer("is_active", { mode: "boolean" }).notNull().default(true),
  sort_order: integer("sort_order").notNull().default(0),
  preparation_time: text("preparation_time"),
  options: text("options"),
  created_at: text("created_at").notNull().default(new Date().toISOString()),
  updated_at: text("updated_at").notNull().default(new Date().toISOString())
});

// Orders table
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  order_number: text("order_number").notNull().unique(),
  customer_id: text("customer_id").notNull(),
  establishment_id: text("establishment_id").notNull(),
  customer_name: text("customer_name").notNull(),
  customer_phone: text("customer_phone").notNull(),
  customer_email: text("customer_email"),
  customer_address: text("customer_address").notNull(),
  customer_complement: text("customer_complement"),
  customer_neighborhood: text("customer_neighborhood").notNull(),
  customer_city: text("customer_city").notNull(),
  customer_state: text("customer_state").notNull(),
  customer_zip_code: text("customer_zip_code").notNull(),
  subtotal: real("subtotal").notNull(),
  delivery_fee: real("delivery_fee").notNull().default(0),
  discount_amount: real("discount_amount").notNull().default(0),
  coupon_code: text("coupon_code"),
  total: real("total").notNull(),
  payment_method: text("payment_method").notNull().default("pix"),
  payment_status: text("payment_status").notNull().default("pending"),
  status: text("status").notNull().default("pending"),
  observations: text("observations"),
  estimated_delivery_time: text("estimated_delivery_time"),
  mercadopago_payment_id: text("mercadopago_payment_id"),
  created_at: text("created_at").notNull().default(new Date().toISOString()),
  updated_at: text("updated_at").notNull().default(new Date().toISOString()),
  confirmed_at: text("confirmed_at"),
  preparing_at: text("preparing_at"),
  ready_at: text("ready_at"),
  delivered_at: text("delivered_at"),
  cancelled_at: text("cancelled_at")
});

// Order Items table
export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  order_id: text("order_id").notNull(),
  product_id: text("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unit_price: real("unit_price").notNull(),
  total: real("total").notNull(),
  observations: text("observations"),
  created_at: text("created_at").notNull().default(new Date().toISOString())
});

// Coupons table
export const coupons = sqliteTable("coupons", {
  id: text("id").primaryKey(),
  establishment_id: text("establishment_id").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  type: text("type").notNull().default("percentage"),
  value: real("value").notNull(),
  minimum_order: real("minimum_order").notNull().default(0),
  usage_limit: integer("usage_limit"),
  usage_count: integer("usage_count").notNull().default(0),
  is_active: integer("is_active", { mode: "boolean" }).notNull().default(true),
  valid_from: text("valid_from"),
  valid_until: text("valid_until"),
  created_at: text("created_at").notNull().default(new Date().toISOString()),
  updated_at: text("updated_at").notNull().default(new Date().toISOString())
});

// Users table for authentication
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  establishment_id: text("establishment_id").notNull(),
  is_active: integer("is_active", { mode: "boolean" }).notNull().default(true),
  created_at: text("created_at").notNull().default(new Date().toISOString()),
  updated_at: text("updated_at").notNull().default(new Date().toISOString())
});

// Relations
export const establishmentsRelations = relations(establishments, ({ many }) => ({
  categories: many(categories),
  products: many(products),
  orders: many(orders),
  coupons: many(coupons),
  users: many(users)
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders)
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  establishment: one(establishments, {
    fields: [categories.establishment_id],
    references: [establishments.id]
  }),
  products: many(products)
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  establishment: one(establishments, {
    fields: [products.establishment_id],
    references: [establishments.id]
  }),
  category: one(categories, {
    fields: [products.category_id],
    references: [categories.id]
  }),
  orderItems: many(orderItems)
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  establishment: one(establishments, {
    fields: [orders.establishment_id],
    references: [establishments.id]
  }),
  customer: one(customers, {
    fields: [orders.customer_id],
    references: [customers.id]
  }),
  items: many(orderItems)
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.order_id],
    references: [orders.id]
  }),
  product: one(products, {
    fields: [orderItems.product_id],
    references: [products.id]
  })
}));

export const couponsRelations = relations(coupons, ({ one, many }) => ({
  establishment: one(establishments, {
    fields: [coupons.establishment_id],
    references: [establishments.id]
  })
}));

// Zod schemas
export const insertEstablishmentSchema = createInsertSchema(establishments);
export const selectEstablishmentSchema = createSelectSchema(establishments);

export const insertCustomerSchema = createInsertSchema(customers);
export const selectCustomerSchema = createSelectSchema(customers);

export const insertCategorySchema = createInsertSchema(categories);
export const selectCategorySchema = createSelectSchema(categories);

export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);

export const insertOrderSchema = createInsertSchema(orders);
export const selectOrderSchema = createSelectSchema(orders);

export const insertOrderItemSchema = createInsertSchema(orderItems);
export const selectOrderItemSchema = createSelectSchema(orderItems);

export const insertCouponSchema = createInsertSchema(coupons);
export const selectCouponSchema = createSelectSchema(coupons);

// Types
export type Establishment = typeof establishments.$inferSelect;
export type InsertEstablishment = typeof establishments.$inferInsert;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;

export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  username: true,
  password: true,
  establishment_id: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;