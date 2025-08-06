import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button.js";
import { Badge } from "@/components/ui/badge.js";
import { UtensilsCrossed, Package, ShoppingCart, Home } from "lucide-react";
import { useCart } from "@/hooks/use-cart.js";
import { motion } from "framer-motion";

interface BottomNavigationProps {
  className?: string;
}

export default function BottomNavigation({ className = "" }: BottomNavigationProps) {
  const [location] = useLocation();
  const { cart } = useCart();

  const navigationItems = [
    {
      name: 'Início',
      href: '/',
      icon: Home,
      active: location === '/'
    },
    {
      name: 'Cardápio',
      href: '/cardapio',
      icon: UtensilsCrossed,
      active: location === '/cardapio'
    },
    {
      name: 'Pedidos',
      href: '/pedidos',
      icon: Package,
      active: location === '/pedidos'
    },
    {
      name: 'Carrinho',
      href: '/checkout',
      icon: ShoppingCart,
      active: location === '/checkout',
      badge: cart.itemCount > 0 ? cart.itemCount : undefined
    }
  ];

  return (
    <motion.nav 
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200/50 ${className}`}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-around h-20">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  className="relative"
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                >
                  <Button
                    variant="ghost"
                    className={`flex flex-col items-center justify-center h-16 w-16 rounded-2xl transition-all duration-300 ${
                      item.active 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">{item.name}</span>
                    
                    {/* Badge for cart */}
                    {item.badge && (
                      <motion.div
                        className="absolute -top-1 -right-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      >
                        <Badge className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center p-0 font-bold">
                          {item.badge}
                        </Badge>
                      </motion.div>
                    )}
                  </Button>
                  
                  {/* Active indicator */}
                  {item.active && (
                    <motion.div
                      className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom" />
    </motion.nav>
  );
}