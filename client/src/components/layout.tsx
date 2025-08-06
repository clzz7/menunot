import { ReactNode } from "react";
import { useLocation } from "wouter";
import AnimatedHeader from "@/components/animated-header.js";
import AppNavigation from "@/components/app-navigation.js";
import { useNavigation } from "@/hooks/use-navigation.js";

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
          padding-bottom: 7rem;
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
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Sobre Nós</h3>
          <p>
            Proporcionamos uma experiência gastronômica única, onde a tradição 
            encontra a inovação em cada prato cuidadosamente preparado.
          </p>
        </div>

        <div className="footer-section">
          <h3>Contato</h3>
          <div className="footer-contact">
            <span>📍</span>
            <span>Rua das Flores, 123 - Centro</span>
          </div>
          <div className="footer-contact">
            <span>📞</span>
            <span>+55 (11) 99999-9999</span>
          </div>
          <div className="footer-contact">
            <span>✉️</span>
            <span>contato@restaurant.com</span>
          </div>
        </div>

        <div className="footer-section">
          <h3>Horário de Funcionamento</h3>
          <p style={{ marginBottom: '0.5rem' }}>Segunda a Sexta: 11h - 23h</p>
          <p style={{ marginBottom: '0.5rem' }}>Sábado: 12h - 24h</p>
          <p>Domingo: 12h - 22h</p>
        </div>
      </div>
    </footer>
  );
}