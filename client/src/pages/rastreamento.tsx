import { useState, useEffect } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Clock, CheckCircle, Package, Truck, MapPin, RefreshCw, XCircle } from "lucide-react";
import { Order } from "@shared/schema";
import { api } from "@/lib/api";

export default function Rastreamento() {
  const [orderNumber, setOrderNumber] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // WebSocket for real-time updates
  useWebSocket((message) => {
    if (message.type === 'ORDER_STATUS_UPDATE' && currentOrder?.id === message.orderId) {
      setCurrentOrder(prev => prev ? { ...prev, status: message.status || prev.status } : null);
      
      toast({
        title: "Status do pedido atualizado",
        description: `Seu pedido está: ${getStatusLabel(message.status || "")}`,
      });
    }
  });

  const handleTrackOrder = async () => {
    if (!orderNumber.trim() || !customerPhone.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Digite o número do pedido e seu telefone",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // First, get customer to verify phone
      const customer = await api.customers.getByWhatsapp(customerPhone);
      if (!customer) {
        throw new Error("Cliente não encontrado");
      }

      // Get customer orders
      const orders = await api.orders.getByCustomer(customer.id);
      const order = orders.find((o: Order) => o.orderNumber === orderNumber);

      if (!order) {
        throw new Error("Pedido não encontrado");
      }

      setCurrentOrder(order);
      
    } catch (error: any) {
      toast({
        title: "Erro ao buscar pedido",
        description: error.message || "Erro interno do servidor",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'CONFIRMED':
        return <CheckCircle className="w-6 h-6 text-blue-500" />;
      case 'PREPARING':
        return <RefreshCw className="w-6 h-6 text-blue-500" />;
      case 'READY':
        return <Package className="w-6 h-6 text-orange-500" />;
      case 'OUT_DELIVERY':
        return <Truck className="w-6 h-6 text-orange-500" />;
      case 'DELIVERED':
        return <MapPin className="w-6 h-6 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Clock className="w-6 h-6 text-gray-500" />;
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

  const getStatusProgress = (status: string) => {
    const progressMap: Record<string, number> = {
      'PENDING': 10,
      'CONFIRMED': 25,
      'PREPARING': 50,
      'READY': 75,
      'OUT_DELIVERY': 90,
      'DELIVERED': 100,
      'CANCELLED': 0
    };
    return progressMap[status] || 0;
  };

  const getEstimatedTime = (status: string) => {
    const timeMap: Record<string, string> = {
      'PENDING': '5-10 minutos',
      'CONFIRMED': '20-30 minutos',
      'PREPARING': '15-25 minutos',
      'READY': 'Pronto para retirada',
      'OUT_DELIVERY': '10-20 minutos',
      'DELIVERED': 'Entregue',
      'CANCELLED': 'Cancelado'
    };
    return timeMap[status] || 'Calculando...';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rastreamento de Pedidos</h1>
        <p className="text-gray-600">Acompanhe o status do seu pedido em tempo real</p>
      </div>

      {/* Search Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Buscar Pedido</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              type="text"
              placeholder="Número do pedido (ex: #001234)"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
            />
            <Input
              type="tel"
              placeholder="Seu telefone (ex: 11999999999)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleTrackOrder} 
            disabled={isLoading}
            className="w-full md:w-auto bg-primary hover:bg-orange-600"
          >
            {isLoading ? 'Buscando...' : 'Rastrear Pedido'}
          </Button>
        </CardContent>
      </Card>

      {/* Order Status */}
      {currentOrder && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pedido {currentOrder.orderNumber}</span>
              <Badge className={getStatusColor(currentOrder.status)}>
                {getStatusLabel(currentOrder.status)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progresso</span>
                <span>{getStatusProgress(currentOrder.status)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getStatusProgress(currentOrder.status)}%` }}
                ></div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {getStatusIcon(currentOrder.status)}
                <div>
                  <h3 className="font-medium text-gray-900">
                    {getStatusLabel(currentOrder.status)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Tempo estimado: {getEstimatedTime(currentOrder.status)}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Detalhes do Pedido</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Total:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(currentOrder.total))}</p>
                  <p><strong>Pagamento:</strong> {currentOrder.paymentMethod}</p>
                  <p><strong>Data:</strong> {new Date(currentOrder.createdAt).toLocaleDateString('pt-BR')}</p>
                  <p><strong>Horário:</strong> {new Date(currentOrder.createdAt).toLocaleTimeString('pt-BR')}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Entrega</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Tipo:</strong> {currentOrder.deliveryType === 'DELIVERY' ? 'Entrega' : 'Retirada'}</p>
                  {currentOrder.deliveryType === 'DELIVERY' && (
                    <p><strong>Endereço:</strong> {currentOrder.deliveryAddress}</p>
                  )}
                  <p><strong>Cliente:</strong> {currentOrder.customerName}</p>
                  <p><strong>Telefone:</strong> {currentOrder.customerPhone}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Precisando de ajuda?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Se você não encontrou seu pedido ou tem alguma dúvida, entre em contato conosco:
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" onClick={() => window.location.href = '/pedidos'}>
              Ver Histórico de Pedidos
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/cardapio'}>
              Fazer Novo Pedido
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}