import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button.js";
import { Dialog, DialogContent } from "@/components/ui/dialog.js";
import { Badge } from "@/components/ui/badge.js";
import { Check, Clock, Utensils, Bell, Truck, Home, History, Plus } from "lucide-react";
import { Order } from "@shared/schema.js";

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

  useEffect(() => {
    if (order) {
      setCurrentStatus(order.status);
    }
  }, [order]);

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
