import { Button } from "@/components/ui/button.js";
import { ScrollArea } from "@/components/ui/scroll-area.js";
import { Separator } from "@/components/ui/separator.js";
import { ShoppingCart, X, Minus, Plus, Trash2 } from "lucide-react";
import { Cart, CartItem } from "@/types.js";

interface CartSidebarProps {
  cart: Cart;
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (itemId: string, change: number, options?: Record<string, any>) => void;
  onRemoveItem: (itemId: string, options?: Record<string, any>) => void;
  onCheckout: () => void;
}

export function CartSidebar({ 
  cart, 
  isOpen, 
  onClose, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout 
}: CartSidebarProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-primary" />
                Seu Pedido
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Items */}
          <ScrollArea className="flex-1 p-4">
            {cart.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Seu carrinho está vazio</p>
                <p className="text-sm">Adicione produtos para começar seu pedido</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item, index) => (
                  <CartItemCard
                    key={`${item.id}-${JSON.stringify(item.selectedOptions)}-${index}`}
                    item={item}
                    onUpdateQuantity={onUpdateQuantity}
                    onRemove={onRemoveItem}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {cart.items.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de entrega:</span>
                  <span>{formatCurrency(cart.deliveryFee)}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Desconto:</span>
                    <span>-{formatCurrency(cart.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(cart.total)}</span>
                </div>
              </div>

              <Button 
                onClick={onCheckout}
                className="w-full bg-primary text-white hover:bg-primary/90 transition-colors"
                size="lg"
              >
                Finalizar Pedido
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (itemId: string, change: number, options?: Record<string, any>) => void;
  onRemove: (itemId: string, options?: Record<string, any>) => void;
  formatCurrency: (value: number) => string;
}

function CartItemCard({ item, onUpdateQuantity, onRemove, formatCurrency }: CartItemCardProps) {
  return (
    <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900">{item.name}</h4>
        <p className="text-sm text-gray-600">{formatCurrency(item.price)} cada</p>
        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {Object.entries(item.selectedOptions).map(([key, value]) => 
              `${key}: ${value}`
            ).join(', ')}
          </p>
        )}
        {item.observations && (
          <p className="text-xs text-gray-500 mt-1">Obs: {item.observations}</p>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdateQuantity(item.id, -1, item.selectedOptions)}
          className="w-8 h-8 p-0"
        >
          <Minus className="w-3 h-3" />
        </Button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdateQuantity(item.id, 1, item.selectedOptions)}
          className="w-8 h-8 p-0"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      
      <div className="text-right">
        <p className="font-semibold text-gray-900">{formatCurrency(item.total)}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item.id, item.selectedOptions)}
          className="text-red-500 hover:text-red-700 p-0 h-auto"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
