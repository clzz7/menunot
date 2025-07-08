import { useLocation } from 'wouter';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentFailurePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Pagamento Cancelado
          </h1>
          <p className="text-muted-foreground">
            Houve um problema com o pagamento. Tente novamente.
          </p>
        </div>

        <div className="bg-card border rounded-lg p-4 space-y-2">
          <p className="text-sm text-muted-foreground">
            Nenhum valor foi cobrado e seu pedido não foi processado.
          </p>
        </div>

        <Button 
          onClick={() => setLocation('/')}
          className="w-full"
        >
          Tentar Novamente
        </Button>
      </div>
    </div>
  );
}