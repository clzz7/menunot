import * as React from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input.js";
import { Button } from "@/components/ui/button.js";
import { Search, Clock } from "lucide-react";
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
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pink-100 via-purple-50 to-yellow-50 pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-4">Cardápio</h1>
            <p className="text-xl text-gray-600 mb-8">
              Explore nossos pratos deliciosos
            </p>
            {establishment && (
              <div className="flex items-center justify-center gap-2">
                <span className={`flex h-3 w-3 rounded-full ${establishment.is_open ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
                <span className={`font-medium ${establishment.is_open ? 'text-green-600' : 'text-red-600'}`}>
                  {establishment.is_open ? "Aceitando Pedidos" : "Fechado no momento"}
                </span>
                <span className="text-gray-600">|</span>
                <span className="flex items-center gap-1 text-gray-600">
                  <Clock className="w-4 h-4" />
                  30-45 min
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
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
                  
                  <div className="bg-white rounded-lg overflow-hidden">
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
            <div className="bg-white rounded-lg overflow-hidden">
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