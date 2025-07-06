# Integração Mercado Pago - PIX

## Configuração Realizada

✅ **Credenciais configuradas no arquivo `.env`:**
- Access Token: `APP_USR-1509726792381844-062810-25b26150d643e919244a7bd4c476600f-1524796894`
- Public Key: `APP_USR-b89dca3f-02cc-448d-a348-4fc1221827c9`

## APIs Disponíveis

### 1. Obter Chave Pública
```
GET /api/mercadopago/public-key
```

**Resposta:**
```json
{
  "publicKey": "APP_USR-b89dca3f-02cc-448d-a348-4fc1221827c9"
}
```

### 2. Criar Pagamento PIX
```
POST /api/mercadopago/create-pix
```

**Payload:**
```json
{
  "orderId": "ORDER_123456",
  "amount": 100.50,
  "description": "Pagamento do pedido #123456"
}
```

**Nota:** Os dados do cliente não são mais necessários no payload, pois agora usamos dados fixos do restaurante configurados no servidor.

**Resposta:**
```json
{
  "id": "12345678",
  "status": "pending",
  "qr_code": "00020126360014BR.GOV.BCB.PIX01145678901234567890...",
  "qr_code_base64": "iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51...",
  "ticket_url": "https://www.mercadopago.com.br/checkout/v1/payment/redirect/12345678"
}
```

### 3. Consultar Status do Pagamento
```
GET /api/mercadopago/payment/:paymentId
```

**Resposta:**
```json
{
  "id": "12345678",
  "status": "approved",
  "status_detail": "accredited",
  "external_reference": "ORDER_123456",
  "transaction_amount": 100.50,
  "payment_method_id": "pix"
}
```

### 4. Webhook para Notificações
```
POST /api/mercadopago/webhook
```

O webhook será chamado automaticamente pelo Mercado Pago quando houver mudanças no status do pagamento.

## Como Usar no Frontend

### JavaScript/TypeScript:
```typescript
import { api } from './lib/api';

// Criar pagamento PIX
const createPixPayment = async (orderData) => {
  try {
    const response = await api.mercadopago.createPix({
      orderId: orderData.id,
      amount: orderData.total,
      description: `Pagamento do pedido #${orderData.id}`
    });
    
    // Exibir QR Code para o usuário
    if (response.qr_code_base64) {
      showQRCode(response.qr_code_base64);
    }
    
    // Iniciar polling para verificar status
    pollPaymentStatus(response.id);
    
    return response;
  } catch (error) {
    console.error('Erro ao criar pagamento PIX:', error);
    throw error;
  }
};

// Verificar status do pagamento
const pollPaymentStatus = async (paymentId) => {
  const checkStatus = async () => {
    try {
      const payment = await api.mercadopago.getPaymentStatus(paymentId);
      
      if (payment.status === 'approved') {
        handlePaymentSuccess(payment);
      } else if (payment.status === 'rejected') {
        handlePaymentFailure(payment);
      } else {
        // Continuar verificando se ainda está pending
        setTimeout(checkStatus, 3000);
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };
  
  checkStatus();
};
```

### React Component Example:
```jsx
import { useState } from 'react';
import { api } from '../lib/api';

const PixPayment = ({ orderData }) => {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('pending');

  const handleCreatePix = async () => {
    setLoading(true);
    try {
      const response = await api.mercadopago.createPix({
        orderId: orderData.id,
        amount: orderData.total,
        description: `Pagamento do pedido #${orderData.id}`
      });
      
      setPaymentData(response);
      startPolling(response.id);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (paymentId) => {
    const interval = setInterval(async () => {
      try {
        const payment = await api.mercadopago.getPaymentStatus(paymentId);
        setStatus(payment.status);
        
        if (payment.status === 'approved' || payment.status === 'rejected') {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    }, 3000);
  };

  return (
    <div>
      {!paymentData ? (
        <button onClick={handleCreatePix} disabled={loading}>
          {loading ? 'Criando PIX...' : 'Pagar com PIX'}
        </button>
      ) : (
        <div>
          <h3>PIX Gerado</h3>
          <p>Status: {status}</p>
          
          {paymentData.qr_code_base64 && (
            <div>
              <h4>QR Code:</h4>
              <img 
                src={`data:image/png;base64,${paymentData.qr_code_base64}`} 
                alt="QR Code PIX"
                style={{ maxWidth: '300px' }}
              />
            </div>
          )}
          
          {paymentData.qr_code && (
            <div>
              <h4>Código PIX (Copia e Cola):</h4>
              <textarea 
                value={paymentData.qr_code}
                readOnly
                style={{ width: '100%', height: '100px' }}
              />
              <button onClick={() => navigator.clipboard.writeText(paymentData.qr_code)}>
                Copiar Código PIX
              </button>
            </div>
          )}
          
          {status === 'approved' && (
            <div style={{ color: 'green' }}>
              ✅ Pagamento Aprovado!
            </div>
          )}
          
          {status === 'rejected' && (
            <div style={{ color: 'red' }}>
              ❌ Pagamento Rejeitado
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

## Status dos Pagamentos

- **`pending`**: Pagamento pendente, aguardando confirmação
- **`approved`**: Pagamento aprovado e processado
- **`rejected`**: Pagamento rejeitado
- **`cancelled`**: Pagamento cancelado
- **`refunded`**: Pagamento estornado

## Testando a Integração

1. **Iniciar o servidor:**
   ```bash
   npm run dev
   ```

2. **Testar criação de PIX:**
   ```bash
   curl -X POST http://localhost:5000/api/mercadopago/create-pix \
     -H "Content-Type: application/json" \
     -d '{
       "orderId": "TEST_123",
       "amount": 10.00,
       "description": "Pagamento teste"
     }'
   ```

## Webhook de Notificação

O webhook está configurado para receber notificações do Mercado Pago em:
```
POST /api/mercadopago/webhook
```

**Importante:** Para produção, configure a `BASE_URL` no arquivo `.env` com a URL do seu servidor.

## Observações Importantes

1. **Ambiente de Teste**: As credenciais fornecidas são para o ambiente de produção
2. **Webhook**: Configure o webhook na sua conta do Mercado Pago apontando para `{sua_url}/api/mercadopago/webhook`
3. **Timeout**: Os pagamentos PIX têm validade de 30 minutos
4. **Polling**: Implemente verificação periódica do status do pagamento no frontend
5. **Dados Fixos**: A integração foi configurada para usar dados fixos do restaurante (nome, email, telefone, CPF) ao invés dos dados do cliente
6. **URL Pública**: O webhook só funciona com URLs públicas. Em desenvolvimento local, o notification_url é omitido
7. **Configuração**: Todos os dados do restaurante estão configurados no arquivo `.env`

## Vantagens da Configuração com Dados Fixos

✅ **Evita erros de validação** com dados de clientes
✅ **Simplifica o processo** de pagamento
✅ **Reduz a complexidade** da integração
✅ **Mantém a segurança** dos dados dos clientes
✅ **Facilita testes** e desenvolvimento

## Para Produção

Para usar em produção, você precisará:

1. **Configurar URL pública**: Altere a `BASE_URL` no arquivo `.env` para a URL pública do seu servidor
2. **Configurar webhook**: No painel do Mercado Pago, configure o webhook apontando para `{sua_url}/api/mercadopago/webhook`
3. **Validar dados**: Certifique-se de que os dados do restaurante no `.env` estão corretos
4. **Testar**: Faça testes com valores baixos antes de colocar em produção

A integração está pronta para uso! 🎉