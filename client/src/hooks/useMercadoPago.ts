import { useState, useEffect } from 'react';

interface MercadoPagoConfig {
  publicKey: string;
  environment: 'sandbox' | 'production';
}

export const useMercadoPago = () => {
  const [config, setConfig] = useState<MercadoPagoConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/mercadopago/config');
        if (!response.ok) {
          throw new Error('Falha ao carregar configuração do Mercado Pago');
        }
        const data = await response.json();
        setConfig(data);
      } catch (error) {
        console.error('Error fetching MercadoPago config:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, loading, error };
};