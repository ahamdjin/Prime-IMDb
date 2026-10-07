import { createHmac, timingSafeEqual } from "crypto";
import type { MediaType } from "./media-types";

export type PlaybackSessionPayload = {
  imdbId: string;
  mediaType: MediaType;
  season: number;
  episode: number;
  resumeAt: number;
  exp: number;
  nonce: string;
};

function getSecret() {
  return process.env.PLAYBACK_SESSION_SECRET || process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "";
}

function encode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function createPlaybackToken(payload: PlaybackSessionPayload) {
  const secret = getSecret();
  if (!secret) throw new Error("Playback session secret is not configured");
  const body = encode(JSON.stringify(payload));
  const signature = sign(body, secret);
  return `${body}.${signature}`;
}

export function verifyPlaybackToken(token: string): PlaybackSessionPayload | null {
  const secret = getSecret();
  if (!secret) return null;

  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = sign(body, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(decode(body)) as PlaybackSessionPayload;
    if (
      !payload ||
      !/^tt\d+$/.test(payload.imdbId) ||
      !["movie", "tv"].includes(payload.mediaType) ||
      !Number.isFinite(payload.exp) ||
      Date.now() > payload.exp ||
      !Number.isFinite(payload.season) ||
      !Number.isFinite(payload.episode) ||
      !Number.isFinite(payload.resumeAt)
    ) return null;
    return payload;
  } catch {
    return null;
  }
}
