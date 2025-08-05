import { Link, useLocation } from "wouter";
import { UtensilsCrossed, Package, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge.js";
import { useCart } from "@/hooks/use-cart.js";
import { Button } from "@/components/ui/button.js";

export default function BottomNavigation() {
  const [location] = useLocation();
  const { cart, isCartAnimating } = useCart();

  const navItems = [
    {
      name: 'Cardápio',
      href: '/cardapio',
      icon: UtensilsCrossed,
      isActive: location === '/cardapio'
    },
    {
      name: 'Pedidos',
      href: '/pedidos', 
      icon: Package,
      isActive: location === '/pedidos'
    },
    {
      name: 'Carrinho',
      href: '/checkout',
      icon: ShoppingCart,
      isActive: location === '/checkout',
      badge: cart.itemCount > 0 ? cart.itemCount : null,
      isAnimating: isCartAnimating
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bottom-nav-glass shadow-xl z-50 bottom-nav-slide-up">
      <div className="max-w-7xl mx-auto px-4 bottom-nav-safe">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={`bottom-nav-item relative flex flex-col items-center justify-center h-16 w-16 sm:h-14 sm:w-14 rounded-xl transition-all duration-300 hover:bg-gray-100 ${
                    item.isActive 
                      ? 'bg-primary/10 text-primary shadow-md transform scale-105' 
                      : 'text-gray-600 hover:text-primary'
                  } ${
                    item.isAnimating ? 'cart-shake' : ''
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-1 transition-transform duration-300 ${
                    item.isActive ? 'scale-110' : 'scale-100'
                  } ${
                    item.name === 'Carrinho' && item.badge ? 'animate-pulse' : ''
                  }`} />
                  
                  <span className={`text-xs font-medium transition-all duration-300 ${
                    item.isActive ? 'text-primary font-semibold' : 'text-gray-500'
                  }`}>
                    {item.name}
                  </span>

                  {item.badge && (
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center p-0 font-bold animate-bounce">
                      {item.badge}
                    </Badge>
                  )}

                  {/* Active indicator */}
                  {item.isActive && (
                    <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full shadow-sm" />
                  )}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}