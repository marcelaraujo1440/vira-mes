import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { handleRouteError } from "@/lib/api";
import { applySessionCookie, hashPin } from "@/lib/auth";
import {
  clearLoginRateLimit,
  findPinUserByNameAndHash,
  getLoginRateLimit,
  upsertLoginRateLimit
} from "@/lib/database";

const loginSchema = z.object({
  name: z.string().trim().min(2, "Digite seu nome de usuario."),
  pin: z.string().regex(/^\d{6}$/, "Digite um PIN com 6 digitos.")
});

export const dynamic = "force-dynamic";

const maxAttempts = 5;
const windowMinutes = 15;
const blockMinutes = 15;

function normalizePin(value: unknown) {
  return typeof value === "string" ? value.replace(/\D/g, "").slice(0, 6) : "";
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function getRateLimitKey(name: string, ip: string) {
  return `${name.trim().toLowerCase()}::${ip}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, pin } = loginSchema.parse({
      name: typeof body.name === "string" ? body.name.trim() : "",
      pin: normalizePin(body.pin)
    });
    const rateLimitKey = getRateLimitKey(name, getClientIp(request));
    const rateLimit = await getLoginRateLimit(rateLimitKey);
    const now = new Date();

    if (rateLimit?.blockedUntil && rateLimit.blockedUntil > now) {
      return NextResponse.json(
        { message: "Muitas tentativas. Tente novamente em alguns minutos." },
        { status: 429 }
      );
    }

    const user = await findPinUserByNameAndHash(name, await hashPin(pin));

    if (!user) {
      const activeWindowStart =
        rateLimit && now.getTime() - rateLimit.windowStartedAt.getTime() < windowMinutes * 60 * 1000
          ? rateLimit.windowStartedAt
          : now;
      const attempts =
        rateLimit && activeWindowStart.getTime() === rateLimit.windowStartedAt.getTime()
          ? rateLimit.attempts + 1
          : 1;
      const blockedUntil =
        attempts >= maxAttempts ? new Date(now.getTime() + blockMinutes * 60 * 1000) : null;

      await upsertLoginRateLimit({
        scopeKey: rateLimitKey,
        attempts,
        windowStartedAt: activeWindowStart,
        blockedUntil
      });

      return NextResponse.json({ message: "Nome de usuario ou PIN invalido." }, { status: 401 });
    }

    await clearLoginRateLimit(rateLimitKey);

    const response = NextResponse.json({ success: true, userId: user.id });

    await applySessionCookie(response, user.id);

    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
