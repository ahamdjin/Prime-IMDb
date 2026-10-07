import type { MediaType } from "./media-types";

const EMBED_BASE = (process.env.VIDEO_EMBED_BASE_URL || "https://vaplayer.ru").replace(/\/$/, "");

export function buildVideoEmbedUrl({
  imdbId,
  mediaType,
  season = 1,
  episode = 1,
  title,
  poster,
}: {
  imdbId?: string;
  mediaType: MediaType;
  season?: number;
  episode?: number;
  title?: string;
  poster?: string;
}) {
  if (!imdbId || !/^tt\d+$/.test(imdbId)) return null;

  const base =
    mediaType === "tv"
      ? `${EMBED_BASE}/embed/tv/${imdbId}/${Math.max(1, season)}/${Math.max(1, episode)}`
      : `${EMBED_BASE}/embed/movie/${imdbId}`;

  const url = new URL(base);
  url.searchParams.set("autoplay", "0");
  if (title) url.searchParams.set("title", title);
  if (poster) url.searchParams.set("poster", poster);
  return url.toString();
}

export function getConfiguredEmbedOrigin() {
  try {
    return new URL(EMBED_BASE).origin;
  } catch {
    return "https://vaplayer.ru";
  }
}
