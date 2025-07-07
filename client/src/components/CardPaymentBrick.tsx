import React, { useEffect, useState } from 'react';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { useMercadoPago } from '../hooks/useMercadoPago.js';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.js';
import { Alert, AlertDescription } from './ui/alert.js';
import { Loader2 } from 'lucide-react';

interface CardPaymentBrickProps {
  amount: number;
  orderId: string;
  customerData?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    document?: string;
    documentType?: string;
  };
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: any) => void;
  onPaymentPending?: (paymentData: any) => void;
}

interface PaymentFormData {
  token: string;
  installments: number;
  payment_method_id: string;
  issuer_id?: string;
  payer: {
    email: string;
    identification: {
      type: string;
      number: string;
    };
  };
}

export const CardPaymentBrick: React.FC<CardPaymentBrickProps> = ({
  amount,
  orderId,
  customerData,
  onPaymentSuccess,
  onPaymentError,
  onPaymentPending
}) => {
  const { config, loading, error } = useMercadoPago();
  const [initialized, setInitialized] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    if (config && !initialized) {
      try {
        initMercadoPago(config.publicKey, {
          locale: 'pt-BR'
        });
        setInitialized(true);
      } catch (error) {
        console.error('Error initializing MercadoPago:', error);
        setPaymentError('Erro ao inicializar o sistema de pagamento');
      }
    }
  }, [config, initialized]);

  const handleSubmit = async (cardFormData: any) => {
    setProcessing(true);
    setPaymentError(null);

    try {
      const response = await fetch('/api/mercadopago/create-card-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          token: cardFormData.token,
          description: `Pedido #${orderId}`,
          payer: {
            email: cardFormData.payer?.email || customerData?.email || '',
            first_name: customerData?.firstName || 'Cliente',
            last_name: customerData?.lastName || '',
            identification: {
              type: cardFormData.payer?.identification?.type || 'CPF',
              number: cardFormData.payer?.identification?.number || ''
            }
          },
          installments: cardFormData.installments,
          payment_method_id: cardFormData.payment_method_id,
          issuer_id: cardFormData.issuer_id
        }),
      });

      if (!response.ok) {
        throw new Error('Falha na comunicação com o servidor');
      }

      const paymentResult = await response.json();
      
      switch (paymentResult.status) {
        case 'approved':
          onPaymentSuccess(paymentResult);
          break;
        case 'pending':
        case 'in_process':
          if (onPaymentPending) {
            onPaymentPending(paymentResult);
          } else {
            onPaymentSuccess(paymentResult);
          }
          break;
        case 'rejected':
          const errorMessage = getErrorMessage(paymentResult.status_detail);
          setPaymentError(errorMessage);
          onPaymentError(paymentResult);
          break;
        default:
          setPaymentError('Status de pagamento desconhecido');
          onPaymentError(paymentResult);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro inesperado ao processar pagamento';
      setPaymentError(errorMessage);
      onPaymentError(error);
    } finally {
      setProcessing(false);
    }
  };

  const getErrorMessage = (statusDetail: string): string => {
    const errorMessages: Record<string, string> = {
      'cc_rejected_insufficient_amount': 'Cartão sem saldo suficiente',
      'cc_rejected_bad_filled_card_number': 'Número do cartão incorreto',
      'cc_rejected_bad_filled_date': 'Data de vencimento incorreta',
      'cc_rejected_bad_filled_security_code': 'Código de segurança incorreto',
      'cc_rejected_bad_filled_other': 'Dados do cartão incorretos',
      'cc_rejected_blacklist': 'Cartão não autorizado',
      'cc_rejected_call_for_authorize': 'Autorize o pagamento com o banco',
      'cc_rejected_card_disabled': 'Cartão desabilitado',
      'cc_rejected_duplicated_payment': 'Pagamento duplicado',
      'cc_rejected_high_risk': 'Pagamento recusado por risco',
      'cc_rejected_max_attempts': 'Máximo de tentativas excedido',
      'cc_rejected_other_reason': 'Pagamento recusado pelo banco'
    };

    return errorMessages[statusDetail] || 'Pagamento recusado. Verifique os dados ou tente outro cartão.';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Carregando sistema de pagamento...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!initialized) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Inicializando...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Pagamento com Cartão</CardTitle>
        <div className="text-center text-lg font-semibold text-green-600">
          Total: R$ {amount.toFixed(2).replace('.', ',')}
        </div>
      </CardHeader>
      <CardContent>
        {paymentError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{paymentError}</AlertDescription>
          </Alert>
        )}
        
        {processing && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Processando pagamento...</span>
            </div>
          </div>
        )}

        <div className="relative">
          <CardPayment
            initialization={{
              amount: amount,
              ...(customerData && {
                payer: {
                  email: customerData.email,
                  ...(customerData.document && customerData.documentType && {
                    identification: {
                      type: customerData.documentType,
                      number: customerData.document
                    }
                  })
                }
              })
            }}
            customization={{
              visual: {
                style: {
                  theme: 'default',
                },
              },
            }}
            onSubmit={handleSubmit}
            onReady={() => {
              console.log('Card Payment Brick is ready');
            }}
            onError={(error) => {
              console.error('Card Payment Brick error:', error);
              setPaymentError('Erro no formulário de pagamento');
              onPaymentError(error);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};