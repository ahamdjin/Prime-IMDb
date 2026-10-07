"use client";

import Link from "next/link";
import Image from "next/image";
import { Check, Play, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import type { CatalogMovie } from "../utlis/catalog";
import { readWatchlist, toggleWatchlist, WATCHLIST_EVENT } from "../utlis/watchlist";

export default function CatalogCard({ movie, rank }: { movie: CatalogMovie; rank?: number }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const sync = () => setSaved(readWatchlist().includes(movie.id));
    sync();
    window.addEventListener(WATCHLIST_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(WATCHLIST_EVENT, sync); window.removeEventListener("storage", sync); };
  }, [movie.id]);
  return (
    <div className="stream-card">
      <Link className="stream-card-main" href={`/watch/${movie.id}`} target="_blank" rel="noopener noreferrer" aria-label={`Play ${movie.title} trailer in a new tab`}>
        {rank && <span className="stream-rank">{rank}</span>}
        <Image src={movie.imageString} alt={movie.title} width={380} height={215} className="stream-card-image" />
        <span className="stream-card-shade" />
        <span className="stream-card-play"><Play size={22} fill="currentColor" /></span>
        <span className="stream-card-info"><strong>{movie.title}</strong><small>{movie.release} · {movie.category === "show" ? "Series" : "Movie"}</small></span>
      </Link>
      <button className="stream-save" onClick={() => { toggleWatchlist(movie.id); setSaved(!saved); }} aria-label={`${saved ? "Remove" : "Add"} ${movie.title} ${saved ? "from" : "to"} My List`} title={saved ? "Remove from My List" : "Add to My List"}>{saved ? <Check size={18} /> : <Plus size={18} />}</button>
    </div>
  );
}
