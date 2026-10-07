import type { MediaItem } from "./media-types";
import { catalog } from "./catalog";

export const WATCHLIST_KEY = "prime-imdb-watchlist";
export const WATCHLIST_EVENT = "prime-imdb-watchlist-change";

export function readWatchlist(): MediaItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(WATCHLIST_KEY) || "[]");
    if (!Array.isArray(stored)) return [];
    return stored.flatMap((item): MediaItem[] => {
      if (typeof item === "number") return catalog.filter((movie) => movie.id === item).map((movie) => ({
        key: String(movie.id), mediaType: movie.category === "show" ? "tv" as const : "movie" as const,
        title: movie.title, overview: movie.overview, year: movie.release, rating: 0,
        poster: movie.imageString, backdrop: movie.imageString, genreIds: [], trailer: movie.youtubeString,
      }));
      if (item && typeof item === "object" && typeof item.key === "string" && typeof item.title === "string") return [item as MediaItem];
      return [];
    });
  } catch { return []; }
}

export function toggleWatchlist(movie: MediaItem): MediaItem[] {
  const current = readWatchlist();
  const next = current.some((item) => item.key === movie.key) ? current.filter((item) => item.key !== movie.key) : [...current, movie];
  window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(WATCHLIST_EVENT));
  return next;
}
