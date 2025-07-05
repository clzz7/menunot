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

  const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value));
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

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
      'PENDING': { label: 'Pendente', variant: 'secondary' },
      'CONFIRMED': { label: 'Confirmado', variant: 'default' },
      'PREPARING': { label: 'Preparando', variant: 'default' },
      'READY': { label: 'Pronto', variant: 'default' },
      'OUT_DELIVERY': { label: 'Saiu para entrega', variant: 'default' },
      'DELIVERED': { label: 'Entregue', variant: 'default' },
      'CANCELLED': { label: 'Cancelado', variant: 'destructive' }
    };
    
    return statusMap[status] || { label: status, variant: 'secondary' as const };
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
    return !['DELIVERED', 'CANCELLED'].includes(status);
  };

  // Group orders by status
  const activeOrders = orders.filter((order: Order) => 
    !['DELIVERED', 'CANCELLED'].includes(order.status)
  );
  
  const completedOrders = orders.filter((order: Order) => 
    ['DELIVERED', 'CANCELLED'].includes(order.status)
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
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Pedido #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {order.customerName} • {formatTime(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={getStatusLabel(order.status).variant}
                        className={
                          getStatusLabel(order.status).variant === 'default' 
                            ? 'bg-primary text-white' 
                            : ''
                        }
                      >
                        {getStatusLabel(order.status).label}
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {order.deliveryAddress}, {order.deliveryNumber}
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      {order.customerPhone}
                    </div>
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      {getPaymentMethodLabel(order.paymentMethod)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg">
                      {formatCurrency(order.total)}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      {canAdvanceStatus(order.status) && (
                        <>
                          {getNextStatus(order.status) && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status)!)}
                              className="bg-primary hover:bg-orange-600"
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
                        #{order.orderNumber} - {order.customerName}
                      </p>
                      <p className="text-sm text-gray-500">{formatTime(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold">{formatCurrency(order.total)}</span>
                      <Badge variant={getStatusLabel(order.status).variant}>
                        {getStatusLabel(order.status).label}
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
                    <p><strong>Nome:</strong> {selectedOrder.customerName}</p>
                    <p><strong>Telefone:</strong> {selectedOrder.customerPhone}</p>
                    {selectedOrder.customerEmail && (
                      <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Informações do Pedido</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Data:</strong> {formatTime(selectedOrder.createdAt)}</p>
                    <p><strong>Status:</strong> {getStatusLabel(selectedOrder.status).label}</p>
                    <p><strong>Pagamento:</strong> {getPaymentMethodLabel(selectedOrder.paymentMethod)}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Endereço de Entrega</h4>
                <div className="p-3 bg-gray-50 rounded text-sm">
                  <p>
                    {selectedOrder.deliveryAddress}, {selectedOrder.deliveryNumber}
                    {selectedOrder.deliveryComplement && `, ${selectedOrder.deliveryComplement}`}
                  </p>
                  <p>{selectedOrder.deliveryNeighborhood} - {selectedOrder.deliveryCity}/{selectedOrder.deliveryState}</p>
                  <p>CEP: {selectedOrder.deliveryZipCode}</p>
                  {selectedOrder.deliveryReference && (
                    <p className="text-gray-600 mt-1">Ref: {selectedOrder.deliveryReference}</p>
                  )}
                </div>
              </div>

              {/* Order Items - This would need to be fetched separately */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Itens do Pedido</h4>
                <div className="border rounded">
                  <div className="p-3 bg-gray-50 text-sm text-gray-600">
                    Itens do pedido (implementar busca de itens)
                  </div>
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
                    <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                  </div>
                  {Number(selectedOrder.discount) > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Desconto:</span>
                      <span>-{formatCurrency(selectedOrder.discount)}</span>
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
