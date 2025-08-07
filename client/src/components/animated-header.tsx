import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { gsap } from "gsap";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api.js";
import { useIsMobile } from "@/hooks/use-mobile";

interface AnimatedHeaderProps {
  onNavigate?: (href: string) => void;
}

export default function AnimatedHeader({ onNavigate }: AnimatedHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const menuToggleIconRef = useRef<HTMLDivElement>(null);
  const menuLinksRef = useRef<HTMLDivElement[]>([]);
  const menuContentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const { data: establishment } = useQuery({
    queryKey: ["/api/establishment"],
    queryFn: api.establishment.get
  });

  useEffect(() => {
    if (menuOverlayRef.current) {
      gsap.set(menuOverlayRef.current, {
        clipPath: "circle(0% at 100% 0%)",
        visibility: "hidden",
        force3D: true,
        willChange: 'clip-path, visibility'
      });
    }

    if (menuLinksRef.current.length > 0) {
      gsap.set(menuLinksRef.current, {
        y: 100,
        opacity: 0,
        force3D: true,
        willChange: 'transform, opacity'
      });
    }

    if (menuContentRef.current) {
      gsap.set(menuContentRef.current, {
        x: 100,
        opacity: 0,
        force3D: true,
        willChange: 'transform, opacity'
      });
    }
  }, []);

  const toggleMenu = () => {
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const openMenu = () => {
    setIsMenuOpen(true);
    if (menuToggleIconRef.current) {
      menuToggleIconRef.current.classList.add('active');
    }

    const tl = gsap.timeline();
    const overlayDuration = isMobile ? 0.5 : 0.8;
    const contentDuration = isMobile ? 0.4 : 0.6;
    const staggerDelay = isMobile ? 0.06 : 0.1;

    tl.set(menuOverlayRef.current, { visibility: "visible" })
      .to(menuOverlayRef.current, {
        clipPath: "circle(150% at 100% 0%)",
        duration: overlayDuration,
        ease: "power2.inOut",
        force3D: true
      })
      .to(menuContentRef.current, {
        x: 0,
        opacity: 1,
        duration: contentDuration,
        ease: "power2.out",
        force3D: true
      }, "-=0.4")
      .to(menuLinksRef.current, {
        y: 0,
        opacity: 1,
        duration: contentDuration,
        stagger: staggerDelay,
        ease: "power2.out",
        force3D: true
      }, "-=0.3");
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    if (menuToggleIconRef.current) {
      menuToggleIconRef.current.classList.remove('active');
    }

    const tl = gsap.timeline();
    const linksDuration = isMobile ? 0.2 : 0.3;
    const contentDuration = isMobile ? 0.3 : 0.4;
    const overlayDuration = isMobile ? 0.4 : 0.6;
    const linksStagger = isMobile ? 0.03 : 0.05;

    tl.to(menuLinksRef.current, {
        y: -50,
        opacity: 0,
        duration: linksDuration,
        stagger: linksStagger,
        ease: "power2.in",
        force3D: true
      })
      .to(menuContentRef.current, {
        x: 100,
        opacity: 0,
        duration: contentDuration,
        ease: "power2.in",
        force3D: true
      }, "-=0.2")
      .to(menuOverlayRef.current, {
        clipPath: "circle(0% at 100% 0%)",
        duration: overlayDuration,
        ease: "power2.inOut",
        force3D: true
      }, "-=0.2")
      .set(menuOverlayRef.current, { 
        visibility: "hidden",
        willChange: 'auto'
      })
      .set([menuContentRef.current, menuLinksRef.current], {
        willChange: 'auto'
      });
  };

  const handleMenuClick = (href: string) => {
    closeMenu();
    setTimeout(() => {
      if (onNavigate) {
        onNavigate(href);
      }
    }, 800); // Wait for menu close animation
  };

  const menuItems = [
    { name: "Início", href: "/" },
    { name: "Cardápio", href: "/cardapio" },
    { name: "Pedidos", href: "/pedidos" },
    { name: "Contato", href: "/contato" }
  ];

  return (
    <>
      <style>{`
        .animated-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .menu-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .menu-logo {
          z-index: 1001;
        }

        .menu-logo img {
          height: 2.5rem;
          width: auto;
        }

        .menu-toggle-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          z-index: 1001;
          background: none;
          border: none;
          padding: 0.5rem;
        }

        .menu-toggle-label {
          display: none;
        }

        .menu-toggle-label p {
          font-size: 0.875rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #374151;
        }

        .menu-hamburger-icon {
          width: 2rem;
          height: 2rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0.25rem;
          cursor: pointer;
        }

        .menu-hamburger-icon span {
          width: 100%;
          height: 2px;
          background-color: #374151;
          transition: all 0.3s ease;
          transform-origin: center;
        }

        .menu-hamburger-icon span:nth-child(1) {
          transform: translateY(0);
        }

        .menu-hamburger-icon span:nth-child(2) {
          transform: translateY(0);
        }

        .menu-hamburger-icon.active span:nth-child(1) {
          transform: rotate(45deg) translateY(0.35rem);
        }

        .menu-hamburger-icon.active span:nth-child(2) {
          transform: rotate(-45deg) translateY(-0.35rem);
        }

        .menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #ffffff;
          z-index: 999;
          visibility: hidden;
        }

        .menu-overlay-content {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 2rem;
        }

        .menu-media-wrapper {
          display: none;
        }

        .menu-content-wrapper {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-end;
          text-align: right;
          padding: 4rem 2rem 2rem;
          width: 100%;
          max-width: 600px;
          margin-left: auto;
          padding-right: 4rem;
        }

        .menu-content-main {
          display: flex;
          gap: 4rem;
          align-items: flex-start;
          justify-content: flex-end;
        }

        .menu-footer {
          display: flex;
          gap: 4rem;
          margin-top: 2rem;
          justify-content: flex-end;
        }

        .menu-content-main,
        .menu-footer {
          align-items: flex-start;
        }

        .menu-col {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          align-items: flex-end;
          text-align: right;
        }

        .menu-col:nth-child(1) {
          flex: 2;
        }

        .menu-col:nth-child(2) {
          flex: 1;
        }

        .menu-link a {
          font-size: 3rem;
          font-weight: 600;
          line-height: 1.1;
          transition: all 0.3s ease;
          text-decoration: none;
          color: #374151;
          cursor: pointer;
        }

        .menu-link a:hover {
          color: #ea580c;
          transform: translateX(1rem);
        }

        .menu-tag a,
        .menu-footer p {
          font-size: 0.875rem;
          color: #6b7280;
        }

        @media (max-width: 1000px) {
          .menu-content-wrapper {
            padding-right: 2rem;
            align-items: center;
            text-align: center;
          }

          .menu-content-main,
          .menu-footer {
            flex-direction: column;
            gap: 2rem;
            justify-content: center;
          }

          .menu-col {
            align-items: center;
            text-align: center;
          }

          .menu-link a {
            font-size: 2.5rem;
          }

          .menu-toggle-label {
            display: block;
          }
        }

        .restaurant-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: #374151;
          text-decoration: none;
        }
      `}</style>

      <nav className="animated-nav">
        <div className="menu-bar">
          <div className="menu-logo">
            <Link href="/" className="restaurant-name">
              {establishment?.name || 'Restaurant'}
            </Link>
          </div>
          <button 
            className="menu-toggle-btn"
            onClick={toggleMenu}
          >
            <div className="menu-toggle-label">
              <p>Menu</p>
            </div>
            <div 
              className="menu-hamburger-icon"
              ref={menuToggleIconRef}
            >
              <span></span>
              <span></span>
            </div>
          </button>
        </div>

                 <div 
           className="menu-overlay"
           ref={menuOverlayRef}
         >
           <div className="menu-overlay-content">
             <div 
               className="menu-content-wrapper"
               ref={menuContentRef}
             >
              <div className="menu-content-main">
                <div className="menu-col">
                  {menuItems.map((item, index) => (
                    <div 
                      key={item.name}
                      className="menu-link"
                      ref={(el) => {
                        if (el) {
                          menuLinksRef.current[index] = el;
                        }
                      }}
                    >
                      <a onClick={() => handleMenuClick(item.href)}>
                        {item.name}
                      </a>
                    </div>
                  ))}
                </div>
                <div className="menu-col">
                  <div className="menu-tag">
                    <a href="#">Experiência Única</a>
                  </div>
                  <div className="menu-tag">
                    <a href="#">Sabores Artesanais</a>
                  </div>
                  <div className="menu-tag">
                    <a href="#">Ambiente Acolhedor</a>
                  </div>
                </div>
              </div>
              <div className="menu-footer">
                <div className="menu-col">
                  <p>{establishment?.address || 'Endereço do Restaurante'}</p>
                </div>
                <div className="menu-col">
                  <p>{establishment?.phone || '+55 (11) 99999-9999'}</p>
                  <p>contato@restaurant.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}