import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentSuccessPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Auto redirect to home after 5 seconds
    const timer = setTimeout(() => {
      setLocation('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Pagamento Aprovado!
          </h1>
          <p className="text-muted-foreground">
            Seu pedido foi confirmado e já está sendo preparado.
          </p>
        </div>

        <div className="bg-card border rounded-lg p-4 space-y-2">
          <p className="text-sm text-muted-foreground">
            Você será redirecionado automaticamente em 5 segundos...
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