import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button.js";
import { Dialog, DialogContent } from "@/components/ui/dialog.js";
import { Badge } from "@/components/ui/badge.js";
import { Check, Clock, Utensils, Bell, Truck, Home, History, Plus, CreditCard } from "lucide-react";
import { Order } from "@shared/schema.js";
import { useToast } from "@/hooks/use-toast.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onViewHistory: () => void;
  onNewOrder: () => void;
}

export function OrderTrackingModal({
  isOpen,
  onClose,
  order,
  onViewHistory,
  onNewOrder
}: OrderTrackingModalProps) {
  const [currentStatus, setCurrentStatus] = useState<string>("PENDING");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (order) {
      setCurrentStatus(order.status);
    }
  }, [order]);

  const checkPaymentMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await fetch(`/api/orders/${orderId}/check-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setCurrentStatus('PREPARING');
        toast({
          title: "Pagamento confirmado!",
          description: data.message,
          duration: 5000,
        });
        // Invalidate queries to refresh order data
        queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      } else {
        toast({
          title: "Pagamento não confirmado",
          description: data.message,
          variant: "destructive",
          duration: 5000,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Erro ao verificar pagamento",
        description: "Tente novamente em alguns minutos",
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  const handleCheckPayment = () => {
    if (order?.id) {
      checkPaymentMutation.mutate(order.id);
    }
  };

  const statusSteps = [
    {
      key: "CONFIRMED",
      label: "Pedido Confirmado",
      icon: Check,
      time: "Agora mesmo"
    },
    {
      key: "PREPARING",
      label: "Preparando",
      icon: Utensils,
      time: "Em breve"
    },
    {
      key: "READY",
      label: "Pronto",
      icon: Bell,
      time: "Aguardando"
    },
    {
      key: "OUT_DELIVERY",
      label: "Saiu para Entrega",
      icon: Truck,
      time: "Aguardando"
    },
    {
      key: "DELIVERED",
      label: "Entregue",
      icon: Home,
      time: "Aguardando"
    }
  ];

  const getStatusIndex = (status: string) => {
    const index = statusSteps.findIndex(step => step.key === status);
    return index === -1 ? 0 : index;
  };

  const currentStatusIndex = getStatusIndex(currentStatus);

  const getStatusTime = (stepIndex: number) => {
    if (stepIndex <= currentStatusIndex) {
      return "Concluído";
    }
    return "Aguardando";
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          {/* Success Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-success text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Pedido Confirmado!</h2>
            <p className="text-gray-600 mt-2">Pedido #{order.orderNumber}</p>
          </div>

          {/* Order Status Timeline */}
          <div className="space-y-4 mb-6">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              
              return (
                <div key={step.key} className={`flex items-center ${isCompleted ? '' : 'opacity-50'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    isCompleted 
                      ? 'bg-success text-white' 
                      : 'bg-gray-200 text-gray-500'
                  } ${isCurrent ? 'order-status-animate' : ''}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-600'}`}>
                      {step.label}
                    </p>
                    <p className={`text-sm ${isCompleted ? 'text-gray-500' : 'text-gray-400'}`}>
                      {getStatusTime(index)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Estimated Time */}
          <div className="bg-primary bg-opacity-10 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center">
              <Clock className="w-5 h-5 text-gray-900 mr-2" />
              <span className="font-medium text-gray-900">
                Tempo estimado: {order.estimatedTime || 30}-{(order.estimatedTime || 30) + 10} min
              </span>
            </div>
          </div>

          {/* Payment Check Button - Only show if order is pending or confirmed but not yet preparing */}
          {(currentStatus === 'PENDING' || currentStatus === 'CONFIRMED') && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-blue-700 mb-3">
                  Após realizar o pagamento, clique no botão abaixo para confirmar:
                </p>
                <Button 
                  onClick={handleCheckPayment}
                  disabled={checkPaymentMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {checkPaymentMutation.isPending ? 'Verificando...' : 'Já Paguei'}
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button 
              onClick={onViewHistory}
              className="w-full bg-primary text-white hover:bg-orange-600 transition-colors h-12"
            >
              <History className="w-4 h-4 mr-2" />
              Ver Meus Pedidos
            </Button>
            <Button 
              onClick={onNewOrder}
              variant="outline"
              className="w-full h-12"
            >
              <Plus className="w-4 h-4 mr-2" />
              Fazer Novo Pedido
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
