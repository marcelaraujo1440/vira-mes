import { expenseCategories } from "@/lib/constants";
import { getMonthlyBalanceHistory } from "@/lib/google-sheets";
import type { Expense, Income, Summary, Transaction } from "@/lib/types";

export async function buildSummary(month: string, expenses: Expense[], income: Income[]) {
  const monthExpenses = expenses.filter((entry) => entry.month === month);
  const monthIncome = income.filter((entry) => entry.month === month);

  const totalIncome = monthIncome.reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpenses = monthExpenses.reduce((sum, entry) => sum + entry.amount, 0);
  const byCategory = expenseCategories.map((category) => ({
    category,
    total: monthExpenses
      .filter((entry) => entry.category === category)
      .reduce((sum, entry) => sum + entry.amount, 0)
  }));
  const monthlyBalance = await getMonthlyBalanceHistory(expenses, income);
  const transactions: Transaction[] = [
    ...monthExpenses.map((entry) => ({
      ...entry,
      type: "expense" as const,
      sortDate: entry.date
    })),
    ...monthIncome.map((entry) => ({
      ...entry,
      type: "income" as const,
      sortDate: `${entry.month}-01`
    }))
  ].sort((left, right) => right.sortDate.localeCompare(left.sortDate));

  return {
    month,
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    byCategory,
    monthlyBalance,
    transactions
  } satisfies Summary;
}
