import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export function useNavigation() {
  const [location, setLocation] = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showAnimatedHeader, setShowAnimatedHeader] = useState(true);
  const [showAppNavigation, setShowAppNavigation] = useState(false);

  // Define quais páginas devem mostrar cada tipo de navegação
  const landingPages = ['/'];
  const appPages = ['/cardapio', '/pedidos'];
  const noNavigationPages = ['/checkout', '/admin', '/login', '/payment'];

  useEffect(() => {
    const isLandingPage = landingPages.includes(location);
    const isAppPage = appPages.some(page => location.startsWith(page));
    const isNoNavigationPage = noNavigationPages.some(page => location.startsWith(page));

    // Determina qual navegação mostrar baseado na rota atual
    const shouldShowAnimatedHeader = isLandingPage;
    const shouldShowAppNavigation = isAppPage;

    // Se houve mudança no tipo de navegação, inicia transição
    if (shouldShowAnimatedHeader !== showAnimatedHeader || shouldShowAppNavigation !== showAppNavigation) {
      setIsTransitioning(true);
      
      // Transição suave
      setTimeout(() => {
        setShowAnimatedHeader(shouldShowAnimatedHeader);
        setShowAppNavigation(shouldShowAppNavigation);
        setIsTransitioning(false);
      }, 300);
    }
  }, [location, showAnimatedHeader, showAppNavigation]);

  const navigateWithTransition = (href: string) => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      setLocation(href);
    }, 200);
  };

  return {
    location,
    setLocation,
    isTransitioning,
    showAnimatedHeader,
    showAppNavigation,
    navigateWithTransition,
    isLandingPage: landingPages.includes(location),
    isAppPage: appPages.some(page => location.startsWith(page)),
    isNoNavigationPage: noNavigationPages.some(page => location.startsWith(page))
  };
}