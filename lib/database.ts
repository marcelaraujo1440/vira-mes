import type { PostgrestError } from "@supabase/supabase-js";

import { getMonthFromDate, getRecentMonths, normalizeMonthValue } from "@/lib/date";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import type { Expense, Income, MonthlyBalancePoint } from "@/lib/types";

type ExpenseRow = {
  id: string;
  user_id: string;
  date: string;
  month: string;
  category: string;
  description: string | null;
  amount: number | string;
};

type IncomeRow = {
  id: string;
  user_id: string;
  month: string;
  description: string | null;
  amount: number | string;
};

type AppUserRow = {
  id: string;
  full_name: string;
  pin_hash: string | null;
  is_active: boolean;
};

type LoginRateLimitRow = {
  scope_key: string;
  attempts: number;
  window_started_at: string;
  blocked_until: string | null;
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
  return {
    id: row.id,
    month: normalizeMonthValue(row.month),
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

export async function getAppUserById(userId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("app_users")
    .select("id, full_name, pin_hash, is_active")
    .eq("id", userId)
    .eq("is_active", true)
    .maybeSingle();

  throwIfDatabaseError(error);

  return data ? mapAppUserRow(data) : null;
}

function mapRateLimitRow(row: LoginRateLimitRow) {
  return {
    scopeKey: row.scope_key,
    attempts: row.attempts,
    windowStartedAt: new Date(row.window_started_at),
    blockedUntil: row.blocked_until ? new Date(row.blocked_until) : null
  };
}

export async function listExpenses(userId?: string) {
  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("expenses")
    .select("id, user_id, date, month, category, description, amount")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  throwIfDatabaseError(error);

  return (data ?? []).map(mapExpenseRow);
}

export async function listIncome(userId?: string) {
  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("income")
    .select("id, user_id, month, description, amount")
    .order("month", { ascending: false })
    .order("created_at", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  throwIfDatabaseError(error);

  return (data ?? []).map(mapIncomeRow);
}

export async function appendExpense(input: Omit<Expense, "id">, userId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      user_id: userId,
      date: input.date,
      month: input.month,
      category: input.category,
      description: input.description,
      amount: input.amount
    })
    .select("id, user_id, date, month, category, description, amount")
    .single();

  throwIfDatabaseError(error);

  if (!data) {
    throw new Error("Nao foi possivel salvar a saida.");
  }

  return mapExpenseRow(data);
}

export async function appendIncome(input: Omit<Income, "id">, userId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("income")
    .insert({
      user_id: userId,
      month: input.month,
      description: input.description,
      amount: input.amount
    })
    .select("id, user_id, month, description, amount")
    .single();

  throwIfDatabaseError(error);

  if (!data) {
    throw new Error("Nao foi possivel salvar a entrada.");
  }

  return mapIncomeRow(data);
}

export async function deleteExpenseById(id: string, userId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  throwIfDatabaseError(error);

  return Boolean(data);
}

export async function deleteIncomeById(id: string, userId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("income")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  throwIfDatabaseError(error);

  return Boolean(data);
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

export async function findPinUserByNameAndHash(fullName: string, pinHash: string) {
  const supabase = getSupabaseAdminClient();
  const normalizedName = fullName.trim();
  const { data, error } = await supabase
    .from("app_users")
    .select("id, full_name, pin_hash, is_active")
    .ilike("full_name", normalizedName)
    .eq("pin_hash", pinHash)
    .eq("is_active", true)
    .maybeSingle();

  throwIfDatabaseError(error);

  return data ? mapAppUserRow(data) : null;
}

export async function getLoginRateLimit(scopeKey: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("login_rate_limits")
    .select("scope_key, attempts, window_started_at, blocked_until")
    .eq("scope_key", scopeKey)
    .maybeSingle();

  throwIfDatabaseError(error);

  return data ? mapRateLimitRow(data) : null;
}

export async function upsertLoginRateLimit(input: {
  scopeKey: string;
  attempts: number;
  windowStartedAt: Date;
  blockedUntil: Date | null;
}) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("login_rate_limits").upsert(
    {
      scope_key: input.scopeKey,
      attempts: input.attempts,
      window_started_at: input.windowStartedAt.toISOString(),
      blocked_until: input.blockedUntil?.toISOString() ?? null,
      updated_at: new Date().toISOString()
    },
    {
      onConflict: "scope_key"
    }
  );

  throwIfDatabaseError(error);
}

export async function clearLoginRateLimit(scopeKey: string) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("login_rate_limits").delete().eq("scope_key", scopeKey);

  throwIfDatabaseError(error);
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
