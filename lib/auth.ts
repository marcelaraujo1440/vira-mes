import type { NextResponse } from "next/server";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import type { NextRequest } from "next/server";

export const sessionCookieName = "vira-mes-session";

const pinPattern = /^\d{6}$/;
const sessionMaxAge = 60 * 60 * 24 * 30;
const encoder = new TextEncoder();

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET nao configurado.");
  }

  return secret;
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getAuthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));

  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function isValidPin(value: string) {
  return pinPattern.test(value);
}

export async function hashPin(pin: string) {
  if (!isValidPin(pin)) {
    throw new Error("PIN invalido.");
  }

  return await sign(`pin:${pin}`);
}

export async function createSessionToken(userId: string) {
  const expiresAt = Date.now() + sessionMaxAge * 1000;
  const payload = `${userId}.${expiresAt}`;
  const signature = await sign(payload);

  return `${payload}.${signature}`;
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const lastSeparator = token.lastIndexOf(".");

  if (lastSeparator === -1) {
    return null;
  }

  const payload = token.slice(0, lastSeparator);
  const signature = token.slice(lastSeparator + 1);
  const [userId, expiresAt] = payload.split(".");

  if (!userId || !expiresAt || !signature) {
    return null;
  }

  const expectedSignature = await sign(payload);

  if (signature !== expectedSignature) {
    return null;
  }

  if (Number(expiresAt) < Date.now()) {
    return null;
  }

  return { userId };
}

export async function applySessionCookie(response: NextResponse, userId: string) {
  response.cookies.set({
    name: sessionCookieName,
    value: await createSessionToken(userId),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionMaxAge
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: sessionCookieName,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export async function getSessionFromRequest(request: NextRequest) {
  return await verifySessionToken(request.cookies.get(sessionCookieName)?.value);
}

export async function getSessionFromCookieStore(cookieStore: Pick<ReadonlyRequestCookies, "get">) {
  return await verifySessionToken(cookieStore.get(sessionCookieName)?.value);
}
