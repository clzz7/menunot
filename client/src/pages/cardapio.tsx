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
      <section className="hero-banner">
        <img 
          src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=2024&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Deliciosos hambúrgueres artesanais"
          className="w-full h-full object-cover"
        />
        <div className="hero-content">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {establishment?.name?.toUpperCase() || 'BURGER POINT'}
          </h1>
          <p className="text-lg opacity-90">
            Você pode fazer seu pedido online! Navegue pelo nosso cardápio e escolha o que gostaria de pedir.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="main-container">
        {/* Hero Info Section */}
        <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-4xl mx-auto px-6">
            {/* Rating System */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-5 h-5 rating-stars" 
                    style={{ color: '#FFD700', fill: '#FFD700' }}
                  />
                ))}
              </div>
              <span className="font-bold text-gray-800 text-lg">4.8</span>
              <span className="text-gray-500">(324 avaliações)</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">Hambúrgueres</span>
            </div>
            
            {/* Status Indicator */}
            {establishment && (
              <div className="mb-8">
                <button className="status-button">
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
            <div className="grid grid-cols-2 gap-6 mb-8">
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
            
            <div className="text-center">
              <button className="text-primary underline hover:text-primary/80 transition-colors">
                Alterar endereço
              </button>
            </div>
          </div>
        </section>

        {/* Featured Section - Mais Pedidos Hoje */}
        <section className="featured-section">
          <div className="featured-title">
            <Flame className="w-6 h-6 text-red-500" />
            MAIS PEDIDOS HOJE
          </div>
          
          <div className="featured-cards scrollbar-hide">
            {productsArray.slice(0, 4).map((product: Product) => (
              <div key={product.id} className="featured-card"
                onClick={() => handleAddToCart(product)}>
                <img 
                  src={product.image || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80&h=80&fit=crop"}
                  alt={product.name}
                  className="featured-card-image"
                />
                <div className="featured-card-title">{product.name}</div>
                <div className="featured-card-price">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Category Navigation */}
        <section className="mb-12">
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`filter-button ${selectedCategory === "all" ? 'active' : 'inactive'}`}
            >
              <Grid3X3 className="w-4 h-4" />
              Todos
            </button>
            {categories.map((category: Category) => {
              const isActive = selectedCategory === category.name;
              const getCategoryIcon = (name: string) => {
                if (name.toLowerCase().includes('hambúrguer')) return <Sandwich className="w-4 h-4" />;
                if (name.toLowerCase().includes('batata') || name.toLowerCase().includes('porção')) return <Beef className="w-4 h-4" />;
                return <Grid3X3 className="w-4 h-4" />;
              };
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`filter-button ${isActive ? 'active' : 'inactive'}`}
                >
                  {getCategoryIcon(category.name)}
                  {category.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* Search Bar */}
        <section className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <Input
              type="text"
              placeholder="Busque por hambúrgueres, bebidas, sobremesas..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </section>

        {/* Products Grid */}
        <section className="pb-20">
          {selectedCategory === "all" ? (
            // Show all categories
            <div className="space-y-20">
              {categories.map((category: Category) => {
                const categoryProducts = productsByCategory[category.id] || [];
                if (categoryProducts.length === 0) return null;
                
                return (
                  <div key={category.id}>
                    <h2 className="section-title">
                      {category.name}
                      {category.description && (
                        <span className="text-base text-gray-500 font-normal ml-2">
                          ({category.description})
                        </span>
                      )}
                    </h2>
                    
                    <div className="products-grid">
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
              })}
            </div>
          ) : (
            // Show filtered products
            <div>
              <h2 className="section-title">
                {selectedCategory}
              </h2>
              <div className="products-grid">
                {filteredProducts.map((product: Product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </div>
          )}
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <Search className="w-16 h-16 mx-auto text-gray-400 mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Nenhum produto encontrado</h3>
              <p className="text-gray-500">Tente buscar por outro termo ou categoria</p>
            </div>
          )}
        </section>

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