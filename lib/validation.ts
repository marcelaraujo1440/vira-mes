import { z } from "zod";

import { expenseCategories } from "@/lib/constants";
import { getMonthFromDate } from "@/lib/date";

const monthPattern = /^\d{4}-\d{2}$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const amountField = z
  .number({
    required_error: "Informe um valor.",
    invalid_type_error: "Informe um valor valido."
  })
  .positive("O valor deve ser maior que zero.");

export const expenseInputSchema = z.object({
  date: z.string().regex(datePattern, "Data invalida."),
  category: z.enum(expenseCategories),
  description: z.string().trim().max(120).optional().default(""),
  amount: amountField,
  month: z.string().regex(monthPattern, "Mes invalido.")
});

export const incomeInputSchema = z.object({
  month: z.string().regex(monthPattern, "Mes invalido."),
  description: z.string().trim().max(120).optional().default(""),
  amount: amountField
});

export const monthQuerySchema = z.object({
  month: z.string().regex(monthPattern, "Mes invalido.")
});

export const deleteQuerySchema = z.object({
  id: z.string().min(1, "ID obrigatorio.")
});

export function normalizeExpensePayload(input: z.infer<typeof expenseInputSchema>) {
  return {
    ...input,
    month: input.month || getMonthFromDate(input.date),
    description: input.description ?? ""
  };
}

export function normalizeIncomePayload(input: z.infer<typeof incomeInputSchema>) {
  return {
    ...input,
    description: input.description ?? ""
  };
}
