import { db } from "../server/db";
import { establishments, customers, orders } from "../shared/schema";
import { eq } from "drizzle-orm";

async function updateRestaurantAndCreateRecurringCustomer() {
  console.log("Atualizando status do restaurante e criando cliente recorrente...");
  
  try {
    // Update restaurant to always be open
    await db.update(establishments)
      .set({ is_open: true })
      .where(eq(establishments.id, "est_1"));
    
    console.log("✓ Restaurante configurado para sempre aberto");
    
    // Create recurring customer
    const existingCustomer = await db.select()
      .from(customers)
      .where(eq(customers.whatsapp, "+5511888888888"));
    
    if (existingCustomer.length === 0) {
      const customer = await db.insert(customers).values({
        id: "cust_recurring",
        number: "999",
        name: "Cliente Teste Recorrente",
        whatsapp: "+5511888888888",
        email: "teste.recorrente@email.com",
        address: "Rua dos Testes, 123",
        complement: "Casa",
        neighborhood: "Bairro Teste",
        city: "São Paulo",
        state: "SP",
        zip_code: "12345-678",
        default_payment_method: "pix",
        total_orders: 15, // Cliente com histórico
        total_spent: 456.78,
        last_order_at: new Date(),
        is_active: true
      }).returning();
      
      console.log("✓ Cliente recorrente criado:", customer[0].name);
      
      // Create some order history for the recurring customer
      const orderData = [
        {
          id: "order_test_1",
          order_number: "TEST001",
          customer_id: "cust_recurring",
          establishment_id: "est_1",
          customer_name: "Cliente Teste Recorrente",
          customer_phone: "+5511888888888",
          customer_email: "teste.recorrente@email.com",
          customer_address: "Rua dos Testes, 123",
          customer_complement: "Casa",
          customer_neighborhood: "Bairro Teste",
          customer_city: "São Paulo",
          customer_state: "SP",
          customer_zip_code: "12345-678",
          subtotal: 65.80,
          delivery_fee: 5.99,
          discount_amount: 0,
          total: 71.79,
          payment_method: "pix",
          payment_status: "paid",
          status: "delivered",
          observations: "Sem cebola",
          estimated_delivery_time: "30-40 min",
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          delivered_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000)
        },
        {
          id: "order_test_2",
          order_number: "TEST002",
          customer_id: "cust_recurring",
          establishment_id: "est_1",
          customer_name: "Cliente Teste Recorrente",
          customer_phone: "+5511888888888",
          customer_email: "teste.recorrente@email.com",
          customer_address: "Rua dos Testes, 123",
          customer_complement: "Casa",
          customer_neighborhood: "Bairro Teste",
          customer_city: "São Paulo",
          customer_state: "SP",
          customer_zip_code: "12345-678",
          subtotal: 89.70,
          delivery_fee: 5.99,
          discount_amount: 10.00,
          coupon_code: "BEMVINDO10",
          total: 85.69,
          payment_method: "credit_card",
          payment_status: "paid",
          status: "delivered",
          estimated_delivery_time: "40-50 min",
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          delivered_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000)
        }
      ];
      
      await db.insert(orders).values(orderData);
      console.log("✓ Histórico de pedidos criado para o cliente recorrente");
      
    } else {
      console.log("✓ Cliente recorrente já existe");
    }
    
    console.log("\n🎉 Configuração concluída!");
    console.log("\nDados do cliente recorrente para testes:");
    console.log("WhatsApp: +5511888888888");
    console.log("Email: teste.recorrente@email.com");
    
  } catch (error) {
    console.error("Erro ao atualizar configurações:", error);
    throw error;
  }
}

// Run the function
updateRestaurantAndCreateRecurringCustomer().catch(console.error);
