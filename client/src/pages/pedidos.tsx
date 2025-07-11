import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Badge } from "@/components/ui/badge.js";
import { Separator } from "@/components/ui/separator.js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible.js";
import { Search, Package, Clock, CheckCircle, XCircle, RefreshCw, History, RotateCcw, ShoppingCart, User, ChevronDown, ChevronUp, LogOut } from "lucide-react";
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
  const [showSearchForm, setShowSearchForm] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [knownCustomerPhone, setKnownCustomerPhone] = useState<string>("");
  const { addToCart, clearCart } = useCart();
  const { toast } = useToast();

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
    queryFn: api.products.getAll
  });

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ["/api/orders/customer", currentCustomerId],
    queryFn: () => currentCustomerId ? api.orders.getByCustomer(currentCustomerId) : Promise.resolve([]),
    enabled: !!currentCustomerId
  });

  // Verificação automática do usuário conhecido
  useEffect(() => {
    const checkKnownUser = async () => {
      // Verificar se chegou via pagamento bem-sucedido
      const urlParams = new URLSearchParams(window.location.search);
      const fromPayment = urlParams.get('from') === 'payment-success';
      
      // Buscar WhatsApp armazenado
      const storedWhatsApp = localStorage.getItem('customerWhatsApp');
      
      if (storedWhatsApp) {
        // Usuário conhecido - buscar automaticamente os pedidos
        const formattedWhatsApp = formatWhatsApp(storedWhatsApp);
        setKnownCustomerPhone(formattedWhatsApp);
        setCustomerPhone(formattedWhatsApp);
        setShowSearchForm(false);
        
        try {
          const unformattedPhone = unformatPhone(storedWhatsApp);
          const customer = await api.customers.getByWhatsapp(unformattedPhone);
          
          if (customer) {
            setCurrentCustomerId(customer.id);
            
            // Mostrar mensagem de boas-vindas se veio do pagamento
            if (fromPayment) {
              toast({
                title: "🎉 Bem-vindo de volta!",
                description: "Aqui estão seus pedidos. Seu último pedido já aparece no topo!",
                duration: 5000,
              });
              
              // Limpar dados temporários do localStorage
              setTimeout(() => {
                localStorage.removeItem('lastPaymentOrder');
              }, 2000);
            }
            
            // Limpar a URL para remover o parâmetro
            if (fromPayment) {
              window.history.replaceState({}, document.title, '/pedidos');
            }
          }
        } catch (error) {
          console.error('Erro ao buscar cliente automaticamente:', error);
          // Se der erro, mostrar formulário de busca
          setShowSearchForm(true);
        }
      }
    };

    checkKnownUser();
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

    try {
      const unformattedPhone = unformatPhone(customerPhone);
      const customer = await api.customers.getByWhatsapp(unformattedPhone);
      
      if (customer) {
        setCurrentCustomerId(customer.id);
        setKnownCustomerPhone(customerPhone);
        setShowSearchForm(false);
        
        // Armazenar WhatsApp para futuras visitas
        localStorage.setItem('customerWhatsApp', unformattedPhone);
        
        toast({
          title: "Pedidos encontrados!",
          description: "Visualizando seu histórico de pedidos",
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
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customerWhatsApp');
    setCurrentCustomerId(null);
    setKnownCustomerPhone("");
    setCustomerPhone("");
    setShowSearchForm(true);
    setExpandedOrders(new Set());
    
    toast({
      title: "Sessão encerrada",
      description: "Você pode buscar pedidos com outro número de telefone",
    });
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
      
      // Redirect to checkout
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
    setExpandedOrders((prev: Set<string>) => {
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

  const formatCurrency = (value: number | string | undefined | null) => {
    // Debug log
    console.log('formatCurrency called with:', value, 'type:', typeof value);
    
    // Handle undefined, null values
    if (value === undefined || value === null) {
      return 'R$ 0,00';
    }
    
    // Convert to number
    const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
    
    // Handle NaN and invalid numbers
    if (isNaN(numValue)) {
      console.log('NaN detected for value:', value);
      return 'R$ 0,00';
    }
    
    const result = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
    
    console.log('formatCurrency result:', result);
    return result;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'CONFIRMED':
      case 'PREPARING':
        return <RefreshCw className="w-4 h-4 text-orange-600" />;
      case 'READY':
      case 'OUT_DELIVERY':
        return <Package className="w-4 h-4 text-orange-700" />;
      case 'DELIVERED':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
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

    useEffect(() => {
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
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">
                  {formatCurrency(order.total)}
                </span>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusInfo(order.status).className}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{getStatusInfo(order.status).label}</span>
                  </Badge>
                  {order.status === 'DELIVERED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRepeatOrder(order);
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

  // Separar pedidos por status
  const currentOrders = Array.isArray(orders) ? orders.filter(order => 
    ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_DELIVERY'].includes(order.status)
  ) : [];
  
  const pastOrders = Array.isArray(orders) ? orders.filter(order => 
    ['DELIVERED', 'CANCELLED'].includes(order.status)
  ) : [];

  // Estatísticas do cliente
  const totalOrders = Array.isArray(orders) ? orders.length : 0;
  const totalSpent = Array.isArray(orders) ? orders.reduce((sum, order) => sum + Number(order.total), 0) : 0;

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
            {showSearchForm ? "Digite seu telefone para acessar seus pedidos" : "Acompanhe e repita seus pedidos favoritos"}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Formulário de busca - mostrado apenas se não conhecemos o usuário */}
        {showSearchForm && (
          <>
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Encontre seus Pedidos</h1>
              <p className="text-gray-600">Digite seu número de telefone para acessar seu histórico</p>
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
                  <Button onClick={handleSearchOrders} className="bg-primary hover:bg-orange-600">
                    Buscar
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Digite o número de telefone usado nos pedidos para visualizar o histórico
                </p>
              </CardContent>
            </Card>

            {/* Como usar e Status Guide */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* How to Use Section */}
              <Card>
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
                  <div className="space-y-3">
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
            </div>
          </>
        )}

        {/* Área dos pedidos - mostrada quando conhecemos o usuário */}
        {!showSearchForm && currentCustomerId && (
          <>
            {/* Header com informações do cliente */}
            <div className="mb-8">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-900">Seus Pedidos</h1>
                <Button variant="outline" onClick={handleLogout} size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  Trocar Usuário
                </Button>
              </div>
              
              {/* Customer info card */}
              <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2 text-gray-700">
                      <User className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Telefone</p>
                        <p className="font-semibold">{knownCustomerPhone}</p>
                      </div>
                    </div>
                    
                    {totalOrders > 0 && (
                      <>
                        <div className="flex items-center space-x-2 text-gray-700">
                          <Package className="w-5 h-5 text-amber-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Total de Pedidos</p>
                            <p className="font-semibold">{totalOrders} pedido{totalOrders > 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-gray-700">
                          <ShoppingCart className="w-5 h-5 text-orange-700" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Total Gasto</p>
                            <p className="font-semibold text-orange-800">{formatCurrency(totalSpent)}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Loading State */}
            {isLoadingOrders && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-500">Carregando seus pedidos...</p>
              </div>
            )}

            {/* Pedidos Atuais */}
            {currentOrders.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-primary" />
                  Pedidos em Andamento
                </h2>
                <div className="space-y-4">
                  {currentOrders.map((order) => (
                    <OrderDetails key={order.id} order={order} />
                  ))}
                </div>
              </div>
            )}

            {/* Pedidos Anteriores */}
            {pastOrders.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <History className="w-5 h-5 mr-2 text-primary" />
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
              <div className="text-center py-12">
                <History className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum pedido encontrado</h3>
                <p className="text-gray-500 mb-6">Você ainda não fez nenhum pedido conosco</p>
                <Button 
                  onClick={() => window.location.href = '/cardapio'}
                  className="bg-primary hover:bg-orange-600"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Fazer Primeiro Pedido
                </Button>
              </div>
            )}

            {/* Botões de ação */}
            {orders.length > 0 && (
              <div className="flex justify-center space-x-4 pt-8 border-t border-gray-200">
                <Button 
                  onClick={() => window.location.href = '/cardapio'}
                  className="bg-primary hover:bg-orange-600"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
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