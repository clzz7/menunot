import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button.js";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.js";
import { ScrollArea } from "@/components/ui/scroll-area.js";
import { Badge } from "@/components/ui/badge.js";
import { Separator } from "@/components/ui/separator.js";
import { Input } from "@/components/ui/input.js";
import { History, X, RotateCcw, ShoppingCart, Search } from "lucide-react";
import { api } from "@/lib/api.js";
import { Order } from "@shared/schema.js";

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
  onRepeatOrder: (order: Order) => void;
  onContinueShopping: () => void;
}

export function OrderHistoryModal({
  isOpen,
  onClose,
  customerId,
  onRepeatOrder,
  onContinueShopping
}: OrderHistoryModalProps) {
  const [whatsapp, setWhatsapp] = useState("");
  const [searchedCustomerId, setSearchedCustomerId] = useState<string | null>(null);
  
  const effectiveCustomerId = customerId || searchedCustomerId;
  
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/orders/customer", effectiveCustomerId],
    queryFn: () => effectiveCustomerId ? api.orders.getByCustomer(effectiveCustomerId) : Promise.resolve([]),
    enabled: !!effectiveCustomerId && isOpen
  });

  const handleSearchOrders = async () => {
    if (!whatsapp) return;
    
    try {
      const customer = await api.customers.getByWhatsapp(whatsapp);
      if (customer) {
        setSearchedCustomerId(customer.id);
      } else {
        setSearchedCustomerId("not-found");
      }
    } catch (error) {
      console.error("Error searching customer:", error);
      setSearchedCustomerId("not-found");
    }
  };

  const handleClose = () => {
    // Reset search state when modal closes
    setWhatsapp("");
    setSearchedCustomerId(null);
    onClose();
  };

  const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value));
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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

  const currentOrder = Array.isArray(orders) ? orders.find(order => 
    ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_DELIVERY'].includes(order.status)
  ) : null;
  
  const pastOrders = Array.isArray(orders) ? orders.filter(order => 
    ['DELIVERED', 'CANCELLED'].includes(order.status)
  ) : [];

  // Calculate statistics
  const totalOrders = Array.isArray(orders) ? orders.length : 0;
  const totalSpent = Array.isArray(orders) ? orders.reduce((sum, order) => sum + Number(order.total), 0) : 0;
  const averageOrder = totalOrders > 0 ? totalSpent / totalOrders : 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center">
              <History className="w-5 h-5 mr-2 text-primary" />
              Meus Pedidos
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6">
            {/* WhatsApp Search (when no customerId provided) */}
            {!customerId && !effectiveCustomerId && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium mb-3">Digite seu WhatsApp para ver seus pedidos</h3>
                <div className="flex space-x-2">
                  <Input
                    placeholder="11999999999"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSearchOrders} disabled={!whatsapp}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* No Customer Found Message */}
            {searchedCustomerId === "not-found" && (
              <div className="text-center py-8">
                <History className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido encontrado</h3>
                <p className="text-gray-500">Não encontramos pedidos para este WhatsApp</p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && effectiveCustomerId && effectiveCustomerId !== "not-found" && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-500">Carregando pedidos...</p>
              </div>
            )}
            {/* Current Order */}
            {currentOrder && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Pedido Atual</h3>
                <div className="bg-primary bg-opacity-10 border border-primary border-opacity-20 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-primary">Pedido #{currentOrder.orderNumber}</span>
                    <span className="text-sm text-gray-500">{formatDate(currentOrder.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{currentOrder.customerName}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-primary">
                      {formatCurrency(currentOrder.total)}
                    </span>
                    <Badge 
                      variant={getStatusLabel(currentOrder.status).variant}
                      className={`${
                        ['PREPARING'].includes(currentOrder.status) ? 'order-status-animate' : ''
                      } ${
                        getStatusLabel(currentOrder.status).variant === 'default' 
                          ? 'bg-primary text-white' 
                          : ''
                      }`}
                    >
                      {getStatusLabel(currentOrder.status).label}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Past Orders */}
            {pastOrders.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Pedidos Anteriores</h3>
                <div className="space-y-4">
                  {pastOrders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900">Pedido #{order.orderNumber}</span>
                        <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Total de {order.customerName}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(order.total)}
                        </span>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getStatusLabel(order.status).variant}>
                            {getStatusLabel(order.status).label}
                          </Badge>
                          {order.status === 'DELIVERED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onRepeatOrder(order)}
                              className="text-primary hover:text-orange-600"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Repetir
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No orders message */}
            {orders.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Você ainda não fez nenhum pedido</p>
                <p className="text-sm">Que tal fazer seu primeiro pedido?</p>
              </div>
            )}

            {/* Statistics */}
            {orders.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Suas Estatísticas</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{totalOrders}</p>
                    <p className="text-sm text-gray-600">Pedidos</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(totalSpent)}</p>
                    <p className="text-sm text-gray-600">Total Gasto</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(averageOrder)}</p>
                    <p className="text-sm text-gray-600">Ticket Médio</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Action Button */}
        <Separator />
        <Button 
          onClick={onContinueShopping}
          className="w-full bg-primary text-white hover:bg-orange-600 transition-colors"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Continuar Comprando
        </Button>
      </DialogContent>
    </Dialog>
  );
}
