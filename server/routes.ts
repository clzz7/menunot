import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
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

  app.post("/api/products", async (req, res) => {
    try {
      const product = await storage.createProduct(req.body as any);
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

  // Coupons
  app.get("/api/coupons", async (req, res) => {
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
  });

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

  app.post("/api/coupons", async (req, res) => {
    try {
      const establishment = await storage.getEstablishment();
      if (!establishment) {
        return res.status(404).json({ error: "Establishment not found" });
      }

      const validatedData = insertCouponSchema.parse({
        ...req.body,
        establishmentId: establishment.id
      });
      const coupon = await storage.createCoupon(validatedData);
      res.status(201).json(coupon);
    } catch (error) {
      console.error("Error creating coupon:", error);
      res.status(400).json({ error: "Invalid coupon data" });
    }
  });

  app.put("/api/coupons/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateCoupon(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating coupon:", error);
      res.status(500).json({ error: "Failed to update coupon" });
    }
  });

  app.delete("/api/coupons/:id", async (req, res) => {
    try {
      const { id } = req.params;
      // Note: We don't have a delete method in storage, so we'll mark as inactive
      const updated = await storage.updateCoupon(id, { isActive: false });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting coupon:", error);
      res.status(500).json({ error: "Failed to delete coupon" });
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
      
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? `https://${req.get('host')}`
        : `http://${req.get('host')}`;

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
        notification_url: `${baseUrl}/api/mercadopago/webhook`
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
      console.log('=== DADOS RECEBIDOS PARA PIX ===');
      console.log('Body completo:', JSON.stringify(req.body, null, 2));

      const { orderId, amount, payer, description } = req.body;

      // Validar dados obrigatórios
      if (!orderId) {
        return res.status(400).json({ error: "Order ID é obrigatório" });
      }

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Valor deve ser maior que zero" });
      }

      if (!payer?.email) {
        return res.status(400).json({ error: "Email do pagador é obrigatório" });
      }

      if (!payer?.name) {
        return res.status(400).json({ error: "Nome do pagador é obrigatório" });
      }

      const pixPaymentData = {
        orderId,
        amount: Number(amount),
        payer: {
          name: payer.name,
          email: payer.email,
          phone: payer.phone || '+5511999999999',
          identification: {
            type: 'CPF',
            number: '11144477735' // CPF válido padrão para testes
          }
        },
        description: description || `Pedido PIX #${orderId}`
      };

      console.log('=== DADOS PROCESSADOS PARA PIX ===');
      console.log('pixPaymentData:', JSON.stringify(pixPaymentData, null, 2));
      
      const pixPayment = await mercadoPagoService.createPixPayment(pixPaymentData);
      
      console.log('=== RESPOSTA PIX DO MERCADO PAGO ===');
      console.log('PIX payment result:', JSON.stringify(pixPayment, null, 2));
      
      res.json(pixPayment);
    } catch (error) {
      console.error("=== ERRO NO PAGAMENTO PIX ===");
      console.error("Error creating PIX payment:", error);
      
      // Log mais detalhado do erro
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      
      res.status(500).json({ 
        error: "Failed to create PIX payment",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });

  app.get("/api/mercadopago/payment/:paymentId", async (req, res) => {
    try {
      const { paymentId } = req.params;
      const payment = await mercadoPagoService.getPayment(paymentId);
      res.json(payment);
    } catch (error) {
      console.error("Error fetching payment:", error);
      res.status(500).json({ error: "Failed to fetch payment status" });
    }
  });

  app.post("/api/mercadopago/webhook", async (req, res) => {
    try {
      const webhookData = await mercadoPagoService.processWebhook(req.body);
      
      if (webhookData && webhookData.externalReference) {
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
          
          // Broadcast status update
          broadcast({
            type: 'ORDER_STATUS_UPDATE',
            orderId: order.id,
            status: orderStatus,
            timestamp: new Date()
          });
        }
      }
      
      res.status(200).send('OK');
    } catch (error) {
      console.error("Error processing MercadoPago webhook:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });

  return httpServer;
}
