# Dashboard Financeiro

Aplicacao full-stack para conectar contas no Plaid Sandbox, importar transacoes, categorizar gastos e visualizar indicadores financeiros em um dashboard moderno.

## Visao geral

Este projeto foi construido para demonstrar:

- integracao com API financeira
- autenticacao com isolamento por usuario
- persistencia com PostgreSQL e Prisma
- dashboard com filtros, categorias, comparativos e orcamentos
- frontend moderno com Next.js App Router

## Stack

- Next.js 16
- TypeScript
- PostgreSQL
- Prisma ORM
- Tailwind CSS v4
- Radix UI / shadcn-style UI
- Plaid Sandbox
- React Query
- Zod
- Vitest

## Funcionalidades

- Cadastro e login
- Conexao com conta sandbox da Plaid
- Sincronizacao incremental de contas e transacoes
- Criptografia do `access_token` da Plaid em repouso
- Rotacao de chave para o token criptografado
- Dashboard com saldo, receitas, despesas, graficos e comparativo mensal
- Orcamentos mensais por categoria
- Pagina de transacoes com filtros e edicao de categoria
- Pagina de detalhes por conta
- Pagina de detalhes por categoria
- Modo escuro com tema roxo

## Estrutura

```text
app/
components/
hooks/
lib/
prisma/
server/
tests/
types/
```

## Setup rapido

### 1. Instale as dependencias

```bash
npm install
```

### 2. Suba o PostgreSQL

Exemplo com Docker:

```bash
docker run --name dashboard-financeiro-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=dashboard_financeiro -p 5432:5432 -d postgres:16
```

### 3. Crie o `.env`

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dashboard_financeiro?schema=public"
SESSION_SECRET="uma-chave-longa-com-pelo-menos-32-caracteres"
NEXTAUTH_SECRET="opcional-ou-o-mesmo-valor-do-session-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PLAID_CLIENT_ID="seu_plaid_client_id"
PLAID_SECRET="seu_plaid_secret"
PLAID_ENV="sandbox"
PLAID_PRODUCTS="transactions"
PLAID_COUNTRY_CODES="US"
PLAID_ACCESS_TOKEN_ENCRYPTION_KEY="chave-opcional-mas-recomendada"
```

Opcional para rotacao de chave do token Plaid:

```env
PLAID_ACCESS_TOKEN_ENCRYPTION_KEY_ID="current"
PLAID_ACCESS_TOKEN_ENCRYPTION_PREVIOUS_KEYS="old-key-id:old-key-material"
```

### 4. Rode as migrations

```bash
npm run prisma:migrate
```

### 5. Popule o usuario demo

```bash
npm run db:seed
```

Credenciais demo:

- email: `demo@dashboard.local`
- senha: `demo123456`

### 6. Inicie o projeto

```bash
npm run dev
```

Abra `http://localhost:3000`.

## Como testar a Plaid

1. Crie uma conta de desenvolvedor na Plaid.
2. Preencha `PLAID_CLIENT_ID`, `PLAID_SECRET` e `PLAID_ENV="sandbox"`.
3. Entre no app.
4. Clique em `Conectar conta sandbox`.
5. Escolha uma instituicao de teste, como `First Platypus Bank`.
6. Conclua o fluxo do Plaid Link.

Depois disso, a aplicacao salva o item Plaid, sincroniza contas e importa transacoes.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
npm run db:seed
```

## Testes

O projeto tem testes para:

- mapeamento de categorias
- helpers do dashboard
- validacoes principais
- criptografia e rotacao de chave do token Plaid
- handlers e servicos da Plaid com mocks

## Validado localmente

- `npm run prisma:generate`
- `npm run lint`
- `npm run test`
- `npm run build`

## Melhorias futuras

- comparativos customizaveis entre periodos
- alertas de orcamento por categoria
- webhooks Plaid
- preferencias de usuario

## Sugestoes

Sugestoes, ideias de melhoria e feedback sao bem-vindos. Se quiser contribuir com uma observacao ou proposta de evolucao para o projeto, fique a vontade para abrir uma issue.
