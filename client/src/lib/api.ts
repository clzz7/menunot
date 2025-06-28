import { apiRequest } from "./queryClient";

export const api = {
  // Establishment
  establishment: {
    get: () => fetch("/api/establishment").then(res => res.json()),
    update: (id: string, data: any) => apiRequest("PUT", `/api/establishment/${id}`, data)
  },

  // Customers
  customers: {
    getByWhatsapp: (whatsapp: string) => 
      fetch(`/api/customer/${encodeURIComponent(whatsapp)}`).then(res => res.json()),
    create: (data: any) => apiRequest("POST", "/api/customers", data),
    getAll: () => fetch("/api/customers").then(res => res.json())
  },

  // Categories
  categories: {
    getAll: () => fetch("/api/categories").then(res => res.json()),
    create: (data: any) => apiRequest("POST", "/api/categories", data)
  },

  // Products
  products: {
    getAll: () => fetch("/api/products").then(res => res.json()),
    create: (data: any) => apiRequest("POST", "/api/products", data),
    update: (id: string, data: any) => apiRequest("PUT", `/api/products/${id}`, data)
  },

  // Orders
  orders: {
    getAll: () => fetch("/api/orders").then(res => res.json()),
    getByCustomer: (customerId: string) => 
      fetch(`/api/orders/customer/${customerId}`).then(res => res.json()),
    create: (data: any) => apiRequest("POST", "/api/orders", data),
    updateStatus: (id: string, status: string) => 
      apiRequest("PUT", `/api/orders/${id}/status`, { status })
  },

  // Coupons
  coupons: {
    getAll: () => fetch("/api/coupons").then(res => res.json()),
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
    getStats: () => fetch("/api/dashboard/stats").then(res => res.json())
  }
};
