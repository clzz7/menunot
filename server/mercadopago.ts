import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

// Initialize MercadoPago with access token
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const preference = new Preference(client);
const payment = new Payment(client);

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