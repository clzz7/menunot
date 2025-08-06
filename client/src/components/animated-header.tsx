import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button.js";
import { Badge } from "@/components/ui/badge.js";
import { ShoppingCart, User, Phone, MapPin } from "lucide-react";
import { useCart } from "@/hooks/use-cart.js";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api.js";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";

interface AnimatedHeaderProps {
  className?: string;
}

export default function AnimatedHeader({ className = "" }: AnimatedHeaderProps) {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart } = useCart();
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLImageElement>(null);
  const menuLinksRef = useRef<HTMLDivElement[]>([]);
  const menuTagsRef = useRef<HTMLDivElement[]>([]);
  const footerRef = useRef<HTMLDivElement>(null);

  const { data: establishment } = useQuery({
    queryKey: ["/api/establishment"],
    queryFn: api.establishment.get
  });

  // Menu navigation items
  const menuItems = [
    { name: 'Início', href: '/', description: 'Voltar à página inicial' },
    { name: 'Cardápio', href: '/cardapio', description: 'Explore nossos pratos' },
    { name: 'Pedidos', href: '/pedidos', description: 'Acompanhe seus pedidos' },
    { name: 'Contato', href: '/contato', description: 'Entre em contato conosco' },
  ];

  const menuTags = [
    { name: 'Culinária Artesanal', href: '/cardapio' },
    { name: 'Ingredientes Frescos', href: '/cardapio' },
    { name: 'Experiência Única', href: '/sobre' },
  ];

  // GSAP Timeline for menu animation
  const animateMenuOpen = () => {
    const tl = gsap.timeline();
    
    // Set initial states
    gsap.set(overlayRef.current, { opacity: 0 });
    gsap.set(contentRef.current, { y: "100%" });
    gsap.set(mediaRef.current, { scale: 1.1 });
    gsap.set(menuLinksRef.current, { opacity: 0, x: 30 });
    gsap.set(menuTagsRef.current, { opacity: 0, x: 30 });
    gsap.set(footerRef.current, { opacity: 0, y: 20 });

    // Animate overlay
    tl.to(overlayRef.current, {
      opacity: 1,
      duration: 0.4,
      ease: "power2.out"
    })
    // Animate content sliding up
    .to(contentRef.current, {
      y: 0,
      duration: 0.8,
      ease: "power4.out"
    }, "-=0.2")
    // Animate media scale
    .to(mediaRef.current, {
      scale: 1,
      duration: 1,
      ease: "power2.out"
    }, "-=0.6")
    // Animate menu links
    .to(menuLinksRef.current, {
      opacity: 1,
      x: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out"
    }, "-=0.4")
    // Animate menu tags
    .to(menuTagsRef.current, {
      opacity: 1,
      x: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out"
    }, "-=0.2")
    // Animate footer
    .to(footerRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.3");

    return tl;
  };

  const animateMenuClose = () => {
    const tl = gsap.timeline();
    
    tl.to([menuLinksRef.current, menuTagsRef.current, footerRef.current], {
      opacity: 0,
      y: -10,
      duration: 0.3,
      ease: "power2.in"
    })
    .to(contentRef.current, {
      y: "100%",
      duration: 0.5,
      ease: "power2.in"
    }, "-=0.1")
    .to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in"
    }, "-=0.2");

    return tl;
  };

  // Toggle menu with GSAP animations
  const toggleMenu = () => {
    if (!isMenuOpen) {
      setIsMenuOpen(true);
      setTimeout(() => {
        animateMenuOpen();
      }, 50);
    } else {
      animateMenuClose().then(() => {
        setIsMenuOpen(false);
      });
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
        if (isMenuOpen) {
          animateMenuClose().then(() => {
            setIsMenuOpen(false);
          });
        }
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
      {/* Menu Bar */}
      <div className="menu-bar bg-white/95 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <div className="menu-logo">
              <Link href="/" className="flex items-center space-x-3 group">
                {establishment?.logo && (
                  <img 
                    src={establishment.logo}
                    alt={`Logo ${establishment.name}`}
                    className="h-12 w-12 rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 tracking-wide">
                    {establishment?.name || 'The Riverside'}
                  </h1>
                </div>
              </Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Status Indicator */}
              <div className="hidden md:flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${establishment?.is_open ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-xs font-medium ${establishment?.is_open ? 'text-green-600' : 'text-red-600'}`}>
                  {establishment?.is_open ? 'ABERTO' : 'FECHADO'}
                </span>
              </div>

              {/* Cart Button */}
              <Link href="/checkout">
                <Button 
                  variant="ghost"
                  className="relative flex items-center justify-center h-12 w-12 rounded-full hover:bg-gray-100 transition-all duration-300"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cart.itemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center p-0 font-bold">
                      {cart.itemCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Menu Toggle */}
              <div className="menu-toggle-btn">
                <button
                  onClick={toggleMenu}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
                >
                  <div className="menu-toggle-label">
                    <p className="text-sm font-medium text-gray-700">Menu</p>
                  </div>
                  <div 
                    ref={hamburgerRef}
                    className={`menu-hamburger-icon ${isMenuOpen ? 'active' : ''}`}
                  >
                    <span></span>
                    <span></span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <div 
          ref={overlayRef}
          className="menu-overlay fixed inset-0 z-40"
          style={{ opacity: 0 }}
        >
          <div 
            ref={contentRef}
            className="menu-overlay-content h-full flex"
            style={{ transform: 'translateY(100%)' }}
          >
            {/* Menu Media */}
            <div className="menu-media-wrapper flex-1 relative overflow-hidden">
              <img 
                ref={mediaRef}
                src={establishment?.logo || "/api/placeholder/800/600"}
                alt="Menu background"
                className="w-full h-full object-cover"
                style={{ transform: 'scale(1.1)' }}
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>

            {/* Menu Content */}
            <div className="menu-content-wrapper flex-1 bg-white flex flex-col">
              <div className="menu-content-main flex-1 p-12 flex">
                {/* Main Navigation */}
                <div className="menu-col flex-1 space-y-8">
                  {menuItems.map((item, index) => (
                    <div
                      key={item.name}
                      ref={el => { if (el) menuLinksRef.current[index] = el; }}
                      className="menu-link"
                      style={{ opacity: 0, transform: 'translateX(30px)' }}
                    >
                      <Link 
                        href={item.href}
                        onClick={() => {
                          animateMenuClose().then(() => {
                            setIsMenuOpen(false);
                          });
                        }}
                        className="block group"
                      >
                        <h3 className="text-4xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-300">
                          {item.name}
                        </h3>
                        <p className="text-gray-600 text-sm group-hover:text-gray-800 transition-colors duration-300">
                          {item.description}
                        </p>
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="menu-col flex-1 space-y-4">
                  {menuTags.map((tag, index) => (
                    <div
                      key={tag.name}
                      ref={el => { if (el) menuTagsRef.current[index] = el; }}
                      className="menu-tag"
                      style={{ opacity: 0, transform: 'translateX(30px)' }}
                    >
                      <Link 
                        href={tag.href}
                        onClick={() => {
                          animateMenuClose().then(() => {
                            setIsMenuOpen(false);
                          });
                        }}
                        className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-primary hover:text-white transition-all duration-300"
                      >
                        {tag.name}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Menu Footer */}
              <div 
                ref={footerRef}
                className="menu-footer p-12 pt-0 flex space-x-12"
                style={{ opacity: 0, transform: 'translateY(20px)' }}
              >
                <div className="menu-col">
                  <p className="text-gray-600 font-medium">
                    {establishment?.address || 'São Paulo, Brasil'}
                  </p>
                </div>
                <div className="menu-col space-y-1">
                  {establishment?.phone && (
                    <p className="text-gray-600">
                      {establishment.phone}
                    </p>
                  )}
                  <p className="text-gray-600">
                    contato@{establishment?.name?.toLowerCase().replace(/\s+/g, '') || 'restaurante'}.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .menu-hamburger-icon {
          width: 24px;
          height: 18px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .menu-hamburger-icon span {
          display: block;
          height: 2px;
          width: 100%;
          background-color: #374151;
          border-radius: 1px;
          transition: all 0.3s ease;
          transform-origin: center;
        }

        .menu-hamburger-icon.active span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        .menu-hamburger-icon.active span:nth-child(2) {
          transform: rotate(-45deg) translate(7px, -6px);
        }

        .menu-overlay {
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
        }

        .menu-overlay-content {
          background: white;
          min-height: 100vh;
        }

        .menu-media-wrapper {
          min-height: 100vh;
        }

        @media (max-width: 768px) {
          .menu-overlay-content {
            flex-direction: column;
          }
          
          .menu-media-wrapper {
            height: 40vh;
          }
          
          .menu-content-main {
            flex-direction: column;
            padding: 2rem;
          }
          
          .menu-link h3 {
            font-size: 2rem;
          }
        }
      `}</style>
    </header>
  );
}