export const expenseCategories = [
  "Alimentacao",
  "Bebida",
  "Roupa",
  "Transporte",
  "Saude",
  "Lazer",
  "Assinatura",
  "Outros"
] as const;

export type ExpenseCategory = (typeof expenseCategories)[number];
