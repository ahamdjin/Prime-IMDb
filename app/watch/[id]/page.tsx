import { ArrowLeft, Play } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMediaItem } from "@/app/utlis/tmdb";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const title = await getMediaItem(id);
  return { title: title ? `${title.title} | Prime IMDb` : "Title not found | Prime IMDb" };
}

export default async function WatchPage({ params }: Props) {
  const { id } = await params;
  const title = await getMediaItem(id);
  if (!title) notFound();
  return (
    <main className="stream-watch-page">
      <div className="stream-watch-top"><Link href="/home" className="stream-watch-back"><ArrowLeft size={20} /> Back to browsing</Link><Link href="/home" className="stream-brand">PRIME<span>IMDb</span></Link></div>
      <div className="stream-player-shell">
        <div className="stream-player-frame">
          {title.trailer ? <iframe src={`${title.trailer}?autoplay=1&rel=0`} title={`${title.title} trailer`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /> : <div className="stream-trailer-empty" style={{ backgroundImage: `linear-gradient(0deg, #08090b, rgba(0,0,0,.3)), url(${title.backdrop})` }}><p>Trailer unavailable for this title</p></div>}
        </div>
        <div className="stream-watch-details"><div><p className="stream-kicker"><Play size={13} fill="currentColor" /> {title.trailer ? "OFFICIAL TRAILER" : "TITLE DETAILS"}</p><h1>{title.title}</h1><p className="stream-watch-meta">{title.year || "Year unavailable"} <span>·</span> {title.mediaType === "tv" ? "Series" : "Movie"} {title.rating > 0 && <><span>·</span> ★ {title.rating.toFixed(1)}</>}</p><p className="stream-watch-overview">{title.overview}</p>{title.tmdbId && <a className="stream-tmdb-title-link" href={`https://www.themoviedb.org/${title.mediaType}/${title.tmdbId}`} target="_blank" rel="noopener noreferrer">View on TMDB ↗</a>}</div><div className="stream-watch-next"><span>Explore more</span><Link href={`/browse?type=${title.mediaType}`}>Browse {title.mediaType === "tv" ? "TV shows" : "movies"} →</Link></div></div>
      </div>
    </main>
  );
}
