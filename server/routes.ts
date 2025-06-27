import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertCustomerSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertCouponSchema,
  insertProductSchema,
  insertCategorySchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  // Broadcast function for real-time updates
  function broadcast(message: any) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // Establishments
  app.get("/api/establishment", async (req, res) => {
    try {
      const establishment = await storage.getEstablishment();
      if (!establishment) {
        // Create default establishment if none exists
        const defaultEstablishment = await storage.createEstablishment({
          name: "Bella Pasta",
          description: "Italiana Autêntica",
          phone: "(11) 99999-9999",
          address: "Rua das Flores, 123 - Centro",
          deliveryFee: "5.00",
          minimumOrder: "20.00",
          openingHours: {
            monday: { open: "18:00", close: "23:00" },
            tuesday: { open: "18:00", close: "23:00" },
            wednesday: { open: "18:00", close: "23:00" },
            thursday: { open: "18:00", close: "23:00" },
            friday: { open: "18:00", close: "23:30" },
            saturday: { open: "18:00", close: "23:30" },
            sunday: { open: "18:00", close: "22:00" }
          }
        });
        res.json(defaultEstablishment);
      } else {
        res.json(establishment);
      }
    } catch (error) {
      console.error("Error fetching establishment:", error);
      res.status(500).json({ error: "Failed to fetch establishment data" });
    }
  });

  app.put("/api/establishment/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateEstablishment(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating establishment:", error);
      res.status(500).json({ error: "Failed to update establishment" });
    }
  });

  // Customers
  app.get("/api/customer/:whatsapp", async (req, res) => {
    try {
      const { whatsapp } = req.params;
      const customer = await storage.getCustomerByWhatsapp(whatsapp);
      res.json(customer || null);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ error: "Failed to fetch customer data" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(400).json({ error: "Invalid customer data" });
    }
  });

  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const establishment = await storage.getEstablishment();
      if (!establishment) {
        return res.status(404).json({ error: "Establishment not found" });
      }
      
      let categories = await storage.getCategories(establishment.id);
      
      // Create default categories if none exist
      if (categories.length === 0) {
        const defaultCategories = [
          { name: "Pizzas", description: "Pizzas artesanais", establishmentId: establishment.id, sortOrder: 1 },
          { name: "Massas", description: "Massas frescas", establishmentId: establishment.id, sortOrder: 2 },
          { name: "Saladas", description: "Saladas frescas", establishmentId: establishment.id, sortOrder: 3 },
          { name: "Bebidas", description: "Bebidas geladas", establishmentId: establishment.id, sortOrder: 4 }
        ];
        
        for (const cat of defaultCategories) {
          await storage.createCategory(cat);
        }
        
        categories = await storage.getCategories(establishment.id);
      }
      
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(400).json({ error: "Invalid category data" });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const establishment = await storage.getEstablishment();
      if (!establishment) {
        return res.status(404).json({ error: "Establishment not found" });
      }
      
      let products = await storage.getProducts(establishment.id);
      
      // Create default products if none exist
      if (products.length === 0) {
        const categories = await storage.getCategories(establishment.id);
        const pizzaCategory = categories.find(c => c.name === "Pizzas");
        const pastaCategory = categories.find(c => c.name === "Massas");
        const drinkCategory = categories.find(c => c.name === "Bebidas");
        
        if (pizzaCategory && pastaCategory && drinkCategory) {
          const defaultProducts = [
            {
              name: "Pizza Margherita",
              description: "Molho de tomate, mozzarella fresca, manjericão e azeite extra virgem",
              price: "32.90",
              image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
              categoryId: pizzaCategory.id,
              establishmentId: establishment.id,
              preparationTime: 25
            },
            {
              name: "Pizza Pepperoni",
              description: "Molho de tomate, mozzarella, pepperoni e orégano",
              price: "38.90",
              image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
              categoryId: pizzaCategory.id,
              establishmentId: establishment.id,
              preparationTime: 25
            },
            {
              name: "Spaghetti Carbonara",
              description: "Spaghetti al dente com molho cremoso, bacon, ovos e parmesão",
              price: "28.90",
              image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
              categoryId: pastaCategory.id,
              establishmentId: establishment.id,
              preparationTime: 15
            },
            {
              name: "Lasanha Bolonhesa",
              description: "Camadas de massa, molho bolonhesa, bechamel e queijo gratinado",
              price: "34.90",
              image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
              categoryId: pastaCategory.id,
              establishmentId: establishment.id,
              preparationTime: 30
            },
            {
              name: "Coca-Cola 350ml",
              description: "Refrigerante gelado tradicional",
              price: "5.90",
              image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
              categoryId: drinkCategory.id,
              establishmentId: establishment.id,
              preparationTime: 0
            }
          ];
          
          for (const product of defaultProducts) {
            await storage.createProduct(product);
          }
          
          products = await storage.getProducts(establishment.id);
        }
      }
      
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ error: "Invalid product data" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateProduct(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    try {
      const establishment = await storage.getEstablishment();
      if (!establishment) {
        return res.status(404).json({ error: "Establishment not found" });
      }
      
      const orders = await storage.getOrders(establishment.id);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/customer/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      const orders = await storage.getOrdersByCustomer(customerId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      res.status(500).json({ error: "Failed to fetch customer orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const { order, items } = req.body;
      
      // Generate order number
      const orderNumber = await storage.generateOrderNumber();
      
      // Create order with generated number
      const orderData = { ...order, orderNumber };
      const validatedOrder = insertOrderSchema.parse(orderData);
      const createdOrder = await storage.createOrder(validatedOrder);
      
      // Create order items
      for (const item of items) {
        const itemData = { ...item, orderId: createdOrder.id };
        const validatedItem = insertOrderItemSchema.parse(itemData);
        await storage.createOrderItem(validatedItem);
      }
      
      // Update customer statistics
      const customer = await storage.getCustomerByWhatsapp(order.customerPhone);
      if (customer) {
        await storage.updateCustomer(customer.id, {
          totalOrders: customer.totalOrders + 1,
          totalSpent: String(Number(customer.totalSpent) + Number(order.total)),
          lastOrderAt: new Date()
        });
      }
      
      // Broadcast new order to admin clients
      broadcast({
        type: 'NEW_ORDER',
        order: createdOrder
      });
      
      res.status(201).json(createdOrder);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(400).json({ error: "Invalid order data" });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const updated = await storage.updateOrderStatus(id, status, new Date());
      
      // Broadcast status update
      broadcast({
        type: 'ORDER_STATUS_UPDATE',
        orderId: id,
        status,
        timestamp: new Date()
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // Coupons
  app.get("/api/coupons/validate/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const establishment = await storage.getEstablishment();
      
      if (!establishment) {
        return res.status(404).json({ error: "Establishment not found" });
      }
      
      const coupon = await storage.getCouponByCode(code, establishment.id);
      
      if (!coupon) {
        return res.status(404).json({ error: "Cupom não encontrado" });
      }
      
      // Check if coupon is still valid
      const now = new Date();
      if (now < coupon.validFrom || now > coupon.validUntil) {
        return res.status(400).json({ error: "Cupom expirado" });
      }
      
      // Check usage limit
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return res.status(400).json({ error: "Cupom esgotado" });
      }
      
      res.json(coupon);
    } catch (error) {
      console.error("Error validating coupon:", error);
      res.status(500).json({ error: "Failed to validate coupon" });
    }
  });

  app.post("/api/coupons", async (req, res) => {
    try {
      const validatedData = insertCouponSchema.parse(req.body);
      const coupon = await storage.createCoupon(validatedData);
      res.status(201).json(coupon);
    } catch (error) {
      console.error("Error creating coupon:", error);
      res.status(400).json({ error: "Invalid coupon data" });
    }
  });

  // Dashboard statistics
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const establishment = await storage.getEstablishment();
      if (!establishment) {
        return res.status(404).json({ error: "Establishment not found" });
      }
      
      const stats = await storage.getDashboardStats(establishment.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard statistics" });
    }
  });

  return httpServer;
}
