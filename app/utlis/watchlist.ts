export const WATCHLIST_KEY = "prime-imdb-watchlist";
export const WATCHLIST_EVENT = "prime-imdb-watchlist-change";

export function readWatchlist(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const ids = JSON.parse(window.localStorage.getItem(WATCHLIST_KEY) || "[]");
    return Array.isArray(ids) ? ids.filter((id): id is number => Number.isInteger(id)) : [];
  } catch {
    return [];
  }
}

export function toggleWatchlist(id: number): number[] {
  const current = readWatchlist();
  const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(WATCHLIST_EVENT));
  return next;
}
