import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { createPlaybackToken, getPlaybackClientHash } from "@/app/utlis/playback-session";
import { anonymousAccessCookie, verifyAnonymousAccessToken } from "@/app/utlis/access-session";

export const runtime = "nodejs";

type RequestBody = {
  imdbId?: string;
  mediaType?: "movie" | "tv";
  season?: number;
  episode?: number;
  resumeAt?: number;
};

function sameOrigin(request: Request) {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  const requestedWith = request.headers.get("x-requested-with");
  const referer = request.headers.get("referer");
  if (origin && origin !== url.origin) return false;
  if (fetchSite && !["same-origin", "same-site", "none"].includes(fetchSite)) return false;
  if (requestedWith !== "PrimeIMDbPlayer") return false;
  if (referer) {
    try {
      const ref = new URL(referer);
      if (ref.origin !== url.origin || !ref.pathname.startsWith("/watch/")) return false;
    } catch {
      return false;
    }
  }
  return true;
}

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const accessToken = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${anonymousAccessCookie.name}=`))
    ?.slice(anonymousAccessCookie.name.length + 1);

  if (!verifyAnonymousAccessToken(accessToken) || !sameOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: RequestBody;
  try {
    body = await request.json() as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const imdbId = String(body.imdbId || "");
  const mediaType = body.mediaType;
  if (!/^tt\d+$/.test(imdbId) || (mediaType !== "movie" && mediaType !== "tv")) {
    return NextResponse.json({ error: "Invalid media" }, { status: 400 });
  }

  const season = Math.max(1, Math.min(999, Number(body.season) || 1));
  const episode = Math.max(1, Math.min(9999, Number(body.episode) || 1));
  const resumeAt = Math.max(0, Math.min(60 * 60 * 24, Math.floor(Number(body.resumeAt) || 0)));

  try {
    const userAgent = request.headers.get("user-agent") || "";
    const token = createPlaybackToken({
      imdbId,
      mediaType,
      season,
      episode,
      resumeAt,
      exp: Date.now() + 5 * 60_000,
      nonce: randomBytes(16).toString("hex"),
      clientHash: getPlaybackClientHash(userAgent),
    });

    return NextResponse.json(
      { playerPath: `/player/${encodeURIComponent(token)}` },
      {
        headers: {
          "Cache-Control": "no-store, private",
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Playback security is not configured" }, { status: 503 });
  }
}
