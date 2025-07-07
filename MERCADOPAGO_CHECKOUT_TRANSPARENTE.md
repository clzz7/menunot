# Guia Completo: Implementação do Checkout Transparente - Mercado Pago

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Configuração de Credenciais](#configuração-de-credenciais)
3. [Análise do Projeto Atual](#análise-do-projeto-atual)
4. [Checkout Bricks - Implementação Moderna](#checkout-bricks-implementação-moderna)
5. [Implementação Backend](#implementação-backend)
6. [Implementação Frontend](#implementação-frontend)
7. [Segurança e Validações](#segurança-e-validações)
8. [Testes e Homologação](#testes-e-homologação)
9. [Credenciais Necessárias](#credenciais-necessárias)

## 🎯 Visão Geral

O **Checkout Transparente** (agora chamado de **Checkout Bricks**) é a solução moderna do Mercado Pago que permite uma experiência de pagamento totalmente integrada ao seu site, sem redirecionamentos externos.

### Principais Vantagens:
- ✅ Experiência totalmente customizável
- ✅ Processamento seguro com certificação PCI
- ✅ Suporte a múltiplos meios de pagamento
- ✅ Interface responsiva e moderna
- ✅ Tokenização segura de cartões
- ✅ Validações em tempo real

### Tecnologias Utilizadas:
- **Frontend**: React + TypeScript + Checkout Bricks SDK
- **Backend**: Node.js + Express + Mercado Pago SDK
- **Meios de Pagamento**: Cartões, PIX, Dinheiro, Conta Mercado Pago

## 🔐 Configuração de Credenciais

### Credenciais Necessárias (arquivo .env):

```env
# Mercado Pago - Credenciais de Sandbox (Testes)
MERCADOPAGO_ACCESS_TOKEN=TEST-123456789-123456-abcdef123456789-123456789
MERCADOPAGO_PUBLIC_KEY=TEST-123456789-123456-abcdef123456789

# Mercado Pago - Credenciais de Produção
MERCADOPAGO_ACCESS_TOKEN_PROD=APP_USR-123456789-123456-abcdef123456789-123456789
MERCADOPAGO_PUBLIC_KEY_PROD=APP_USR-123456789-123456-abcdef123456789

# Configurações do ambiente
NODE_ENV=development
BASE_URL=http://localhost:5000

# URLs de retorno
MERCADOPAGO_SUCCESS_URL=http://localhost:5000/payment/success
MERCADOPAGO_FAILURE_URL=http://localhost:5000/payment/failure
MERCADOPAGO_PENDING_URL=http://localhost:5000/payment/pending
MERCADOPAGO_WEBHOOK_URL=http://localhost:5000/api/mercadopago/webhook
```

### Como Obter as Credenciais:
1. Acesse: https://www.mercadopago.com.br/developers/panel/credentials
2. Faça login na sua conta Mercado Pago
3. Crie uma aplicação (se não tiver)
4. Copie as credenciais de **Sandbox** para testes
5. Após homologação, use as credenciais de **Produção**

## 📊 Análise do Projeto Atual

### ✅ O que já está implementado:
- SDK do Mercado Pago instalado (`mercadopago: ^2.8.0`)
- Serviço básico do Mercado Pago (`server/mercadopago.ts`)
- Pagamento PIX implementado
- Webhook para notificações
- Rotas da API configuradas

### 🔄 O que precisa ser melhorado:
1. **Adicionar Checkout Bricks para cartões**
2. **Implementar SDK React do Mercado Pago**
3. **Melhorar validações de segurança**
4. **Adicionar mais meios de pagamento**
5. **Implementar tokenização de cartões**

## 🎨 Checkout Bricks - Implementação Moderna

### 1. Instalação das Dependências

```bash
npm install @mercadopago/sdk-react @mercadopago/sdk-js
```

### 2. Atualização do package.json

```json
{
  "dependencies": {
    "@mercadopago/sdk-react": "^1.0.3",
    "@mercadopago/sdk-js": "^0.0.3",
    "mercadopago": "^2.8.0"
  }
}
```

## 🔧 Implementação Backend

### 1. Atualização do Serviço MercadoPago

```typescript
// server/mercadopago.ts - Versão Atualizada
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});

const preference = new Preference(client);
const payment = new Payment(client);

export interface CardPaymentRequest {
  orderId: string;
  amount: number;
  token: string;
  description: string;
  payer: {
    email: string;
    first_name: string;
    last_name: string;
    identification: {
      type: string;
      number: string;
    };
  };
  installments: number;
  payment_method_id: string;
  issuer_id?: string;
}

export class MercadoPagoService {
  
  // Método para criar pagamento com cartão (Checkout Transparente)
  async createCardPayment(paymentData: CardPaymentRequest) {
    try {
      const paymentRequest = {
        transaction_amount: paymentData.amount,
        token: paymentData.token,
        description: paymentData.description,
        installments: paymentData.installments,
        payment_method_id: paymentData.payment_method_id,
        issuer_id: paymentData.issuer_id,
        payer: {
          email: paymentData.payer.email,
          first_name: paymentData.payer.first_name,
          last_name: paymentData.payer.last_name,
          identification: {
            type: paymentData.payer.identification.type,
            number: paymentData.payer.identification.number
          }
        },
        external_reference: paymentData.orderId,
        notification_url: `${process.env.BASE_URL}/api/mercadopago/webhook`,
        metadata: {
          order_id: paymentData.orderId
        }
      };

      const result = await payment.create({ body: paymentRequest });
      
      return {
        id: result.id,
        status: result.status,
        status_detail: result.status_detail,
        transaction_amount: result.transaction_amount,
        payment_method_id: result.payment_method_id,
        external_reference: result.external_reference
      };
    } catch (error) {
      console.error('Error creating card payment:', error);
      throw error;
    }
  }

  // Método existente para PIX (mantido)
  async createPixPayment(paymentData: any) {
    // ... código existente
  }

  // Método para obter meios de pagamento disponíveis
  async getPaymentMethods() {
    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payment_methods`, {
        headers: {
          'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }
}

export const mercadoPagoService = new MercadoPagoService();
```

### 2. Novas Rotas da API

```typescript
// server/routes.ts - Adicionar estas rotas ao arquivo existente

// Rota para criar pagamento com cartão
app.post("/api/mercadopago/create-card-payment", async (req, res) => {
  try {
    const cardPaymentData: CardPaymentRequest = {
      orderId: req.body.orderId,
      amount: req.body.amount,
      token: req.body.token,
      description: req.body.description,
      payer: req.body.payer,
      installments: req.body.installments,
      payment_method_id: req.body.payment_method_id,
      issuer_id: req.body.issuer_id
    };

    const payment = await mercadoPagoService.createCardPayment(cardPaymentData);
    
    // Atualizar status do pedido baseado no resultado
    if (payment.status === 'approved') {
      await storage.updateOrderStatus(req.body.orderId, 'CONFIRMED');
    } else if (payment.status === 'rejected') {
      await storage.updateOrderStatus(req.body.orderId, 'CANCELLED');
    }
    
    res.json(payment);
  } catch (error) {
    console.error("Error creating card payment:", error);
    res.status(500).json({ error: "Failed to process card payment" });
  }
});

// Rota para obter chave pública (atualizada)
app.get("/api/mercadopago/config", (req, res) => {
  res.json({ 
    publicKey: process.env.MERCADOPAGO_PUBLIC_KEY,
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
  });
});

// Rota para obter meios de pagamento
app.get("/api/mercadopago/payment-methods", async (req, res) => {
  try {
    const paymentMethods = await mercadoPagoService.getPaymentMethods();
    res.json(paymentMethods);
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    res.status(500).json({ error: "Failed to fetch payment methods" });
  }
});
```

## 🎨 Implementação Frontend

### 1. Hook para Mercado Pago

```typescript
// client/src/hooks/useMercadoPago.ts
import { useState, useEffect } from 'react';

interface MercadoPagoConfig {
  publicKey: string;
  environment: 'sandbox' | 'production';
}

export const useMercadoPago = () => {
  const [config, setConfig] = useState<MercadoPagoConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/mercadopago/config');
        const data = await response.json();
        setConfig(data);
      } catch (error) {
        console.error('Error fetching MercadoPago config:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, loading };
};
```

### 2. Componente Card Payment Brick

```tsx
// client/src/components/CardPaymentBrick.tsx
import React, { useEffect, useState } from 'react';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { useMercadoPago } from '../hooks/useMercadoPago';

interface CardPaymentBrickProps {
  amount: number;
  orderId: string;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: any) => void;
}

export const CardPaymentBrick: React.FC<CardPaymentBrickProps> = ({
  amount,
  orderId,
  onPaymentSuccess,
  onPaymentError
}) => {
  const { config, loading } = useMercadoPago();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (config && !initialized) {
      initMercadoPago(config.publicKey, {
        locale: 'pt-BR'
      });
      setInitialized(true);
    }
  }, [config, initialized]);

  const handleSubmit = async (cardFormData: any) => {
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
            email: cardFormData.payer.email,
            first_name: cardFormData.payer.first_name,
            last_name: cardFormData.payer.last_name,
            identification: {
              type: cardFormData.payer.identification.type,
              number: cardFormData.payer.identification.number
            }
          },
          installments: cardFormData.installments,
          payment_method_id: cardFormData.payment_method_id,
          issuer_id: cardFormData.issuer_id
        }),
      });

      const paymentResult = await response.json();
      
      if (paymentResult.status === 'approved') {
        onPaymentSuccess(paymentResult);
      } else {
        onPaymentError(paymentResult);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      onPaymentError(error);
    }
  };

  if (loading || !initialized) {
    return <div className="flex justify-center p-4">Carregando...</div>;
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <CardPayment
        initialization={{
          amount: amount,
        }}
        customization={{
          visual: {
            style: {
              theme: 'default',
            },
          },
          paymentMethods: {
            creditCard: 'all',
            debitCard: 'all',
          },
        }}
        onSubmit={handleSubmit}
        onReady={() => {
          console.log('Card Payment Brick is ready');
        }}
        onError={(error) => {
          console.error('Card Payment Brick error:', error);
          onPaymentError(error);
        }}
      />
    </div>
  );
};
```

### 3. Atualização do Modal de Checkout

```tsx
// client/src/components/checkout-modal.tsx - Adicionar ao componente existente

import { CardPaymentBrick } from './CardPaymentBrick';

// Adicionar ao componente CheckoutModal
const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | null>(null);

const handleCardPaymentSuccess = (paymentData: any) => {
  console.log('Pagamento aprovado:', paymentData);
  // Redirecionar para página de sucesso ou mostrar confirmação
  onClose();
  // Adicionar lógica de sucesso
};

const handleCardPaymentError = (error: any) => {
  console.error('Erro no pagamento:', error);
  // Mostrar mensagem de erro ao usuário
};

// Adicionar na renderização do modal:
{paymentMethod === 'card' && (
  <CardPaymentBrick
    amount={total}
    orderId={orderId}
    onPaymentSuccess={handleCardPaymentSuccess}
    onPaymentError={handleCardPaymentError}
  />
)}

// Adicionar botão para escolher método de pagamento:
<div className="space-y-4">
  <button
    onClick={() => setPaymentMethod('card')}
    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
  >
    💳 Pagar com Cartão
  </button>
  
  <button
    onClick={() => setPaymentMethod('pix')}
    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700"
  >
    📱 Pagar com PIX
  </button>
</div>
```

## 🔒 Segurança e Validações

### 1. Validação de Dados Sensíveis

```typescript
// Nunca envie dados de cartão para seu servidor
// Use sempre tokenização via SDK do frontend

const validatePaymentData = (data: any) => {
  // Validar apenas dados não sensíveis
  if (!data.amount || data.amount <= 0) {
    throw new Error('Valor inválido');
  }
  
  if (!data.orderId) {
    throw new Error('ID do pedido obrigatório');
  }
  
  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.payer.email)) {
    throw new Error('Email inválido');
  }
};
```

### 2. Implementação de Webhook Seguro

```typescript
// Validação de webhook do Mercado Pago
app.post("/api/mercadopago/webhook", async (req, res) => {
  try {
    // Validar origem do webhook (opcional - implementar verificação de assinatura)
    const webhookData = await mercadoPagoService.processWebhook(req.body);
    
    if (webhookData && webhookData.externalReference) {
      // Buscar pedido no banco de dados
      const order = await storage.getOrder(webhookData.externalReference);
      
      if (order) {
        let orderStatus = 'PENDING';
        
        switch (webhookData.status) {
          case 'approved':
            orderStatus = 'CONFIRMED';
            break;
          case 'rejected':
          case 'cancelled':
            orderStatus = 'CANCELLED';
            break;
          case 'pending':
          case 'in_process':
            orderStatus = 'PENDING';
            break;
        }
        
        await storage.updateOrderStatus(order.id, orderStatus);
        
        // Broadcast para clientes conectados
        broadcast({
          type: 'ORDER_STATUS_UPDATE',
          orderId: order.id,
          status: orderStatus,
          timestamp: new Date()
        });
      }
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ error: "Failed to process webhook" });
  }
});
```

## 🧪 Testes e Homologação

### 1. Cartões de Teste

```javascript
// Cartões para teste em sandbox
const testCards = {
  visa: {
    number: '4509 9535 6623 3704',
    cvv: '123',
    expiry: '11/25',
    status: 'approved'
  },
  mastercard: {
    number: '5031 7557 3453 0604',
    cvv: '123',
    expiry: '11/25',
    status: 'approved'
  },
  amex: {
    number: '3711 8030 3257 522',
    cvv: '1234',
    expiry: '11/25',
    status: 'approved'
  },
  rejected: {
    number: '4000 0000 0000 0002',
    cvv: '123',
    expiry: '11/25',
    status: 'rejected'
  }
};
```

### 2. Usuários de Teste

```bash
# Criar usuários de teste via API
curl -X POST \
'https://api.mercadopago.com/users/test_user' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
-d '{
  "site_id": "MLB"
}'
```

### 3. Ambiente de Teste

```env
# .env.test
NODE_ENV=test
MERCADOPAGO_ACCESS_TOKEN=TEST-123456789-123456-abcdef123456789-123456789
MERCADOPAGO_PUBLIC_KEY=TEST-123456789-123456-abcdef123456789
BASE_URL=http://localhost:5000
```

## 📋 Credenciais Necessárias

### Lista Completa de Variáveis de Ambiente:

```env
# === MERCADO PAGO - SANDBOX (TESTES) ===
MERCADOPAGO_ACCESS_TOKEN=TEST-1234567890-123456-abcdef123456789-123456789
MERCADOPAGO_PUBLIC_KEY=TEST-1234567890-123456-abcdef123456789

# === MERCADO PAGO - PRODUÇÃO ===
MERCADOPAGO_ACCESS_TOKEN_PROD=APP_USR-1234567890-123456-abcdef123456789-123456789
MERCADOPAGO_PUBLIC_KEY_PROD=APP_USR-1234567890-123456-abcdef123456789

# === CONFIGURAÇÕES GERAIS ===
NODE_ENV=development
BASE_URL=http://localhost:5000

# === URLs DE RETORNO ===
MERCADOPAGO_SUCCESS_URL=http://localhost:5000/payment/success
MERCADOPAGO_FAILURE_URL=http://localhost:5000/payment/failure
MERCADOPAGO_PENDING_URL=http://localhost:5000/payment/pending
MERCADOPAGO_WEBHOOK_URL=http://localhost:5000/api/mercadopago/webhook

# === CONFIGURAÇÕES DE SEGURANÇA ===
MERCADOPAGO_WEBHOOK_SECRET=your-webhook-secret-key

# === DATABASE (já existente) ===
DATABASE_URL=your-database-url
```

## 📝 Próximos Passos

### Para Implementação Completa:

1. **✅ Configurar credenciais** - Criar conta e obter chaves API
2. **✅ Instalar dependências** - Adicionar SDKs do Mercado Pago
3. **🔄 Implementar backend** - Criar rotas para pagamento com cartão
4. **🔄 Implementar frontend** - Adicionar Checkout Bricks
5. **🔄 Configurar webhook** - Para receber notificações de pagamento
6. **🧪 Testar integração** - Usar cartões de teste
7. **🚀 Homologar produção** - Validar com dados reais
8. **📊 Monitorar pagamentos** - Implementar logs e alertas

### Recursos Adicionais:

- **3DS 2.0**: Para maior segurança em transações
- **Antifraude**: Validações automáticas de segurança
- **Parcelamento**: Configuração de parcelas
- **Múltiplos cartões**: Salvar cartões para próximas compras
- **Wallet**: Integração com carteira Mercado Pago

## 🎯 Conclusão

Com esta implementação, você terá um checkout transparente completo e moderno, oferecendo:

- ✅ **Experiência integrada** sem redirecionamentos
- ✅ **Múltiplos meios de pagamento** (PIX, Cartões, etc.)
- ✅ **Segurança PCI-DSS** completa
- ✅ **Interface responsiva** e moderna
- ✅ **Processamento em tempo real**

O projeto ficará totalmente configurado para receber pagamentos de forma segura e eficiente! 🚀