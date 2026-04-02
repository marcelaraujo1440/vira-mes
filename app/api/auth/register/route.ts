import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { handleRouteError } from "@/lib/api";
import { applySessionCookie, hashPin } from "@/lib/auth";
import { createPinUser, getRegisteredPinUser } from "@/lib/database";

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

export async function POST(request: NextRequest) {
  try {
    const { name, pin } = registerSchema.parse(await request.json());
    const existingUser = await getRegisteredPinUser();

    if (existingUser) {
      return NextResponse.json({ message: "Ja existe um cadastro. Entre com o PIN atual." }, { status: 409 });
    }

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
