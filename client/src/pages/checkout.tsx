import { useState } from "react";
import { useCart } from "@/hooks/use-cart.js";
import { useToast } from "@/hooks/use-toast.js";
import { CheckoutModal } from "@/components/checkout-modal.js";
import { OrderTrackingModal } from "@/components/order-tracking-modal.js";
import { Button } from "@/components/ui/button.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Badge } from "@/components/ui/badge.js";
import { Separator } from "@/components/ui/separator.js";
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, Clock } from "lucide-react";
import { Order } from "@shared/schema.js";
import { api } from "@/lib/api.js";

export default function Checkout() {
  const { cart, updateQuantity, removeFromCart, applyCoupon, clearCart } = useCart();
  const { toast } = useToast();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const handleUpdateQuantity = (item: typeof cart.items[number], change: number) => {
    if (item.quantity + change <= 0) {
      removeFromCart(item.id, item.selectedOptions);
    } else {
      updateQuantity(item.id, change, item.selectedOptions);
    }
  };

  const handleRemoveItem = (item: typeof cart.items[number]) => {
    removeFromCart(item.id, item.selectedOptions);
    toast({
      title: "Item removido",
      description: "O item foi removido do carrinho",
    });
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos antes de finalizar o pedido",
        variant: "destructive"
      });
      return;
    }
    
    setIsCheckoutOpen(true);
  };

  const handleOrderComplete = (order: Order) => {
    setCurrentOrder(order);
    setIsCheckoutOpen(false);
    setIsOrderTrackingOpen(true);
    clearCart();
  };

  const handleApplyCoupon = async (code: string, customerPhone?: string) => {
    try {
      const coupon = await api.coupons.validate(code, customerPhone);
      
      // Check minimum order first
      if (coupon.minimumOrder && cart.subtotal < Number(coupon.minimumOrder)) {
        throw new Error(`Pedido mínimo de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(coupon.minimumOrder))} necessário`);
      }
      
      let discount = 0;
      let freeDelivery = false;
      
      // Check if coupon includes free delivery
      if (coupon.freeDelivery || coupon.free_delivery) {
        freeDelivery = true;
      }
      
      if (coupon.type === "PERCENTAGE" || coupon.type === "percentage") {
        discount = cart.subtotal * (Number(coupon.value) / 100);
        if (coupon.maxDiscount || coupon.maximum_discount) {
          const maxDiscount = Number(coupon.maxDiscount || coupon.maximum_discount);
          discount = Math.min(discount, maxDiscount);
        }
      } else if (coupon.type === "FIXED" || coupon.type === "fixed") {
        discount = Number(coupon.value);
      } else if (coupon.type === "FREE_DELIVERY" || coupon.type === "free_delivery") {
        freeDelivery = true;
        discount = 0; // No discount on subtotal, just free delivery
      }
      
      applyCoupon(discount, code, freeDelivery);
    } catch (error: any) {
      // Re-throw the exact error from the API
      throw error;
    }
  };

  const handleContinueShopping = () => {
    window.location.href = '/cardapio';
  };

  const handleGoBack = () => {
    window.location.href = '/cardapio';
  };

  if (cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Seu carrinho está vazio</h2>
          <p className="text-gray-600 mb-6">Adicione produtos do cardápio para continuar</p>
          <Button onClick={handleContinueShopping} className="bg-primary hover:bg-orange-600">
            Ver Cardápio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Banner */}
      <section
        className="relative w-full h-44 sm:h-56 md:h-64 lg:h-72 flex items-center justify-center text-center text-white mb-10"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=60)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 px-4">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Checkout</h1>
          <p className="text-sm sm:text-base opacity-90 mt-2">
            Revise seus itens e finalize o pedido
          </p>
        </div>
      </section>

      {/* Main */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Cardápio
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Revise seus itens e finalize o pedido</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Seus Itens ({cart.itemCount})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                        
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(item.selectedOptions).map(([key, value], idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {key}: {value}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {item.observations && (
                          <p className="text-sm text-gray-500 mt-2">
                            <strong>Observações:</strong> {item.observations}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item, -1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item, 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item)}
                              className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cart.subtotal)}</span>
                </div>
                
                {cart.couponCode && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Desconto ({cart.couponCode})</span>
                    <span>-{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cart.discount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span>Taxa de entrega</span>
                  <span>
                    {cart.freeDelivery ? (
                      <span className="text-green-600">Grátis</span>
                    ) : (
                      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cart.deliveryFee)
                    )}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cart.total)}</span>
                </div>
                
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-primary hover:bg-orange-600"
                  size="lg"
                >
                  Finalizar Pedido
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Checkout Modal */}
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cart={cart}
          onOrderComplete={handleOrderComplete}
          onApplyCoupon={handleApplyCoupon}
          onBackToCart={() => {
            setIsCheckoutOpen(false);
          }}
        />

        {/* Order Tracking Modal */}
        <OrderTrackingModal
          isOpen={isOrderTrackingOpen}
          onClose={() => setIsOrderTrackingOpen(false)}
          order={currentOrder}
          onViewHistory={() => {
            setIsOrderTrackingOpen(false);
            window.location.href = '/pedidos';
          }}
          onNewOrder={() => {
            setIsOrderTrackingOpen(false);
            window.location.href = '/cardapio';
          }}
        />
      </div>
    </>
  );
}