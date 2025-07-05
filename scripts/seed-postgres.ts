import { db } from "../server/db";
import { 
  establishments, 
  categories, 
  products, 
  customers, 
  coupons 
} from "../shared/schema";

async function seedDatabase() {
  console.log("Seeding PostgreSQL database...");
  
  try {
    // Create establishment
    const establishment = await db.insert(establishments).values({
      id: "est_1",
      name: "Bella Pasta",
      description: "Deliciosa comida italiana com entrega rápida",
      phone: "(11) 99999-9999",
      email: "contato@bellapasta.com",
      address: "Rua das Flores, 123",
      delivery_fee: 5.99,
      minimum_order: 25.00,
      is_open: true,
      is_active: true
    }).returning();
    
    console.log("✓ Establishment created:", establishment[0].name);
    
    // Create categories
    const categoryData = [
      {
        id: "cat_1",
        name: "Pizzas",
        description: "Deliciosas pizzas artesanais",
        establishment_id: "est_1",
        is_active: true,
        sort_order: 1
      },
      {
        id: "cat_2", 
        name: "Massas",
        description: "Massas frescas e molhos especiais",
        establishment_id: "est_1",
        is_active: true,
        sort_order: 2
      },
      {
        id: "cat_3",
        name: "Bebidas",
        description: "Bebidas geladas e refrescos",
        establishment_id: "est_1",
        is_active: true,
        sort_order: 3
      }
    ];
    
    await db.insert(categories).values(categoryData);
    console.log("✓ Categories created");
    
    // Create products
    const productData = [
      {
        id: "prod_1",
        name: "Pizza Margherita",
        description: "Molho de tomate, mussarela, manjericão fresco",
        price: 32.90,
        image: "/images/pizza-margherita.jpg",
        category_id: "cat_1",
        establishment_id: "est_1",
        is_active: true,
        sort_order: 1,
        preparation_time: "25-30 min"
      },
      {
        id: "prod_2",
        name: "Pizza Pepperoni",
        description: "Molho de tomate, mussarela, pepperoni",
        price: 38.90,
        image: "/images/pizza-pepperoni.jpg",
        category_id: "cat_1",
        establishment_id: "est_1",
        is_active: true,
        sort_order: 2,
        preparation_time: "25-30 min"
      },
      {
        id: "prod_3",
        name: "Lasanha Bolonhesa",
        description: "Massa fresca, molho bolonhesa, queijo gratinado",
        price: 28.90,
        image: "/images/lasanha-bolonhesa.jpg",
        category_id: "cat_2",
        establishment_id: "est_1",
        is_active: true,
        sort_order: 1,
        preparation_time: "30-35 min"
      },
      {
        id: "prod_4",
        name: "Espaguete Carbonara",
        description: "Massa al dente, bacon, ovos, queijo parmesão",
        price: 26.90,
        image: "/images/espaguete-carbonara.jpg",
        category_id: "cat_2",
        establishment_id: "est_1",
        is_active: true,
        sort_order: 2,
        preparation_time: "20-25 min"
      },
      {
        id: "prod_5",
        name: "Coca-Cola 350ml",
        description: "Refrigerante gelado",
        price: 4.50,
        image: "/images/coca-cola.jpg",
        category_id: "cat_3",
        establishment_id: "est_1",
        is_active: true,
        sort_order: 1,
        preparation_time: "Imediato"
      },
      {
        id: "prod_6",
        name: "Água Mineral 500ml",
        description: "Água mineral natural",
        price: 3.00,
        image: "/images/agua-mineral.jpg",
        category_id: "cat_3",
        establishment_id: "est_1",
        is_active: true,
        sort_order: 2,
        preparation_time: "Imediato"
      }
    ];
    
    await db.insert(products).values(productData);
    console.log("✓ Products created");
    
    // Create sample customer
    const customer = await db.insert(customers).values({
      id: "cust_1",
      number: "001",
      name: "João Silva",
      whatsapp: "+5511999999999",
      email: "joao.silva@email.com",
      address: "Rua das Palmeiras, 456",
      complement: "Apto 12",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      zip_code: "01234-567",
      default_payment_method: "pix",
      total_orders: 0,
      total_spent: 0,
      is_active: true
    }).returning();
    
    console.log("✓ Sample customer created:", customer[0].name);
    
    // Create sample coupon
    const coupon = await db.insert(coupons).values({
      id: "coup_1",
      code: "BEMVINDO10",
      name: "Bem-vindo",
      description: "10% de desconto na primeira compra",
      establishment_id: "est_1",
      type: "percentage",
      value: 10,
      minimum_order: 20.00,
      maximum_discount: 15.00,
      usage_limit: 100,
      usage_count: 0,
      valid_from: new Date(),
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      is_active: true,
      free_delivery: false
    }).returning();
    
    console.log("✓ Sample coupon created:", coupon[0].code);
    
    console.log("\n🎉 Database seeded successfully!");
    
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run the seed function
seedDatabase().catch(console.error);