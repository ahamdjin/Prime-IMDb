import { NextResponse } from "next/server";
import { anonymousAccessCookie, createAnonymousAccessToken } from "@/app/utlis/access-session";

export const runtime = "nodejs";

function sameOrigin(request: Request) {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  const requestedWith = request.headers.get("x-requested-with");

  if (origin && origin !== url.origin) return false;
  if (fetchSite && !["same-origin", "same-site", "none"].includes(fetchSite)) return false;
  if (requestedWith !== "PrimeIMDbAccess") return false;
  return true;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const token = createAnonymousAccessToken();
  const response = NextResponse.json({ ok: true }, {
    headers: {
      "Cache-Control": "no-store, private",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });

  response.cookies.set(anonymousAccessCookie.name, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: anonymousAccessCookie.maxAge,
  });

  return response;
}
