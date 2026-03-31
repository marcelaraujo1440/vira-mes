import { NextRequest, NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api";
import { listExpenses, listIncome } from "@/lib/google-sheets";
import { buildSummary } from "@/lib/summary";
import { monthQuerySchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const month = monthQuerySchema.parse({
      month: request.nextUrl.searchParams.get("month")
    }).month;
    const [expenses, income] = await Promise.all([listExpenses(), listIncome()]);
    const summary = await buildSummary(month, expenses, income);

    return NextResponse.json(summary);
  } catch (error) {
    return handleRouteError(error);
  }
}
