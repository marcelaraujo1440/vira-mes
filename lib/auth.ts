import type { NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "vira-mes-session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
const PIN_PATTERN = /^\d{6}$/;
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
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));

  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function isValidPin(pin: string) {
  return PIN_PATTERN.test(pin);
}

export async function hashPin(pin: string) {
  if (!isValidPin(pin)) {
    throw new Error("PIN invalido.");
  }

  return await sign(`pin:${pin}`);
}

export async function createSessionToken(userId: string) {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
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
  response.cookies.set(SESSION_COOKIE_NAME, await createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/"
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}
