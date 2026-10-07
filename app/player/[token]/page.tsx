import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProviderPlayerFrame from "@/app/components/ProviderPlayerFrame";
import { verifyPlaybackToken } from "@/app/utlis/playback-session";
import { buildVideoEmbedUrl } from "@/app/utlis/player";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function SecurePlayerPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const payload = verifyPlaybackToken(decodeURIComponent(token));
  if (!payload) notFound();

  const src = buildVideoEmbedUrl({
    imdbId: payload.imdbId,
    mediaType: payload.mediaType,
    season: payload.season,
    episode: payload.episode,
    autoplay: true,
    resumeAt: payload.resumeAt,
  });

  if (!src) notFound();

  return (
    <main style={{ position: "fixed", inset: 0, background: "#000" }}>
      <ProviderPlayerFrame src={src} />
    </main>
  );
}
