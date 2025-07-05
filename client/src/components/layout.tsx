import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button.js";
import { Badge } from "@/components/ui/badge.js";
import { ShoppingCart, Menu, Home, UtensilsCrossed, Package, History, X } from "lucide-react";
import { useCart } from "@/hooks/use-cart.js";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api.js";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart } = useCart();

  const { data: establishment } = useQuery({
    queryKey: ["/api/establishment"],
    queryFn: api.establishment.get
  });

  const isAdminPage = location.startsWith('/admin');
  const isPaymentPage = location.startsWith('/payment');
  
  // Don't render layout for admin and payment pages
  if (isAdminPage || isPaymentPage) {
    return <>{children}</>;
  }

  const navigation = [
    { name: 'Início', href: '/', icon: Home },
    { name: 'Cardápio', href: '/cardapio', icon: UtensilsCrossed },
    { name: 'Meus Pedidos', href: '/pedidos', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              {/* Logo and brand */}
              <Link href="/" className="flex items-center space-x-3">
                {establishment?.logo && (
                  <img 
                    src={establishment.logo}
                    alt={`Logo ${establishment.name}`}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {establishment?.name || 'Carregando...'}
                  </h1>
                  {establishment?.description && (
                    <p className="text-sm text-gray-500 hidden sm:block">
                      {establishment.description}
                    </p>
                  )}
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-primary text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Status and Cart */}
            <div className="flex items-center space-x-4">
              {/* Status */}
              <div className="hidden sm:flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${establishment?.is_open ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm font-medium ${establishment?.is_open ? 'text-green-500' : 'text-red-500'}`}>
                  {establishment?.is_open ? 'Aberto' : 'Fechado'}
                </span>
              </div>

              {/* Cart Button */}
              <Link href="/checkout">
                <Button 
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
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive 
                        ? 'bg-primary text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <span className="text-gray-600 text-sm">
                © 2024 {establishment?.name || 'Restaurante'}. Todos os direitos reservados.
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              {establishment?.phone && (
                <span>📞 {establishment.phone}</span>
              )}
              {establishment?.address && (
                <span>📍 {establishment.address}</span>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}