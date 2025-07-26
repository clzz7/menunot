import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button.js";
import { Badge } from "@/components/ui/badge.js";
import { ShoppingCart, Menu, Home, UtensilsCrossed, Package, History, X, User, Phone, MapPin, Clock } from "lucide-react";
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

  // Navegação principal expandida
  const mainNavigation = [
    { name: 'MENU', href: '/cardapio', icon: UtensilsCrossed },
    { name: 'ABOUT', href: '/sobre', icon: Home },
    { name: 'CONTACT', href: '/contato', icon: Phone },
  ];

  // Navegação mobile (simplificada)
  const mobileNavigation = [
    { name: 'Início', href: '/', icon: Home },
    { name: 'Cardápio', href: '/cardapio', icon: UtensilsCrossed },
    { name: 'Meus Pedidos', href: '/pedidos', icon: Package },
    { name: 'Contato', href: '/contato', icon: Phone },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-2 border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Left Section - Navigation */}
            <div className="flex items-center space-x-8">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-all duration-300 ${
                  isMobileMenuOpen ? 'hamburger-open' : ''
                }`}
              >
                <div className="w-6 h-6 flex flex-col justify-center items-center">
                  <span className="hamburger-line"></span>
                  <span className="hamburger-line"></span>
                  <span className="hamburger-line"></span>
                </div>
              </button>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-8">
                {mainNavigation.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`text-sm font-medium tracking-wide transition-all duration-300 hover:text-primary relative group ${
                        isActive 
                          ? 'text-primary' 
                          : 'text-gray-700 hover:text-primary'
                      }`}
                    >
                      {item.name}
                      <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full ${
                        isActive ? 'w-full' : ''
                      }`}></span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Center Section - Restaurant Name */}
            <div className="flex-1 flex justify-center">
              <Link href="/" className="flex items-center space-x-3 group">
                {establishment?.logo && (
                  <img 
                    src={establishment.logo}
                    alt={`Logo ${establishment.name}`}
                    className="h-12 w-12 rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 tracking-wide title-gradient">
                    {establishment?.name || 'The Riverside'}
                  </h1>
                </div>
              </Link>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center space-x-4">
              {/* Status Indicator */}
              <div className="hidden md:flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${establishment?.is_open ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-xs font-medium ${establishment?.is_open ? 'text-green-600' : 'text-red-600'}`}>
                  {establishment?.is_open ? 'ABERTO' : 'FECHADO'}
                </span>
              </div>

              {/* Login Button */}
              <Button 
                variant="ghost" 
                className="hidden md:flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors duration-300"
              >
                <User className="w-4 h-4" />
                <span className="font-medium">Log In</span>
              </Button>

              {/* Cart Button */}
              <Link href="/checkout">
                <Button 
                  variant="outline"
                  className={`relative border-2 border-gray-300 hover:border-primary text-gray-700 hover:text-primary transition-all duration-300 flex items-center justify-center h-12 w-12 rounded-full ${
                    isCartAnimating ? 'cart-shake' : ''
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cart.itemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center p-0 font-bold">
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
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 pt-4 pb-6 space-y-2">
              {mobileNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                      isActive 
                        ? 'bg-primary text-white shadow-md' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Mobile Status */}
              <div className="flex items-center justify-center space-x-2 pt-4 border-t border-gray-200 mt-4">
                <div className={`h-3 w-3 rounded-full ${establishment?.is_open ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm font-medium ${establishment?.is_open ? 'text-green-600' : 'text-red-600'}`}>
                  {establishment?.is_open ? 'Restaurante Aberto' : 'Restaurante Fechado'}
                </span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Restaurant Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {establishment?.name || 'Restaurante'}
              </h3>
              <p className="text-gray-600 text-sm">
                {establishment?.description || 'Experiência gastronômica única'}
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Contato</h3>
              <div className="space-y-2">
                {establishment?.phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{establishment.phone}</span>
                  </div>
                )}
                {establishment?.address && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{establishment.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Copyright */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Informações</h3>
              <p className="text-sm text-gray-600">
                © 2024 {establishment?.name || 'Restaurante'}. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}