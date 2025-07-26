import 'dotenv/config';
import { storage } from "./storage.js";
import { hashPassword } from "./auth.js";

async function setupAdmin() {
  try {
    // Verificar se já existe um usuário admin
    const existingUser = await storage.getUserByUsername("admin");
    
    if (existingUser) {
      console.log("Usuário admin já existe!");
      return;
    }

    // Criar usuário admin padrão
    const hashedPassword = await hashPassword("admin123");
    
    await storage.createUser({
      username: "admin",
      password: hashedPassword
    });

    console.log("Usuário admin criado com sucesso!");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("IMPORTANTE: Altere a senha após o primeiro login!");
    
  } catch (error) {
    console.error("Erro ao criar usuário admin:", error);
  }
}

setupAdmin();