import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { CartSidebar } from "@/components/cart-sidebar";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Product, Category } from "@shared/schema";

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cardápio</h1>
        <p className="text-gray-600">Explore nossos produtos e sabores únicos</p>
      </div>

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
                  {category.description && (
                    <span className="ml-2 text-sm text-gray-500">({category.description})</span>
                  )}
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
  );
}