import type { PostgrestError } from "@supabase/supabase-js";

import { getMonthFromDate, getRecentMonths, normalizeMonthValue } from "@/lib/date";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import type { Expense, Income, MonthlyBalancePoint } from "@/lib/types";

type ExpenseRow = {
  id: string;
  date: string;
  month: string;
  category: string;
  description: string | null;
  amount: number;
};

type IncomeRow = {
  id: string;
  month: string;
  description: string | null;
  amount: number;
};

type AppUserRow = {
  id: string;
  full_name: string;
  pin_hash: string | null;
  is_active: boolean;
};

function throwIfDatabaseError(error: PostgrestError | null) {
  if (error) {
    throw new Error(error.message);
  }
}

function mapExpenseRow(row: ExpenseRow): Expense {
  const normalizedMonth = normalizeMonthValue(row.month) || getMonthFromDate(row.date);

  return {
    id: row.id,
    date: row.date,
    month: normalizedMonth,
    category: row.category as Expense["category"],
    description: row.description ?? "",
    amount: Number(row.amount)
  };
}

function mapIncomeRow(row: IncomeRow): Income {
  const normalizedMonth = normalizeMonthValue(row.month);

  return {
    id: row.id,
    month: normalizedMonth,
    description: row.description ?? "",
    amount: Number(row.amount)
  };
}

function mapAppUserRow(row: AppUserRow) {
  return {
    id: row.id,
    fullName: row.full_name,
    pinHash: row.pin_hash ?? "",
    isActive: row.is_active
  };
}

export async function listExpenses() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("expenses")
    .select("id, date, month, category, description, amount")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  throwIfDatabaseError(error);

  return (data ?? []).map(mapExpenseRow);
}

export async function listIncome() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("income")
    .select("id, month, description, amount")
    .order("month", { ascending: false })
    .order("created_at", { ascending: false });

  throwIfDatabaseError(error);

  return (data ?? []).map(mapIncomeRow);
}

export async function appendExpense(input: Omit<Expense, "id">) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      date: input.date,
      month: input.month,
      category: input.category,
      description: input.description,
      amount: input.amount
    })
    .select("id, date, month, category, description, amount")
    .single();

  throwIfDatabaseError(error);

  if (!data) {
    throw new Error("Nao foi possivel salvar a saida.");
  }

  return mapExpenseRow(data);
}

export async function appendIncome(input: Omit<Income, "id">) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("income")
    .insert({
      month: input.month,
      description: input.description,
      amount: input.amount
    })
    .select("id, month, description, amount")
    .single();

  throwIfDatabaseError(error);

  if (!data) {
    throw new Error("Nao foi possivel salvar a entrada.");
  }

  return mapIncomeRow(data);
}

export async function deleteExpenseById(id: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("expenses").delete().eq("id", id).select("id").maybeSingle();

  throwIfDatabaseError(error);

  return Boolean(data);
}

export async function deleteIncomeById(id: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("income").delete().eq("id", id).select("id").maybeSingle();

  throwIfDatabaseError(error);

  return Boolean(data);
}

export async function getRegisteredPinUser() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("app_users")
    .select("id, full_name, pin_hash, is_active")
    .eq("is_active", true)
    .not("pin_hash", "is", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  throwIfDatabaseError(error);

  return data ? mapAppUserRow(data) : null;
}

export async function createPinUser(input: { fullName: string; pinHash: string }) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("app_users")
    .insert({
      full_name: input.fullName,
      pin_hash: input.pinHash,
      is_active: true
    })
    .select("id, full_name, pin_hash, is_active")
    .single();

  throwIfDatabaseError(error);

  if (!data) {
    throw new Error("Nao foi possivel criar o cadastro.");
  }

  return mapAppUserRow(data);
}

export async function findPinUserByHash(pinHash: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("app_users")
    .select("id, full_name, pin_hash, is_active")
    .eq("pin_hash", pinHash)
    .eq("is_active", true)
    .maybeSingle();

  throwIfDatabaseError(error);

  return data ? mapAppUserRow(data) : null;
}

export function filterByMonth<T extends { month: string }>(rows: T[], month: string) {
  const normalizedMonth = normalizeMonthValue(month);

  return rows.filter((row) => normalizeMonthValue(row.month) === normalizedMonth);
}

export async function getMonthlyBalanceHistory(expenses: Expense[], income: Income[]) {
  const months = getRecentMonths(6);

  return months.map<MonthlyBalancePoint>((month) => {
    const totalIncome = income
      .filter((entry) => normalizeMonthValue(entry.month) === month)
      .reduce((sum, entry) => sum + entry.amount, 0);
    const totalExpenses = expenses
      .filter((entry) => normalizeMonthValue(entry.month) === month)
      .reduce((sum, entry) => sum + entry.amount, 0);

    return {
      month,
      income: totalIncome,
      expenses: totalExpenses,
      balance: totalIncome - totalExpenses
    };
  });
}
