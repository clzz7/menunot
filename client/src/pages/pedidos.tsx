import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Badge } from "@/components/ui/badge.js";
import { Separator } from "@/components/ui/separator.js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible.js";
import { Search, Package, Clock, CheckCircle, XCircle, RefreshCw, History, RotateCcw, ShoppingCart, ChevronDown, ChevronUp, User, LogOut } from "lucide-react";
import { useCart } from "@/hooks/use-cart.js";
import { useToast } from "@/hooks/use-toast.js";
import { api } from "@/lib/api.js";
import { Order, Product } from "@shared/schema.js";
import { getStatusInfo, getStatusColor } from "@/lib/status-utils";

// Formatting function for WhatsApp
const formatWhatsApp = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

const unformatPhone = (value: string) => {
  return value.replace(/\D/g, '');
};

export default function Pedidos() {
  const [customerPhone, setCustomerPhone] = useState("");
  const [currentCustomerId, setCurrentCustomerId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const { addToCart, clearCart } = useCart();
  const { toast } = useToast();

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
    queryFn: api.products.getAll
  });

  const { data: orders = [], isLoading: isLoadingOrders, refetch: refetchOrders } = useQuery({
    queryKey: ["/api/orders/customer", currentCustomerId],
    queryFn: () => currentCustomerId ? api.orders.getByCustomer(currentCustomerId) : Promise.resolve([]),
    enabled: !!currentCustomerId
  });

  // Auto-login do cliente baseado no localStorage
  useEffect(() => {
    const checkAutoLogin = async () => {
      // Verificar se chegou aqui via pagamento bem-sucedido
      const urlParams = new URLSearchParams(window.location.search);
      const fromPayment = urlParams.get('from') === 'payment-success';
      
      // Buscar WhatsApp armazenado
      const storedWhatsApp = localStorage.getItem('customerWhatsApp');
      
      if (storedWhatsApp) {
        const formattedWhatsApp = formatWhatsApp(storedWhatsApp);
        setCustomerPhone(formattedWhatsApp);
        
        try {
          const unformattedPhone = unformatPhone(storedWhatsApp);
          const customer = await api.customers.getByWhatsapp(unformattedPhone);
          
          if (customer) {
            setCurrentCustomerId(customer.id);
            setIsLoggedIn(true);
            
            if (fromPayment) {
              toast({
                title: "🎉 Bem-vindo de volta!",
                description: "Aqui estão seus pedidos. Seu último pedido já aparece no topo!",
                duration: 5000,
              });
              
              // Limpar dados temporários
              setTimeout(() => {
                localStorage.removeItem('lastPaymentOrder');
              }, 2000);
            }
            
            // Limpar a URL
            window.history.replaceState({}, document.title, '/pedidos');
          }
        } catch (error) {
          console.error('Erro ao buscar cliente automaticamente:', error);
        }
      }
    };

    checkAutoLogin();
  }, [toast]);

  const handleSearchOrders = async () => {
    if (!customerPhone.trim()) {
      toast({
        title: "Telefone obrigatório",
        description: "Digite seu número de telefone para buscar seus pedidos",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const unformattedPhone = unformatPhone(customerPhone);
      const customer = await api.customers.getByWhatsapp(unformattedPhone);
      
      if (customer) {
        setCurrentCustomerId(customer.id);
        setIsLoggedIn(true);
        // Armazenar WhatsApp para futuras visitas
        localStorage.setItem('customerWhatsApp', unformattedPhone);
        
        toast({
          title: "✅ Pedidos encontrados!",
          description: "Carregando seu histórico de pedidos...",
        });
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
    } finally {
      setIsSearching(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customerWhatsApp');
    setCurrentCustomerId(null);
    setIsLoggedIn(false);
    setCustomerPhone("");
    setExpandedOrders(new Set());
    
    toast({
      title: "Deslogado com sucesso",
      description: "Você pode buscar pedidos de outro número agora",
    });
  };

  const handleRepeatOrder = async (order: Order) => {
    try {
      const response = await fetch(`/api/orders/${order.id}/items`);
      if (!response.ok) {
        throw new Error('Erro ao buscar itens do pedido');
      }
      
      const orderItems = await response.json();
      clearCart();
      
      for (const item of orderItems) {
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
      
      window.location.href = '/checkout';
    } catch (error: any) {
      toast({
        title: "Erro ao repetir pedido",
        description: error.message || "Erro interno do servidor",
        variant: "destructive"
      });
    }
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Componente para exibir detalhes do pedido
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

    useEffect(() => {
      if (isExpanded) {
        fetchOrderItems();
      }
    }, [isExpanded]);

    return (
      <Card className="hover:shadow-md transition-shadow">
        <Collapsible open={isExpanded} onOpenChange={() => toggleOrderExpansion(order.id)}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">Pedido #{order.order_number}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusInfo(order.status).className}>
                    {getStatusInfo(order.status).label}
                  </Badge>
                  <span className="font-bold text-lg">{formatCurrency(order.total)}</span>
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-0">
              <Separator className="mb-4" />
              
              {loadingItems ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Carregando itens...</p>
                </div>
              ) : orderItems.length > 0 ? (
                <div className="space-y-4">
                  {/* Itens do pedido */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Itens do Pedido</h4>
                    <div className="space-y-2">
                      {orderItems.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <div className="flex-1">
                            <p className="font-medium">{getProductName(item.product_id)}</p>
                            <p className="text-sm text-gray-500">
                              {item.quantity}x {formatCurrency(item.unit_price)}
                            </p>
                            {item.observations && (
                              <p className="text-xs text-gray-400 mt-1">Obs: {item.observations}</p>
                            )}
                          </div>
                          <span className="font-medium">
                            {formatCurrency(item.total)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resumo financeiro */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(order.subtotal)}</span>
                      </div>
                      {order.delivery_fee > 0 && (
                        <div className="flex justify-between">
                          <span>Taxa de entrega:</span>
                          <span>{formatCurrency(order.delivery_fee)}</span>
                        </div>
                      )}
                      {order.discount_amount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Desconto:</span>
                          <span>-{formatCurrency(order.discount_amount)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-medium text-base">
                        <span>Total:</span>
                        <span>{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Informações de entrega */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h5 className="font-medium text-sm mb-2">Informações de Entrega</h5>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{order.customer_address}</p>
                      {order.customer_complement && <p>Complemento: {order.customer_complement}</p>}
                      <p>{order.customer_neighborhood}, {order.customer_city} - {order.customer_state}</p>
                      <p>CEP: {order.customer_zip_code}</p>
                      <p className="mt-2 font-medium">
                        Pagamento: {order.payment_method === 'pix' ? 'PIX' : order.payment_method.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Botão repetir pedido */}
                  {order.status === 'DELIVERED' && (
                    <Button
                      onClick={() => handleRepeatOrder(order)}
                      className="w-full bg-primary hover:bg-orange-600"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Repetir este Pedido
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Não foi possível carregar os itens do pedido.
                </p>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  // Separar pedidos atuais e passados
  const currentOrder = Array.isArray(orders) ? orders.find(order => 
    ['pending', 'confirmed', 'preparing', 'ready', 'out_delivery', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_DELIVERY'].includes(order.status)
  ) : null;
  
  const pastOrders = Array.isArray(orders) ? orders.filter(order => 
    ['delivered', 'cancelled', 'DELIVERED', 'CANCELLED'].includes(order.status)
  ) : [];

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
          <p className="text-sm sm:text-base opacity-90 mt-2">
            {isLoggedIn ? "Seus pedidos e histórico" : "Acompanhe ou repita seus pedidos favoritos"}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Se usuário não estiver "logado", mostrar busca */}
        {!isLoggedIn ? (
          <>
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Pedidos</h1>
              <p className="text-gray-600">Digite seu WhatsApp para consultar seus pedidos</p>
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
                    placeholder="Digite seu número de telefone (ex: (11) 99999-9999)"
                    value={customerPhone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const formatted = formatWhatsApp(e.target.value);
                      setCustomerPhone(formatted);
                    }}
                    className="flex-1"
                    maxLength={15}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchOrders();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleSearchOrders} 
                    disabled={isSearching}
                    className="bg-primary hover:bg-orange-600"
                  >
                    {isSearching ? "Buscando..." : "Buscar"}
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
          </>
        ) : (
          <>
            {/* Header com informações do usuário logado */}
            <div className="mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Pedidos</h1>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{customerPhone}</span>
                  </div>
                </div>
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Trocar Número</span>
                </Button>
              </div>
            </div>

            {/* Loading state */}
            {isLoadingOrders && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-500">Carregando pedidos...</p>
              </div>
            )}

            {/* Pedido atual */}
            {currentOrder && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-orange-500" />
                  Pedido Atual
                </h2>
                <OrderDetails order={currentOrder} />
              </div>
            )}

            {/* Pedidos anteriores */}
            {pastOrders.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <History className="w-5 h-5 mr-2 text-gray-600" />
                  Histórico de Pedidos
                </h2>
                <div className="space-y-4">
                  {pastOrders.map((order) => (
                    <OrderDetails key={order.id} order={order} />
                  ))}
                </div>
              </div>
            )}

            {/* Sem pedidos */}
            {!isLoadingOrders && orders.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <History className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum pedido encontrado</h3>
                  <p className="text-gray-600 mb-6">Você ainda não fez nenhum pedido conosco</p>
                  <Button 
                    onClick={() => window.location.href = '/cardapio'}
                    className="bg-primary hover:bg-orange-600"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Fazer Primeiro Pedido
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Botão para continuar comprando */}
            {orders.length > 0 && (
              <div className="text-center mt-8">
                <Button 
                  onClick={() => window.location.href = '/cardapio'}
                  className="bg-primary hover:bg-orange-600"
                  size="lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Fazer Novo Pedido
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}