import { ArrowLeft, Play } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { catalog } from "@/app/utlis/catalog";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const movie = catalog.find((item) => String(item.id) === id);
  return { title: movie ? `${movie.title} | Prime IMDb` : "Title not found | Prime IMDb" };
}

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movie = catalog.find((item) => String(item.id) === id);
  if (!movie) notFound();
  return (
    <main className="stream-watch-page">
      <div className="stream-watch-top"><Link href="/home" className="stream-watch-back"><ArrowLeft size={20} /> Back to browsing</Link><Link href="/home" className="stream-brand">PRIME<span>IMDb</span></Link></div>
      <div className="stream-player-shell">
        <div className="stream-player-frame"><iframe src={`${movie.youtubeString}?autoplay=1&rel=0`} title={`${movie.title} official trailer`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
        <div className="stream-watch-details"><div><p className="stream-kicker"><Play size={13} fill="currentColor" /> NOW PLAYING · TRAILER</p><h1>{movie.title}</h1><p className="stream-watch-meta">{movie.release} <span>·</span> {movie.category === "show" ? "Series" : "Movie"} <span>·</span> {movie.age}+ <span>·</span> HD</p><p className="stream-watch-overview">{movie.overview}</p></div><div className="stream-watch-next"><span>Up next</span><Link href={`/watch/${catalog[(catalog.findIndex((item) => item.id === movie.id) + 1) % catalog.length].id}`}>Watch another title →</Link></div></div>
      </div>
    </main>
  );
}
