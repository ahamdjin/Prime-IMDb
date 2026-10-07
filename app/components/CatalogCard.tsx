"use client";

import Link from "next/link";
import Image from "next/image";
import { Check, Play, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import type { MediaItem } from "../utlis/media-types";
import { readWatchlist, toggleWatchlist, WATCHLIST_EVENT } from "../utlis/watchlist";

export default function CatalogCard({ movie, rank, poster = false }: { movie: MediaItem; rank?: number; poster?: boolean }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const sync = () => setSaved(readWatchlist().some((item) => item.key === movie.key));
    sync();
    window.addEventListener(WATCHLIST_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(WATCHLIST_EVENT, sync); window.removeEventListener("storage", sync); };
  }, [movie.key]);
  return (
    <div className="stream-card">
      <Link className="stream-card-main" href={`/watch/${movie.key}`} target="_blank" rel="noopener noreferrer" aria-label={`Open ${movie.title} in a new tab`}>
        {rank && <span className="stream-rank">{rank}</span>}
        <Image src={(poster ? movie.poster : movie.backdrop) || movie.poster} alt={movie.title} width={poster ? 300 : 380} height={poster ? 450 : 215} className="stream-card-image" />
        <span className="stream-card-shade" />
        <span className="stream-card-play"><Play size={22} fill="currentColor" /></span>
        <span className="stream-card-info"><strong>{movie.title}</strong><small>{movie.year || "—"} · {movie.mediaType === "tv" ? "Series" : "Movie"}{movie.rating ? ` · ★ ${movie.rating.toFixed(1)}` : ""}</small></span>
      </Link>
      <button className="stream-save" onClick={() => { toggleWatchlist(movie); setSaved(!saved); }} aria-label={`${saved ? "Remove" : "Add"} ${movie.title} ${saved ? "from" : "to"} My List`} title={saved ? "Remove from My List" : "Add to My List"}>{saved ? <Check size={18} /> : <Plus size={18} />}</button>
    </div>
  );
}
