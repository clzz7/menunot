# Migração para PostgreSQL

Este projeto está configurado para funcionar tanto com SQLite (desenvolvimento) quanto com PostgreSQL (produção).

## Estado Atual
- ✅ Aplicação rodando com SQLite
- ✅ Dados existentes salvos em backup
- ✅ Código preparado para PostgreSQL
- 🔄 Pronto para migração para PostgreSQL

## Para Migrar para PostgreSQL

### Opção 1: Usando um Serviço de Nuvem (Recomendado)

1. **Crie uma conta em um provedor PostgreSQL:**
   - [Neon](https://neon.tech/) (gratuito)
   - [Supabase](https://supabase.com/) (gratuito)
   - [Railway](https://railway.app/) (gratuito)
   - [Aiven](https://aiven.io/) (gratuito)

2. **Obtenha a URL de conexão:**
   ```
   postgresql://username:password@hostname:5432/database_name
   ```

3. **Configure no arquivo .env:**
   ```env
   DATABASE_URL=postgresql://sua_url_de_conexao_aqui
   ```

4. **Execute a migração:**
   ```bash
   npm run db:push
   ```

### Opção 2: PostgreSQL Local (Desenvolvimento)

Se você quiser rodar PostgreSQL localmente:

1. **Instale PostgreSQL:**
   ```bash
   # Ubuntu/Debian
   sudo apt install postgresql postgresql-contrib
   
   # macOS
   brew install postgresql
   ```

2. **Configure e inicie:**
   ```bash
   sudo service postgresql start
   createdb delivery_app
   ```

3. **Configure no .env:**
   ```env
   DATABASE_URL=postgresql://postgres:senha@localhost:5432/delivery_app
   ```

## Dados Existentes

Seus dados atuais estão salvos em:
- 📁 `replit_db.sqlite` - banco SQLite atual
- 📁 `backup_data.sql` - backup dos dados em SQL

### Dados Existentes no Sistema:
- **1 restaurante:** Burger Point (lanchonete)
- **1 cliente:** João Silva  
- **1 categoria:** Hambúrgueres
- **8 produtos:** Diversos hambúrgueres e acompanhamentos
- **3 pedidos:** Histórico de pedidos do cliente

## Migração dos Dados

Após configurar PostgreSQL:

1. **Execute o script de migração:**
   ```bash
   npx tsx scripts/migrate-data.ts
   ```

2. **Ou execute manualmente:**
   ```bash
   npm run db:push  # Cria as tabelas
   # Em seguida, execute o script de migração
   ```

## Como Funciona

O projeto automaticamente detecta se você tem uma `DATABASE_URL` configurada:
- **Com DATABASE_URL:** Usa PostgreSQL
- **Sem DATABASE_URL:** Usa SQLite (desenvolvimento)

## Vantagens do PostgreSQL

- ✅ Melhor performance em produção
- ✅ Transações ACID completas
- ✅ Suporte a JSON nativo
- ✅ Escalabilidade
- ✅ Backup e recuperação robustos
- ✅ Ideal para deploy em produção

## Próximos Passos

1. Escolha um provedor PostgreSQL
2. Configure a DATABASE_URL no .env
3. Execute `npm run db:push`
4. Execute o script de migração de dados
5. Teste a aplicação

Precisa de ajuda? Me informe qual provedor você prefere usar!