import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketManager } from "./websocket";
import { storage } from "./storage";
import { z } from "zod";
import { mercadoPagoService } from "./mercadopago";
import {
  insertCustomerSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertCouponSchema,
  insertProductSchema,
  insertCategorySchema
} from "@shared/schema";
import { 
  loginSchema, 
  generateToken, 
  hashPassword, 
  verifyPassword, 
  requireAuth,
  requireAdmin,
  validateLoginData,
  validateUserCreation,
  type AuthRequest 
} from "./auth";
import { config } from "./config";
import {
  loginRateLimit,
  adminRateLimit,
  logSecurityEvent,
  detectBruteForceLogin,
  securityLogger
} from "./security";

export function registerRoutes(app: Express): Promise<Server> {
  const server = createServer(app);
  
  // Inicializar WebSocket Manager com path específico
  const wsManager = new WebSocketManager(server);
  
  // Função para broadcast (mantém compatibilidade)
  function broadcast(message: any) {
    wsManager.broadcast(message);
  }

  // Rota para estatísticas do WebSocket
  app.get("/api/ws/stats", requireAuth, (req, res) => {
    res.json(wsManager.getStats());
  });

  // ==================== ROTAS DE AUTENTICAÇÃO ====================
  
  // Login com validação de força bruta específica
  app.post("/api/auth/login", 
    loginRateLimit,
    detectBruteForceLogin, // Usar o middleware específico para login
    logSecurityEvent('LOGIN_ATTEMPT'),
    async (req, res) => {
      try {
        // Validar dados de entrada
        const validation = validateLoginData(req.body);
        if (!validation.isValid) {
          securityLogger.log(req, 'LOGIN_VALIDATION_FAILED', false, undefined, {
            errors: validation.errors
          });
          return res.status(400).json({ 
            error: "Dados inválidos",
            details: validation.errors 
          });
        }

        const { username, password } = req.body;
        
        // Buscar usuário
        const user = await storage.getUserByUsername(username);
        if (!user) {
          securityLogger.log(req, 'LOGIN_USER_NOT_FOUND', false, username);
          return res.status(401).json({ error: "Credenciais inválidas" });
        }
        
        // Verificar senha
        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
          securityLogger.log(req, 'LOGIN_INVALID_PASSWORD', false, username);
          return res.status(401).json({ error: "Credenciais inválidas" });
        }
        
        // Gerar token
        const token = generateToken({ id: user.id, username: user.username });
        
        // Definir cookie HttpOnly com flags de segurança
        res.cookie('auth_token', token, {
          httpOnly: config.COOKIE_HTTP_ONLY,
          secure: config.COOKIE_SECURE,
          sameSite: config.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none',
          maxAge: 24 * 60 * 60 * 1000 // 24 horas
        });
        
        securityLogger.log(req, 'LOGIN_SUCCESS', true, username);
        
        // Notificar via WebSocket sobre login bem-sucedido
        broadcast({
          type: 'user_login',
          username: user.username,
          timestamp: new Date().toISOString()
        });
        
        res.json({
          success: true,
          user: {
            id: user.id,
            username: user.username
          }
        });
      } catch (error) {
        console.error("Error during login:", error);
        securityLogger.log(req, 'LOGIN_ERROR', false, undefined, { error: error.message });
        res.status(500).json({ error: "Erro interno do servidor" });
      }
    }
  );

  // Verificar token com logs
  app.get("/api/auth/verify", 
    logSecurityEvent('TOKEN_VERIFICATION'),
    requireAuth, 
    async (req: AuthRequest, res) => {
      res.json({
        success: true,
        user: req.user
      });
    }
  );

  // Logout com logs
  app.post("/api/auth/logout", 
    logSecurityEvent('LOGOUT'),
    (req, res) => {
      const token = req.cookies?.auth_token;
      
      if (token) {
        try {
          const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          securityLogger.log(req, 'LOGOUT_SUCCESS', true, decoded.username);
        } catch (error) {
          securityLogger.log(req, 'LOGOUT_INVALID_TOKEN', false);
        }
      }
      
      // Limpar o cookie de autenticação
      res.clearCookie('auth_token', {
        httpOnly: config.COOKIE_HTTP_ONLY,
        secure: config.COOKIE_SECURE,
        sameSite: config.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none'
      });
      
      res.json({ success: true, message: "Logout realizado com sucesso" });
    }
  );

  // Criar usuário admin com validação de senha forte
  app.post("/api/auth/setup", 
    loginRateLimit,
    logSecurityEvent('ADMIN_SETUP'),
    async (req, res) => {
      try {
        // Verificar se já existe algum usuário
        const existingUser = await storage.getUserByUsername("admin");
        if (existingUser) {
          securityLogger.log(req, 'ADMIN_SETUP_ALREADY_EXISTS', false);
          return res.status(400).json({ error: "Sistema já foi configurado" });
        }

        // Validar dados com senha forte
        const validation = validateUserCreation(req.body);
        if (!validation.isValid) {
          securityLogger.log(req, 'ADMIN_SETUP_VALIDATION_FAILED', false, undefined, {
            errors: validation.errors
          });
          return res.status(400).json({ 
            error: "Dados inválidos",
            details: validation.errors 
          });
        }

        const { username, password } = req.body;
        
        // Hash da senha
        const hashedPassword = await hashPassword(password);
        
        // Criar usuário
        const user = await storage.createUser({
          username,
          password: hashedPassword
        });
        
        securityLogger.log(req, 'ADMIN_SETUP_SUCCESS', true, username);
        
        res.status(201).json({
          success: true,
          message: "Usuário admin criado com sucesso",
          user: {
            id: user.id,
            username: user.username
          }
        });
      } catch (error) {
        console.error("Error creating admin user:", error);
        securityLogger.log(req, 'ADMIN_SETUP_ERROR', false, undefined, { error: error.message });
        res.status(500).json({ error: "Erro interno do servidor" });
      }
    }
  );

  // ==================== ROTAS DE SEGURANÇA ====================

  // Endpoint para visualizar logs de segurança (apenas admin)
  app.get("/api/security/logs", 
    adminRateLimit,
    requireAdmin,
    logSecurityEvent('SECURITY_LOGS_ACCESS'),
    async (req: AuthRequest, res) => {
      try {
        const limit = parseInt(req.query.limit as string) || 50;
        const logs = securityLogger.getRecentLogs(limit);
        
        res.json({
          success: true,
          logs,
          total: logs.length
        });
      } catch (error) {
        console.error("Error fetching security logs:", error);
        res.status(500).json({ error: "Erro ao buscar logs de segurança" });
      }
    }
  );

  // Endpoint para atividade suspeita
  app.get("/api/security/suspicious", 
    adminRateLimit,
    requireAdmin,
    logSecurityEvent('SUSPICIOUS_ACTIVITY_CHECK'),
    async (req: AuthRequest, res) => {
      try {
        const suspicious = securityLogger.getSuspiciousActivity();
        
        res.json({
          success: true,
          suspicious,
          count: suspicious.length
        });
      } catch (error) {
        console.error("Error fetching suspicious activity:", error);
        res.status(500).json({ error: "Erro ao buscar atividade suspeita" });
      }
    }
  );

  // Endpoint para tentativas de login falhadas
  app.get("/api/security/failed-logins", 
    adminRateLimit,
    requireAdmin,
    logSecurityEvent('FAILED_LOGINS_CHECK'),
    async (req: AuthRequest, res) => {
      try {
        const timeWindow = parseInt(req.query.window as string) || 60 * 60 * 1000; // 1 hora
        const failedLogins = securityLogger.getFailedLoginAttempts(timeWindow);
        
        res.json({
          success: true,
          failedLogins,
          count: failedLogins.length,
          timeWindow
        });
      } catch (error) {
        console.error("Error fetching failed logins:", error);
        res.status(500).json({ error: "Erro ao buscar tentativas de login falhadas" });
      }
    }
  );

  // ==================== ROTAS PROTEGIDAS COM RATE LIMITING ====================

  // Dashboard statistics (PROTEGIDA)
  app.get("/api/dashboard/stats", 
    adminRateLimit,
    requireAdmin,
    logSecurityEvent('DASHBOARD_STATS_ACCESS'),
    async (req: AuthRequest, res) => {
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
    }
  );

  // Orders management (PROTEGIDAS)
  app.get("/api/orders", 
    adminRateLimit,
    requireAdmin,
    logSecurityEvent('ORDERS_ACCESS'),
    async (req: AuthRequest, res) => {
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
    }
  );

  app.put("/api/orders/:id/status", 
    adminRateLimit,
    requireAdmin,
    logSecurityEvent('ORDER_STATUS_UPDATE'),
    async (req: AuthRequest, res) => {
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
    }
  );

  // Products management (PROTEGIDAS)
  app.post("/api/products", 
    adminRateLimit,
    requireAdmin,
    logSecurityEvent('PRODUCT_CREATE'),
    async (req: AuthRequest, res) => {
      try {
        const establishment = await storage.getEstablishment();
        if (!establishment) {
          return res.status(404).json({ error: "Establishment not found" });
        }

        const productData = {
          ...req.body,
          id: req.body.id || `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          establishment_id: establishment.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const validatedData = insertProductSchema.parse(productData);
        const product = await storage.createProduct(validatedData);
        res.status(201).json(product);
      } catch (error) {
        console.error("Error creating product:", error);
        res.status(400).json({ error: "Invalid product data" });
      }
    }
  );

  app.put("/api/products/:id", 
    adminRateLimit,
    requireAdmin,
    logSecurityEvent('PRODUCT_UPDATE'),
    async (req: AuthRequest, res) => {
      try {
        const { id } = req.params;
        const updated = await storage.updateProduct(id, req.body);
        res.json(updated);
      } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Failed to update product" });
      }
    }
  );

  // DELETE product (PROTEGIDA)
  app.delete("/api/products/:id", 
    adminRateLimit,
    requireAdmin,
    logSecurityEvent('PRODUCT_DELETE'),
    async (req: AuthRequest, res) => {
      try {
        const { id } = req.params;
        await storage.deleteProduct(id);
        res.json({ success: true, message: "Product deleted successfully" });
      } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Failed to delete product" });
      }
    }
  );

  // Categories management (PROTEGIDAS)
  app.post("/api/categories", 
    adminRateLimit,
    requireAdmin,
    logSecurityEvent('CATEGORY_CREATE'),
    async (req: AuthRequest, res) => {
      try {
        const validatedData = insertCategorySchema.parse(req.body);
        const category = await storage.createCategory(validatedData);
        res.status(201).json(category);
      } catch (error) {
        console.error("Error creating category:", error);
        res.status(400).json({ error: "Invalid category data" });
      }
    }
  );

  // UPDATE category (PROTEGIDA)
  app.put("/api/categories/:id", 
    adminRateLimit,
    requireAdmin,
    logSecurityEvent('CATEGORY_UPDATE'),
    async (req: AuthRequest, res) => {
      try {
        const { id } = req.params;
        const updated = await storage.updateCategory(id, req.body);
        res.json(updated);
      } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ error: "Failed to update category" });
      }
    }
  );

  // DELETE category (PROTEGIDA)
  app.delete("/api/categories/:id", 
    adminRateLimit,
    requireAdmin,
    logSecurityEvent('CATEGORY_DELETE'),
    async (req: AuthRequest, res) => {
      try {
        const { id } = req.params;
        await storage.deleteCategory(id);
        res.json({ success: true, message: "Category deleted successfully" });
      } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ error: "Failed to delete category" });
      }
    }
  );

  // Coupons management (PROTEGIDAS)
  app.get("/api/coupons", 
    adminRateLimit,
    requireAdmin,
    logSecurityEvent('COUPONS_ACCESS'),
    async (req: AuthRequest, res) => {
      try {
        const establishment = await storage.getEstablishment();
        if (!establishment) {
          return res.status(404).json({ error: "Establishment not found" });
        }
        
        const coupons = await storage.getCoupons(establishment.id);
        res.json(coupons);
      } catch (error) {
        console.error("Error fetching coupons:", error);
        res.status(500).json({ error: "Failed to fetch coupons" });
      }
    }
  );

  app.post("/api/coupons", 
    adminRateLimit,
    requireAdmin,
    logSecurityEvent('COUPON_CREATE'),
    async (req: AuthRequest, res) => {
      try {
        const establishment = await storage.getEstablishment();
        if (!establishment) {
          return res.status(404).json({ error: "Establishment not found" });
        }

        // Transform data to match database schema
        const couponData = {
          id: req.body.id || `coupon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          code: req.body.code?.toUpperCase(),
          name: req.body.name,
          description: req.body.description,
          establishment_id: establishment.id,
          type: req.body.type || 'percentage',
          value: Number(req.body.value) || 0,
          minimum_order: Number(req.body.minimumOrder) || 0,
          maximum_discount: req.body.maxDiscount ? Number(req.body.maxDiscount) : null,
          usage_limit: req.body.usageLimit ? Number(req.body.usageLimit) : null,
          usage_count: 0,
          valid_from: new Date(req.body.validFrom),
          valid_until: req.body.validUntil ? new Date(req.body.validUntil) : null,
          is_active: req.body.isActive !== false,
          free_delivery: req.body.freeDelivery === true || req.body.free_delivery === true
        };

        const validatedData = insertCouponSchema.parse(couponData);
        const coupon = await storage.createCoupon(validatedData);
        res.status(201).json(coupon);
      } catch (error) {
        console.error("Error creating coupon:", error);
        res.status(400).json({ error: "Invalid coupon data" });
      }
    }
  );

  app.put("/api/coupons/:id", 
    adminRateLimit,
    requireAdmin,
    logSecurityEvent('COUPON_UPDATE'),
    async (req: AuthRequest, res) => {
      try {
        const { id } = req.params;
        const updated = await storage.updateCoupon(id, req.body);
        res.json(updated);
      } catch (error) {
        console.error("Error updating coupon:", error);
        res.status(500).json({ error: "Failed to update coupon" });
      }
    }
  );

  app.delete("/api/coupons/:id", 
    adminRateLimit,
    requireAdmin,
    logSecurityEvent('COUPON_DELETE'),
    async (req: AuthRequest, res) => {
      try {
        const { id } = req.params;
        // Note: We don't have a delete method in storage, so we'll mark as inactive
        const updated = await storage.updateCoupon(id, { isActive: false });
        res.json({ success: true });
      } catch (error) {
        console.error("Error deleting coupon:", error);
        res.status(500).json({ error: "Failed to delete coupon" });
      }
    }
  );

  // Customers management (PROTEGIDA)
  app.get("/api/customers", 
    adminRateLimit,
    requireAdmin,
    logSecurityEvent('CUSTOMERS_ACCESS'),
    async (req: AuthRequest, res) => {
      try {
        const customers = await storage.getCustomers();
        res.json(customers);
      } catch (error) {
        console.error("Error fetching customers:", error);
        res.status(500).json({ error: "Failed to fetch customers" });
      }
    }
  );

  // Establishment management (PROTEGIDA)
  app.put("/api/establishment/:id", 
    adminRateLimit,
    requireAdmin,
    logSecurityEvent('ESTABLISHMENT_UPDATE'),
    async (req: AuthRequest, res) => {
      try {
        const { id } = req.params;
        const updated = await storage.updateEstablishment(id, req.body);
        res.json(updated);
      } catch (error) {
        console.error("Error updating establishment:", error);
        res.status(500).json({ error: "Failed to update establishment" });
      }
    }
  );

  // ==================== ROTAS PÚBLICAS ====================

  // Establishments (público - para clientes)
  app.get("/api/establishment", async (req, res) => {
    try {
      const establishment = await storage.getEstablishment();
      if (!establishment) {
        // Create default establishment if none exists
        const defaultEstablishment = await storage.createEstablishment({
          id: "est_1",
          name: "Bella Pasta",
          description: "Italiana Autêntica",
          phone: "(11) 99999-9999",
          address: "Rua das Flores, 123 - Centro",
          delivery_fee: 5.00,
          minimum_order: 20.00,
          delivery_time: "30-45 min",
          is_open: true,
          opening_hours: "18:00-23:00",
          payment_methods: "PIX,Cartão,Dinheiro",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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
          { 
            id: "cat_1",
            name: "Pizzas", 
            description: "Pizzas artesanais", 
            establishment_id: establishment.id, 
            sort_order: 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          { 
            id: "cat_2",
            name: "Massas", 
            description: "Massas frescas", 
            establishment_id: establishment.id, 
            sort_order: 2,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          { 
            id: "cat_3",
            name: "Saladas", 
            description: "Saladas frescas", 
            establishment_id: establishment.id, 
            sort_order: 3,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          { 
            id: "cat_4",
            name: "Bebidas", 
            description: "Bebidas geladas", 
            establishment_id: establishment.id, 
            sort_order: 4,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
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
              id: "prod_1",
              name: "Pizza Margherita",
              description: "Molho de tomate, mozzarella fresca, manjericão e azeite extra virgem",
              price: 32.90,
              image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
              category_id: pizzaCategory.id,
              establishment_id: establishment.id,
              preparation_time: "25 min",
              is_active: true,
              sort_order: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: "prod_2",
              name: "Pizza Pepperoni",
              description: "Molho de tomate, mozzarella, pepperoni e orégano",
              price: 38.90,
              image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
              category_id: pizzaCategory.id,
              establishment_id: establishment.id,
              preparation_time: "25 min",
              is_active: true,
              sort_order: 2,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: "prod_3",
              name: "Spaghetti Carbonara",
              description: "Spaghetti al dente com molho cremoso, bacon, ovos e parmesão",
              price: 28.90,
              image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
              category_id: pastaCategory.id,
              establishment_id: establishment.id,
              preparation_time: "15 min",
              is_active: true,
              sort_order: 3,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: "prod_4",
              name: "Lasanha Bolonhesa",
              description: "Camadas de massa, molho bolonhesa, bechamel e queijo gratinado",
              price: 34.90,
              image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
              category_id: pastaCategory.id,
              establishment_id: establishment.id,
              preparation_time: "30 min",
              is_active: true,
              sort_order: 4,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: "prod_5",
              name: "Coca-Cola 350ml",
              description: "Refrigerante gelado tradicional",
              price: 5.90,
              image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
              category_id: drinkCategory.id,
              establishment_id: establishment.id,
              preparation_time: "0 min",
              is_active: true,
              sort_order: 5,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
          
          for (const product of defaultProducts) {
            await storage.createProduct({ ...product, options: null });
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



  // Orders (públicas para clientes)

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

  app.get("/api/orders/:orderId/items", async (req, res) => {
    try {
      const { orderId } = req.params;
      const items = await storage.getOrderItems(orderId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching order items:", error);
      res.status(500).json({ error: "Failed to fetch order items" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const { order, items } = req.body;
      console.log("Order data received:", JSON.stringify(order, null, 2));
      console.log("Items data received:", JSON.stringify(items, null, 2));
      
      // Get the establishment ID from database
      const establishment = await storage.getEstablishment();
      if (!establishment) {
        return res.status(404).json({ error: "Establishment not found" });
      }
      
      // Generate order number
      const orderNumber = await storage.generateOrderNumber();
      
      // Generate unique order ID
      const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Map frontend camelCase to database snake_case
      const orderData = { 
        id: orderId,
        order_number: orderNumber,
        customer_id: order.customerId,
        establishment_id: establishment.id,
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        customer_email: order.customerEmail || null,
        customer_address: order.deliveryAddress || order.customerAddress,
        customer_complement: order.deliveryComplement || order.customerComplement || null,
        customer_neighborhood: order.deliveryNeighborhood || order.customerNeighborhood,
        customer_city: order.deliveryCity || order.customerCity,
        customer_state: order.deliveryState || order.customerState,
        customer_zip_code: order.deliveryZipCode || order.customerZipCode,
        subtotal: parseFloat(order.subtotal),
        delivery_fee: parseFloat(order.deliveryFee || '0'),
        discount_amount: parseFloat(order.discount || '0'),
        coupon_code: order.couponCode || null,
        total: parseFloat(order.total),
        payment_method: order.paymentMethod || 'PIX',
        payment_status: 'pending',
        status: 'PENDING',
        observations: order.observations || null,
        estimated_delivery_time: order.estimatedTime ? `${order.estimatedTime} minutos` : null,
        mercadopago_payment_id: null,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Remove undefined fields and ensure proper types
      const cleanOrderData = Object.fromEntries(
        Object.entries(orderData).filter(([_, v]) => v !== undefined)
      );
      
      const createdOrder = await storage.createOrder(orderData as any);
      
      // Create order items
      for (const item of items) {
        const itemId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Get product details to fill in missing data
        const product = await storage.getProduct(item.productId);
        
        const itemData = { 
          id: itemId,
          order_id: createdOrder.id,
          product_id: item.productId,
          quantity: item.quantity,
          product_name: product?.name || 'Produto',
          product_price: parseFloat(item.unitPrice),
          product_description: product?.description || null,
          unit_price: parseFloat(item.unitPrice),
          subtotal: parseFloat(item.totalPrice),
          total_price: parseFloat(item.totalPrice),
          selected_options: item.selectedOptions || null,
          observations: item.observations || null,
          created_at: new Date()
        };
        
        await storage.createOrderItem(itemData as any);
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



  app.get("/api/orders/:id/items", async (req, res) => {
    try {
      const { id } = req.params;
      const items = await storage.getOrderItems(id);
      res.json(items);
    } catch (error) {
      console.error("Error fetching order items:", error);
      res.status(500).json({ error: "Failed to fetch order items" });
    }
  });

  // Check payment status and update order
  app.post("/api/orders/:id/check-payment", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (!order.mercadopago_payment_id) {
        return res.status(400).json({ error: "No payment ID found for this order" });
      }

      // Check payment status on MercadoPago
      const paymentStatus = await mercadoPagoService.checkPaymentStatus(order.mercadopago_payment_id);
      
      if (paymentStatus.status === 'approved') {
        // Payment is approved, update order status to PREPARING
        const updatedOrder = await storage.updateOrderStatus(order.id, 'PREPARING');
        
        // Broadcast order update to admin clients
        broadcast({
          type: 'ORDER_UPDATED',
          data: updatedOrder
        });
        
        res.json({ 
          success: true, 
          message: 'Pagamento confirmado! Seu pedido está sendo preparado.',
          order: updatedOrder,
          paymentStatus: paymentStatus
        });
      } else if (paymentStatus.status === 'pending') {
        res.json({ 
          success: false, 
          message: 'Pagamento ainda está pendente. Aguarde alguns minutos e tente novamente.',
          paymentStatus: paymentStatus
        });
      } else {
        res.json({ 
          success: false, 
          message: 'Pagamento não foi aprovado. Verifique os dados e tente novamente.',
          paymentStatus: paymentStatus
        });
      }
    } catch (error) {
      console.error("Error checking payment:", error);
      res.status(500).json({ error: "Failed to check payment status" });
    }
  });

  // Coupons (públicas para validação)

  app.post("/api/coupons/validate", async (req, res) => {
    try {
      const { code, customerPhone } = req.body;
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
      
      // Special validation for first-time customer coupons
      if (coupon.code === "PRIMEIRACOMPRA" && customerPhone) {
        const customer = await storage.getCustomerByWhatsapp(customerPhone);
        if (customer && customer.totalOrders > 0) {
          return res.status(400).json({ error: "Este cupom é válido apenas para primeira compra" });
        }
      }
      
      res.json(coupon);
    } catch (error) {
      console.error("Error validating coupon:", error);
      res.status(500).json({ error: "Failed to validate coupon" });
    }
  });





  // MercadoPago routes
  app.get("/api/mercadopago/public-key", (req, res) => {
    res.json({ publicKey: process.env.MERCADOPAGO_PUBLIC_KEY });
  });

  // Rota para obter configuração do Mercado Pago
  app.get("/api/mercadopago/config", (req, res) => {
    res.json({ 
      publicKey: process.env.MERCADOPAGO_PUBLIC_KEY,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
    });
  });

  // Rota para criar pagamento com cartão (Checkout Transparente)
  app.post("/api/mercadopago/create-card-payment", async (req, res) => {
    try {
      console.log('=== DADOS RECEBIDOS PARA PAGAMENTO ===');
      console.log('Body completo:', JSON.stringify(req.body, null, 2));

      // Validar dados obrigatórios
      const { orderId, amount, token, payer, installments, payment_method_id } = req.body;

      if (!orderId) {
        return res.status(400).json({ error: "Order ID é obrigatório" });
      }

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Valor deve ser maior que zero" });
      }

      if (!token) {
        return res.status(400).json({ error: "Token do cartão é obrigatório" });
      }

      if (!payer?.email) {
        return res.status(400).json({ error: "Email do pagador é obrigatório" });
      }

      if (!payer?.first_name) {
        return res.status(400).json({ error: "Nome do pagador é obrigatório" });
      }

      if (!payer?.identification?.number) {
        return res.status(400).json({ error: "CPF/CNPJ é obrigatório" });
      }

      const cardPaymentData = {
        orderId,
        amount: Number(amount),
        token,
        description: req.body.description || `Pedido #${orderId}`,
        payer: {
          email: payer.email,
          first_name: payer.first_name,
          last_name: payer.last_name || '',
          identification: {
            type: payer.identification.type || 'CPF',
            number: payer.identification.number.replace(/\D/g, '') // Remove formatação
          }
        },
        installments: Number(installments) || 1,
        payment_method_id,
        issuer_id: req.body.issuer_id
      };

      console.log('=== DADOS PROCESSADOS PARA MERCADO PAGO ===');
      console.log('cardPaymentData:', JSON.stringify(cardPaymentData, null, 2));

      const payment = await mercadoPagoService.createCardPayment(cardPaymentData);
      
      console.log('=== RESPOSTA DO MERCADO PAGO ===');
      console.log('payment result:', JSON.stringify(payment, null, 2));
      
      // Atualizar status do pedido baseado no resultado
      if (payment.status === 'approved') {
        await storage.updateOrderStatus(orderId, 'CONFIRMED');
        console.log(`✅ Pedido ${orderId} confirmado`);
      } else if (payment.status === 'rejected') {
        await storage.updateOrderStatus(orderId, 'CANCELLED');
        console.log(`❌ Pedido ${orderId} cancelado - motivo: ${payment.status_detail}`);
      } else {
        console.log(`⏳ Pedido ${orderId} com status: ${payment.status}`);
      }
      
      res.json(payment);
    } catch (error) {
      console.error("=== ERRO NO PAGAMENTO ===");
      console.error("Error creating card payment:", error);
      
      // Log mais detalhado do erro
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      
      res.status(500).json({ 
        error: "Failed to process card payment",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });

  app.post("/api/mercadopago/create-preference", async (req, res) => {
    try {
      const { orderId, items, payer } = req.body;
      
      const baseUrl = process.env.REPLIT_BASE_URL || 
        (process.env.NODE_ENV === 'production' 
          ? `https://${req.get('host')}`
          : `http://${req.get('host')}`);

      const paymentRequest = {
        orderId,
        items: items.map((item: any, index: number) => ({
          id: `item_${index}`,
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency_id: 'BRL'
        })),
        payer,
        back_urls: {
          success: `${baseUrl}/payment/success`,
          failure: `${baseUrl}/payment/failure`,
          pending: `${baseUrl}/payment/pending`
        },
        auto_return: 'approved' as const,
        external_reference: orderId,
        notification_url: process.env.WEBHOOK_URL || `${baseUrl}/api/webhook/mercadopago`
      };

      const preference = await mercadoPagoService.createPreference(paymentRequest);
      res.json({ preferenceId: preference.id, initPoint: preference.init_point });
    } catch (error) {
      console.error("Error creating MercadoPago preference:", error);
      res.status(500).json({ error: "Failed to create payment preference" });
    }
  });

  app.post("/api/mercadopago/create-pix", async (req, res) => {
    try {
      const { orderId, amount, payer, description } = req.body;
      
      try {
        // Try direct PIX payment first
        const pixPayment = await mercadoPagoService.createPixPayment({
          orderId,
          amount,
          payer,
          description
        });
        
        // Update order with payment ID and status
        if (pixPayment.id) {
          const order = await storage.getOrder(orderId);
          if (order) {
            await storage.updateOrderStatus(orderId, 'CONFIRMED');
            await storage.updateOrderPaymentId(orderId, pixPayment.id.toString());
            console.log(`=== PAYMENT ID SALVO ===`);
            console.log(`Order: ${orderId}, Payment ID: ${pixPayment.id}`);
          }
        }
        
        res.json(pixPayment);
      } catch (pixError: any) {
        console.error("Direct PIX payment failed, trying preference fallback:", pixError);
        
        // Fallback: Create preference with PIX only
        const preferenceData = {
          items: [{
            id: orderId,
            title: description,
            quantity: 1,
            unit_price: amount,
            currency_id: 'BRL'
          }],
          payer: {
            name: payer.name,
            email: payer.email,
            phone: {
              area_code: payer.phone.substring(0, 2),
              number: payer.phone.substring(2)
            }
          },
          payment_methods: {
            excluded_payment_types: [
              { id: "credit_card" },
              { id: "debit_card" },
              { id: "ticket" }
            ],
            installments: 1
          },
          back_urls: {
            success: `${req.protocol}://${req.get('host')}/payment/success`,
            failure: `${req.protocol}://${req.get('host')}/payment/failure`,
            pending: `${req.protocol}://${req.get('host')}/payment/pending`
          },
          auto_return: 'approved' as const,
          external_reference: orderId,
          notification_url: process.env.WEBHOOK_URL ? `${process.env.WEBHOOK_URL}/api/webhook/mercadopago` : `${req.protocol}://${req.get('host')}/api/webhook/mercadopago`
        };
        
        const preference = await mercadoPagoService.createPreference(preferenceData);
        
        // Return preference data in a format compatible with PIX modal
        res.json({
          id: preference.id,
          status: 'pending',
          init_point: preference.init_point,
          fallback_to_preference: true
        });
      }
    } catch (error) {
      console.error("Error creating PIX payment and fallback:", error);
      res.status(500).json({ error: "Failed to create PIX payment" });
    }
  });

  app.get("/api/mercadopago/payment/:paymentId", async (req, res) => {
    try {
      const { paymentId } = req.params;
      console.log(`🔍 Checking payment status for ID: ${paymentId}`);
      
      const payment = await mercadoPagoService.getPayment(paymentId);
      
      // Enhanced response with more useful information
      const enhancedResponse = {
        id: payment.id,
        status: payment.status,
        status_detail: payment.status_detail,
        transaction_amount: payment.transaction_amount,
        currency_id: payment.currency_id,
        date_created: payment.date_created,
        date_approved: payment.date_approved,
        date_last_updated: payment.date_last_updated,
        external_reference: payment.external_reference,
        payment_method_id: payment.payment_method_id,
        payment_type_id: payment.payment_type_id,
        last_check: new Date().toISOString()
      };
      
      console.log(`💳 Payment status response:`, {
        id: payment.id,
        status: payment.status,
        status_detail: payment.status_detail
      });
      
      res.json(enhancedResponse);
    } catch (error) {
      console.error("❌ Error fetching payment:", error);
      
      // More detailed error response
      let errorMessage = "Failed to fetch payment status";
      let errorCode = "PAYMENT_FETCH_ERROR";
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          errorMessage = "Payment not found";
          errorCode = "PAYMENT_NOT_FOUND";
        } else if (error.message.includes('401')) {
          errorMessage = "Authentication error";
          errorCode = "AUTH_ERROR";
        } else if (error.message.includes('timeout')) {
          errorMessage = "Request timeout";
          errorCode = "TIMEOUT_ERROR";
        }
      }
      
      res.status(500).json({ 
        error: errorMessage,
        code: errorCode,
        timestamp: new Date().toISOString(),
        paymentId: req.params.paymentId
      });
    }
  });

  // Webhook endpoint for MercadoPago notifications
  app.post("/api/webhook/mercadopago", async (req, res) => {
    try {
      console.log('=== WEBHOOK MERCADOPAGO RECEBIDO ===');
      console.log('Headers:', req.headers);
      console.log('Body:', JSON.stringify(req.body, null, 2));
      
      const webhookData = await mercadoPagoService.processWebhook(req.body);
      
      if (webhookData && webhookData.externalReference) {
        console.log('=== PROCESSANDO WEBHOOK ===');
        console.log('Payment ID:', webhookData.paymentId);
        console.log('Status:', webhookData.status);
        console.log('External Reference (Order ID):', webhookData.externalReference);
        
        // Update order payment status
        const order = await storage.getOrder(webhookData.externalReference);
        if (order) {
          let orderStatus = 'PENDING';
          if (webhookData.status === 'approved') {
            orderStatus = 'CONFIRMED';
          } else if (webhookData.status === 'rejected' || webhookData.status === 'cancelled') {
            orderStatus = 'CANCELLED';
          }
          
          await storage.updateOrderStatus(order.id, orderStatus);
          
          // Broadcast order status update
          broadcast({
            type: 'ORDER_STATUS_UPDATE',
            orderId: order.id,
            status: orderStatus,
            timestamp: new Date()
          });

          // Real-time payment status notification for PIX modal
          broadcast({
            type: 'PAYMENT_STATUS_UPDATE',
            paymentId: webhookData.paymentId,
            orderId: order.id,
            status: webhookData.status,
            transactionAmount: webhookData.transactionAmount,
            paymentMethodId: webhookData.paymentMethodId,
            timestamp: new Date()
          });

          console.log('🔄 Real-time notifications sent via WebSocket');
        }
      }
      
      res.status(200).send('OK');
    } catch (error) {
      console.error("Error processing MercadoPago webhook:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });

  return Promise.resolve(server);
}
