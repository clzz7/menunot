import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Search, Clock, History } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { CartSidebar } from "@/components/cart-sidebar";
import { CheckoutModal } from "@/components/checkout-modal";
import { OrderTrackingModal } from "@/components/order-tracking-modal";
import { OrderHistoryModal } from "@/components/order-history-modal";
import { useCart } from "@/hooks/use-cart";
import { useWebSocket } from "@/hooks/use-websocket";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Product, Category, Establishment, Order } from "@shared/schema";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [currentCustomerId, setCurrentCustomerId] = useState<string | null>(null);

  const { cart, addToCart, updateQuantity, removeFromCart, applyDiscount, clearCart } = useCart();
  const { toast } = useToast();

  // Fetch data
  const { data: establishment } = useQuery({
    queryKey: ["/api/establishment"],
    queryFn: api.establishment.get
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: api.categories.getAll
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
    queryFn: api.products.getAll
  });

  // WebSocket for real-time updates
  useWebSocket((message) => {
    if (message.type === 'ORDER_STATUS_UPDATE' && currentOrder?.id === message.orderId) {
      setCurrentOrder(prev => prev ? { ...prev, status: message.status || prev.status } : null);
      
      toast({
        title: "Status do pedido atualizado",
        description: `Seu pedido está: ${getStatusLabel(message.status || "")}`,
      });
    }
  });

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': 'Pendente',
      'CONFIRMED': 'Confirmado',
      'PREPARING': 'Preparando',
      'READY': 'Pronto',
      'OUT_DELIVERY': 'Saiu para entrega',
      'DELIVERED': 'Entregue',
      'CANCELLED': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  // Filter products
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (selectedCategory === "all") {
      return matchesSearch;
    }
    
    const category = categories.find((cat: Category) => cat.id === product.categoryId);
    const matchesCategory = category?.name.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  // Group products by category
  const productsByCategory = categories.reduce((acc: Record<string, Product[]>, category: Category) => {
    acc[category.id] = filteredProducts.filter((product: Product) => product.categoryId === category.id);
    return acc;
  }, {});

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    
    toast({
      title: "Produto adicionado!",
      description: `${product.name} foi adicionado ao carrinho`,
    });
  };

  const handleOpenCart = () => {
    setIsCartOpen(true);
  };

  const handleCloseCart = () => {
    setIsCartOpen(false);
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
    
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderComplete = (order: Order) => {
    setCurrentOrder(order);
    setIsCheckoutOpen(false);
    setIsOrderTrackingOpen(true);
    clearCart();
  };

  const handleApplyCoupon = async (code: string) => {
    try {
      const coupon = await api.coupons.validate(code);
      
      let discount = 0;
      if (coupon.type === "PERCENTAGE") {
        discount = cart.subtotal * (Number(coupon.value) / 100);
        if (coupon.maxDiscount) {
          discount = Math.min(discount, Number(coupon.maxDiscount));
        }
      } else if (coupon.type === "FIXED") {
        discount = Number(coupon.value);
      }
      
      // Check minimum order
      if (coupon.minimumOrder && cart.subtotal < Number(coupon.minimumOrder)) {
        throw new Error(`Pedido mínimo de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(coupon.minimumOrder))} necessário`);
      }
      
      applyDiscount(discount, code);
    } catch (error: any) {
      throw new Error(error.message || "Cupom inválido");
    }
  };

  const handleViewOrderHistory = () => {
    setIsOrderTrackingOpen(false);
    setIsOrderHistoryOpen(true);
  };

  const handleNewOrder = () => {
    setIsOrderTrackingOpen(false);
    setCurrentOrder(null);
  };

  const handleRepeatOrder = async (order: Order) => {
    try {
      // Fetch order items from the API
      const response = await fetch(`/api/orders/${order.id}/items`);
      if (!response.ok) {
        throw new Error('Erro ao buscar itens do pedido');
      }
      
      const orderItems = await response.json();
      
      // Clear current cart and add items from the order
      clearCart();
      
      for (const item of orderItems) {
        // Find the product to get current details
        const product = products.find((p: Product) => p.id === item.productId);
        if (product) {
          addToCart({
            ...product,
            selectedOptions: item.selectedOptions,
            observations: item.observations
          }, item.quantity);
        }
      }
      
      toast({
        title: "Pedido repetido!",
        description: `${orderItems.length} itens foram adicionados ao carrinho`,
      });
      
      // Close order history and open cart
      setIsOrderHistoryOpen(false);
      setIsCartOpen(true);
      
    } catch (error: any) {
      toast({
        title: "Erro ao repetir pedido",
        description: error.message || "Erro interno do servidor",
        variant: "destructive"
      });
    }
  };

  const handleContinueShopping = () => {
    setIsOrderHistoryOpen(false);
  };

  const handleOpenOrderHistory = () => {
    setIsOrderHistoryOpen(true);
  };

  if (!establishment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {establishment.logo && (
                <img 
                  src={establishment.logo}
                  alt={`Logo ${establishment.name}`}
                  className="h-10 w-10 rounded-full object-cover"
                />
              )}
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{establishment.name}</h1>
                {establishment.description && (
                  <p className="text-sm text-gray-500">{establishment.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Status */}
              <div className="hidden sm:flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${establishment.isOpen ? 'bg-success' : 'bg-red-500'}`}></div>
                <span className={`text-sm font-medium ${establishment.isOpen ? 'text-success' : 'text-red-500'}`}>
                  {establishment.isOpen ? 'Aberto' : 'Fechado'}
                </span>
              </div>
              
              {/* My Orders Button */}
              <Button 
                onClick={handleOpenOrderHistory}
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-white transition-colors"
              >
                <History className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Meus Pedidos</span>
              </Button>
              
              {/* Cart Button */}
              <Button 
                onClick={handleOpenCart}
                className="relative bg-primary text-white hover:bg-orange-600 transition-colors"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Carrinho</span>
                {cart.itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center p-0">
                    {cart.itemCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Category Navigation */}
        <div className="mb-6">
          <div className="flex space-x-4 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className={`flex-shrink-0 ${selectedCategory === "all" ? 'bg-primary text-white' : ''}`}
            >
              Todos
            </Button>
            {categories.map((category: Category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.name ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex-shrink-0 whitespace-nowrap ${selectedCategory === category.name ? 'bg-primary text-white' : ''}`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>

        {/* Products Grid */}
        <div className="space-y-6">
          {selectedCategory === "all" ? (
            // Show all categories
            categories.map((category: Category) => {
              const categoryProducts = productsByCategory[category.id] || [];
              if (categoryProducts.length === 0) return null;
              
              return (
                <div key={category.id} className="category-section">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    {category.name}
                  </h2>
                  
                  <div className="grid gap-4">
                    {categoryProducts.map((product: Product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            // Show filtered products
            <div className="grid gap-4">
              {filteredProducts.map((product: Product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-500">Tente buscar por outro termo ou categoria</p>
            </div>
          )}
        </div>
      </main>

      {/* Cart Sidebar */}
      <CartSidebar
        cart={cart}
        isOpen={isCartOpen}
        onClose={handleCloseCart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onOrderComplete={handleOrderComplete}
        onApplyCoupon={handleApplyCoupon}
        onBackToCart={() => {
          setIsCheckoutOpen(false);
          setIsCartOpen(true);
        }}
      />

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isOrderTrackingOpen}
        onClose={() => setIsOrderTrackingOpen(false)}
        order={currentOrder}
        onViewHistory={handleViewOrderHistory}
        onNewOrder={handleNewOrder}
      />

      {/* Order History Modal */}
      <OrderHistoryModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
        customerId={currentCustomerId}
        onRepeatOrder={handleRepeatOrder}
        onContinueShopping={handleContinueShopping}
      />
    </div>
  );
}
