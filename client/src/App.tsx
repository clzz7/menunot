import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout";
import Home from "@/pages/home";
import Cardapio from "@/pages/cardapio";
import Pedidos from "@/pages/pedidos";
import Checkout from "@/pages/checkout";
import Rastreamento from "@/pages/rastreamento";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";
import PaymentSuccess from "@/pages/payment-success";
import PaymentFailure from "@/pages/payment-failure";
import PaymentPending from "@/pages/payment-pending";
import { CartProvider } from "@/hooks/use-cart";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/cardapio" component={Cardapio} />
      <Route path="/pedidos" component={Pedidos} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/rastreamento" component={Rastreamento} />
      <Route path="/admin" component={Admin} />
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
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Layout>
            <Router />
          </Layout>
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
