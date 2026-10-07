"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CatalogCard from "@/app/components/CatalogCard";
import { catalog } from "@/app/utlis/catalog";
import { readWatchlist, WATCHLIST_EVENT } from "@/app/utlis/watchlist";

export default function MyList() {
  const [ids, setIds] = useState<number[]>([]);
  useEffect(() => {
    const sync = () => setIds(readWatchlist());
    sync();
    window.addEventListener(WATCHLIST_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(WATCHLIST_EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);
  const movies = catalog.filter((movie) => ids.includes(movie.id));
  return (
    <section className="stream-catalog-page">
      <div className="stream-catalog-heading"><p className="stream-kicker">YOUR PICKS</p><h1>My List</h1><p>Saved on this device. No account needed.</p></div>
      {movies.length ? <div className="stream-grid">{movies.map((movie) => <CatalogCard key={movie.id} movie={movie} />)}</div> : <div className="stream-list-empty"><h2>Your list is empty</h2><p>Save titles with the + button as you browse.</p><Link href="/home">Browse titles</Link></div>}
    </section>
  );
}
