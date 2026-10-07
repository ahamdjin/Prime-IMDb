export type MediaType = "movie" | "tv";

export type MediaItem = {
  key: string;
  tmdbId?: number;
  mediaType: MediaType;
  title: string;
  overview: string;
  year: number;
  rating: number;
  poster: string;
  backdrop: string;
  genreIds: number[];
  trailer?: string;
};

export type Genre = { id: number; name: string; type: MediaType };
export type MediaPage = { items: MediaItem[]; page: number; totalPages: number; source: "tmdb" | "demo" };
