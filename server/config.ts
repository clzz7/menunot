import 'dotenv/config';

// Centralizar configuração de ambiente
export const config = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  
  // MercadoPago
  MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN,
  MERCADOPAGO_PUBLIC_KEY: process.env.MERCADOPAGO_PUBLIC_KEY,
  
  // Webhook
  WEBHOOK_URL: process.env.WEBHOOK_URL,
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  
  // Session
  SESSION_TIMEOUT: parseInt(process.env.SESSION_TIMEOUT || '86400000'),
  
  // Rate Limiting
  LOGIN_RATE_LIMIT_WINDOW: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW || '900000'),
  LOGIN_RATE_LIMIT_MAX: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || '5'),
  ADMIN_RATE_LIMIT_MAX: parseInt(process.env.ADMIN_RATE_LIMIT_MAX || '100'),
  PUBLIC_RATE_LIMIT_MAX: parseInt(process.env.PUBLIC_RATE_LIMIT_MAX || '200'),
  
  // Security
  ENABLE_SECURITY_LOGS: process.env.ENABLE_SECURITY_LOGS === 'true',
  MAX_SECURITY_LOGS: parseInt(process.env.MAX_SECURITY_LOGS || '1000'),
  BRUTE_FORCE_THRESHOLD: parseInt(process.env.BRUTE_FORCE_THRESHOLD || '5'),
  BRUTE_FORCE_WINDOW: parseInt(process.env.BRUTE_FORCE_WINDOW || '900000'),
  
  // Cookies
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true',
  COOKIE_HTTP_ONLY: process.env.COOKIE_HTTP_ONLY === 'true',
  COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE || 'strict'
};

// Validar configurações críticas
export function validateConfig() {
  const errors: string[] = [];
  
  if (!config.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL não encontrada - usando SQLite para desenvolvimento');
  }
  
  if (!config.MERCADOPAGO_ACCESS_TOKEN) {
    errors.push('MERCADOPAGO_ACCESS_TOKEN é obrigatório');
  }
  
  if (!config.MERCADOPAGO_PUBLIC_KEY) {
    errors.push('MERCADOPAGO_PUBLIC_KEY é obrigatório');
  }
  
  if (config.NODE_ENV === 'production') {
    if (config.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
      errors.push('JWT_SECRET deve ser alterado em produção');
    }
    
    if (!config.WEBHOOK_URL) {
      errors.push('WEBHOOK_URL é obrigatório em produção');
    }
  }
  
  if (errors.length > 0) {
    console.error('❌ Erros de configuração:');
    errors.forEach(error => console.error(`  - ${error}`));
    
    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
  
  // Log de configurações carregadas
  console.log('✅ Configurações carregadas:');
  console.log(`  NODE_ENV: ${config.NODE_ENV}`);
  console.log(`  DATABASE_URL: ${config.DATABASE_URL ? 'DEFINIDA' : 'NÃO ENCONTRADA'}`);
  console.log(`  MERCADOPAGO_ACCESS_TOKEN: ${config.MERCADOPAGO_ACCESS_TOKEN ? 'DEFINIDA' : 'NÃO ENCONTRADA'}`);
  console.log(`  MERCADOPAGO_PUBLIC_KEY: ${config.MERCADOPAGO_PUBLIC_KEY ? 'DEFINIDA' : 'NÃO ENCONTRADA'}`);
  console.log(`  WEBHOOK_URL: ${config.WEBHOOK_URL || 'NÃO DEFINIDA'}`);
}