import { NextResponse } from "next/server";
import { searchMedia } from "@/app/utlis/tmdb";

export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") || "").trim().slice(0, 100);
  if (q.length < 2) return NextResponse.json({ items: [] });

  const data = await searchMedia(q, 1);
  return NextResponse.json(
    { items: data.items.slice(0, 6) },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
