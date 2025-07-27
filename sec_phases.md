  Passo 1: Mover o Token de Autenticação (JWT) para Cookies `HttpOnly`

   * Problema a ser resolvido: Risco de roubo de token de autenticação através de ataques XSS, pois o token está atualmente no
     localStorage.
   * Por que é crítico: Se um token for roubado, um invasor pode se passar por um usuário autenticado, ganhando acesso total à
     sua conta, especialmente contas de administrador.
   * Ações propostas:
       1. No Backend (`server`):
           * Instalar a dependência cookie-parser para facilitar o manejo de cookies no Express.
           * Modificar a rota de login (/api/auth/login) para, em vez de retornar o token no corpo da resposta, enviá-lo como
             um cookie com as flags HttpOnly, Secure e SameSite=Strict.
           * Ajustar o middleware de autenticação (requireAuth) para extrair o token dos cookies da requisição, em vez do
             cabeçalho Authorization.
           * Atualizar a rota de logout para limpar o cookie de autenticação no navegador.
       2. No Frontend (`client`):
           * Remover toda a lógica de salvar, ler e apagar o token do localStorage no hook useAuth.
           * Ajustar as chamadas de API para não enviar mais o cabeçalho Authorization, pois o navegador enviará o cookie
             automaticamente.
           * A lógica de "usuário autenticado" passará a ser validada por uma chamada à API que dependerá do cookie, e não da
             existência do token no localStorage.

  ---

  Passo 2: Adicionar Validação de Entrada em Todas as Rotas de Modificação de Dados

   * Problema a ser resolvido: Falta de validação de dados nas rotas POST/PUT, o que pode levar à corrupção de dados ou a
     vulnerabilidades de injeção.
   * Por que é crítico: Sem validação, um usuário (ou um script malicioso) pode enviar dados malformados que quebram a aplicação
     ou, em cenários piores, exploram falhas na lógica de negócio.
   * Ações propostas:
       1. No Backend (`server/routes.ts`):
           * Revisar todas as rotas que recebem dados no corpo da requisição (ex: criar/atualizar produtos, cupons, categorias,
             pedidos).
           * Utilizar os schemas da biblioteca zod (já presente no projeto em shared/schema.ts) para validar o req.body no
             início de cada rota.
           * Retornar um erro 400 Bad Request com detalhes claros se a validação falhar, impedindo que dados inválidos cheguem à
             lógica de negócio ou ao banco de dados.