// Módulos externos inexistentes no compile-time

declare module "@/types.js" {
  export type Cart = any;
  export type CartItem = any;
  export type CustomerData = any;
  export type WebSocketMessage = any;
}

declare module "@/lib/status-utils" {
  export function getStatusInfo(status: string): any;
  export function getStatusColor(status: string): any;
}

// Ajustes de tipos camelCase para corresponder às propriedades usadas no front-end

declare module "@shared/schema" {
  interface Customer {
    lastOrderAt?: Date | null;
    totalOrders: number;
    totalSpent: number;
    defaultPaymentMethod?: string;
    zipCode?: string;
    reference?: string | null;
  }
  interface Product {
    categoryId: string;
    preparationTime?: string | null;
    isActive: boolean;
    isAvailable?: boolean;
  }
  interface Order {
    orderNumber: string;
    createdAt: Date;
    estimatedTime?: number;
    paymentMethod?: string;
    deliveryType?: string;
    deliveryAddress?: string;
    customerName?: string;
    customerPhone?: string;
  }
}