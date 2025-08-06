import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button.js";
import { Badge } from "@/components/ui/badge.js";
import { ShoppingCart, UtensilsCrossed, Package, Home } from "lucide-react";
import { useCart } from "@/hooks/use-cart.js";

export default function AppNavigation() {
  const [location] = useLocation();
  const { cart, isCartAnimating } = useCart();

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
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(0, 0, 0, 0.1);
          padding: 1rem;
          transform: translateY(0);
          transition: transform 0.3s ease;
        }

        .app-navigation.hidden {
          transform: translateY(100%);
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1rem;
          align-items: center;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0.75rem;
          border-radius: 1rem;
          text-decoration: none;
          transition: all 0.3s ease;
          color: #6b7280;
          background: transparent;
          border: 2px solid transparent;
          min-height: 4rem;
        }

        .nav-item.active {
          background: #ea580c;
          color: white;
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(234, 88, 12, 0.3);
        }

        .nav-item:hover:not(.active) {
          background: rgba(234, 88, 12, 0.1);
          color: #ea580c;
          transform: translateY(-2px);
        }

        .nav-item-icon {
          margin-bottom: 0.25rem;
        }

        .nav-item-label {
          font-size: 0.75rem;
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
          padding: 0.75rem;
          border-radius: 1rem;
          background: #ea580c;
          color: white;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          min-height: 4rem;
          box-shadow: 0 4px 15px rgba(234, 88, 12, 0.3);
        }

        .cart-button:hover {
          background: #dc2626;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(234, 88, 12, 0.4);
        }

        .cart-button.shake {
          animation: cartShake 0.5s ease-in-out;
        }

        .cart-badge {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
          background: #dc2626;
          color: white;
          font-size: 0.625rem;
          font-weight: 700;
          border-radius: 50%;
          width: 1.25rem;
          height: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        @keyframes cartShake {
          0%, 100% { transform: translateY(-2px) translateX(0); }
          25% { transform: translateY(-2px) translateX(-2px); }
          75% { transform: translateY(-2px) translateX(2px); }
        }

        @media (max-width: 768px) {
          .nav-container {
            padding: 0 1rem;
          }
          
          .nav-item,
          .cart-button {
            min-height: 3.5rem;
            padding: 0.5rem;
          }
          
          .nav-item-label {
            font-size: 0.625rem;
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
            className={`cart-button ${isCartAnimating ? 'shake' : ''}`}
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