import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Copy, Clock, QrCode, CheckCircle2, Loader2 } from "lucide-react";

interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    orderNumber: string;
    total: number;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
  };
  onPaymentComplete?: () => void;
}

interface PixPaymentData {
  id: string;
  status: string;
  qr_code: string;
  qr_code_base64: string;
}

export function PixPaymentModal({ isOpen, onClose, order, onPaymentComplete }: PixPaymentModalProps) {
  const [pixPayment, setPixPayment] = useState<PixPaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes
  const { toast } = useToast();

  // Create PIX payment when modal opens
  useEffect(() => {
    if (isOpen && !pixPayment) {
      createPixPayment();
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(time => time - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  const createPixPayment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/mercadopago/create-pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          amount: order.total,
          payer: {
            name: order.customerName,
            email: order.customerEmail || `${order.customerPhone.replace(/\D/g, '')}@noemail.com`,
            phone: order.customerPhone.replace(/\D/g, '')
          },
          description: `Pedido #${order.orderNumber} - ${order.customerName}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create PIX payment');
      }

      const pixData = await response.json();
      setPixPayment(pixData);
    } catch (error) {
      console.error('Error creating PIX payment:', error);
      toast({
        title: "Erro ao gerar PIX",
        description: "Não foi possível gerar o código PIX. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyPixCode = () => {
    if (pixPayment?.qr_code) {
      navigator.clipboard.writeText(pixPayment.qr_code);
      toast({
        title: "Código copiado!",
        description: "Cole no seu app do banco para pagar",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Pagamento PIX
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Pedido #{order.orderNumber}</CardTitle>
              <CardDescription>{order.customerName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="font-medium">Total</span>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <div className="flex justify-center">
            <Badge variant="secondary" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Aguardando pagamento - {formatTime(timeRemaining)}
            </Badge>
          </div>

          {/* PIX Payment */}
          {isLoading ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>Gerando código PIX...</p>
              </CardContent>
            </Card>
          ) : pixPayment ? (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Escaneie o QR Code</CardTitle>
                <CardDescription>
                  Use o app do seu banco para pagar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* QR Code */}
                {pixPayment.qr_code_base64 && (
                  <div className="flex justify-center">
                    <img 
                      src={`data:image/png;base64,${pixPayment.qr_code_base64}`}
                      alt="QR Code PIX"
                      className="w-48 h-48 border rounded"
                    />
                  </div>
                )}

                <Separator />

                {/* Copy Code Button */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground text-center">
                    Ou copie e cole o código no seu banco
                  </p>
                  <Button 
                    onClick={copyPixCode}
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar código PIX
                  </Button>
                </div>

                {/* PIX Code Display */}
                <div className="bg-muted p-3 rounded text-xs break-all max-h-20 overflow-y-auto">
                  {pixPayment.qr_code}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground">Erro ao gerar código PIX</p>
                <Button onClick={createPixPayment} className="mt-4">
                  Tentar novamente
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Como pagar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>1. Abra o app do seu banco</p>
              <p>2. Escaneie o QR Code ou cole o código PIX</p>
              <p>3. Confirme o pagamento</p>
              <p>4. O pedido será confirmado automaticamente</p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Fechar
            </Button>
            <Button onClick={() => createPixPayment()} variant="outline" className="flex-1">
              Gerar novo PIX
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}