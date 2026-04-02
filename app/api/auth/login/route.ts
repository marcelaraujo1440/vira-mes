import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { handleRouteError } from "@/lib/api";
import { applySessionCookie, hashPin } from "@/lib/auth";
import { findPinUserByHash } from "@/lib/database";

const loginSchema = z.object({
  pin: z.string().regex(/^\d{6}$/, "Digite um PIN com 6 digitos.")
});

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { pin } = loginSchema.parse(await request.json());
    const user = await findPinUserByHash(await hashPin(pin));

    if (!user) {
      return NextResponse.json({ message: "PIN invalido." }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, userId: user.id });

    await applySessionCookie(response, user.id);

    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
