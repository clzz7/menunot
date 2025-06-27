export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  selectedOptions?: Record<string, any>;
  observations?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  itemCount: number;
  couponCode?: string;
}

export interface CustomerData {
  whatsapp: string;
  name: string;
  email?: string;
  address: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  reference?: string;
  defaultPaymentMethod: string;
}

export interface OrderStatus {
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  timestamp?: Date;
}

export interface WebSocketMessage {
  type: 'NEW_ORDER' | 'ORDER_STATUS_UPDATE' | 'CONNECTION_STATUS';
  orderId?: string;
  order?: any;
  status?: string;
  timestamp?: Date;
}
