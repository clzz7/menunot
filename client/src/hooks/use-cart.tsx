import { useState, useCallback, createContext, useContext, ReactNode } from "react";
import { Cart, CartItem } from "@/types.js";

// ---------------------------------------------------------------
// Initial cart shape
// ---------------------------------------------------------------
const initialCart: Cart = {
  items: [],
  subtotal: 0,
  deliveryFee: 5.0,
  discount: 0,
  total: 0,
  itemCount: 0,
  freeDelivery: false,
};

// ---------------------------------------------------------------
// Context typings
// ---------------------------------------------------------------
interface CartContextValue {
  cart: Cart;
  addToCart: (product: any, options?: Record<string, any>, observations?: string) => void;
  updateQuantity: (
    itemId: string,
    change: number,
    options?: Record<string, any>
  ) => void;
  removeFromCart: (itemId: string, options?: Record<string, any>) => void;
  applyDiscount: (discount: number, couponCode?: string) => void;
  applyCoupon: (
    discount: number,
    couponCode?: string,
    freeDelivery?: boolean
  ) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

// ---------------------------------------------------------------
// Helper – totals calculator
// ---------------------------------------------------------------
const calculateTotals = (
  items: CartItem[],
  deliveryFee: number,
  discount: number
) => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal + deliveryFee - discount;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal, total, itemCount };
};

// ---------------------------------------------------------------
// Internal hook – performs all cart mutations
// ---------------------------------------------------------------
function useCartInternal(): CartContextValue {
  const [cart, setCart] = useState<Cart>(initialCart);

  /* ----------------------------- ADD ITEM ----------------------------- */
  const addToCart = useCallback(
    (product: any, options?: Record<string, any>, observations?: string) => {
      setCart((prevCart: Cart) => {
        const existingItemIndex = prevCart.items.findIndex(
          (item) =>
            item.id === product.id &&
            JSON.stringify(item.selectedOptions) === JSON.stringify(options)
        );

        let newItems: CartItem[];

        if (existingItemIndex >= 0) {
          // Increase quantity of the existing line item
          newItems = [...prevCart.items];
          const current = newItems[existingItemIndex];
          const nextQty = current.quantity + 1;
          newItems[existingItemIndex] = {
            ...current,
            quantity: nextQty,
            total: nextQty * current.price,
          };
        } else {
          const newItem: CartItem = {
            id: product.id,
            name: product.name,
            price: Number(product.price),
            quantity: 1,
            total: Number(product.price),
            image: product.image,
            description: product.description,
            selectedOptions: options,
            observations,
          };
          newItems = [...prevCart.items, newItem];
        }

        const totals = calculateTotals(
          newItems,
          prevCart.deliveryFee,
          prevCart.discount
        );

        return {
          ...prevCart,
          items: newItems,
          ...totals,
        } as Cart;
      });
    },
    []
  );

  /* --------------------------- UPDATE QUANTITY -------------------------- */
  const updateQuantity = useCallback(
    (itemId: string, change: number, options?: Record<string, any>) => {
      setCart((prevCart: Cart) => {
        const index = prevCart.items.findIndex(
          (item) =>
            item.id === itemId &&
            JSON.stringify(item.selectedOptions) === JSON.stringify(options)
        );
        if (index === -1) return prevCart;

        const newItems = [...prevCart.items];
        const current = newItems[index];
        const nextQty = current.quantity + change;

        if (nextQty <= 0) {
          newItems.splice(index, 1);
        } else {
          newItems[index] = {
            ...current,
            quantity: nextQty,
            total: nextQty * current.price,
          };
        }

        const totals = calculateTotals(
          newItems,
          prevCart.deliveryFee,
          prevCart.discount
        );

        return {
          ...prevCart,
          items: newItems,
          ...totals,
        } as Cart;
      });
    },
    []
  );

  /* ----------------------------- REMOVE ITEM ---------------------------- */
  const removeFromCart = useCallback(
    (itemId: string, options?: Record<string, any>) => {
      setCart((prevCart: Cart) => {
        const newItems = prevCart.items.filter(
          (item) =>
            !(
              item.id === itemId &&
              JSON.stringify(item.selectedOptions) === JSON.stringify(options)
            )
        );

        const totals = calculateTotals(
          newItems,
          prevCart.deliveryFee,
          prevCart.discount
        );

        return {
          ...prevCart,
          items: newItems,
          ...totals,
        } as Cart;
      });
    },
    []
  );

  /* ---------------------------- APPLY DISCOUNT --------------------------- */
  const applyDiscount = useCallback(
    (discount: number, couponCode?: string) => {
      setCart((prevCart: Cart) => {
        const totals = calculateTotals(
          prevCart.items,
          prevCart.deliveryFee,
          discount
        );

        return {
          ...prevCart,
          discount,
          couponCode,
          ...totals,
        } as Cart;
      });
    },
    []
  );

  /* ----------------------------- APPLY COUPON ---------------------------- */
  const applyCoupon = useCallback(
    (discount: number, couponCode?: string, freeDelivery?: boolean) => {
      setCart((prevCart: Cart) => {
        const deliveryFee = freeDelivery ? 0 : prevCart.deliveryFee;
        const totals = calculateTotals(prevCart.items, deliveryFee, discount);

        return {
          ...prevCart,
          discount,
          couponCode,
          deliveryFee,
          freeDelivery: !!freeDelivery,
          ...totals,
        } as Cart;
      });
    },
    []
  );

  /* ----------------------------- CLEAR CART ----------------------------- */
  const clearCart = useCallback(() => {
    setCart(initialCart);
  }, []);

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    applyDiscount,
    applyCoupon,
    clearCart,
  };
}

// ---------------------------------------------------------------
// Provider Wrapper
// ---------------------------------------------------------------
export function CartProvider({ children }: { children: ReactNode }) {
  const value = useCartInternal();
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ---------------------------------------------------------------
// Public Hook
// ---------------------------------------------------------------
export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}