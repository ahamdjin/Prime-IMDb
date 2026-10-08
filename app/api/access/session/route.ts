import { NextResponse } from "next/server";
import { anonymousAccessCookie, createAnonymousAccessToken } from "@/app/utlis/access-session";

export const runtime = "nodejs";

type VerificationResponse = {
  success?: boolean;
  hostname?: string;
  action?: string;
  "error-codes"?: string[];
};

export async function POST(request: Request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
    return NextResponse.json({ error: "Verification is not configured" }, { status: 503 });
  }

  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  const url = new URL(request.url);

  if (
    origin !== url.origin ||
    (fetchSite && fetchSite !== "same-origin") ||
    request.headers.get("content-type")?.split(";")[0] !== "application/json"
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let responseToken = "";
  try {
    const body = await request.json() as { token?: unknown };
    if (typeof body.token === "string") responseToken = body.token;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (responseToken.length < 1 || responseToken.length > 2048) {
    return NextResponse.json({ error: "Missing verification token" }, { status: 400 });
  }

  let verified: VerificationResponse;
  try {
    const form = new FormData();
    form.set("secret", secret);
    form.set("response", responseToken);
    const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!verification.ok) throw new Error("Verification service unavailable");
    verified = await verification.json() as VerificationResponse;
  } catch {
    return NextResponse.json({ error: "Verification unavailable; please retry" }, { status: 503 });
  }

  if (
    verified.success !== true ||
    verified.hostname?.toLowerCase() !== url.hostname.toLowerCase() ||
    verified.action !== "watch_access"
  ) {
    return NextResponse.json({ error: "Verification failed; please retry" }, { status: 403 });
  }

  let token: string;
  try {
    token = createAnonymousAccessToken();
  } catch {
    return NextResponse.json({ error: "Access signing unavailable" }, { status: 503 });
  }

  const reply = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow, noarchive" } }
  );
  reply.cookies.set(anonymousAccessCookie.name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: anonymousAccessCookie.maxAge,
  });
  return reply;
}
