import { NextRequest, NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api";
import { getSessionFromRequest } from "@/lib/auth";
import { appendIncome, deleteIncomeById, filterByMonth, listIncome } from "@/lib/database";
import { deleteQuerySchema, incomeInputSchema, monthQuerySchema, normalizeIncomePayload } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
    }

    const month = monthQuerySchema.parse({
      month: request.nextUrl.searchParams.get("month")
    }).month;
    const income = await listIncome(session.userId);

    return NextResponse.json(filterByMonth(income, month));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
    }

    const payload = normalizeIncomePayload(incomeInputSchema.parse(await request.json()));
    const income = await appendIncome(payload, session.userId);

    return NextResponse.json(income, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
    }

    const id = deleteQuerySchema.parse({
      id: request.nextUrl.searchParams.get("id")
    }).id;
    const deleted = await deleteIncomeById(id, session.userId);

    if (!deleted) {
      return NextResponse.json({ message: "Lancamento nao encontrado." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
