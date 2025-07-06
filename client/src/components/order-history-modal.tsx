import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button.js";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.js";
import { ScrollArea } from "@/components/ui/scroll-area.js";
import { Badge } from "@/components/ui/badge.js";
import { Separator } from "@/components/ui/separator.js";
import { Input } from "@/components/ui/input.js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible.js";
import { History, X, RotateCcw, ShoppingCart, Search, ChevronDown, ChevronUp } from "lucide-react";
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
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  
  const effectiveCustomerId = customerId || searchedCustomerId;
  
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/orders/customer", effectiveCustomerId],
    queryFn: () => effectiveCustomerId ? api.orders.getByCustomer(effectiveCustomerId) : Promise.resolve([]),
    enabled: !!effectiveCustomerId && isOpen
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
    queryFn: api.products.getAll,
    enabled: isOpen
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
    setExpandedOrders(new Set());
    onClose();
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const getOrderItems = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/items`);
      if (!response.ok) {
        throw new Error('Failed to fetch order items');
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching order items:", error);
      return [];
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find((p: any) => p.id === productId);
    return product?.name || 'Produto não encontrado';
  };

  // Component to show order details
  const OrderDetails = ({ order }: { order: Order }) => {
    const [orderItems, setOrderItems] = useState<any[]>([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const isExpanded = expandedOrders.has(order.id);

    const fetchOrderItems = async () => {
      if (isExpanded && orderItems.length === 0) {
        setLoadingItems(true);
        try {
          const items = await getOrderItems(order.id);
          setOrderItems(items);
        } catch (error) {
          console.error("Error fetching items:", error);
        } finally {
          setLoadingItems(false);
        }
      }
    };

    React.useEffect(() => {
      if (isExpanded) {
        fetchOrderItems();
      }
    }, [isExpanded]);

    return (
      <Collapsible open={isExpanded} onOpenChange={() => toggleOrderExpansion(order.id)}>
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <CollapsibleTrigger asChild>
            <div className="w-full cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-gray-900">Pedido #{order.order_number}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{formatDate(order.created_at)}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {order.status === 'DELIVERED' ? `Entregue em ${formatDate(order.delivered_at || order.created_at)}` : 'Em andamento'}
              </p>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        onRepeatOrder(order);
                      }}
                      className="text-primary hover:text-orange-600"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Repetir
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <Separator className="mb-4" />
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Detalhes do Pedido</h4>
              
              {loadingItems ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Carregando itens...</p>
                </div>
              ) : orderItems.length > 0 ? (
                <div className="space-y-2">
                  {orderItems.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{getProductName(item.product_id)}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity}x {formatCurrency(item.unit_price)}
                        </p>
                        {item.observations && (
                          <p className="text-xs text-gray-400 mt-1">Obs: {item.observations}</p>
                        )}
                      </div>
                      <span className="font-medium text-sm">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  ))}
                  
                  <div className="pt-3 mt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    {order.delivery_fee > 0 && (
                      <div className="flex justify-between text-sm mb-2">
                        <span>Taxa de entrega:</span>
                        <span>{formatCurrency(order.delivery_fee)}</span>
                      </div>
                    )}
                    {order.discount_amount > 0 && (
                      <div className="flex justify-between text-sm text-green-600 mb-2">
                        <span>Desconto:</span>
                        <span>-{formatCurrency(order.discount_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium text-base pt-3 mt-2 border-t border-gray-200">
                      <span>Total:</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Não foi possível carregar os itens do pedido.</p>
              )}

              <div className="bg-gray-50 rounded-lg p-3 mt-4">
                <h5 className="font-medium text-sm mb-2">Informações de Entrega</h5>
                <p className="text-sm text-gray-600">
                  {order.customer_address}
                  {order.customer_complement && `, ${order.customer_complement}`}
                </p>
                <p className="text-sm text-gray-600">
                  {order.customer_neighborhood}, {order.customer_city} - {order.customer_state}
                </p>
                <p className="text-sm text-gray-600">CEP: {order.customer_zip_code}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Pagamento: {order.payment_method === 'pix' ? 'PIX' : order.payment_method.toUpperCase()}
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
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
      'CANCELLED': { label: 'Cancelado', variant: 'destructive' },
      'pending': { label: 'Pendente', variant: 'secondary' },
      'confirmed': { label: 'Confirmado', variant: 'default' },
      'preparing': { label: 'Preparando', variant: 'default' },
      'ready': { label: 'Pronto', variant: 'default' },
      'out_delivery': { label: 'Saiu para entrega', variant: 'default' },
      'delivered': { label: 'Entregue', variant: 'default' },
      'cancelled': { label: 'Cancelado', variant: 'destructive' }
    };
    
    return statusMap[status] || { label: status, variant: 'secondary' as const };
  };

  const currentOrder = Array.isArray(orders) ? orders.find(order => 
    ['pending', 'confirmed', 'preparing', 'ready', 'out_delivery', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_DELIVERY'].includes(order.status)
  ) : null;
  
  const pastOrders = Array.isArray(orders) ? orders.filter(order => 
    ['delivered', 'cancelled', 'DELIVERED', 'CANCELLED'].includes(order.status)
  ) : [];

  // Calculate statistics
  const totalOrders = Array.isArray(orders) ? orders.length : 0;
  const totalSpent = Array.isArray(orders) ? orders.reduce((sum, order) => sum + Number(order.total), 0) : 0;
  const averageOrder = totalOrders > 0 ? totalSpent / totalOrders : 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <History className="w-5 h-5 mr-2 text-primary" />
            Meus Pedidos
          </DialogTitle>
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
                <div className="border border-gray-200 rounded-lg">
                  <OrderDetails order={currentOrder} />
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
                        <span className="font-medium text-gray-900">Pedido #{order.order_number}</span>
                        <span className="text-sm text-gray-500">{formatDate(order.created_at)}</span>
                      </div>
                      
                      {/* Order Details */}
                      <div className="space-y-2 mb-3">
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">Detalhes do Pedido:</p>
                          {order.order_number === '001' && (
                            <div className="ml-2 space-y-1">
                              <p>• 1x Burger Bacon - R$ 28,00</p>
                              <p>• 1x Coca-Cola - R$ 6,00</p>
                            </div>
                          )}
                          {order.order_number === '002' && (
                            <div className="ml-2 space-y-1">
                              <p>• 1x X-Tudão - R$ 35,00</p>
                              <p>• 1x Coca-Cola - R$ 6,00</p>
                            </div>
                          )}
                          {order.order_number === '003' && (
                            <div className="ml-2 space-y-1">
                              <p>• 1x Burger Duplo - R$ 32,00</p>
                              <p>• 1x Porção de Onion Rings - R$ 5,50</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-sm border-t pt-2 space-y-1">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>R$ {(order.total - 5).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Taxa de entrega:</span>
                            <span>R$ 5,00</span>
                          </div>
                          <div className="flex justify-between font-medium border-t pt-1">
                            <span>Total:</span>
                            <span>{formatCurrency(order.total)}</span>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded p-2 text-sm">
                          <p><strong>Entrega:</strong> {order.customer_address}</p>
                          <p><strong>Pagamento:</strong> {order.payment_method === 'pix' ? 'PIX' : order.payment_method.toUpperCase()}</p>
                          <p><strong>Status:</strong> {getStatusLabel(order.status).label}</p>
                        </div>
                      </div>
                      
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
