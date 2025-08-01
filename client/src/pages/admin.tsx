import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.js";
import { Button } from "@/components/ui/button.js";
import { BarChart3, Package, Users, Settings, LogOut, Bell, Ticket } from "lucide-react";
import { Dashboard } from "@/components/admin/dashboard.js";
import { OrdersManagement } from "@/components/admin/orders-management.js";
import { ProductsManagement } from "@/components/admin/products-management.js";
import { CustomersManagement } from "@/components/admin/customers-management.js";
import { CouponsManagement } from "@/components/admin/coupons-management.js";
import { SettingsPage } from "@/components/admin/settings.js";
import { useWebSocket } from "@/hooks/use-websocket.js";
import { useToast } from "@/hooks/use-toast.js";
import { Badge } from "@/components/ui/badge.js";
import { useAuth } from "@/hooks/use-auth.js";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notifications, setNotifications] = useState<number>(0);
  const { toast } = useToast();
  const { user, logout } = useAuth();

  // WebSocket for real-time admin updates
  useWebSocket((message) => {
    if (message.type === 'NEW_ORDER') {
      setNotifications(prev => prev + 1);
      
      // Play notification sound (if supported)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Novo Pedido!', {
          body: `Pedido #${message.order?.orderNumber} foi recebido`,
          icon: '/favicon.ico'
        });
      }
      
      toast({
        title: "Novo Pedido Recebido!",
        description: `Pedido #${message.order?.orderNumber}`,
      });
    }
  });

  const clearNotifications = () => {
    setNotifications(0);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Painel Administrativo</h1>
              {notifications > 0 && (
                <Badge variant="destructive" className="bg-red-500">
                  {notifications} novo{notifications > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notificações
              </Button>
              <span className="text-sm text-gray-600">{user?.username || 'Admin'}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center" onClick={clearNotifications}>
              <Package className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Pedidos</span>
              {notifications > 0 && (
                <Badge variant="destructive" className="ml-2 bg-red-500 text-xs">
                  {notifications}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center">
              <Package className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Produtos</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Clientes</span>
            </TabsTrigger>
            <TabsTrigger value="coupons" className="flex items-center">
              <Ticket className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Cupons</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Configurações</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <OrdersManagement />
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <ProductsManagement />
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <CustomersManagement />
          </TabsContent>

          <TabsContent value="coupons" className="space-y-6">
            <CouponsManagement />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsPage />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
