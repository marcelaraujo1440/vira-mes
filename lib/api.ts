import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        message: error.issues[0]?.message ?? "Dados invalidos."
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Erro inesperado." }, { status: 500 });
}
