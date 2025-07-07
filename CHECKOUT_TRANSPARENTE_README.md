# 🚀 Checkout Transparente - Guia de Uso

## ✅ Implementação Concluída

O checkout transparente do Mercado Pago foi implementado com sucesso no projeto! Agora você tem:

- ✅ **SDK React do Mercado Pago** instalado
- ✅ **Hook personalizado** para configuração
- ✅ **Componente CardPaymentBrick** funcional  
- ✅ **Rotas da API** configuradas no backend
- ✅ **Serviço atualizado** com pagamentos por cartão

## 🔧 Como Configurar

### 1. Configure as Credenciais

1. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Obtenha suas credenciais do Mercado Pago:
   - Acesse: https://www.mercadopago.com.br/developers/panel/credentials
   - Faça login na sua conta
   - Copie as credenciais de **Sandbox** (para testes)

3. Substitua no arquivo `.env`:
```env
MERCADOPAGO_ACCESS_TOKEN=TEST-sua-chave-access-token-aqui
MERCADOPAGO_PUBLIC_KEY=TEST-sua-chave-publica-aqui
```

## 💳 Como Usar o Checkout Transparente

### 1. No Modal de Checkout

Adicione o componente ao seu modal existente:

```tsx
import { CardPaymentBrick } from './components/CardPaymentBrick';

// No seu checkout-modal.tsx
const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | null>(null);

// Handlers para pagamento com cartão
const handleCardPaymentSuccess = (paymentData: any) => {
  console.log('✅ Pagamento aprovado:', paymentData);
  onClose();
  // Redirecionar para página de sucesso
};

const handleCardPaymentError = (error: any) => {
  console.error('❌ Erro no pagamento:', error);
  // Mostrar mensagem de erro
};

// IMPORTANTE: Garanta que os dados do cliente estejam completos
const customerData = {
  email: customer?.email || '', // ⚠️ OBRIGATÓRIO
  firstName: customer?.name?.split(' ')[0] || 'Cliente', // ⚠️ OBRIGATÓRIO  
  lastName: customer?.name?.split(' ').slice(1).join(' ') || '',
  phone: customer?.whatsapp,
  document: customer?.document || '', // ⚠️ OBRIGATÓRIO (CPF/CNPJ)
  documentType: customer?.document?.length > 11 ? 'CNPJ' : 'CPF' // ⚠️ OBRIGATÓRIO
};

// Validar dados antes de renderizar
if (!customerData.email || !customerData.document) {
  return (
    <div className="text-red-500 p-4">
      ⚠️ Dados do cliente incompletos. Email e CPF/CNPJ são obrigatórios.
    </div>
  );
}

// Renderizar o componente
{paymentMethod === 'card' && (
  <CardPaymentBrick
    amount={total}
    orderId={orderId}
    customerData={customerData}
    onPaymentSuccess={handleCardPaymentSuccess}
    onPaymentError={handleCardPaymentError}
  />
)}
```

### 2. Botões de Seleção de Método

```tsx
<div className="space-y-4">
  <button
    onClick={() => setPaymentMethod('card')}
    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
  >
    💳 Pagar com Cartão de Crédito/Débito
  </button>
  
  <button
    onClick={() => setPaymentMethod('pix')}
    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
  >
    📱 Pagar com PIX
  </button>
</div>
```

## 🧪 Testando a Implementação

### Cartões de Teste (Sandbox)

Use estes cartões para testar:

| Bandeira | Número | CVV | Validade | Resultado |
|----------|--------|-----|----------|-----------|
| Visa | `4509 9535 6623 3704` | 123 | 11/25 | ✅ Aprovado |
| Mastercard | `5031 7557 3453 0604` | 123 | 11/25 | ✅ Aprovado |
| American Express | `3711 8030 3257 522` | 1234 | 11/25 | ✅ Aprovado |
| Visa Recusado | `4000 0000 0000 0002` | 123 | 11/25 | ❌ Recusado |

### Dados de Teste

- **Email**: `test@mercadopago.com.br`
- **Nome**: `João Silva`
- **CPF**: `123.456.789-09`

## 🔄 Fluxo de Pagamento

1. **Cliente escolhe produtos** → Adiciona ao carrinho
2. **Abre checkout** → Seleciona "Pagar com Cartão"
3. **Valida dados obrigatórios** → Email, nome, CPF/CNPJ
4. **Preenche dados do cartão** → Número, CVV, validade, parcelas
5. **Processa pagamento** → Mercado Pago valida em tempo real
6. **Recebe resultado** → Aprovado, Pendente ou Recusado
7. **Atualiza pedido** → Status automaticamente atualizado

## 🔍 Validação de Dados

### ⚠️ Campos Obrigatórios

O Mercado Pago exige os seguintes dados:

✅ **Email** - Deve ser um email válido  
✅ **Nome** - Primeiro nome do cliente  
✅ **Sobrenome** - Último nome (pode ser vazio)  
✅ **CPF/CNPJ** - Documento de identificação  
✅ **Token do cartão** - Gerado automaticamente pelo Brick  

### 🛠️ Debug e Logs

Para verificar se os dados estão sendo enviados corretamente:

1. **Abra o Console do Navegador** (F12)
2. **Faça um pagamento teste**
3. **Verifique os logs:**

```
✅ Card Payment Brick está pronto
Dados do cliente passados: {email: "...", firstName: "...", ...}

Dados enviados para pagamento: {orderId: "...", amount: 100, ...}

=== DADOS RECEBIDOS PARA PAGAMENTO ===
Body completo: {...}

=== DADOS PROCESSADOS PARA MERCADO PAGO ===
cardPaymentData: {...}

=== RESPOSTA DO MERCADO PAGO ===
payment result: {status: "approved", ...}
```

### ❌ Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| "Email é obrigatório" | Email vazio/inválido | Validar dados do cliente |
| "CPF/CNPJ é obrigatório" | Documento não informado | Coletar CPF na checkout |
| "Token do cartão é obrigatório" | Erro no Brick | Verificar credenciais |
| "Nome do pagador é obrigatório" | Nome vazio | Garantir first_name |

## 🔒 Segurança

✅ **Dados sensíveis nunca passam pelo seu servidor**
- Números de cartão são tokenizados pelo Mercado Pago
- Sua aplicação só recebe tokens seguros
- Conformidade PCI-DSS automática

✅ **Validações em tempo real**
- Verificação de BIN (primeiros 6 dígitos)
- Validação de CVV e data de validade
- Detecção de fraude automática

## 📊 Status de Pagamento

| Status | Descrição | Ação |
|--------|-----------|------|
| `approved` | ✅ Pagamento aprovado | Pedido confirmado |
| `pending` | ⏳ Pagamento pendente | Aguardar confirmação |
| `in_process` | 🔄 Em processamento | Aguardar resultado |
| `rejected` | ❌ Pagamento recusado | Tentar novamente |

## 🚨 Tratamento de Erros

O componente já trata automaticamente:

- **Cartão sem saldo** → "Cartão sem saldo suficiente"
- **Dados incorretos** → "Verifique os dados do cartão"
- **Cartão bloqueado** → "Cartão não autorizado"
- **Limite excedido** → "Entre em contato com o banco"

## 🔗 URLs de Webhook

Para receber notificações automáticas:

```env
MERCADOPAGO_WEBHOOK_URL=https://seudominio.com/api/mercadopago/webhook
```

⚠️ **Importante**: Em produção, use HTTPS e um domínio válido.

## 🚀 Indo para Produção

### 1. Substitua as Credenciais

```env
# Remova as credenciais de teste e use as de produção
MERCADOPAGO_ACCESS_TOKEN=APP_USR-sua-chave-de-producao
MERCADOPAGO_PUBLIC_KEY=APP_USR-sua-chave-publica-producao
NODE_ENV=production
```

### 2. Configure HTTPS

- Use sempre HTTPS em produção
- Configure certificado SSL válido
- Atualize URLs de webhook

### 3. Teste com Cartões Reais

- Use valores baixos (R$ 1,00) para teste
- Verifique se os webhooks estão funcionando
- Monitore logs de erro

## 📞 Suporte

### Documentação Oficial
- [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
- [Checkout Bricks](https://www.mercadopago.com.br/developers/pt/docs/checkout-bricks)

### Em Caso de Problemas
1. Verifique as credenciais no `.env`
2. Confirme se está usando sandbox/produção correto
3. Monitore logs do servidor (`console.log`)
4. Teste com cartões de teste válidos

---

🎉 **Parabéns!** Seu checkout transparente está pronto para processar pagamentos de forma segura e profissional!