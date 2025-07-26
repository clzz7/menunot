import { apiRequest } from "./queryClient.js";

export const api = {
  // Establishment
  establishment: {
    get: () => apiRequest("GET", "/api/establishment").then(res => res.json()),
    update: (id: string, data: any) => apiRequest("PUT", `/api/establishment/${id}`, data)
  },

  // Customers
  customers: {
    getByWhatsapp: (whatsapp: string) => 
      apiRequest("GET", `/api/customer/${encodeURIComponent(whatsapp)}`).then(res => res.json()),
    create: (data: any) => apiRequest("POST", "/api/customers", data),
    getAll: () => apiRequest("GET", "/api/customers").then(res => res.json())
  },

  // Categories
  categories: {
    getAll: () => apiRequest("GET", "/api/categories").then(res => res.json()),
    create: (data: any) => apiRequest("POST", "/api/categories", data)
  },

  // Products
  products: {
    getAll: () => apiRequest("GET", "/api/products").then(res => res.json()),
    create: (data: any) => apiRequest("POST", "/api/products", data),
    update: (id: string, data: any) => apiRequest("PUT", `/api/products/${id}`, data)
  },

  // Orders
  orders: {
    getAll: () => apiRequest("GET", "/api/orders").then(res => res.json()),
    getByCustomer: (customerId: string) => 
      apiRequest("GET", `/api/orders/customer/${customerId}`).then(res => res.json()),
    getItems: (orderId: string) => 
      apiRequest("GET", `/api/orders/${orderId}/items`).then(res => res.json()),
    create: (data: any) => apiRequest("POST", "/api/orders", data),
    updateStatus: (id: string, status: string) => 
      apiRequest("PUT", `/api/orders/${id}/status`, { status })
  },

  // Coupons
  coupons: {
    getAll: () => apiRequest("GET", "/api/coupons").then(res => res.json()),
    validate: async (code: string, customerPhone?: string) => {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code, customerPhone })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Cupom inválido");
      }
      return response.json();
    },
    create: (data: any) => apiRequest("POST", "/api/coupons", data),
    update: (id: string, data: any) => apiRequest("PUT", `/api/coupons/${id}`, data),
    delete: (id: string) => apiRequest("DELETE", `/api/coupons/${id}`)
  },

  // Dashboard
  dashboard: {
    getStats: () => apiRequest("GET", "/api/dashboard/stats").then(res => res.json())
  },

  // MercadoPago
  mercadopago: {
    getPublicKey: () => apiRequest("GET", "/api/mercadopago/public-key").then(res => res.json()),
    getConfig: () => apiRequest("GET", "/api/mercadopago/config").then(res => res.json()),
    createPreference: (data: any) => apiRequest("POST", "/api/mercadopago/create-preference", data),
    createPix: (data: any) => apiRequest("POST", "/api/mercadopago/create-pix", data),
    createCardPayment: (data: any) => apiRequest("POST", "/api/mercadopago/create-card-payment", data),
    getPaymentStatus: (paymentId: string) => apiRequest("GET", `/api/mercadopago/payment/${paymentId}`).then(res => res.json())
  }
};
