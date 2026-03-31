import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getExpectedSessionToken, isValidPin, sessionCookieName } from "@/lib/auth";
import { handleRouteError } from "@/lib/api";

const loginSchema = z.object({
  pin: z.string().regex(/^\d+$/, "Digite apenas numeros.")
});

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { pin } = loginSchema.parse(await request.json());

    if (!isValidPin(pin)) {
      return NextResponse.json({ message: "PIN incorreto." }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: sessionCookieName,
      value: getExpectedSessionToken(),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });

    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
