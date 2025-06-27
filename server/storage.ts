import { 
  establishments, 
  customers, 
  categories, 
  products, 
  orders, 
  orderItems, 
  coupons,
  type Establishment,
  type InsertEstablishment,
  type Customer,
  type InsertCustomer,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Coupon,
  type InsertCoupon
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Establishments
  getEstablishment(): Promise<Establishment | undefined>;
  createEstablishment(establishment: InsertEstablishment): Promise<Establishment>;
  updateEstablishment(id: string, data: Partial<InsertEstablishment>): Promise<Establishment>;
  
  // Customers
  getCustomerByWhatsapp(whatsapp: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, data: Partial<InsertCustomer>): Promise<Customer>;
  getCustomers(): Promise<Customer[]>;
  
  // Categories
  getCategories(establishmentId: string): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, data: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  
  // Products
  getProducts(establishmentId: string): Promise<Product[]>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  
  // Orders
  getOrders(establishmentId: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string, timestamp?: Date): Promise<Order>;
  generateOrderNumber(): Promise<string>;
  
  // Order Items
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  
  // Coupons
  getCoupons(establishmentId: string): Promise<Coupon[]>;
  getCouponByCode(code: string, establishmentId: string): Promise<Coupon | undefined>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: string, data: Partial<InsertCoupon>): Promise<Coupon>;
  incrementCouponUsage(id: string): Promise<void>;
  
  // Statistics
  getDashboardStats(establishmentId: string): Promise<{
    todayOrders: number;
    todayRevenue: number;
    totalCustomers: number;
    averageOrderValue: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Establishments
  async getEstablishment(): Promise<Establishment | undefined> {
    const [establishment] = await db.select().from(establishments).limit(1);
    return establishment || undefined;
  }

  async createEstablishment(establishment: InsertEstablishment): Promise<Establishment> {
    const [created] = await db
      .insert(establishments)
      .values(establishment)
      .returning();
    return created;
  }

  async updateEstablishment(id: string, data: Partial<InsertEstablishment>): Promise<Establishment> {
    const [updated] = await db
      .update(establishments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(establishments.id, id))
      .returning();
    return updated;
  }

  // Customers
  async getCustomerByWhatsapp(whatsapp: string): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.whatsapp, whatsapp));
    return customer || undefined;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [created] = await db
      .insert(customers)
      .values(customer)
      .returning();
    return created;
  }

  async updateCustomer(id: string, data: Partial<InsertCustomer>): Promise<Customer> {
    const [updated] = await db
      .update(customers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return updated;
  }

  async getCustomers(): Promise<Customer[]> {
    return await db
      .select()
      .from(customers)
      .orderBy(desc(customers.createdAt));
  }

  // Categories
  async getCategories(establishmentId: string): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(and(
        eq(categories.establishmentId, establishmentId),
        eq(categories.isActive, true)
      ))
      .orderBy(categories.sortOrder);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [created] = await db
      .insert(categories)
      .values(category)
      .returning();
    return created;
  }

  async updateCategory(id: string, data: Partial<InsertCategory>): Promise<Category> {
    const [updated] = await db
      .update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Products
  async getProducts(establishmentId: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(and(
        eq(products.establishmentId, establishmentId),
        eq(products.isActive, true)
      ))
      .orderBy(products.sortOrder);
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(and(
        eq(products.categoryId, categoryId),
        eq(products.isActive, true),
        eq(products.isAvailable, true)
      ))
      .orderBy(products.sortOrder);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db
      .insert(products)
      .values(product)
      .returning();
    return created;
  }

  async updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db
      .update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Orders
  async getOrders(establishmentId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.establishmentId, establishmentId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [created] = await db
      .insert(orders)
      .values(order)
      .returning();
    return created;
  }

  async updateOrderStatus(id: string, status: string, timestamp?: Date): Promise<Order> {
    const updateData: any = { status, updatedAt: new Date() };
    
    // Set appropriate timestamp based on status
    if (status === "CONFIRMED" && timestamp) updateData.confirmedAt = timestamp;
    if (status === "PREPARING" && timestamp) updateData.preparingAt = timestamp;
    if (status === "READY" && timestamp) updateData.readyAt = timestamp;
    if (status === "DELIVERED" && timestamp) updateData.deliveredAt = timestamp;

    const [updated] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  async generateOrderNumber(): Promise<string> {
    const count = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders);
    
    return String(10000 + (count[0]?.count || 0) + 1);
  }

  // Order Items
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [created] = await db
      .insert(orderItems)
      .values(item)
      .returning();
    return created;
  }

  // Coupons
  async getCoupons(establishmentId: string): Promise<Coupon[]> {
    return await db
      .select()
      .from(coupons)
      .where(and(
        eq(coupons.establishmentId, establishmentId),
        eq(coupons.isActive, true)
      ))
      .orderBy(desc(coupons.createdAt));
  }

  async getCouponByCode(code: string, establishmentId: string): Promise<Coupon | undefined> {
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(and(
        eq(coupons.code, code.toUpperCase()),
        eq(coupons.establishmentId, establishmentId),
        eq(coupons.isActive, true)
      ));
    return coupon || undefined;
  }

  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const [created] = await db
      .insert(coupons)
      .values(coupon)
      .returning();
    return created;
  }

  async updateCoupon(id: string, data: Partial<InsertCoupon>): Promise<Coupon> {
    const [updated] = await db
      .update(coupons)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(coupons.id, id))
      .returning();
    return updated;
  }

  async incrementCouponUsage(id: string): Promise<void> {
    await db
      .update(coupons)
      .set({ usageCount: sql`${coupons.usageCount} + 1` })
      .where(eq(coupons.id, id));
  }

  // Statistics
  async getDashboardStats(establishmentId: string): Promise<{
    todayOrders: number;
    todayRevenue: number;
    totalCustomers: number;
    averageOrderValue: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrdersResult = await db
      .select({ count: sql<number>`count(*)`, total: sql<number>`sum(${orders.total})` })
      .from(orders)
      .where(and(
        eq(orders.establishmentId, establishmentId),
        sql`${orders.createdAt} >= ${today}`
      ));

    const totalCustomersResult = await db
      .select({ count: sql<number>`count(distinct ${orders.customerId})` })
      .from(orders)
      .where(eq(orders.establishmentId, establishmentId));

    const averageOrderResult = await db
      .select({ avg: sql<number>`avg(${orders.total})` })
      .from(orders)
      .where(eq(orders.establishmentId, establishmentId));

    return {
      todayOrders: todayOrdersResult[0]?.count || 0,
      todayRevenue: Number(todayOrdersResult[0]?.total || 0),
      totalCustomers: totalCustomersResult[0]?.count || 0,
      averageOrderValue: Number(averageOrderResult[0]?.avg || 0)
    };
  }
}

export const storage = new DatabaseStorage();
