import { catalog } from "./catalog";
import type { Genre, MediaItem, MediaPage, MediaType } from "./media-types";

const BASE = "https://api.themoviedb.org/3";
export const tmdbConfigured = Boolean(process.env.TMDB_API_READ_TOKEN || process.env.TMDB_API_KEY);

const movieGenres: Genre[] = [
  [28, "Action"], [12, "Adventure"], [16, "Animation"], [35, "Comedy"], [80, "Crime"],
  [99, "Documentary"], [18, "Drama"], [10751, "Family"], [14, "Fantasy"], [36, "History"],
  [27, "Horror"], [10402, "Music"], [9648, "Mystery"], [10749, "Romance"],
  [878, "Science Fiction"], [53, "Thriller"], [10752, "War"], [37, "Western"],
].map(([id, name]) => ({ id: Number(id), name: String(name), type: "movie" as const }));
const tvGenres: Genre[] = [
  [10759, "Action & Adventure"], [16, "Animation"], [35, "Comedy"], [80, "Crime"],
  [99, "Documentary"], [18, "Drama"], [10751, "Family"], [10762, "Kids"],
  [9648, "Mystery"], [10764, "Reality"], [10765, "Sci-Fi & Fantasy"],
  [10766, "Soap"], [10767, "Talk"], [10768, "War & Politics"], [37, "Western"],
].map(([id, name]) => ({ id: Number(id), name: String(name), type: "tv" as const }));

const fallbackGenres: Record<number, number[]> = {
  0: [28, 18], 1: [80, 18, 9648], 2: [27, 53], 3: [80, 18], 4: [18],
  5: [18, 36], 6: [28, 53], 7: [16, 28, 12], 8: [16, 10751, 14],
  9: [80, 18, 9648], 10: [16, 35],
};

export const demoItems: MediaItem[] = catalog.map((movie) => ({
  key: String(movie.id), mediaType: movie.category === "show" ? "tv" : "movie",
  title: movie.title, overview: movie.overview, year: movie.release, rating: 0,
  poster: movie.imageString, backdrop: movie.imageString,
  genreIds: fallbackGenres[movie.id] ?? [], trailer: movie.youtubeString,
}));

export function imageUrl(path: string | null | undefined, size: "w500" | "w1280" = "w500") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : "";
}

type TmdbResult = {
  id: number; media_type?: "movie" | "tv" | "person"; title?: string; name?: string;
  overview?: string; release_date?: string; first_air_date?: string;
  poster_path?: string | null; backdrop_path?: string | null; genre_ids?: number[];
  vote_average?: number; videos?: { results?: Array<{ site: string; type: string; key: string; official?: boolean }> };
};
type TmdbList = { page: number; total_pages: number; results: TmdbResult[] };

async function request<T>(path: string, params: Record<string, string | number | undefined> = {}, revalidate = 900): Promise<T> {
  const url = new URL(BASE + path);
  url.searchParams.set("language", "en-US");
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  const token = process.env.TMDB_API_READ_TOKEN;
  const key = process.env.TMDB_API_KEY;
  if (!token && !key) throw new Error("TMDB credential is not configured");
  if (!token && key) url.searchParams.set("api_key", key);
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}`, accept: "application/json" } : { accept: "application/json" },
    next: { revalidate },
  });
  if (!response.ok) throw new Error(`TMDB request failed (${response.status}) for ${path}`);
  return response.json() as Promise<T>;
}

function normalize(result: TmdbResult, kind?: MediaType): MediaItem | null {
  const mediaType = kind ?? (result.media_type === "tv" ? "tv" : result.media_type === "movie" ? "movie" : undefined);
  if (!mediaType || !(result.backdrop_path || result.poster_path)) return null;
  const trailers = result.videos?.results ?? [];
  const trailer = trailers.find((video) => video.site === "YouTube" && video.type === "Trailer" && video.official)
    ?? trailers.find((video) => video.site === "YouTube" && video.type === "Trailer")
    ?? trailers.find((video) => video.site === "YouTube" && video.type === "Teaser");
  return {
    key: `${mediaType}-${result.id}`, tmdbId: result.id, mediaType,
    title: result.title || result.name || "Untitled", overview: result.overview || "Description unavailable.",
    year: Number((result.release_date || result.first_air_date || "").slice(0, 4)) || 0,
    rating: Number(result.vote_average || 0),
    poster: imageUrl(result.poster_path || result.backdrop_path),
    backdrop: imageUrl(result.backdrop_path || result.poster_path, "w1280"),
    genreIds: result.genre_ids || [],
    trailer: trailer ? `https://www.youtube.com/embed/${trailer.key}` : undefined,
  };
}

function toItems(results: TmdbResult[], type?: MediaType) {
  return results.map((result) => normalize(result, type)).filter((item): item is MediaItem => Boolean(item));
}

export async function getHomeData() {
  if (!tmdbConfigured) return getDemoHomeData();
  try {
    const paths: Array<[string, MediaType | undefined]> = [
      ["/trending/all/week", undefined], ["/movie/popular", "movie"], ["/tv/popular", "tv"],
      ["/movie/top_rated", "movie"], ["/tv/top_rated", "tv"], ["/movie/now_playing", "movie"],
    ];
    const lists = await Promise.all(paths.map(([path]) => request<TmdbList>(path)));
    const items = lists.map((list, index) => toItems(list.results, paths[index][1]));
    return { source: "tmdb" as const, featured: items[0].filter((item) => item.backdrop).slice(0, 6), rows: [
      { title: "Top 10 Popular Movies", items: items[1].slice(0, 10), ranked: true },
      { title: "Trending This Week", items: items[0] },
      { title: "Popular Movies", items: items[1] },
      { title: "Popular TV Shows", items: items[2] },
      { title: "Top Rated Movies", items: items[3] },
      { title: "Top Rated TV Shows", items: items[4] },
      { title: "Now Playing", items: items[5] },
    ] };
  } catch (error) {
    console.error("TMDB home data unavailable:", error);
    return getDemoHomeData();
  }
}

function getDemoHomeData() {
  return { source: "demo" as const, featured: demoItems.slice(0, 5), rows: [
    { title: "Movies", items: demoItems.filter((item) => item.mediaType === "movie"), ranked: false },
    { title: "Trending Now", items: [...demoItems].reverse() },
    { title: "Movies", items: demoItems.filter((item) => item.mediaType === "movie") },
    { title: "TV Shows", items: demoItems.filter((item) => item.mediaType === "tv") },
  ] };
}

export async function getGenres(): Promise<Genre[]> {
  if (!tmdbConfigured) return [...movieGenres, ...tvGenres];
  try {
    const [movies, shows] = await Promise.all([
      request<{ genres: Array<{ id: number; name: string }> }>("/genre/movie/list", {}, 86400),
      request<{ genres: Array<{ id: number; name: string }> }>("/genre/tv/list", {}, 86400),
    ]);
    return [...movies.genres.map((item) => ({ ...item, type: "movie" as const })), ...shows.genres.map((item) => ({ ...item, type: "tv" as const }))];
  } catch (error) {
    console.error("TMDB genres unavailable:", error);
    return [...movieGenres, ...tvGenres];
  }
}

export type BrowseFilters = { type: "all" | MediaType; genre: string; sort: "popular" | "top_rated" | "newest"; year?: number; page: number };
function browseDemo(filters: BrowseFilters, genres: Genre[]): MediaPage {
    const filtered = demoItems.filter((item) =>
      (filters.type === "all" || item.mediaType === filters.type) &&
      (!filters.genre || genres.some((genre) => genre.name === filters.genre && genre.type === item.mediaType && item.genreIds.includes(genre.id))) &&
      (!filters.year || item.year === filters.year));
    filtered.sort((a, b) => filters.sort === "newest" ? b.year - a.year : filters.sort === "top_rated" ? b.rating - a.rating : 0);
    return { items: filtered, page: 1, totalPages: 1, source: "demo" };
}
export async function browseMedia(filters: BrowseFilters, genres: Genre[]): Promise<MediaPage> {
  if (!tmdbConfigured) return browseDemo(filters, genres);
  try {
    const types: MediaType[] = filters.type === "all" ? ["movie", "tv"] : [filters.type];
    const results = await Promise.all(types.map(async (type) => {
      const genre = filters.genre ? genres.find((item) => item.name === filters.genre && item.type === type) : undefined;
      if (filters.genre && !genre) return { items: [] as MediaItem[], totalPages: 0 };
      const sort = filters.sort === "top_rated" ? "vote_average.desc" : filters.sort === "newest"
        ? type === "movie" ? "primary_release_date.desc" : "first_air_date.desc" : "popularity.desc";
      const list = await request<TmdbList>(`/discover/${type}`, {
        page: filters.page, sort_by: sort, include_adult: "false", with_genres: genre?.id,
        "vote_count.gte": filters.sort === "top_rated" ? 200 : undefined,
        ...(filters.year ? { [type === "movie" ? "primary_release_year" : "first_air_date_year"]: filters.year } : {}),
        ...(filters.sort === "newest" ? { [type === "movie" ? "primary_release_date.lte" : "first_air_date.lte"]: new Date().toISOString().slice(0, 10) } : {}),
      });
      return { items: toItems(list.results, type), totalPages: list.total_pages };
    }));
    const combined = results.flatMap((result) => result.items);
    if (filters.type === "all") combined.sort((a, b) => filters.sort === "newest" ? b.year - a.year : filters.sort === "top_rated" ? b.rating - a.rating : 0);
    return { items: combined, page: filters.page, totalPages: Math.min(500, Math.max(...results.map((result) => result.totalPages), 1)), source: "tmdb" };
  } catch (error) {
    console.error("TMDB browse unavailable:", error);
    return browseDemo(filters, genres);
  }
}

export async function searchMedia(query: string, page = 1): Promise<MediaPage> {
  const term = query.trim().slice(0, 100);
  if (!term) return { items: [], page: 1, totalPages: 1, source: tmdbConfigured ? "tmdb" : "demo" };
  if (!tmdbConfigured) return { items: demoItems.filter((item) => `${item.title} ${item.overview}`.toLowerCase().includes(term.toLowerCase())), page: 1, totalPages: 1, source: "demo" };
  try {
    const list = await request<TmdbList>("/search/multi", { query: term, page, include_adult: "false" }, 300);
    return { items: toItems(list.results), page: list.page, totalPages: Math.min(500, list.total_pages), source: "tmdb" };
  } catch (error) {
    console.error("TMDB search unavailable:", error);
    return { items: demoItems.filter((item) => item.title.toLowerCase().includes(term.toLowerCase())), page: 1, totalPages: 1, source: "demo" };
  }
}

export async function getMediaItem(key: string): Promise<MediaItem | null> {
  const demo = demoItems.find((item) => item.key === key);
  if (demo) return demo;
  const match = /^(movie|tv)-(\d+)$/.exec(key);
  if (!match || !tmdbConfigured) return null;
  try {
    const result = await request<TmdbResult>(`/${match[1]}/${match[2]}`, { append_to_response: "videos" }, 3600);
    return normalize(result, match[1] as MediaType);
  } catch (error) {
    console.error("TMDB title unavailable:", error);
    return null;
  }
}
