import { useState, useCallback } from "react";
import { Cart, CartItem } from "@/types";

const initialCart: Cart = {
  items: [],
  subtotal: 0,
  deliveryFee: 5.0,
  discount: 0,
  total: 0,
  itemCount: 0
};

export function useCart() {
  const [cart, setCart] = useState<Cart>(initialCart);

  const calculateTotals = useCallback((items: CartItem[], deliveryFee: number, discount: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal + deliveryFee - discount;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    
    return { subtotal, total, itemCount };
  }, []);

  const addToCart = useCallback((product: any, options?: Record<string, any>, observations?: string) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.items.findIndex(
        item => item.id === product.id && 
        JSON.stringify(item.selectedOptions) === JSON.stringify(options)
      );

      let newItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        newItems = [...prevCart.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + 1,
          total: (newItems[existingItemIndex].quantity + 1) * newItems[existingItemIndex].price
        };
      } else {
        const newItem: CartItem = {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: 1,
          total: Number(product.price),
          selectedOptions: options,
          observations
        };
        newItems = [...prevCart.items, newItem];
      }

      const totals = calculateTotals(newItems, prevCart.deliveryFee, prevCart.discount);
      
      return {
        ...prevCart,
        items: newItems,
        ...totals
      };
    });
  }, [calculateTotals]);

  const updateQuantity = useCallback((itemId: string, change: number, options?: Record<string, any>) => {
    setCart(prevCart => {
      const itemIndex = prevCart.items.findIndex(
        item => item.id === itemId && 
        JSON.stringify(item.selectedOptions) === JSON.stringify(options)
      );
      
      if (itemIndex === -1) return prevCart;

      const newItems = [...prevCart.items];
      const item = newItems[itemIndex];
      const newQuantity = item.quantity + change;

      if (newQuantity <= 0) {
        newItems.splice(itemIndex, 1);
      } else {
        newItems[itemIndex] = {
          ...item,
          quantity: newQuantity,
          total: newQuantity * item.price
        };
      }

      const totals = calculateTotals(newItems, prevCart.deliveryFee, prevCart.discount);
      
      return {
        ...prevCart,
        items: newItems,
        ...totals
      };
    });
  }, [calculateTotals]);

  const removeFromCart = useCallback((itemId: string, options?: Record<string, any>) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter(
        item => !(item.id === itemId && JSON.stringify(item.selectedOptions) === JSON.stringify(options))
      );

      const totals = calculateTotals(newItems, prevCart.deliveryFee, prevCart.discount);
      
      return {
        ...prevCart,
        items: newItems,
        ...totals
      };
    });
  }, [calculateTotals]);

  const applyDiscount = useCallback((discount: number, couponCode?: string) => {
    setCart(prevCart => {
      const totals = calculateTotals(prevCart.items, prevCart.deliveryFee, discount);
      
      return {
        ...prevCart,
        discount,
        couponCode,
        ...totals
      };
    });
  }, [calculateTotals]);

  const clearCart = useCallback(() => {
    setCart(initialCart);
  }, []);

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    applyDiscount,
    clearCart
  };
}
