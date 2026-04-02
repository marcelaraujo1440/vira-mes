import { DashboardShell } from "@/components/dashboard-shell";
import { listExpenses, listIncome } from "@/lib/database";
import { getCurrentMonth } from "@/lib/date";
import { buildSummary } from "@/lib/summary";

export default async function HomePage() {
  const month = getCurrentMonth();
  const [expenses, income] = await Promise.all([listExpenses(), listIncome()]);
  const summary = await buildSummary(month, expenses, income);

  return <DashboardShell initialMonth={month} initialSummary={summary} />;
}
