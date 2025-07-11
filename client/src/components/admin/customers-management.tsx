import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import { Badge } from "@/components/ui/badge.js";
import { ScrollArea } from "@/components/ui/scroll-area.js";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.js";
import { Users, Search, Phone, MapPin, CreditCard, ShoppingCart, Eye } from "lucide-react";
import { api } from "@/lib/api.js";
import { Customer, Order } from "@shared/schema.js";

export function CustomersManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerDetailOpen, setIsCustomerDetailOpen] = useState(false);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: api.customers.getAll
  });

  const { data: customerOrders = [] } = useQuery({
    queryKey: ["/api/orders/customer", selectedCustomer?.id],
    queryFn: () => selectedCustomer ? api.orders.getByCustomer(selectedCustomer.id) : Promise.resolve([]),
    enabled: !!selectedCustomer
  });

  const formatCurrency = (value: number | string | undefined | null) => {
    if (value === undefined || value === null || value === '' || isNaN(Number(value))) {
      return 'R$ 0,00';
    }
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

  const formatPhone = (phone: string) => {
    // Format phone number for display
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
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

  // Filter customers based on search term
  const filteredCustomers = customers.filter((customer: Customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.whatsapp.includes(searchTerm) ||
    customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsCustomerDetailOpen(true);
  };

  const getCustomerStatus = (customer: Customer) => {
    const daysSinceLastOrder = customer.lastOrderAt 
      ? Math.floor((new Date().getTime() - new Date(customer.lastOrderAt).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    if (!customer.lastOrderAt) return { label: "Novo", variant: "secondary" as const };
    if (daysSinceLastOrder! <= 7) return { label: "Ativo", variant: "default" as const };
    if (daysSinceLastOrder! <= 30) return { label: "Regular", variant: "secondary" as const };
    return { label: "Inativo", variant: "destructive" as const };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Clientes</h2>
          <p className="text-gray-600">Visualize e gerencie informações dos clientes</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Buscar por nome, telefone, endereço..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{customers.length}</p>
                <p className="text-sm text-gray-600">Total de Clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-success" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {customers.reduce((sum: number, customer: Customer) => sum + customer.totalOrders, 0)}
                </p>
                <p className="text-sm text-gray-600">Total de Pedidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-warning" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    customers.reduce((sum: number, customer: Customer) => sum + Number(customer.totalSpent), 0)
                  )}
                </p>
                <p className="text-sm text-gray-600">Faturamento Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    customers.length > 0 
                      ? customers.reduce((sum: number, customer: Customer) => sum + Number(customer.totalSpent), 0) / customers.length
                      : 0
                  )}
                </p>
                <p className="text-sm text-gray-600">Ticket Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-primary" />
            Clientes ({filteredCustomers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum cliente encontrado</p>
              <p className="text-sm">
                {searchTerm ? "Tente outro termo de busca" : "Clientes aparecerão aqui quando fizerem pedidos"}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {filteredCustomers.map((customer: Customer) => (
                  <div key={customer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{customer.name}</h3>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {formatPhone(customer.whatsapp)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getCustomerStatus(customer).variant}>
                          {getCustomerStatus(customer).label}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCustomer(customer)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="truncate">
                          {customer.address}, {customer.number} - {customer.neighborhood}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {customer.totalOrders} pedido{customer.totalOrders !== 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        {formatCurrency(customer.totalSpent)}
                      </div>
                    </div>

                    {customer.lastOrderAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Último pedido: {formatDate(customer.lastOrderAt)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Customer Detail Modal */}
      <Dialog open={isCustomerDetailOpen} onOpenChange={setIsCustomerDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detalhes do Cliente - {selectedCustomer?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Informações Pessoais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nome</label>
                      <p className="text-gray-900">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">WhatsApp</label>
                      <p className="text-gray-900">{formatPhone(selectedCustomer.whatsapp)}</p>
                    </div>
                    {selectedCustomer.email && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">E-mail</label>
                        <p className="text-gray-900">{selectedCustomer.email}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Forma de Pagamento Padrão</label>
                      <p className="text-gray-900">{getPaymentMethodLabel(selectedCustomer.defaultPaymentMethod)}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Endereço</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      <p>{selectedCustomer.address}, {selectedCustomer.number}</p>
                      {selectedCustomer.complement && <p>{selectedCustomer.complement}</p>}
                      <p>{selectedCustomer.neighborhood}</p>
                      <p>{selectedCustomer.city}/{selectedCustomer.state}</p>
                      <p>CEP: {selectedCustomer.zipCode}</p>
                      {selectedCustomer.reference && (
                        <p className="text-gray-600">Ref: {selectedCustomer.reference}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{selectedCustomer.totalOrders}</p>
                    <p className="text-sm text-gray-600">Total de Pedidos</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{formatCurrency(selectedCustomer.totalSpent)}</p>
                    <p className="text-sm text-gray-600">Total Gasto</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">
                      {selectedCustomer.totalOrders > 0 
                        ? formatCurrency(Number(selectedCustomer.totalSpent) / selectedCustomer.totalOrders)
                        : formatCurrency(0)
                      }
                    </p>
                    <p className="text-sm text-gray-600">Ticket Médio</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{formatDate(selectedCustomer.createdAt)}</p>
                    <p className="text-sm text-gray-600">Cliente Desde</p>
                  </CardContent>
                </Card>
              </div>

              {/* Order History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Histórico de Pedidos</CardTitle>
                </CardHeader>
                <CardContent>
                  {customerOrders.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <p>Nenhum pedido encontrado</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3">
                        {customerOrders.map((order: Order) => (
                          <div key={order.id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                            <div>
                              <p className="font-medium">#{order.orderNumber}</p>
                              <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(order.total)}</p>
                              <Badge variant="outline" className="text-xs">
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
