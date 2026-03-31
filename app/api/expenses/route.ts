import { NextRequest, NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api";
import {
  appendExpense,
  deleteExpenseById,
  filterByMonth,
  listExpenses
} from "@/lib/google-sheets";
import { expenseInputSchema, deleteQuerySchema, monthQuerySchema, normalizeExpensePayload } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const month = monthQuerySchema.parse({
      month: request.nextUrl.searchParams.get("month")
    }).month;
    const expenses = await listExpenses();

    return NextResponse.json(filterByMonth(expenses, month));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = normalizeExpensePayload(expenseInputSchema.parse(await request.json()));
    const expense = await appendExpense(payload);

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = deleteQuerySchema.parse({
      id: request.nextUrl.searchParams.get("id")
    }).id;
    const deleted = await deleteExpenseById(id);

    if (!deleted) {
      return NextResponse.json({ message: "Lancamento nao encontrado." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
