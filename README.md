# Vira Mes

Aplicativo pessoal de controle financeiro com Next.js 14, Supabase Postgres, autenticação por PIN de 6 dígitos e gráficos em Recharts.

## Stack

- Next.js 14 com App Router e TypeScript
- Supabase Postgres para persistência
- Tailwind CSS com componentes no estilo shadcn/ui
- Recharts para visualização
- Vercel Cron Jobs para rotina agendada

## Funcionalidades

- Cadastro de saídas com data, categoria, descrição, valor e mês
- Cadastro de entradas por mês
- Dashboard com filtro mensal
- Cards de resumo com total de entradas, saídas e saldo
- Gráfico de barras por categoria
- Gráfico de linha com evolução do saldo nos últimos 6 meses
- Gráfico de pizza com divisão percentual das despesas
- Tabela unificada de lançamentos com exclusão por item
- Toasts de sucesso e erro
- Skeletons de carregamento
- Cadastro com nome, PIN e confirmação de PIN
- Login com PIN de 6 dígitos
- Sessão protegida por cookie assinado

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
AUTH_SECRET=
```

## Como configurar o Supabase

1. Acesse [supabase.com](https://supabase.com/) e crie um projeto.
2. No painel do projeto, abra `Project Settings` > `API`.
3. Copie:
   - `Project URL` para `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` para `SUPABASE_SERVICE_ROLE_KEY`
4. Gere um segredo para sessão e salve em `AUTH_SECRET`.
   Exemplo:
   ```bash
   openssl rand -base64 32
   ```

Observação: a `service_role` deve ser usada apenas no servidor. Neste projeto ela nunca vai para o browser.

## Como criar as tabelas

1. No Supabase, abra `SQL Editor`.
2. Cole o conteúdo de [supabase/schema.sql](/Users/marcelfilho/Documents/vira-mes/supabase/schema.sql).
3. Execute o script.

Esse schema cria:

- tabela `expenses`
- tabela `income`
- tabela `app_users` com `full_name` e `pin_hash`
- índices por mês, data e email
- `uuid` automático para as linhas

## Como funciona o acesso

Na tela de autenticação, a pessoa pode:

- cadastrar `nome + PIN + confirmar PIN`
- entrar depois digitando apenas o `PIN`

O PIN não é salvo em texto puro. O app guarda apenas `pin_hash` na tabela `app_users` e assina a sessão no servidor antes de gravar o cookie no navegador.

## Estrutura do banco

### Tabela `expenses`

- `id uuid primary key`
- `date date not null`
- `month text not null`
- `category text not null`
- `description text`
- `amount numeric(12,2) not null`
- `created_at timestamptz not null`

### Tabela `income`

- `id uuid primary key`
- `month text not null`
- `description text`
- `amount numeric(12,2) not null`
- `created_at timestamptz not null`

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Deploy na Vercel

1. Suba o projeto para GitHub, GitLab ou Bitbucket.
2. Importe o repositório na [Vercel](https://vercel.com/).
3. Em `Project Settings` > `Environment Variables`, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AUTH_SECRET`
4. Faça o deploy.

## Cron Job

O projeto inclui `vercel.json` com uma rotina diária:

```json
{
  "crons": [
    {
      "path": "/api/cron/summary",
      "schedule": "0 6 * * *"
    }
  ]
}
```

Essa rota recalcula e devolve o resumo do mês atual, servindo como ponto simples para automação futura.

## Rotas da API

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/expenses?month=YYYY-MM`
- `POST /api/expenses`
- `DELETE /api/expenses?id=xxx`
- `GET /api/income?month=YYYY-MM`
- `POST /api/income`
- `DELETE /api/income?id=xxx`
- `GET /api/summary?month=YYYY-MM`

## Observações

- O campo `month` da saída é preenchido automaticamente pela data, mas pode ser ajustado antes de salvar.
- O app foi desenhado em abordagem mobile-first e funciona bem em desktop.
- Como o projeto usa uma API própria no servidor, o browser não precisa receber a `service_role`.
- Se a tabela `app_users` já existe no seu projeto, rode novamente o SQL de [supabase/schema.sql](/Users/marcelfilho/Documents/vira-mes/supabase/schema.sql) para adicionar `pin_hash`.
