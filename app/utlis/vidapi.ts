import type { MediaItem, MediaPage, MediaType } from "./media-types";

const VIDAPI_BASE = "https://vidapi.ru";

type VidApiItem = {
  tmdb_id?: string;
  imdb_id?: string;
  title?: string;
  year?: string;
  poster_url?: string;
  rating?: string;
  genre?: string;
  popularity?: string;
  type?: "movie" | "tv";
  embed_url?: string;
};

type VidApiPage = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  items: VidApiItem[];
};

async function getText(path: string, revalidate = 86400) {
  const res = await fetch(`${VIDAPI_BASE}${path}`, { next: { revalidate } });
  if (!res.ok) throw new Error(`VidAPI request failed (${res.status}) for ${path}`);
  return res.text();
}

async function getJson<T>(path: string, revalidate = 900): Promise<T> {
  const res = await fetch(`${VIDAPI_BASE}${path}`, { next: { revalidate } });
  if (!res.ok) throw new Error(`VidAPI request failed (${res.status}) for ${path}`);
  return res.json() as Promise<T>;
}

function normalize(item: VidApiItem, type: MediaType): MediaItem | null {
  const tmdbId = Number(item.tmdb_id || 0) || undefined;
  const imdbId = item.imdb_id || undefined;
  const title = item.title?.trim();
  if (!title || (!tmdbId && !imdbId)) return null;

  const poster = item.poster_url || "";
  return {
    key: `${type}-${tmdbId || imdbId}`,
    tmdbId,
    imdbId,
    mediaType: type,
    title,
    overview: "Available to watch.",
    year: Number(item.year || 0) || 0,
    rating: Number(item.rating || 0) || 0,
    poster,
    backdrop: poster,
    genreIds: [],
  };
}

export async function getVidApiLatest(type: MediaType, page = 1): Promise<MediaPage> {
  const safePage = Math.max(1, Math.min(500, page));
  const path = type === "movie"
    ? `/movies/latest/page-${safePage}.json`
    : `/tvshows/latest/page-${safePage}.json`;

  const data = await getJson<VidApiPage>(path, 600);
  const items = data.items
    .map((item) => normalize(item, type))
    .filter((item): item is MediaItem => Boolean(item));

  return {
    items,
    page: data.page,
    totalPages: Math.min(500, data.total_pages),
    source: "vidapi",
  };
}

export async function getVidApiAvailableTmdbIds(type: MediaType): Promise<Set<number>> {
  const file = type === "movie" ? "/ids/movie_list_tmdb.txt" : "/ids/tv_list_tmdb.txt";
  const text = await getText(file, 86400);
  return new Set(
    text
      .split(/\r?\n/)
      .map((line) => Number(line.trim()))
      .filter((id) => Number.isFinite(id) && id > 0)
  );
}

export async function filterToVidApiAvailable(items: MediaItem[]) {
  const [movies, shows] = await Promise.all([
    getVidApiAvailableTmdbIds("movie"),
    getVidApiAvailableTmdbIds("tv"),
  ]);

  return items.filter((item) => {
    if (!item.tmdbId) return false;
    return item.mediaType === "movie" ? movies.has(item.tmdbId) : shows.has(item.tmdbId);
  });
}
