import type { MediaType } from "./media-types";

const EMBED_BASE = (process.env.VIDEO_EMBED_BASE_URL || "").replace(/\/$/, "");

export function buildVideoEmbedUrl({
  imdbId,
  mediaType,
  season = 1,
  episode = 1,
}: {
  imdbId?: string;
  mediaType: MediaType;
  season?: number;
  episode?: number;
}) {
  if (!EMBED_BASE || !imdbId || !/^tt\d+$/.test(imdbId)) return null;

  if (mediaType === "tv") {
    return `${EMBED_BASE}/embed/tv/${imdbId}/${Math.max(1, season)}/${Math.max(1, episode)}`;
  }

  return `${EMBED_BASE}/embed/movie/${imdbId}`;
}
