import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Badge } from "@/components/ui/badge.js";
import { Search, Package, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { OrderHistoryModal } from "@/components/order-history-modal.js";
import { useCart } from "@/hooks/use-cart.js";
import { useToast } from "@/hooks/use-toast.js";
import { api } from "@/lib/api.js";
import { Order, Product } from "@shared/schema.js";

export default function Pedidos() {
  const [customerPhone, setCustomerPhone] = useState("");
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [currentCustomerId, setCurrentCustomerId] = useState<string | null>(null);
  const { addToCart, clearCart } = useCart();
  const { toast } = useToast();

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
    queryFn: api.products.getAll
  });

  const handleSearchOrders = async () => {
    if (!customerPhone.trim()) {
      toast({
        title: "Telefone obrigatório",
        description: "Digite seu número de telefone para buscar seus pedidos",
        variant: "destructive"
      });
      return;
    }

    try {
      const customer = await api.customers.getByWhatsapp(customerPhone);
      if (customer) {
        setCurrentCustomerId(customer.id);
        setIsOrderHistoryOpen(true);
      } else {
        toast({
          title: "Cliente não encontrado",
          description: "Nenhum pedido encontrado para este número de telefone",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro na busca",
        description: "Erro ao buscar pedidos. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleRepeatOrder = async (order: Order) => {
    try {
      // Fetch order items from the API
      const response = await fetch(`/api/orders/${order.id}/items`);
      if (!response.ok) {
        throw new Error('Erro ao buscar itens do pedido');
      }
      
      const orderItems = await response.json();
      
      // Clear current cart and add items from the order
      clearCart();
      
      for (const item of orderItems) {
        // Find the product to get current details
        const product = products.find((p: Product) => p.id === item.productId);
        if (product) {
          for (let i = 0; i < item.quantity; i++) {
            addToCart(product, item.selectedOptions, item.observations);
          }
        }
      }
      
      toast({
        title: "Pedido repetido!",
        description: `${orderItems.length} itens foram adicionados ao carrinho`,
      });
      
      // Close order history and redirect to checkout
      setIsOrderHistoryOpen(false);
      window.location.href = '/checkout';
      
    } catch (error: any) {
      toast({
        title: "Erro ao repetir pedido",
        description: error.message || "Erro interno do servidor",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'CONFIRMED':
      case 'PREPARING':
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      case 'READY':
      case 'OUT_DELIVERY':
        return <Package className="w-4 h-4 text-orange-500" />;
      case 'DELIVERED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': 'Pendente',
      'CONFIRMED': 'Confirmado',
      'PREPARING': 'Preparando',
      'READY': 'Pronto',
      'OUT_DELIVERY': 'Saiu para entrega',
      'DELIVERED': 'Entregue',
      'CANCELLED': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'CONFIRMED': 'bg-blue-100 text-blue-800',
      'PREPARING': 'bg-blue-100 text-blue-800',
      'READY': 'bg-orange-100 text-orange-800',
      'OUT_DELIVERY': 'bg-orange-100 text-orange-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      {/* Hero Banner */}
      <section
        className="relative w-full h-44 sm:h-56 md:h-64 lg:h-72 flex items-center justify-center text-center text-white mb-10"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=60)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 px-4">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Meus Pedidos</h1>
          <p className="text-sm sm:text-base opacity-90 mt-2">Acompanhe ou repita seus pedidos favoritos</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Pedidos</h1>
          <p className="text-gray-600">Consulte o histórico e status dos seus pedidos</p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Buscar Pedidos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Input
                type="tel"
                placeholder="Digite seu número de telefone (ex: 11999999999)"
                value={customerPhone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerPhone(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearchOrders} className="bg-primary hover:bg-orange-600">
                Buscar
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Digite o número de telefone usado nos pedidos para visualizar o histórico
            </p>
          </CardContent>
        </Card>

        {/* How to Use Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Como usar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h3 className="font-medium">Digite seu telefone</h3>
                <p className="text-sm text-gray-600">Use o mesmo número cadastrado nos seus pedidos</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h3 className="font-medium">Visualize seus pedidos</h3>
                <p className="text-sm text-gray-600">Veja o histórico completo com status e detalhes</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h3 className="font-medium">Repita pedidos</h3>
                <p className="text-sm text-gray-600">Refaça pedidos anteriores com um clique</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon('PENDING')}
                <span className="text-sm">Pendente - Aguardando confirmação</span>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusIcon('CONFIRMED')}
                <span className="text-sm">Confirmado - Pedido aceito</span>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusIcon('PREPARING')}
                <span className="text-sm">Preparando - Em produção</span>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusIcon('READY')}
                <span className="text-sm">Pronto - Aguardando retirada/entrega</span>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusIcon('OUT_DELIVERY')}
                <span className="text-sm">Saiu para entrega - A caminho</span>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusIcon('DELIVERED')}
                <span className="text-sm">Entregue - Pedido finalizado</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order History Modal */}
        <OrderHistoryModal
          isOpen={isOrderHistoryOpen}
          onClose={() => setIsOrderHistoryOpen(false)}
          customerId={currentCustomerId}
          onRepeatOrder={handleRepeatOrder}
          onContinueShopping={() => {
            setIsOrderHistoryOpen(false);
            window.location.href = '/cardapio';
          }}
        />
      </div>
    </>
  );
}