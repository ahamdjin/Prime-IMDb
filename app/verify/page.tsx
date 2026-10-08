import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TurnstileAccessGate from "@/app/components/TurnstileAccessGate";
import { anonymousAccessCookie, verifyAnonymousAccessToken } from "@/app/utlis/access-session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Verify access | Prime IMDb",
  robots: { index: false, follow: false, nocache: true },
};

function safeDestination(target?: string) {
  if (!target || !target.startsWith("/watch/") || target.startsWith("//") || target.includes("\\")) {
    return "/home";
  }
  try {
    const parsed = new URL(target, "https://prime.local");
    if (parsed.origin !== "https://prime.local" || !/^\/watch\/(?:movie-|tv-)?\d+$/.test(parsed.pathname)) {
      return "/home";
    }
    const query = new URLSearchParams();
    for (const field of ["season", "episode"]) {
      const value = parsed.searchParams.get(field);
      if (value && /^\d{1,4}$/.test(value)) query.set(field, value);
    }
    return parsed.pathname + (query.size ? `?${query}` : "");
  } catch {
    return "/home";
  }
}

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const destination = safeDestination(next);
  const cookieStore = await cookies();
  if (verifyAnonymousAccessToken(cookieStore.get(anonymousAccessCookie.name)?.value)) {
    redirect(destination);
  }

  return (
    <main className="stream-credits-page">
      <Link href="/home" className="stream-watch-back">← Back to browsing</Link>
      <h1>Verify your visit</h1>
      <p>One quick browser check is required before using the player. No account is needed.</p>
      <TurnstileAccessGate
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
        destination={destination}
      />
    </main>
  );
}
