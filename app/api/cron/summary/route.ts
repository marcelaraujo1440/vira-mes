import { NextResponse } from "next/server";

import { listExpenses, listIncome } from "@/lib/database";
import { getCurrentMonth } from "@/lib/date";
import { buildSummary } from "@/lib/summary";

export const dynamic = "force-dynamic";

export async function GET() {
  const month = getCurrentMonth();
  const [expenses, income] = await Promise.all([listExpenses(), listIncome()]);
  const summary = await buildSummary(month, expenses, income);

  return NextResponse.json({
    refreshedAt: new Date().toISOString(),
    summary
  });
}
