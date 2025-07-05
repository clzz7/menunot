import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.js";

export default function PaymentFailure() {
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
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">Pagamento Não Aprovado</CardTitle>
          <CardDescription>
            Houve um problema com o processamento do seu pagamento.
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
            Seu pedido não foi confirmado devido ao problema no pagamento. 
            Você pode tentar novamente ou escolher outro método de pagamento.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/" asChild>
              <Button className="w-full">
                Tentar Novamente
              </Button>
            </Link>
            <Link href="/" asChild>
              <Button variant="outline" className="w-full">
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}