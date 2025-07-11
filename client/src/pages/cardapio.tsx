import * as React from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input.js";
import { Button } from "@/components/ui/button.js";
import { Search, Clock, MapPin } from "lucide-react";
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
        <div className="bg-gray-50 py-8">
          <div className="max-w-2xl mx-auto px-4">
            {/* Main Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-primary mb-3 tracking-wide text-left">
              {establishment?.name?.toUpperCase() || 'BURGER POINT'}
            </h1>
            
            {/* Description */}
            <p className="text-base text-gray-700 mb-6 max-w-lg text-left">
              Você pode fazer seu pedido online! Navegue pelo nosso cardápio e escolha o que gostaria de pedir.
            </p>
            
            {/* Status Indicator */}
            {establishment && (
              <div className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full bg-white mb-6">
                <div className={`w-2.5 h-2.5 rounded-full ${establishment.is_open ? 'bg-primary' : 'bg-red-500'}`} />
                <span className="text-gray-700 text-sm">
                  {establishment.is_open ? "Aceitando Pedidos" : "Fechado no momento"}
                </span>
              </div>
            )}
            
            {/* Order Info - All Left Aligned */}
            <div className="space-y-2 text-left max-w-xs">
              <div className="flex items-start gap-2 text-gray-700">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  Tempo de entrega: Até 30 minutos
                </span>
              </div>
              
              <div className="flex items-start gap-2 text-gray-700">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div>
                    Área de entrega:
                  </div>
                  <div className="text-gray-600">
                    Rua das Flores, 123, Centro, São Paulo, SP
                  </div>
                </div>
              </div>
              
              <div className="pt-1">
                <button className="text-primary underline text-sm hover:text-primary/80 transition-colors">
                  Alterar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 bg-gray-50">
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
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