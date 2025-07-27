import 'dotenv/config';
import { config } from "./config";
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

// Initialize MercadoPago with access token
const accessToken = config.MERCADOPAGO_ACCESS_TOKEN;

if (!accessToken) {
  console.error('MERCADOPAGO_ACCESS_TOKEN not found in environment variables');
}

const client = new MercadoPagoConfig({
  accessToken: accessToken!,
  options: {
    timeout: 5000,
    integratorId: 'dev_24c65fb163bf11ea96500242ac130004', // Test integrator ID
  }
});

console.log('MercadoPago initialized with token:', accessToken ? `${accessToken.substring(0, 10)}...` : 'NOT FOUND');

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
        issuer_id: paymentData.issuer_id ? parseInt(paymentData.issuer_id) : undefined,
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
      // Ensure amount is a number and properly formatted
      const amount = Number(paymentData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid payment amount');
      }

      const paymentRequest = {
        transaction_amount: amount,
        description: paymentData.description,
        payment_method_id: 'pix',
        payer: {
          email: paymentData.payer.email,
          first_name: paymentData.payer.name.split(' ')[0] || 'Cliente',
          last_name: paymentData.payer.name.split(' ').slice(1).join(' ') || 'Cliente',
          identification: {
            type: 'CPF',
            number: '11144477735' // Valid test CPF for sandbox
          }
        },
        external_reference: paymentData.orderId,
        notification_url: process.env.WEBHOOK_URL ? `${process.env.WEBHOOK_URL}/api/webhook/mercadopago` : undefined
      };

      console.log('Creating PIX payment with request:', JSON.stringify(paymentRequest, null, 2));
      
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
      console.error('Error details:', JSON.stringify(error, null, 2));
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

  async checkPaymentStatus(paymentId: string) {
    try {
      const payment = await this.getPayment(paymentId);
      return {
        id: payment.id,
        status: payment.status,
        status_detail: payment.status_detail,
        transaction_amount: payment.transaction_amount,
        date_approved: payment.date_approved,
        date_created: payment.date_created,
        external_reference: payment.external_reference
      };
    } catch (error) {
      console.error('Error checking payment status:', error);
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