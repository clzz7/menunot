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
  const { cart, isCartAnimating } = useCart();

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
      <header className="header">
        <div className="header-content">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-all duration-300 ${
                isMobileMenuOpen ? 'hamburger-open' : ''
              }`}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
              </div>
            </button>

            {/* Logo and brand */}
            <Link href="/" className="flex items-center space-x-3">
              {establishment?.logo && (
                <img 
                  src={establishment.logo}
                  alt={`Logo ${establishment.name}`}
                  className="h-12 w-12 rounded-full object-cover"
                />
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">
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
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Status and Cart */}
          <div className="flex items-center space-x-6">
            {/* Status */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${establishment?.is_open ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`text-sm font-medium ${establishment?.is_open ? 'text-green-600' : 'text-red-600'}`}>
                {establishment?.is_open ? 'Aberto' : 'Fechado'}
              </span>
            </div>

            {/* Cart Button */}
            <Link href="/checkout">
              <Button 
                className={`relative bg-primary text-white hover:bg-orange-600 transition-all duration-300 flex items-center justify-center h-12 px-6 rounded-lg shadow-lg ${
                  isCartAnimating ? 'cart-shake' : ''
                }`}
              >
                <ShoppingCart className="w-5 h-5 sm:mr-2" />
                <span className="hidden sm:inline font-medium">Carrinho</span>
                {cart.itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center p-0 font-bold">
                    {cart.itemCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
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
      <footer className="footer">
        <div className="footer-content">
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 text-sm">
              © 2024 {establishment?.name || 'Restaurante'}. Todos os direitos reservados.
            </span>
          </div>
          <div className="footer-contact">
            {establishment?.phone && (
              <span>
                📞 {establishment.phone}
              </span>
            )}
            {establishment?.address && (
              <span>
                📍 {establishment.address}
              </span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}