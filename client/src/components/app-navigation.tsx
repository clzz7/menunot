import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button.js";
import { Badge } from "@/components/ui/badge.js";
import { ShoppingCart, UtensilsCrossed, Package, Home } from "lucide-react";
import { useCart } from "@/hooks/use-cart.js";

export default function AppNavigation() {
  const [location] = useLocation();
  const { cart, isCartAnimating } = useCart();

  const isCartActive = location === '/checkout';

  const navigationItems = [
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
  ];

  return (
    <>
      <style>{`
        .app-navigation {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 20px;
          padding: 8px 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          width: auto;
          max-width: 300px;
        }

        .app-navigation.hidden {
          transform: translateY(100%);
        }

        .nav-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 10px 12px;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: #6b7280;
          background: transparent;
          border: none;
          min-height: 48px;
          min-width: 60px;
          position: relative;
          overflow: hidden;
        }

        .nav-item::before {
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

        .nav-item > * {
          position: relative;
          z-index: 1;
        }

        .nav-item.active {
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(234, 88, 12, 0.3);
        }

        .nav-item.active::before {
          opacity: 1;
        }

        .nav-item:hover:not(.active) {
          background: rgba(234, 88, 12, 0.08);
          color: #ea580c;
          transform: translateY(-2px);
        }

        .nav-item-icon {
          margin-bottom: 0.125rem;
        }

        .nav-item-label {
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .cart-button {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 10px 12px;
          border-radius: 12px;
          background: transparent;
          color: #6b7280;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          min-height: 48px;
          min-width: 60px;
          overflow: hidden;
        }

        .cart-button::before {
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

        .cart-button > * {
          position: relative;
          z-index: 1;
        }

        .cart-button.active {
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(234, 88, 12, 0.3);
        }

        .cart-button.active::before {
          opacity: 1;
        }

        .cart-button:hover:not(.active) {
          background: rgba(234, 88, 12, 0.08);
          color: #ea580c;
          transform: translateY(-2px);
        }

        .cart-button.shake {
          animation: cartShake 0.5s ease-in-out;
        }

        .cart-badge {
          position: absolute;
          top: 0.125rem;
          right: 0.125rem;
          background: #dc2626;
          color: white;
          font-size: 0.5rem;
          font-weight: 700;
          border-radius: 50%;
          width: 1rem;
          height: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid white;
        }

        @keyframes cartShake {
          0%, 100% { transform: translateY(-2px) translateX(0); }
          25% { transform: translateY(-2px) translateX(-2px); }
          75% { transform: translateY(-2px) translateX(2px); }
        }

        @media (max-width: 768px) {
          .app-navigation {
            bottom: 16px;
            max-width: 280px;
            padding: 6px 10px;
          }

          .nav-container {
            gap: 6px;
          }
          
          .nav-item,
          .cart-button {
            min-height: 44px;
            min-width: 55px;
            padding: 8px 10px;
          }
          
          .nav-item-label {
            font-size: 0.6rem;
          }
        }
      `}</style>

      <nav className="app-navigation">
        <div className="nav-container">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`nav-item ${item.isActive ? 'active' : ''}`}
              >
                <Icon className="nav-item-icon" size={20} />
                <span className="nav-item-label">{item.name}</span>
              </Link>
            );
          })}

          <Link
            href="/checkout"
            className={`cart-button ${isCartActive ? 'active' : ''} ${isCartAnimating ? 'shake' : ''}`}
          >
            <ShoppingCart size={20} />
            <span className="nav-item-label">Carrinho</span>
            {cart.itemCount > 0 && (
              <span className="cart-badge">
                {cart.itemCount}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </>
  );
}