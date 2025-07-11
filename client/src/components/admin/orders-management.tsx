import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Button } from "@/components/ui/button.js";
import { Badge } from "@/components/ui/badge.js";
import { ScrollArea } from "@/components/ui/scroll-area.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.js";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.js";
import { 
  Clock, 
  MapPin, 
  Phone, 
  CreditCard, 
  FileText, 
  Check, 
  X,
  Eye
} from "lucide-react";
import { api } from "@/lib/api.js";
import { useToast } from "@/hooks/use-toast.js";
import { getStatusInfo } from "@/lib/status-utils";
import { Order, OrderItem } from "@shared/schema.js";

export function OrdersManagement() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: api.orders.getAll,
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  // Fetch order items when a specific order is selected
  const { data: orderItems = [] } = useQuery({
    queryKey: ["/api/orders", selectedOrder?.id, "items"],
    queryFn: () => selectedOrder ? api.orders.getItems(selectedOrder.id) : [],
    enabled: !!selectedOrder?.id
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      api.orders.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Status atualizado",
        description: "Status do pedido foi atualizado com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status do pedido",
        variant: "destructive"
      });
    }
  });

  const formatCurrency = (value: number | string | undefined | null) => {
    if (value === undefined || value === null) {
      return 'R$ 0,00';
    }
    const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
    if (isNaN(numValue)) {
      return 'R$ 0,00';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  const getPaymentMethodLabel = (method: string) => {
    const methodMap: Record<string, string> = {
      'PIX': 'PIX',
      'CASH': 'Dinheiro',
      'CARD': 'Cartão',
      'CREDIT_CARD': 'Cartão de Crédito',
      'DEBIT_CARD': 'Cartão de Débito'
    };
    return methodMap[method] || method;
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_DELIVERY', 'DELIVERED'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    return currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null;
  };

  const canAdvanceStatus = (status: string) => {
    return !['delivered', 'cancelled'].includes(status.toLowerCase());
  };

  // Group orders by status
  const activeOrders = orders.filter((order: Order) => 
    ['pending', 'confirmed', 'preparing', 'ready', 'out_delivery'].includes(order.status.toLowerCase())
  );
  
  const completedOrders = orders.filter((order: Order) => 
    ['delivered', 'cancelled'].includes(order.status.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-primary" />
            Pedidos Ativos ({activeOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum pedido ativo</p>
              <p className="text-sm">Novos pedidos aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order: Order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {/* Header com número do pedido e status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Pedido #{order.order_number}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {order.customer_name} • {formatTime(order.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={getStatusInfo(order.status).className}
                      >
                        {getStatusInfo(order.status).label}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Informações de contato e entrega */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{order.customer_address}, {order.customer_neighborhood}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{order.customer_phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CreditCard className="w-4 h-4 flex-shrink-0" />
                      <span>{getPaymentMethodLabel(order.payment_method)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="font-semibold text-lg">
                      {formatCurrency(order.total)}
                    </span>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      {canAdvanceStatus(order.status) && (
                        <>
                          {getNextStatus(order.status) && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status)!)}
                              className="bg-primary hover:bg-orange-600 text-white"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Avançar Status
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancelar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {order.observations && (
                    <div className="mt-3 p-2 bg-yellow-50 rounded border-l-4 border-yellow-200">
                      <div className="flex items-start">
                        <FileText className="w-4 h-4 mr-2 text-yellow-600 mt-0.5" />
                        <p className="text-sm text-yellow-700">{order.observations}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Check className="w-5 h-5 mr-2 text-success" />
            Pedidos Finalizados ({completedOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Check className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum pedido finalizado</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {completedOrders.slice(0, 10).map((order: Order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        #{order.order_number} - {order.customer_name}
                      </p>
                      <p className="text-sm text-gray-500">{formatTime(order.created_at)}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold">{formatCurrency(order.total)}</span>
                      <Badge className={getStatusInfo(order.status).className}>
                        {getStatusInfo(order.status).label}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detalhes do Pedido #{selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Informações do Cliente</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Nome:</strong> {selectedOrder.customer_name}</p>
                    <p><strong>Telefone:</strong> {selectedOrder.customer_phone}</p>
                    {selectedOrder.customer_email && (
                      <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Informações do Pedido</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Data:</strong> {formatTime(selectedOrder.created_at)}</p>
                    <p><strong>Status:</strong> {getStatusInfo(selectedOrder.status).label}</p>
                    <p><strong>Pagamento:</strong> {getPaymentMethodLabel(selectedOrder.payment_method)}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Endereço de Entrega</h4>
                <div className="p-3 bg-gray-50 rounded text-sm">
                  <p>
                    {selectedOrder.customer_address}
                    {selectedOrder.customer_complement && `, ${selectedOrder.customer_complement}`}
                  </p>
                  <p>{selectedOrder.customer_neighborhood} - {selectedOrder.customer_city}/{selectedOrder.customer_state}</p>
                  <p>CEP: {selectedOrder.customer_zip_code}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Itens do Pedido</h4>
                <div className="border rounded">
                  {orderItems.length > 0 ? (
                    <div className="divide-y">
                      {orderItems.map((item: any, index: number) => (
                        <div key={index} className="p-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm">Item #{item.product_id}</p>
                            <p className="text-xs text-gray-500">
                              Quantidade: {item.quantity} × {formatCurrency(item.unit_price)}
                            </p>
                            {item.observations && (
                              <p className="text-xs text-gray-400 mt-1">Obs: {item.observations}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">{formatCurrency(item.total)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 text-sm text-gray-600">
                      Carregando itens do pedido...
                    </div>
                  )}
                </div>
              </div>

              {/* Order Total */}
              <div className="border-t pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de entrega:</span>
                    <span>{formatCurrency(selectedOrder.delivery_fee)}</span>
                  </div>
                  {Number(selectedOrder.discount_amount) > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Desconto:</span>
                      <span>-{formatCurrency(selectedOrder.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span className="text-primary">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Observations */}
              {selectedOrder.observations && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Observações</h4>
                  <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-200">
                    <p className="text-sm text-yellow-700">{selectedOrder.observations}</p>
                  </div>
                </div>
              )}

              {/* Status Update */}
              {canAdvanceStatus(selectedOrder.status) && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="font-medium">Atualizar Status:</span>
                  <div className="flex space-x-2">
                    <Select
                      onValueChange={(value) => handleStatusUpdate(selectedOrder.id, value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Selecionar status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                        <SelectItem value="PREPARING">Preparando</SelectItem>
                        <SelectItem value="READY">Pronto</SelectItem>
                        <SelectItem value="OUT_DELIVERY">Saiu para entrega</SelectItem>
                        <SelectItem value="DELIVERED">Entregue</SelectItem>
                        <SelectItem value="CANCELLED">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
