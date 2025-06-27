import { 
  pgTable, 
  text, 
  serial, 
  integer, 
  boolean, 
  decimal, 
  timestamp, 
  json,
  varchar
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Establishments table
export const establishments = pgTable("establishments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address").notNull(),
  logo: text("logo"),
  banner: text("banner"),
  primaryColor: text("primary_color").notNull().default("#FF6B35"),
  secondaryColor: text("secondary_color").notNull().default("#F7931E"),
  
  // Operating settings
  isOpen: boolean("is_open").notNull().default(true),
  openingHours: json("opening_hours").$type<Record<string, { open: string; close: string }>>(),
  preparationTime: integer("preparation_time").notNull().default(30),
  
  // Delivery settings
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).notNull(),
  minimumOrder: decimal("minimum_order", { precision: 10, scale: 2 }).notNull(),
  deliveryAreas: json("delivery_areas").$type<string[]>(),
  
  // Payment settings
  acceptsCard: boolean("accepts_card").notNull().default(true),
  acceptsPix: boolean("accepts_pix").notNull().default(true),
  acceptsCash: boolean("accepts_cash").notNull().default(true),
  pixKey: text("pix_key"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Customers table
export const customers = pgTable("customers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  whatsapp: text("whatsapp").notNull().unique(),
  name: text("name").notNull(),
  email: text("email"),
  
  // Default address
  address: text("address").notNull(),
  number: text("number").notNull(),
  complement: text("complement"),
  neighborhood: text("neighborhood").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  reference: text("reference"),
  
  // Default payment method
  defaultPaymentMethod: text("default_payment_method").notNull().default("CASH"),
  
  // Statistics
  totalOrders: integer("total_orders").notNull().default(0),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).notNull().default("0"),
  lastOrderAt: timestamp("last_order_at"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Categories table
export const categories = pgTable("categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  
  establishmentId: text("establishment_id").notNull().references(() => establishments.id, { onDelete: "cascade" }),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Products table
export const products = pgTable("products", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image"),
  isActive: boolean("is_active").notNull().default(true),
  isAvailable: boolean("is_available").notNull().default(true),
  preparationTime: integer("preparation_time"),
  sortOrder: integer("sort_order").notNull().default(0),
  
  // Product options
  hasOptions: boolean("has_options").notNull().default(false),
  options: json("options").$type<{
    sizes?: Array<{ name: string; price: number }>;
    extras?: Array<{ name: string; price: number }>;
  }>(),
  
  categoryId: text("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  establishmentId: text("establishment_id").notNull().references(() => establishments.id, { onDelete: "cascade" }),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Orders table
export const orders = pgTable("orders", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderNumber: text("order_number").notNull().unique(),
  status: text("status").notNull().default("PENDING"),
  
  // Customer data at time of order
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  
  // Delivery address
  deliveryAddress: text("delivery_address").notNull(),
  deliveryNumber: text("delivery_number").notNull(),
  deliveryComplement: text("delivery_complement"),
  deliveryNeighborhood: text("delivery_neighborhood").notNull(),
  deliveryCity: text("delivery_city").notNull(),
  deliveryState: text("delivery_state").notNull(),
  deliveryZipCode: text("delivery_zip_code").notNull(),
  deliveryReference: text("delivery_reference"),
  
  // Financial
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  
  // Payment
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").notNull().default("PENDING"),
  
  // Additional info
  observations: text("observations"),
  estimatedTime: integer("estimated_time"),
  
  // Status timestamps
  confirmedAt: timestamp("confirmed_at"),
  preparingAt: timestamp("preparing_at"),
  readyAt: timestamp("ready_at"),
  deliveredAt: timestamp("delivered_at"),
  
  customerId: text("customer_id").notNull().references(() => customers.id),
  establishmentId: text("establishment_id").notNull().references(() => establishments.id),
  couponId: text("coupon_id").references(() => coupons.id),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  
  // Selected options at time of order
  selectedOptions: json("selected_options").$type<Record<string, any>>(),
  observations: text("observations"),
  
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull().references(() => products.id),
  
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Coupons table
export const coupons = pgTable("coupons", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: text("code").notNull().unique(),
  description: text("description"),
  type: text("type").notNull().default("PERCENTAGE"),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  minimumOrder: decimal("minimum_order", { precision: 10, scale: 2 }),
  maxDiscount: decimal("max_discount", { precision: 10, scale: 2 }),
  
  isActive: boolean("is_active").notNull().default(true),
  usageLimit: integer("usage_limit"),
  usageCount: integer("usage_count").notNull().default(0),
  
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  
  establishmentId: text("establishment_id").notNull().references(() => establishments.id, { onDelete: "cascade" }),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
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
    fields: [categories.establishmentId],
    references: [establishments.id]
  }),
  products: many(products)
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id]
  }),
  establishment: one(establishments, {
    fields: [products.establishmentId],
    references: [establishments.id]
  }),
  orderItems: many(orderItems)
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id]
  }),
  establishment: one(establishments, {
    fields: [orders.establishmentId],
    references: [establishments.id]
  }),
  coupon: one(coupons, {
    fields: [orders.couponId],
    references: [coupons.id]
  }),
  items: many(orderItems)
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id]
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id]
  })
}));

export const couponsRelations = relations(coupons, ({ one, many }) => ({
  establishment: one(establishments, {
    fields: [coupons.establishmentId],
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

// Legacy user table (keeping for compatibility)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
