˜# Vira Mes

Aplicativo pessoal de controle financeiro com Next.js 14, Google Sheets como banco de dados, gráficos em Recharts e deploy pensado para Vercel.

## Stack

- Next.js 14 com App Router e TypeScript
- Google Sheets API v4 para persistência
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

## Estrutura esperada da planilha

Crie uma planilha do Google com duas abas:

### Aba `Expenses`

Colunas:

`id | date | month | category | description | amount`

### Aba `Income`

Colunas:

`id | month | description | amount`

Observação: o app também consegue criar automaticamente a primeira linha de cabeçalhos se a aba estiver vazia.

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
GOOGLE_SHEETS_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FINANCE_APP_PIN=1234
```

## Como criar a Service Account

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um projeto novo ou use um existente.
3. Vá em `APIs & Services` > `Library`.
4. Busque por `Google Sheets API` e clique em `Enable`.
5. Vá em `APIs & Services` > `Credentials`.
6. Clique em `Create Credentials` > `Service account`.
7. Dê um nome para a conta e conclua a criação.
8. Abra a conta criada, vá em `Keys` e gere uma nova chave do tipo `JSON`.
9. No arquivo JSON, copie:
   - `client_email` para `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` para `GOOGLE_PRIVATE_KEY`
10. Mantenha os `\n` no valor da chave privada ao salvar a variável.

## Como compartilhar a planilha

1. Abra a planilha no Google Sheets.
2. Clique em `Compartilhar`.
3. Adicione o `client_email` da Service Account como editor.
4. Copie o ID da planilha pela URL:

```txt
https://docs.google.com/spreadsheets/d/ESTE_E_O_ID/edit#gid=0
```

Use esse valor em `GOOGLE_SHEETS_ID`.

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
   - `GOOGLE_SHEETS_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `FINANCE_APP_PIN`
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

- `GET /api/expenses?month=YYYY-MM`
- `POST /api/expenses`
- `DELETE /api/expenses?id=xxx`
- `GET /api/income?month=YYYY-MM`
- `POST /api/income`
- `DELETE /api/income?id=xxx`
- `GET /api/summary?month=YYYY-MM`

## Observações

- O campo `month` da saída é preenchido automaticamente pela data, mas pode ser ajustado antes de salvar.
- As exclusões são feitas por `id`, procurando a linha correspondente e removendo-a da aba correta.
- O app foi desenhado em abordagem mobile-first e funciona bem em desktop.
- O acesso agora é protegido por um PIN numérico simples configurado em `FINANCE_APP_PIN`.
