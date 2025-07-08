#!/usr/bin/env tsx

import { storage } from "../server/storage.js";

async function createFreeDeliveryCoupon() {
  try {
    const couponData = {
      id: `coupon-frete-gratis-${Date.now()}`,
      code: 'FRETEGRATIS',
      name: 'Frete Grátis',
      description: 'Cupom de frete grátis para qualquer pedido',
      establishment_id: '1',
      type: 'percentage',
      value: 0,
      minimum_order: 0,
      maximum_discount: null,
      usage_limit: null,
      usage_count: 0,
      valid_from: new Date(),
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      is_active: true,
      free_delivery: true
    };

    const result = await storage.createCoupon(couponData);
    console.log('Cupom de frete grátis criado com sucesso:', result);
  } catch (error) {
    console.error('Erro ao criar cupom:', error);
  }
}

createFreeDeliveryCoupon();