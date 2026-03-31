import { NextResponse } from "next/server";

import { getCurrentMonth } from "@/lib/date";
import { listExpenses, listIncome } from "@/lib/google-sheets";
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
