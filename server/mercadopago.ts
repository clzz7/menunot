import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

// Initialize MercadoPago with access token
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const preference = new Preference(client);
const payment = new Payment(client);

// Dados fixos do restaurante para evitar erros de validação do Mercado Pago
const DEFAULT_PAYER = {
  name: process.env.RESTAURANT_PAYER_NAME || 'Restaurante',
  email: process.env.RESTAURANT_PAYER_EMAIL || 'restaurante@example.com',
  phone: process.env.RESTAURANT_PAYER_PHONE || '5511999999999', // formato E164 sem +
  cpf: process.env.RESTAURANT_PAYER_CPF || '12345678909', // CPF válido fictício
};

export interface PaymentRequest {
  orderId: string;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
  }>;
  payer: {
    name: string;
    email: string;
    phone: {
      area_code: string;
      number: string;
    };
  };
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: 'approved' | 'all';
  external_reference: string;
  notification_url?: string;
}

export class MercadoPagoService {
  
  async createPixPayment(paymentData: {
    orderId: string;
    amount: number;
    payer: {
      name: string;
      email: string;
      phone: string;
    };
    description: string;
  }) {
    try {
      const paymentRequest = {
        transaction_amount: paymentData.amount,
        description: paymentData.description,
        payment_method_id: 'pix',
        payer: {
          email: DEFAULT_PAYER.email,
          first_name: DEFAULT_PAYER.name.split(' ')[0],
          last_name: DEFAULT_PAYER.name.split(' ').slice(1).join(' ') || 'Restaurante',
          phone: {
            area_code: DEFAULT_PAYER.phone.substring(2, 4),
            number: DEFAULT_PAYER.phone.substring(4)
          },
          identification: {
            type: 'CPF',
            number: DEFAULT_PAYER.cpf
          }
        },
        external_reference: paymentData.orderId,
        notification_url: `${(globalThis as any).process?.env?.BASE_URL || 'http://localhost:5000'}/api/mercadopago/webhook`
      };

      const result = await payment.create({ body: paymentRequest });
      
      return {
        id: result.id,
        status: result.status,
        qr_code: result.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64,
        ticket_url: result.point_of_interaction?.transaction_data?.ticket_url
      };
    } catch (error) {
      console.error('Error creating PIX payment:', error);
      throw error;
    }
  }
  
  async createPreference(paymentData: PaymentRequest) {
    try {
      const preferenceData = {
        items: paymentData.items,
        payer: paymentData.payer,
        back_urls: paymentData.back_urls,
        auto_return: paymentData.auto_return,
        external_reference: paymentData.external_reference,
        notification_url: paymentData.notification_url,
        statement_descriptor: 'Delivery App',
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      };

      const result = await preference.create({ body: preferenceData } as any);
      return result;
    } catch (error) {
      console.error('Error creating MercadoPago preference:', error);
      throw error;
    }
  }

  async getPayment(paymentId: string) {
    try {
      const result = await payment.get({ id: paymentId });
      return result;
    } catch (error) {
      console.error('Error getting payment:', error);
      throw error;
    }
  }

  async processWebhook(data: any) {
    try {
      if (data.type === 'payment') {
        const paymentData = await this.getPayment(data.data.id);
        return {
          paymentId: data.data.id,
          status: paymentData.status,
          externalReference: paymentData.external_reference,
          transactionAmount: paymentData.transaction_amount,
          paymentMethodId: paymentData.payment_method_id,
        };
      }
      return null;
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw error;
    }
  }
}

export const mercadoPagoService = new MercadoPagoService();