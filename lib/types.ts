import type { ExpenseCategory } from "@/lib/constants";

export type Expense = {
  id: string;
  date: string;
  month: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
};

export type Income = {
  id: string;
  month: string;
  description: string;
  amount: number;
};

export type Transaction = (
  | (Expense & { type: "expense" })
  | (Income & { type: "income" })
) & { sortDate: string };

export type CategoryTotal = {
  category: ExpenseCategory;
  total: number;
};

export type MonthlyBalancePoint = {
  month: string;
  income: number;
  expenses: number;
  balance: number;
};

export type Summary = {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  byCategory: CategoryTotal[];
  monthlyBalance: MonthlyBalancePoint[];
  transactions: Transaction[];
};
