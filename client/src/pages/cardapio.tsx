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
        {/* Category Navigation */}
        <div className="mb-8 pt-8">
          <style>{`
            .category-nav {
              position: sticky;
              top: 0;
              z-index: 50;
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(20px);
              border-radius: 16px;
              padding: 8px;
              box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06);
              border: 1px solid rgba(0, 0, 0, 0.05);
              margin: 0 auto;
              max-width: fit-content;
            }

            .category-nav-container {
              display: flex;
              justify-content: center;
              width: 100%;
              overflow-x: auto;
              scrollbar-width: none;
              -ms-overflow-style: none;
            }

            .category-nav-container::-webkit-scrollbar {
              display: none;
            }

            .category-scroll {
              display: flex;
              gap: 6px;
              padding: 2px;
              min-width: fit-content;
              align-items: center;
            }

            .category-btn {
              flex-shrink: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              padding: 10px 16px;
              border-radius: 12px;
              font-weight: 600;
              font-size: 14px;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              border: none;
              cursor: pointer;
              background: transparent;
              color: #6b7280;
              position: relative;
              overflow: hidden;
              white-space: nowrap;
              min-width: fit-content;
            }

            .category-btn::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: linear-gradient(135deg, #ea580c, #f97316);
              opacity: 0;
              transition: opacity 0.3s ease;
              border-radius: 12px;
            }

            .category-btn > * {
              position: relative;
              z-index: 1;
            }

            .category-btn:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 15px rgba(234, 88, 12, 0.15);
              color: #ea580c;
            }

            .category-btn.active {
              color: white;
              transform: translateY(-1px);
              box-shadow: 0 4px 15px rgba(234, 88, 12, 0.3);
            }

            .category-btn.active::before {
              opacity: 1;
            }

            .category-icon {
              width: 18px;
              height: 18px;
              transition: transform 0.3s ease;
              flex-shrink: 0;
            }

            .category-btn:hover .category-icon {
              transform: scale(1.1);
            }

            /* Mobile specific styles */
            @media (max-width: 1024px) {
              .category-nav-container {
                margin: 0 -24px;
                padding: 0 24px;
              }
              
              .category-nav {
                border-radius: 0;
                border-left: none;
                border-right: none;
                width: 100vw;
                max-width: none;
                margin: 0 -24px;
                padding: 8px 24px;
              }
              
              .category-scroll {
                gap: 4px;
                padding: 2px 0;
              }
              
              .category-btn {
                padding: 8px 12px;
                font-size: 13px;
                gap: 6px;
              }
              
              .category-icon {
                width: 16px;
                height: 16px;
              }
            }

            /* Extra small screens */
            @media (max-width: 480px) {
              .category-btn {
                padding: 6px 10px;
                font-size: 12px;
                gap: 4px;
              }
              
              .category-icon {
                width: 14px;
                height: 14px;
              }
            }
          `}</style>
          
          <div className="category-nav-container">
            <div className="category-nav">
              <div className="category-scroll">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`category-btn ${selectedCategory === "all" ? 'active' : ''}`}
                >
                  <Grid3X3 className="category-icon" />
                  <span>Todos</span>
                </button>
                
                {categories.map((category: Category) => {
                  const isActive = selectedCategory === category.name;
                  const getCategoryIcon = (name: string) => {
                    if (name.toLowerCase().includes('hambúrguer')) return <Sandwich className="category-icon" />;
                    if (name.toLowerCase().includes('batata') || name.toLowerCase().includes('porção')) return <Beef className="category-icon" />;
                    if (name.toLowerCase().includes('bebida')) return <Star className="category-icon" />;
                    if (name.toLowerCase().includes('sobremesa')) return <Sparkles className="category-icon" />;
                    if (name.toLowerCase().includes('salada')) return <Leaf className="category-icon" />;
                    if (name.toLowerCase().includes('promoção')) return <Tag className="category-icon" />;
                    return <Grid3X3 className="category-icon" />;
                  };
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`category-btn ${isActive ? 'active' : ''}`}
                    >
                      {getCategoryIcon(category.name)}
                      <span>{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <style>{`
            .search-container {
              position: relative;
              max-width: 400px;
            }

            .search-input {
              width: 100%;
              height: 44px;
              padding: 0 20px 0 44px;
              border-radius: 22px;
              border: 1px solid rgba(0, 0, 0, 0.06);
              background: rgba(255, 255, 255, 0.9);
              backdrop-filter: blur(20px);
              font-size: 14px;
              font-weight: 500;
              color: #374151;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
            }

            .search-input:focus {
              outline: none;
              border-color: #ea580c;
              background: #ffffff;
              box-shadow: 0 4px 20px rgba(234, 88, 12, 0.15);
              transform: translateY(-1px);
            }

            .search-input::placeholder {
              color: #9ca3af;
              font-weight: 400;
            }

            .search-icon {
              position: absolute;
              left: 16px;
              top: 50%;
              transform: translateY(-50%);
              color: #9ca3af;
              width: 16px;
              height: 16px;
              transition: all 0.3s ease;
            }

            .search-container:focus-within .search-icon {
              color: #ea580c;
              transform: translateY(-50%) scale(1.1);
            }

            @media (max-width: 768px) {
              .search-container {
                max-width: 100%;
              }
            }
          `}</style>
          
          <div className="search-container">
            <input
              type="text"
              placeholder="Busque por hambúrgueres, bebidas, sobremesas..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <Search className="search-icon" />
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