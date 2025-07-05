# 🍽️ Micro SaaS - Sistema de Restaurante

Este projeto foi transformado de um SPA (Single Page Application) para um **Micro SaaS** com múltiplas páginas reais, oferecendo uma experiência mais robusta e profissional.

## 🚀 Transformações Realizadas

### ✅ Arquitetura Multi-Página
- **Antes**: SPA com roteamento client-side em uma única página
- **Depois**: Múltiplas páginas dedicadas com URLs específicas:
  - `/` - Landing page principal
  - `/cardapio` - Página dedicada ao cardápio
  - `/pedidos` - Histórico de pedidos do cliente
  - `/checkout` - Processo de finalização de compra
  - `/rastreamento` - Rastreamento de pedidos em tempo real
  - `/admin` - Painel administrativo

### 🎨 Layout Comum
- **Navegação responsiva** com menu desktop e mobile
- **Header unificado** com logo, navegação e status
- **Footer informativo** com dados de contato
- **Breadcrumbs** e navegação contextual

### 🏠 Landing Page (Home)
- **Hero Section** com call-to-action
- **Status do estabelecimento** (aberto/fechado)
- **Produtos em destaque**
- **Categorias** do cardápio
- **Ações rápidas** para navegação
- **Informações de contato**

### 📱 Páginas Especializadas

#### 🍴 Cardápio (`/cardapio`)
- Filtros por categoria
- Busca de produtos
- Visualização organizada por categorias
- Adicionar produtos ao carrinho

#### 📦 Pedidos (`/pedidos`)
- Busca por telefone
- Histórico completo de pedidos
- Repetir pedidos anteriores
- Guia de status dos pedidos

#### 🛒 Checkout (`/checkout`)
- Revisão detalhada do carrinho
- Edição de quantidades
- Resumo do pedido
- Finalização da compra

#### 🔍 Rastreamento (`/rastreamento`)
- Busca por número do pedido
- Acompanhamento em tempo real
- Barra de progresso
- Detalhes completos do pedido

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React** - Biblioteca principal
- **Wouter** - Roteamento client-side
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones
- **React Query** - Gerenciamento de estado
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime
- **Express** - Framework web
- **SQLite** - Banco de dados
- **Drizzle ORM** - ORM
- **WebSocket** - Comunicação em tempo real

## 📦 Estrutura do Projeto

```
client/
├── src/
│   ├── components/
│   │   ├── layout.tsx          # Layout comum
│   │   ├── ui/                 # Componentes UI
│   │   └── ...
│   ├── pages/
│   │   ├── home.tsx            # Landing page
│   │   ├── cardapio.tsx        # Página do cardápio
│   │   ├── pedidos.tsx         # Histórico de pedidos
│   │   ├── checkout.tsx        # Finalização de compra
│   │   ├── rastreamento.tsx    # Rastreamento de pedidos
│   │   └── admin.tsx           # Painel administrativo
│   ├── hooks/                  # Hooks customizados
│   ├── lib/                    # Utilitários
│   └── App.tsx                 # Configuração de rotas
server/
├── index.ts                    # Servidor Express
├── routes.ts                   # Rotas da API
├── db.ts                       # Configuração do banco
└── ...
```

## 🌟 Funcionalidades

### 🎯 Para Clientes
- **Navegação intuitiva** entre páginas
- **Cardápio organizado** por categorias
- **Carrinho de compras** persistente
- **Histórico de pedidos** consultável
- **Rastreamento em tempo real**
- **Sistema de cupons** e descontos
- **Múltiplas formas de pagamento**

### 👨‍💼 Para Administradores
- **Painel administrativo** completo
- **Gestão de produtos** e categorias
- **Acompanhamento de pedidos**
- **Relatórios e estatísticas**
- **Configurações do estabelecimento**

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação
```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar produção
npm start
```

### Configuração do Banco
```bash
# Executar migrações
npm run db:push
```

## 🔧 Configuração

### Variáveis de Ambiente
```env
NODE_ENV=development
DATABASE_URL=./database.sqlite
PORT=3000
```

### Personalização
- **Cores**: Configuráveis em `tailwind.config.ts`
- **Logo**: Configurável no painel administrativo
- **Informações**: Editáveis via API

## 📈 Benefícios da Transformação

### 🎯 SEO e Performance
- **URLs específicas** para cada página
- **Meta tags** personalizadas
- **Carregamento otimizado**
- **Indexação melhorada**

### 👥 Experiência do Usuário
- **Navegação clara** e intuitiva
- **Páginas focadas** em funcionalidades específicas
- **Carregamento mais rápido**
- **Melhor organização** do conteúdo

### 🔧 Manutenibilidade
- **Código modular** e organizado
- **Componentes reutilizáveis**
- **Separação de responsabilidades**
- **Facilidade de extensão**

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

---

**Desenvolvido com ❤️ para transformar experiências digitais em restaurantes e estabelecimentos**