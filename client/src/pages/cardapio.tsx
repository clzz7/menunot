import * as React from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input.js";
import { Button } from "@/components/ui/button.js";
import { Badge } from "@/components/ui/badge.js";
import { Search, Clock, MapPin, Check, Star, Flame, Grid3X3, Beef, Utensils, DollarSign, MapPinIcon, ShoppingBag } from "lucide-react";
import { ProductCard } from "@/components/product-card.js";
import { CartSidebar } from "@/components/cart-sidebar.js";
import { useCart } from "@/hooks/use-cart.js";
import { useToast } from "@/hooks/use-toast.js";
import { api } from "@/lib/api.js";
import { Product, Category } from "@shared/schema.js";

export default function Cardapio() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const { toast } = useToast();

  // Fetch data
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: api.categories.getAll
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
    queryFn: api.products.getAll
  });

  // Fetch establishment to show status in hero
  const { data: establishment } = useQuery({
    queryKey: ["/api/establishment"],
    queryFn: api.establishment.get,
  });

  // Ensure products is always an array
  const productsArray = Array.isArray(products) ? products : [];

  // Filter products
  const filteredProducts = productsArray.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (selectedCategory === "all") {
      return matchesSearch;
    }
    
    const category = categories.find((cat: Category) => cat.id === product.category_id);
    const matchesCategory = category?.name.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  // Group products by category
  const productsByCategory = categories.reduce((acc: Record<string, Product[]>, category: Category) => {
    acc[category.id] = filteredProducts.filter((product: Product) => product.category_id === category.id);
    return acc;
  }, {});

  const handleAddToCart = (product: Product) => {
    addToCart(product, {}, "");
    
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

  return (
    <>
      {/* Hero Banner */}
      <section className="w-full">
        {/* Hero Image */}
        <div className="w-full h-48 md:h-56 lg:h-64 relative overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=2024&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Deliciosos hambúrgueres artesanais"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content Area */}
        <div className="bg-gradient-to-b from-white to-gray-50 py-8">
          <div className="max-w-md mx-auto px-6">
            {/* Main Title with Gradient */}
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent mb-2 tracking-wide text-left font-['Montserrat',sans-serif] drop-shadow-sm">
              {establishment?.name?.toUpperCase() || 'BURGER POINT'}
            </h1>
            
            {/* Rating and Category */}
            <div className="flex items-center gap-2 mb-4 text-left">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="font-semibold text-sm ml-1">4.8</span>
                <span className="text-gray-600 text-sm">(324 avaliações)</span>
              </div>
              <span className="text-gray-600 text-sm">• Hambúrgueres</span>
            </div>
            
            {/* Description */}
            <p className="text-base text-gray-700 mb-6 max-w-lg text-left font-['Roboto',sans-serif] leading-relaxed">
              Você pode fazer seu pedido online! Navegue pelo nosso cardápio e escolha o que gostaria de pedir.
            </p>
            
            {/* Status Indicator with Animation */}
            {establishment && (
              <div className="inline-flex items-center gap-2 px-4 py-3 rounded-3xl bg-gradient-to-r from-green-500 to-green-600 text-white mb-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-pulse">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {establishment.is_open ? "Aceitando Pedidos" : "Fechado no momento"}
                </span>
              </div>
            )}
            
            {/* Information Cards Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-100 rounded-xl p-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">25-30 min</div>
                  <div className="text-gray-600 text-xs">Entrega</div>
                </div>
              </div>
              
              <div className="bg-gray-100 rounded-xl p-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">R$ 4,99</div>
                  <div className="text-gray-600 text-xs">Taxa</div>
                </div>
              </div>
              
              <div className="bg-gray-100 rounded-xl p-3 flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-blue-600" />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">2.5km</div>
                  <div className="text-gray-600 text-xs">Distância</div>
                </div>
              </div>
              
              <div className="bg-gray-100 rounded-xl p-3 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-purple-600" />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">R$ 25,00</div>
                  <div className="text-gray-600 text-xs">Pedido mín.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Popular Items Section */}
        <div className="bg-white py-6 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-gray-900">MAIS PEDIDOS HOJE</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {featuredProducts.slice(0, 3).map((product: Product) => (
                <div key={product.id} className="flex-shrink-0 bg-gray-50 rounded-xl p-4 w-64">
                  <div className="flex items-center gap-3">
                    <img 
                      src={product.image || `https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80&h=80&fit=crop`}
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <Badge className="bg-red-100 text-red-700 text-xs mb-1">Mais Pedido</Badge>
                      <h3 className="font-semibold text-sm text-gray-900">{product.name}</h3>
                      <p className="text-primary font-bold text-sm">R$ {product.price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 bg-gray-50">
        {/* Category Navigation Enhanced */}
        <div className="mb-6">
          <div className="flex space-x-3 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className={`flex-shrink-0 h-12 px-4 rounded-xl transition-all duration-300 flex items-center gap-2 hover:scale-105 ${
                selectedCategory === "all" ? 'bg-primary text-white shadow-lg' : 'hover:bg-gray-100'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              Todos
            </Button>
            {categories.map((category: Category) => {
              const isActive = selectedCategory === category.name;
              const icon = category.name.toLowerCase().includes('hambúrguer') ? Beef : Utensils;
              const IconComponent = icon;
              
              return (
                <Button
                  key={category.id}
                  variant={isActive ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex-shrink-0 whitespace-nowrap h-12 px-4 rounded-xl transition-all duration-300 flex items-center gap-2 hover:scale-105 ${
                    isActive ? 'bg-primary text-white shadow-lg' : 'hover:bg-gray-100'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Busque por hambúrgueres, bebidas, sobremesas..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl transition-all duration-300 focus:border-primary focus:bg-white focus:shadow-lg"
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
                    {category.description && (
                      <span className="ml-2 text-sm text-gray-500">({category.description})</span>
                    )}
                  </h2>
                  
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
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
            <div className="bg-gray-50 rounded-lg overflow-hidden">
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

        {/* Cart Sidebar */}
        <CartSidebar
          cart={cart}
          isOpen={isCartOpen}
          onClose={handleCloseCart}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onCheckout={() => {
            setIsCartOpen(false);
            window.location.href = '/checkout';
          }}
        />
      </div>
    </>
  );
}