# Configuração Supabase - Passo a Passo

## Credenciais Necessárias

Para integrar com Supabase, você precisa das seguintes informações:

### 1. Database Password (Senha do Banco)
- Senha que você definiu ao criar o projeto Supabase
- Se esqueceu, pode redefinir no dashboard

### 2. Project Reference ID
- Identificador único do seu projeto
- Exemplo: `abcdefghijklmnop`

### 3. Region (Região)
- Região onde seu banco está hospedado
- Exemplos: `us-east-1`, `eu-west-1`, etc.

## Como Obter as Credenciais

### Passo 1: Acesse o Dashboard
1. Vá para [supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login na sua conta
3. Selecione seu projeto

### Passo 2: Obtenha a Connection String
1. Clique no botão **"Connect"** no topo da página
2. Escolha uma das opções:
   - **Transaction pooler** (recomendado para aplicações)
   - **Session pooler** (para apps persistentes)
   - **Direct connection** (apenas IPv6)

### Passo 3: Copie a URL de Conexão
A URL terá este formato:
```
postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

## Formatos de Connection String

### Transaction Pooler (Recomendado)
```
postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```
- **Porta:** 6543
- **Uso:** Ideal para aplicações serverless e funções
- **Suporte:** IPv4 e IPv6

### Session Pooler
```
postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```
- **Porta:** 5432
- **Uso:** Aplicações persistentes
- **Suporte:** IPv4 e IPv6

### Direct Connection
```
postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```
- **Porta:** 5432
- **Uso:** Conexão direta
- **Limitação:** Apenas IPv6

## Qual Connection String Usar?

Para seu projeto Replit, recomendo o **Transaction Pooler** porque:
- ✅ Suporta IPv4 (necessário no Replit)
- ✅ Otimizado para aplicações web
- ✅ Melhor performance com pooling
- ✅ Ideal para Node.js/Express

## Exemplo Prático

Se suas credenciais fossem:
- **Project Ref:** `abcdefghijklmnop`
- **Password:** `sua_senha_123`
- **Region:** `us-east-1`

Sua DATABASE_URL seria:
```
postgres://postgres.abcdefghijklmnop:sua_senha_123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## Próximos Passos

Após obter a DATABASE_URL:
1. ✅ Configurar no arquivo .env
2. ✅ Executar `npm run db:push` para criar as tabelas
3. ✅ Migrar os dados do SQLite
4. ✅ Testar a aplicação

## Informações que Preciso de Você

Para configurar automaticamente, me forneça:

1. **DATABASE_URL completa** do Supabase
   - (ou as credenciais separadas se preferir)

2. **Confirmação** se quer migrar os dados existentes

3. **Qual connection string** você copiou (transaction/session/direct)

Está pronto para configurar?