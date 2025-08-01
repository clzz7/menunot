import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient.js";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster.js";
import { TooltipProvider } from "@/components/ui/tooltip.js";
import Layout from "@/components/layout.js";
import Home from "@/pages/home.js";
import Cardapio from "@/pages/cardapio.js";
import Pedidos from "@/pages/pedidos.js";
import Checkout from "@/pages/checkout.js";
import Rastreamento from "@/pages/rastreamento.js";
import Admin from "@/pages/admin.js";
import Login from "@/pages/login.js";
import NotFound from "@/pages/not-found.js";
import PaymentSuccess from "@/pages/payment-success.js";
import PaymentFailure from "@/pages/payment-failure.js";
import PaymentPending from "@/pages/payment-pending.js";
import { CartProvider } from "@/hooks/use-cart.js";
import { AuthProvider } from "@/hooks/use-auth.js";
import { ProtectedRoute } from "@/components/protected-route.js";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/cardapio" component={Cardapio} />
      <Route path="/pedidos" component={Pedidos} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/rastreamento" component={Rastreamento} />
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Layout>
              <Router />
            </Layout>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
