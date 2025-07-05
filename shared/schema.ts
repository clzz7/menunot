import { 
  sqliteTable, 
  text, 
  integer, 
  real
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
  delivery_time: text("delivery_time").notNull().default("30-45 min"),
  is_open: integer("is_open", { mode: "boolean" }).notNull().default(true),
  opening_hours: text("opening_hours"),
  payment_methods: text("payment_methods"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull()
});

// Customers table
export const customers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  whatsapp: text("whatsapp").notNull().unique(),
  name: text("name").notNull(),
  email: text("email"),
  address: text("address").notNull(),
  number: text("number").notNull(),
  complement: text("complement"),
  neighborhood: text("neighborhood").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip_code: text("zip_code").notNull(),
  reference: text("reference"),
  default_payment_method: text("default_payment_method").notNull().default("CASH"),
  total_orders: integer("total_orders").notNull().default(0),
  total_spent: real("total_spent").notNull().default(0),
  last_order_at: text("last_order_at"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull()
});

// Categories table
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  is_active: integer("is_active", { mode: "boolean" }).notNull().default(true),
  sort_order: integer("sort_order").notNull().default(0),
  establishment_id: text("establishment_id").notNull(),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull()
});

// Products table
export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  image: text("image"),
  category_id: text("category_id").notNull(),
  establishment_id: text("establishment_id").notNull(),
  is_active: integer("is_active", { mode: "boolean" }).notNull().default(true),
  sort_order: integer("sort_order").notNull().default(0),
  preparation_time: text("preparation_time").notNull().default("15 min"),
  options: text("options"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull()
});

// Orders table
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  order_number: text("order_number").notNull().unique(),
  customer_id: text("customer_id").notNull(),
  establishment_id: text("establishment_id").notNull(),
  status: text("status").notNull().default("PENDING"),
  total_amount: real("total_amount").notNull(),
  delivery_fee: real("delivery_fee").notNull().default(0),
  discount_amount: real("discount_amount").notNull().default(0),
  coupon_code: text("coupon_code"),
  payment_method: text("payment_method").notNull(),
  delivery_address: text("delivery_address").notNull(),
  observations: text("observations"),
  estimated_delivery: text("estimated_delivery"),
  confirmed_at: text("confirmed_at"),
  prepared_at: text("prepared_at"),
  delivered_at: text("delivered_at"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull()
});

// Order Items table
export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  order_id: text("order_id").notNull(),
  product_id: text("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unit_price: real("unit_price").notNull(),
  total_price: real("total_price").notNull(),
  observations: text("observations"),
  options: text("options"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull()
});

// Coupons table
export const coupons = sqliteTable("coupons", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  description: text("description"),
  type: text("type").notNull().default("PERCENTAGE"),
  value: real("value").notNull(),
  minimum_order: real("minimum_order"),
  max_discount: real("max_discount"),
  is_active: integer("is_active", { mode: "boolean" }).notNull().default(true),
  usage_limit: integer("usage_limit"),
  usage_count: integer("usage_count").notNull().default(0),
  valid_from: text("valid_from").notNull(),
  valid_until: text("valid_until").notNull(),
  establishment_id: text("establishment_id").notNull(),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull()
});

// Users table
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull()
});

// Relations
export const establishmentsRelations = relations(establishments, ({ many }) => ({
  categories: many(categories),
  products: many(products),
  orders: many(orders),
  coupons: many(coupons)
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
  category: one(categories, {
    fields: [products.category_id],
    references: [categories.id]
  }),
  establishment: one(establishments, {
    fields: [products.establishment_id],
    references: [establishments.id]
  }),
  orderItems: many(orderItems)
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customer_id],
    references: [customers.id]
  }),
  establishment: one(establishments, {
    fields: [orders.establishment_id],
    references: [establishments.id]
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
  }),
  orders: many(orders)
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

// User types
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password_hash: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;