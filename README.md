# Vira Mes

App pessoal de controle financeiro feito para registrar entradas e saídas de forma rápida, acompanhar o saldo do mês e visualizar para onde o dinheiro está indo.

O projeto foi pensado para uso real no dia a dia:
- mobile-first
- fluxo rápido para lançar gastos
- dashboard com visão mensal
- autenticação por nome de usuário e PIN de 6 dígitos

## O que o app faz

- cadastra saídas com `data`, `categoria`, `descrição`, `valor` e `mês`
- cadastra entradas com `mês`, `descrição` e `valor`
- mostra cards com `entradas`, `saídas` e `saldo`
- exibe gráficos de categoria, evolução de saldo e distribuição percentual
- lista os lançamentos do mês em tabela
- permite excluir lançamentos
- isola os dados por usuário
- protege o acesso com `nome + PIN`

## Stack

- Next.js 14
- TypeScript
- Supabase Postgres
- Tailwind CSS
- shadcn/ui
- Recharts
- Vercel
- Vercel Cron Jobs

## Como funciona a autenticação

O app usa um fluxo simples:

- no cadastro, a pessoa informa `nome + PIN + confirmar PIN`
- no login, entra com `nome de usuário + PIN`
- o PIN não é salvo em texto puro
- o sistema armazena apenas `pin_hash` no banco
- a sessão é mantida por cookie assinado no servidor
- o login tem rate limiting por `nome + IP`

## Estrutura do banco

O projeto usa estas tabelas:

### `app_users`

- `id`
- `full_name`
- `email`
- `pin_hash`
- `is_active`
- `created_at`

### `expenses`

- `id`
- `user_id`
- `date`
- `month`
- `category`
- `description`
- `amount`
- `created_at`

### `income`

- `id`
- `user_id`
- `month`
- `description`
- `amount`
- `created_at`

### `login_rate_limits`

- `scope_key`
- `attempts`
- `window_started_at`
- `blocked_until`
- `created_at`
- `updated_at`

## Variáveis de ambiente

Crie um arquivo [`.env.local`](/Users/marcelfilho/Documents/vira-mes/.env.local) com:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AUTH_SECRET=
```

### O que vai em cada variável

- `NEXT_PUBLIC_SUPABASE_URL`
  URL do projeto no Supabase

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  chave pública do projeto

- `SUPABASE_SERVICE_ROLE_KEY`
  chave `service_role` usada só no servidor

- `AUTH_SECRET`
  segredo usado para assinar a sessão do app

Para gerar um `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

## Como configurar o Supabase

### 1. Criar o projeto

1. Acesse [supabase.com](https://supabase.com/)
2. Crie um novo projeto

### 2. Pegar as chaves

No painel do Supabase:

1. abra `Settings`
2. vá em `API Keys`
3. copie:
   - `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
   - `publishable key` -> `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `service_role` -> `SUPABASE_SERVICE_ROLE_KEY`

### 3. Criar ou atualizar as tabelas

1. abra `SQL Editor`
2. clique em `New query`
3. cole o conteúdo de [supabase/schema.sql](/Users/marcelfilho/Documents/vira-mes/supabase/schema.sql)
4. clique em `Run`

Esse arquivo:
- cria as tabelas principais
- adiciona `user_id` para isolar os dados por usuário
- ativa RLS
- cria a tabela de rate limiting

## Como rodar localmente

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar o ambiente

Crie [`.env.local`](/Users/marcelfilho/Documents/vira-mes/.env.local) com as variáveis mostradas acima.

### 3. Subir o projeto

```bash
npm run dev
```

### 4. Abrir no navegador

[http://localhost:3000](http://localhost:3000)

## Fluxo esperado no primeiro uso

1. abrir o app
2. ir para a tela de login
3. clicar em `Cadastrar`
4. informar `nome`, `PIN` e `confirmar PIN`
5. entrar no dashboard
6. começar a registrar entradas e saídas

## Deploy na Vercel

1. suba o projeto para o GitHub
2. importe o repositório na [Vercel](https://vercel.com/)
3. adicione estas variáveis em `Project Settings` > `Environment Variables`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AUTH_SECRET`
4. faça o deploy

## Rotas da API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/expenses?month=YYYY-MM`
- `POST /api/expenses`
- `DELETE /api/expenses?id=xxx`
- `GET /api/income?month=YYYY-MM`
- `POST /api/income`
- `DELETE /api/income?id=xxx`
- `GET /api/summary?month=YYYY-MM`

## Segurança

- sessão por cookie assinado
- PIN armazenado como hash
- isolamento por `user_id`
- RLS ativado no schema
- rate limiting no login

## Observações

- o campo `month` da saída é preenchido automaticamente pela `date`, mas pode ser ajustado
- o app foi desenhado com foco em uso no celular
- o dashboard já nasce com o resumo calculado no servidor para evitar telas zeradas no primeiro carregamento
- o browser nunca recebe a `service_role`
