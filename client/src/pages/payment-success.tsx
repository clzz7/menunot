import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.js";

export default function PaymentSuccess() {
  const [location] = useLocation();
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setPaymentId(urlParams.get('payment_id'));
    setOrderId(urlParams.get('external_reference'));
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Pagamento Aprovado!</CardTitle>
          <CardDescription>
            Seu pedido foi confirmado e o pagamento foi processado com sucesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentId && (
            <div className="text-sm text-gray-600">
              <strong>ID do Pagamento:</strong> {paymentId}
            </div>
          )}
          {orderId && (
            <div className="text-sm text-gray-600">
              <strong>Número do Pedido:</strong> {orderId}
            </div>
          )}
          <p className="text-sm text-gray-600">
            Você receberá atualizações do status do seu pedido em tempo real. 
            O estabelecimento já foi notificado e começará a preparar seu pedido.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/" asChild>
              <Button className="w-full">
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}