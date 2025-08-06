import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient.js";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster.js";
import { TooltipProvider } from "@/components/ui/tooltip.js";
import Layout from "@/components/layout.js";
import AnimatedHeader from "@/components/animated-header.js";
import BottomNavigation from "@/components/bottom-navigation.js";
import Home from "@/pages/home.js";
import Cardapio from "@/pages/cardapio.js";
import Pedidos from "@/pages/pedidos.js";
import Checkout from "@/pages/checkout.js";
import Rastreamento from "@/pages/rastreamento.js";
import Contato from "@/pages/contato.js";
import Admin from "@/pages/admin.js";
import Login from "@/pages/login.js";
import NotFound from "@/pages/not-found.js";
import PaymentSuccess from "@/pages/payment-success.js";
import PaymentFailure from "@/pages/payment-failure.js";
import PaymentPending from "@/pages/payment-pending.js";
import { CartProvider } from "@/hooks/use-cart.js";
import { AuthProvider } from "@/hooks/use-auth.js";
import { ProtectedRoute } from "@/components/protected-route.js";
import { motion, AnimatePresence } from "framer-motion";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/cardapio" component={Cardapio} />
      <Route path="/pedidos" component={Pedidos} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/rastreamento" component={Rastreamento} />
      <Route path="/contato" component={Contato} />
      <Route path="/login" component={Login} />
      <Route path="/admin">
        <ProtectedRoute>
          <Admin />
        </ProtectedRoute>
      </Route>
      <Route path="/payment/success" component={PaymentSuccess} />
      <Route path="/payment/failure" component={PaymentFailure} />
      <Route path="/payment/pending" component={PaymentPending} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  
  const isHomePage = location === '/';
  const isAdminPage = location.startsWith('/admin');
  const isPaymentPage = location.startsWith('/payment');
  const isAuthPage = location === '/login';
  const isAppPage = ['/cardapio', '/pedidos', '/checkout', '/contato'].includes(location);
  
  // Pages that don't use any custom navigation
  if (isAdminPage || isPaymentPage) {
    return <>{children}</>;
  }
  
  // Landing page with animated header
  if (isHomePage) {
    return (
      <div className="min-h-screen">
        <AnimatedHeader />
        <motion.main 
          className="pt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {children}
        </motion.main>
      </div>
    );
  }
  
  // App pages (cardápio, pedidos, checkout) with bottom navigation
  if (isAppPage) {
    return (
      <div className="min-h-screen pb-24">
        <motion.main 
          className="min-h-screen"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.main>
        <BottomNavigation />
      </div>
    );
  }
  
  // Other pages use the original layout
  return (
    <Layout>
      {children}
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <AnimatePresence mode="wait">
              <ConditionalLayout>
                <Router />
              </ConditionalLayout>
            </AnimatePresence>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
