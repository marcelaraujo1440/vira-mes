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
