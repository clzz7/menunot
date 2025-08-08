import { ReactNode, useState } from "react";
import { useLocation } from "wouter";
import AnimatedHeader from "@/components/animated-header.js";
import AppNavigation from "@/components/app-navigation.js";
import { useNavigation } from "@/hooks/use-navigation.js";
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail, Clock } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { 
    showAnimatedHeader, 
    showAppNavigation, 
    isTransitioning, 
    navigateWithTransition,
    isNoNavigationPage 
  } = useNavigation();

  // Don't render navigation for certain pages
  if (isNoNavigationPage) {
    return <>{children}</>;
  }

  return (
    <>
      <style>{`
        .layout-container {
          min-height: 100vh;
          background: #ffffff;
          transition: all 0.3s ease;
        }

        .layout-container.transitioning {
          opacity: 0.95;
        }

        .main-content {
          width: 100%;
          min-height: 100vh;
          transition: all 0.3s ease;
        }

        .main-content.with-header {
          padding-top: 0;
        }

        .main-content.with-bottom-nav {
          padding-top: 0;
          padding-bottom: 70px;
        }

        .transition-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.8);
          z-index: 9999;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .transition-overlay.active {
          opacity: 1;
          pointer-events: all;
        }

        .footer {
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          padding: 2rem 0;
          margin-top: auto;
        }

        .footer.hidden {
          display: none;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .footer-section h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 1rem;
        }

        .footer-section p {
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.6;
        }

        .footer-contact {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .footer-content {
            grid-template-columns: 1fr;
            text-align: center;
          }
        }
      `}</style>

      <div className={`layout-container ${isTransitioning ? 'transitioning' : ''}`}>
        {/* Animated Header - only on landing page */}
        {showAnimatedHeader && (
          <AnimatedHeader onNavigate={navigateWithTransition} />
        )}

        {/* Transition Overlay */}
        <div className={`transition-overlay ${isTransitioning ? 'active' : ''}`}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#374151'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #ea580c',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            Carregando...
          </div>
        </div>

        {/* Main Content */}
        <main className={`main-content ${showAnimatedHeader ? 'with-header' : ''} ${showAppNavigation ? 'with-bottom-nav' : ''}`}>
          {children}
        </main>

        {/* Footer - only show on landing page */}
        {showAnimatedHeader && <Footer />}

        {/* App Navigation - only on app pages */}
        {showAppNavigation && <AppNavigation />}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

// Footer component
function Footer() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail("");
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-foreground/10 bg-gradient-to-b from-amber-50/60 to-background">
      <div className="absolute inset-0 bg-micro-grid opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="text-2xl font-bold tracking-tight title-gradient">Sabor</div>
            <p className="mt-3 text-sm text-muted-foreground">
              Cozinha de autor onde a tradição encontra a técnica. Ingredientes de estação, tempo e cuidado.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full border border-foreground/10 flex items-center justify-center hover:bg-foreground/[0.04] transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full border border-foreground/10 flex items-center justify-center hover:bg-foreground/[0.04] transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-full border border-foreground/10 flex items-center justify-center hover:bg-foreground/[0.04] transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" aria-label="YouTube" className="w-9 h-9 rounded-full border border-foreground/10 flex items-center justify-center hover:bg-foreground/[0.04] transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold tracking-wide uppercase text-foreground/80">Navegação</div>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="/" className="text-muted-foreground hover:text-foreground transition-colors">Início</a></li>
              <li><a href="/cardapio" className="text-muted-foreground hover:text-foreground transition-colors">Cardápio</a></li>
              <li><a href="/cardapio" className="text-muted-foreground hover:text-foreground transition-colors">Reservas</a></li>
              <li><a href="/login" className="text-muted-foreground hover:text-foreground transition-colors">Área do cliente</a></li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold tracking-wide uppercase text-foreground/80">Contato</div>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Rua das Flores, 123 — Centro</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+55 (11) 99999‑9999</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>contato@sabor.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Ter–Dom, 12h–23h</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold tracking-wide uppercase text-foreground/80">Newsletter</div>
            <p className="mt-3 text-sm text-muted-foreground">Receba novidades e o menu da semana.</p>
            <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                placeholder="seu@email.com"
                className="flex-1 h-11 px-3 rounded-md border border-foreground/10 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button type="submit" className="h-11 px-4 rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors">
                Assinar
              </button>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">Prometemos não enviar spam.</p>
          </div>
        </div>

        <div className="mt-10 border-t border-foreground/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div>© {currentYear} Sabor. Todos os direitos reservados.</div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
            <a href="#" className="hover:text-foreground transition-colors">Termos</a>
            <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}