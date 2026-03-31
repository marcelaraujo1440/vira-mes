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

export const expenseSheetName = "Expenses";
export const incomeSheetName = "Income";

export type ExpenseCategory = (typeof expenseCategories)[number];
