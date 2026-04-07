import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { handleRouteError } from "@/lib/api";
import { applySessionCookie, hashPin } from "@/lib/auth";
import { createPinUser } from "@/lib/database";

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Digite seu nome."),
    pin: z.string().regex(/^\d{6}$/, "Use um PIN com 6 digitos."),
    confirmPin: z.string().regex(/^\d{6}$/, "Confirme o PIN com 6 digitos.")
  })
  .refine((input) => input.pin === input.confirmPin, {
    path: ["confirmPin"],
    message: "Os PINs precisam ser iguais."
  });

export const dynamic = "force-dynamic";

function normalizePin(value: unknown) {
  return typeof value === "string" ? value.replace(/\D/g, "").slice(0, 6) : "";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, pin } = registerSchema.parse({
      name: typeof body.name === "string" ? body.name.trim() : "",
      pin: normalizePin(body.pin),
      confirmPin: normalizePin(body.confirmPin)
    });
    const user = await createPinUser({
      fullName: name,
      pinHash: await hashPin(pin)
    });
    const response = NextResponse.json({ success: true, userId: user.id }, { status: 201 });

    await applySessionCookie(response, user.id);

    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
