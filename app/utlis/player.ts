import type { MediaType } from "./media-types";

const EMBED_BASE = (process.env.VIDEO_EMBED_BASE_URL || "https://vaplayer.ru").replace(/\/$/, "");

export function buildVideoEmbedUrl({
  imdbId,
  mediaType,
  season = 1,
  episode = 1,
  title,
  poster,
  autoplay = false,
  resumeAt = 0,
}: {
  imdbId?: string;
  mediaType: MediaType;
  season?: number;
  episode?: number;
  title?: string;
  poster?: string;
  autoplay?: boolean;
  resumeAt?: number;
}) {
  if (!imdbId || !/^tt\d+$/.test(imdbId)) return null;

  const base =
    mediaType === "tv"
      ? `${EMBED_BASE}/embed/tv/${imdbId}/${Math.max(1, season)}/${Math.max(1, episode)}`
      : `${EMBED_BASE}/embed/movie/${imdbId}`;

  const url = new URL(base);
  url.searchParams.set("autoplay", autoplay ? "1" : "0");
  if (resumeAt > 0) url.searchParams.set("resumeAt", String(Math.floor(resumeAt)));
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
