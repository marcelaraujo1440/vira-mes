import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { getSessionFromCookieStore } from "@/lib/auth";
import { listExpenses, listIncome } from "@/lib/database";
import { getCurrentMonth } from "@/lib/date";
import { buildSummary } from "@/lib/summary";

export default async function HomePage() {
  const session = await getSessionFromCookieStore(cookies());

  if (!session) {
    redirect("/login");
  }

  const month = getCurrentMonth();
  const [expenses, income] = await Promise.all([
    listExpenses(session.userId),
    listIncome(session.userId)
  ]);
  const summary = await buildSummary(month, expenses, income);

  return <DashboardShell initialMonth={month} initialSummary={summary} />;
}
