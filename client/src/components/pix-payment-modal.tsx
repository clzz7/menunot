import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.js";
import { Button } from "@/components/ui/button.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Badge } from "@/components/ui/badge.js";
import { Separator } from "@/components/ui/separator.js";
import { useToast } from "@/hooks/use-toast.js";
import { useWebSocket } from "@/hooks/use-websocket.js";
import { Copy, Clock, QrCode, CreditCard, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

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
  ticket_url?: string;
}

export function PixPaymentModal({ isOpen, onClose, order, onPaymentComplete }: PixPaymentModalProps) {
  const [pixPayment, setPixPayment] = useState<PixPaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes in seconds
  const [retryCount, setRetryCount] = useState(0);
  const [lastStatusCheck, setLastStatusCheck] = useState<Date | null>(null);
  const { toast } = useToast();
  
  // Refs for cleanup
  const pollingIntervalRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);

  // WebSocket for real-time payment updates
  useWebSocket((message) => {
    if (message.type === 'PAYMENT_STATUS_UPDATE' && 
        pixPayment && 
        message.paymentId === pixPayment.id) {
      console.log('🔄 Received real-time payment update:', message);
      
      if (message.status === 'approved') {
        setPaymentStatus('approved');
        setLastStatusCheck(new Date());
        stopPolling();
        
        toast({
          title: "✅ Pagamento aprovado!",
          description: "Seu pedido foi confirmado com sucesso.",
        });
        onPaymentComplete?.();
      } else if (message.status === 'rejected') {
        setPaymentStatus('rejected');
        setLastStatusCheck(new Date());
        stopPolling();
        
        toast({
          title: "❌ Pagamento rejeitado",
          description: "O pagamento não foi processado. Tente novamente.",
          variant: "destructive"
        });
      }
    }
  });

  // Create PIX payment when modal opens
  useEffect(() => {
    if (isOpen && !pixPayment) {
      createPixPayment();
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining > 0 && paymentStatus === 'pending') {
      countdownTimerRef.current = setTimeout(() => setTimeRemaining((time: number) => time - 1), 1000);
      return () => {
        if (countdownTimerRef.current) {
          clearTimeout(countdownTimerRef.current);
        }
      };
    }
  }, [timeRemaining, paymentStatus]);

  // Enhanced polling with exponential backoff
  useEffect(() => {
    if (pixPayment && paymentStatus === 'pending') {
      startPolling();
    }
    
    return () => stopPolling();
  }, [pixPayment, paymentStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
      if (countdownTimerRef.current) {
        clearTimeout(countdownTimerRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const startPolling = () => {
    if (pollingIntervalRef.current) return; // Already polling
    
    console.log('🔄 Starting payment status polling...');
    
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/mercadopago/payment/${pixPayment!.id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const paymentData = await response.json();
        setLastStatusCheck(new Date());
        setRetryCount(0); // Reset retry count on successful call
        
        console.log('💳 Payment status check result:', paymentData);
        
        if (paymentData.status === 'approved') {
          setPaymentStatus('approved');
          stopPolling();
          
          toast({
            title: "✅ Pagamento aprovado!",
            description: "Seu pedido foi confirmado com sucesso.",
          });
          onPaymentComplete?.();
        } else if (paymentData.status === 'rejected') {
          setPaymentStatus('rejected');
          stopPolling();
          
          toast({
            title: "❌ Pagamento rejeitado",
            description: "O pagamento não foi processado. Tente novamente.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('❌ Error checking payment status:', error);
        handlePollingError();
      }
    };

    // Initial check
    checkPaymentStatus();
    
    // Start polling with 2-second interval for better responsiveness
    pollingIntervalRef.current = setInterval(checkPaymentStatus, 2000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      console.log('🛑 Stopping payment status polling...');
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const handlePollingError = () => {
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    
    // Stop polling temporarily and retry with exponential backoff
    stopPolling();
    
    if (newRetryCount < 5) {
      const backoffDelay = Math.min(1000 * Math.pow(2, newRetryCount), 30000); // Max 30 seconds
      
      console.log(`⏳ Retrying polling in ${backoffDelay}ms (attempt ${newRetryCount})`);
      
      retryTimeoutRef.current = setTimeout(() => {
        if (paymentStatus === 'pending') {
          startPolling();
        }
      }, backoffDelay);
    } else {
      toast({
        title: "⚠️ Problema na verificação",
        description: "Tivemos dificuldade para verificar o status. O pagamento pode ter sido processado normalmente.",
        variant: "destructive"
      });
    }
  };

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
      
      // Check if we got a fallback preference instead of direct PIX
      if (pixData.fallback_to_preference && pixData.init_point) {
        // Redirect to MercadoPago checkout for PIX
        window.open(pixData.init_point, '_blank');
        toast({
          title: "PIX via MercadoPago",
          description: "Você será redirecionado para completar o pagamento PIX.",
        });
        onClose(); // Close modal since user will complete payment externally
      } else {
        setPixPayment(pixData);
        console.log('💳 PIX payment created:', pixData);
      }
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
            {paymentStatus === 'pending' && (
              <Badge variant="secondary" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Aguardando pagamento - {formatTime(timeRemaining)}
              </Badge>
            )}
            {paymentStatus === 'approved' && (
              <Badge variant="default" className="flex items-center gap-2 bg-green-600">
                <CheckCircle2 className="h-4 w-4" />
                Pagamento aprovado
              </Badge>
            )}
            {paymentStatus === 'rejected' && (
              <Badge variant="destructive" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Pagamento rejeitado
              </Badge>
            )}
          </div>

          {/* Connection Status */}
          {retryCount > 0 && paymentStatus === 'pending' && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Verificando status... (tentativa {retryCount})</span>
            </div>
          )}

          {lastStatusCheck && (
            <div className="text-xs text-center text-muted-foreground">
              Última verificação: {lastStatusCheck.toLocaleTimeString('pt-BR')}
            </div>
          )}

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

                {/* PIX Code */}
                <div className="bg-muted p-3 rounded text-xs break-all">
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
              <p>4. Aguarde a confirmação automática (em tempo real)</p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Fechar
            </Button>
            {paymentStatus === 'approved' && onPaymentComplete && (
              <Button onClick={onPaymentComplete} className="flex-1">
                Continuar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}