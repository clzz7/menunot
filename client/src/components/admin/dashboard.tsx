import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Badge } from "@/components/ui/badge.js";
import { Button } from "@/components/ui/button.js";
import { ScrollArea } from "@/components/ui/scroll-area.js";
import { ShoppingCart, DollarSign, Users, Star, Edit, Clock } from "lucide-react";
import { api } from "@/lib/api.js";
import { Order } from "@shared/schema.js";

export function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: api.dashboard.getStats
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: api.orders.getAll
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const orderDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Agora mesmo";
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)} dias atrás`;
  };

  // Get recent orders (last 10)
  const recentOrders = orders.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.todayOrders ? '+20.1% em relação a ontem' : 'Nenhum pedido hoje'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.todayRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.todayRevenue ? '+15.2% em relação a ontem' : 'Sem faturamento hoje'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCustomers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalCustomers ? '+2 novos esta semana' : 'Nenhum cliente cadastrado'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.averageOrderValue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.averageOrderValue ? '+5.1% este mês' : 'Sem dados suficientes'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum pedido encontrado</p>
              <p className="text-sm">Os pedidos aparecerão aqui quando forem feitos</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {recentOrders.map((order: Order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium text-gray-900 flex items-center">
                          #{order.orderNumber} - {order.customerName}
                          <Clock className="w-3 h-3 ml-2 text-gray-400" />
                          <span className="text-xs text-gray-500 ml-1">
                            {formatTimeAgo(order.createdAt)}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.deliveryAddress}, {order.deliveryNumber}
                        </p>
                        {order.observations && (
                          <p className="text-xs text-gray-400 mt-1">
                            Obs: {order.observations}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(Number(order.total))}
                      </span>
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
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
