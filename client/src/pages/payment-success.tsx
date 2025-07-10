import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentSuccessPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Verificar se há WhatsApp armazenado para redirecionar para pedidos
    const storedWhatsApp = localStorage.getItem('customerWhatsApp');
    
    if (storedWhatsApp) {
      // Redirecionar para pedidos após 2 segundos se houver WhatsApp
      const timer = setTimeout(() => {
        setLocation('/pedidos?from=payment-success');
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      // Fallback: redirecionar para home após 5 segundos
      const timer = setTimeout(() => {
        setLocation('/');
      }, 5000);
      return () => clearTimeout(timer);
    }
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
            Redirecionando para seus pedidos...
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => setLocation('/pedidos')}
            className="flex-1"
          >
            Ver Meus Pedidos
          </Button>
          <Button 
            onClick={() => setLocation('/')}
            variant="outline"
            className="flex-1"
          >
            Voltar ao Início
          </Button>
        </div>
      </div>
    </div>
  );
}