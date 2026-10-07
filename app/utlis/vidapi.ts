import type { MediaItem, MediaPage, MediaType } from "./media-types";

const VIDAPI_BASE = "https://vidapi.ru";
const AVAILABILITY_TTL_MS = 60 * 60 * 1000;

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

type AvailabilityCache = {
  expiresAt: number;
  movies: Set<number>;
  shows: Set<number>;
};

let availabilityCache: AvailabilityCache | null = null;
let availabilityPromise: Promise<AvailabilityCache> | null = null;

async function getText(path: string, revalidate = 86400) {
  const res = await fetch(`${VIDAPI_BASE}${path}`, {
    next: { revalidate },
    headers: { accept: "text/plain" },
  });
  if (!res.ok) throw new Error(`VidAPI request failed (${res.status}) for ${path}`);
  return res.text();
}

async function getJson<T>(path: string, revalidate = 900): Promise<T> {
  const res = await fetch(`${VIDAPI_BASE}${path}`, {
    next: { revalidate },
    headers: { accept: "application/json" },
  });
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

function parseIdList(text: string) {
  const ids = new Set<number>();
  for (const line of text.split(/\r?\n/)) {
    const value = Number(line.trim());
    if (Number.isFinite(value) && value > 0) ids.add(value);
  }
  return ids;
}

export async function getVidApiAvailability() {
  const now = Date.now();
  if (availabilityCache && availabilityCache.expiresAt > now) return availabilityCache;
  if (availabilityPromise) return availabilityPromise;

  availabilityPromise = (async () => {
    const [movieText, tvText] = await Promise.all([
      getText("/ids/movie_list_tmdb.txt", 86400),
      getText("/ids/tv_list_tmdb.txt", 86400),
    ]);

    const next = {
      expiresAt: Date.now() + AVAILABILITY_TTL_MS,
      movies: parseIdList(movieText),
      shows: parseIdList(tvText),
    };

    availabilityCache = next;
    availabilityPromise = null;
    return next;
  })().catch((error) => {
    availabilityPromise = null;
    throw error;
  });

  return availabilityPromise;
}

export function filterWithVidApiAvailability(
  items: MediaItem[],
  availability: { movies: Set<number>; shows: Set<number> }
) {
  return items.filter((item) => {
    if (!item.tmdbId) return false;
    return item.mediaType === "movie"
      ? availability.movies.has(item.tmdbId)
      : availability.shows.has(item.tmdbId);
  });
}

export async function filterToVidApiAvailable(items: MediaItem[]) {
  const availability = await getVidApiAvailability();
  return filterWithVidApiAvailability(items, availability);
}
