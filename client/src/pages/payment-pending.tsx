import { useLocation } from 'wouter';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentPendingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8 text-yellow-600" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Pagamento Pendente
          </h1>
          <p className="text-muted-foreground">
            Estamos aguardando a confirmação do seu pagamento.
          </p>
        </div>

        <div className="bg-card border rounded-lg p-4 space-y-2">
          <p className="text-sm text-muted-foreground">
            Para PIX, o pagamento é processado instantaneamente.
            Para outros métodos, pode levar alguns minutos.
          </p>
        </div>

        <Button 
          onClick={() => setLocation('/')}
          className="w-full"
        >
          Voltar ao Início
        </Button>
      </div>
    </div>
  );
}