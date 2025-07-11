import * as React from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input.js";
import { Button } from "@/components/ui/button.js";
import { Search, Clock, MapPin, DollarSign, ShoppingBag, Grid3X3, Sandwich, Beef, Star, Flame, Tag, Leaf, Sparkles } from "lucide-react";
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
        <div className="w-full h-40 md:h-44 lg:h-48 relative overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=2024&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Deliciosos hambúrgueres artesanais"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content Area - Updated with new layout */}
        <div className="bg-gradient-to-b from-white to-gray-50 py-8">
          <div className="max-w-md mx-auto px-6">
            {/* Main Title */}
            <h1 className="text-2xl md:text-3xl title-text title-gradient mb-3 tracking-wide text-left">
              {establishment?.name?.toUpperCase() || 'BURGER POINT'}
            </h1>
            
            {/* Rating System */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-4 h-4 rating-stars" 
                    style={{ color: '#FFD700', fill: '#FFD700' }}
                  />
                ))}
              </div>
              <span className="font-bold text-gray-800">4.8</span>
              <span className="text-gray-500 text-sm">(324 avaliações)</span>
              <span className="text-gray-500 text-sm">•</span>
              <span className="text-gray-500 text-sm">Hambúrgueres</span>
            </div>
            
            {/* Description */}
            <p className="text-base description-text mb-6 max-w-lg text-left">
              Você pode fazer seu pedido online! Navegue pelo nosso cardápio e escolha o que gostaria de pedir.
            </p>
            
            {/* Status Indicator */}
            {establishment && (
              <div className="inline-flex items-center gap-3 mb-8">
                <button className="status-button inline-flex items-center gap-2">
                  {establishment.is_open ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Aceitando Pedidos
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Fechado no momento
                    </>
                  )}
                </button>
              </div>
            )}
            
            {/* Informações Essenciais - Grid 2x2 */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="info-card">
                <Clock className="info-card-icon text-amber-600" />
                <div className="info-card-content">
                  <div className="info-card-label">Entrega</div>
                  <div className="info-card-value">25-30 min</div>
                </div>
              </div>
              
              <div className="info-card">
                <DollarSign className="info-card-icon text-green-600" />
                <div className="info-card-content">
                  <div className="info-card-label">Taxa</div>
                  <div className="info-card-value">R$ 4,99</div>
                </div>
              </div>
              
              <div className="info-card">
                <MapPin className="info-card-icon text-blue-600" />
                <div className="info-card-content">
                  <div className="info-card-label">Distância</div>
                  <div className="info-card-value">2.5km</div>
                </div>
              </div>
              
              <div className="info-card">
                <ShoppingBag className="info-card-icon text-purple-600" />
                <div className="info-card-content">
                  <div className="info-card-label">Mínimo</div>
                  <div className="info-card-value">R$ 25,00</div>
                </div>
              </div>
            </div>
            
            <div className="pt-1">
              <button className="text-primary underline text-sm hover:text-primary/80 transition-colors">
                Alterar endereço
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-6 pb-10 bg-gradient-to-b from-gray-50 to-white">
        {/* Featured Section - Mais Pedidos Hoje */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold text-gray-900">MAIS PEDIDOS HOJE</h2>
          </div>
          
          <div className="flex space-x-6 overflow-x-auto pb-2 scrollbar-hide">
            {productsArray.slice(0, 3).map((product: Product) => (
              <div key={product.id} className="flex-shrink-0 w-48 bg-white rounded-lg border border-gray-100 p-4 shadow-sm featured-card cursor-pointer btn-interactive"
                onClick={() => handleAddToCart(product)}>
                <div className="relative">
                  <img 
                    src={product.image || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80&h=80&fit=crop"}
                    alt={product.name}
                    className="w-20 h-20 rounded-lg object-cover mx-auto"
                  />
                </div>
                <div className="mt-3 text-center">
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{product.name}</h3>
                  <p className="text-lg font-bold text-primary mt-1">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Navigation */}
        <div className="mb-8">
          <div className="flex space-x-3 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className={`flex-shrink-0 h-12 px-4 flex items-center gap-2 btn-interactive ${
                selectedCategory === "all" 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              Todos
            </Button>
            {categories.map((category: Category) => {
              const isActive = selectedCategory === category.name;
              const getCategoryIcon = (name: string) => {
                if (name.toLowerCase().includes('hambúrguer')) return <Sandwich className="w-4 h-4" />;
                if (name.toLowerCase().includes('batata') || name.toLowerCase().includes('porção')) return <Beef className="w-4 h-4" />;
                return <Grid3X3 className="w-4 h-4" />;
              };
              
              return (
                <Button
                  key={category.id}
                  variant={isActive ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex-shrink-0 h-12 px-4 flex items-center gap-2 whitespace-nowrap btn-interactive ${
                    isActive 
                      ? 'bg-primary text-white shadow-md' 
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                  }`}
                >
                  {getCategoryIcon(category.name)}
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Input
              type="text"
              placeholder="Busque por hambúrgueres, bebidas, sobremesas..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="h-11 pl-10 pr-4 bg-gray-50 border-gray-200 focus:border-primary focus:bg-white transition-all duration-200 placeholder:text-gray-400"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>

        {/* Products Grid */}
        <div className="space-y-8">
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