declare namespace NodeJS {
  interface ProcessEnv {
    MERCADOPAGO_PUBLIC_KEY: string;
    MERCADOPAGO_ACCESS_TOKEN: string;
    BASE_URL: string;
    RESTAURANT_PAYER_NAME: string;
    RESTAURANT_PAYER_EMAIL: string;
    RESTAURANT_PAYER_PHONE: string;
    RESTAURANT_PAYER_CPF: string;
  }
}