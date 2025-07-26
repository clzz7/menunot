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
      {/* Header Section */}
      <section className="w-full bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* ONLINE ORDERING - Main Title */}
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            ONLINE ORDERING
          </h1>
          
          {/* Description */}
          <p className="text-gray-600 mb-4 text-lg">
            You can order online! Browse our menu items and choose what you'd like to order from us.
          </p>
          
          {/* Status Indicator */}
          {establishment && (
            <div className="my-4">
              <div className="inline-flex items-center gap-2 text-green-700 text-base font-medium">
                {establishment.is_open ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Accepting Orders
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Fechado no momento
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Pickup Information */}
          <div className="flex flex-wrap items-center gap-6 text-gray-700">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Pickup time: Up to 30 minutes</span>
              <button className="text-orange-500 underline hover:text-orange-600 transition-colors ml-2">
                Change
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Pickup Address: 500 terry francine, San Francisco, CA</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-md lg:max-w-7xl mx-auto px-6 pb-10 bg-gradient-to-b from-gray-50 to-white">
        {/* Featured Section - Mais Pedidos Hoje */}
        <div className="mb-8 pt-8">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold text-gray-900">MAIS PEDIDOS HOJE</h2>
          </div>
          
          {/* Grid responsivo para produtos em destaque */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {productsArray.slice(0, 4).map((product: Product) => (
              <div key={product.id} className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm featured-card cursor-pointer btn-interactive"
                onClick={() => handleAddToCart(product)}>
                <div className="relative">
                  <img 
                    src={product.image || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80&h=80&fit=crop"}
                    alt={product.name}
                    className="w-20 h-20 lg:w-24 lg:h-24 rounded-lg object-cover mx-auto"
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
          <div className="relative lg:max-w-md">
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
                  
                  {/* Grid responsivo: 1 coluna no mobile, 3 colunas em telas grandes */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {categoryProducts.map((product: Product) => (
                      <div key={product.id} className="bg-gray-50 rounded-lg overflow-hidden">
                        <ProductCard
                          product={product}
                          onAddToCart={handleAddToCart}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            // Show filtered products
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product: Product) => (
                <div key={product.id} className="bg-gray-50 rounded-lg overflow-hidden">
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                </div>
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