import { createHmac, randomUUID, timingSafeEqual } from "crypto";

const COOKIE_NAME = "prime_watch_verified";
const TTL_MS = 2 * 60 * 60 * 1000;

function secret() {
  return process.env.PLAYBACK_SESSION_SECRET || process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "";
}

function sign(value: string) {
  const key = secret();
  if (!key) throw new Error("Access-session secret is not configured");
  return createHmac("sha256", key).update(value).digest("base64url");
}

export function createAnonymousAccessToken() {
  const payload = Buffer.from(JSON.stringify({
    exp: Date.now() + TTL_MS,
    nonce: randomUUID(),
  })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyAnonymousAccessToken(token?: string | null) {
  if (!token || !secret()) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: number };
    return Number.isFinite(data.exp) && Date.now() < Number(data.exp);
  } catch {
    return false;
  }
}

export const anonymousAccessCookie = {
  name: COOKIE_NAME,
  maxAge: Math.floor(TTL_MS / 1000),
};
