import { ArrowLeft, Play } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMediaItem } from "@/app/utlis/tmdb";
import TrailerButton from "@/app/components/TrailerButton";
import EmbeddedPlayer from "@/app/components/EmbeddedPlayer";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ season?: string; episode?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const title = await getMediaItem(id);
  return { title: title ? `${title.title} | Prime IMDb` : "Title not found | Prime IMDb" };
}

export default async function WatchPage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = await searchParams;
  const title = await getMediaItem(id);
  if (!title) notFound();

  const season = Math.max(1, Number(query.season) || 1);
  const episode = Math.max(1, Number(query.episode) || 1);
  return (
    <main className="stream-watch-page">
      <div className="stream-watch-top">
        <Link href="/home" className="stream-watch-back"><ArrowLeft size={20} /> Back to browsing</Link>
        <Link href="/home" className="stream-brand">PRIME<span>IMDb</span></Link>
      </div>

      <div className="stream-player-shell">
        <div className="stream-player-frame">
          <EmbeddedPlayer
            imdbId={title.imdbId}
            mediaType={title.mediaType}
            season={season}
            episode={episode}
            title={title.title}
            poster={title.backdrop || title.poster}
            mediaKey={title.imdbId || title.key}
          />
        </div>

        <div className="stream-watch-details">
          <div>
            <p className="stream-kicker"><Play size={13} fill="currentColor" /> {title.imdbId ? "READY TO PLAY" : "TITLE DETAILS"}</p>
            <h1>{title.title}</h1>
            <p className="stream-watch-meta">
              {title.year || "Year unavailable"} <span>·</span> {title.mediaType === "tv" ? `Series · S${season} E${episode}` : "Movie"}
              {title.rating > 0 && <><span>·</span> ★ {title.rating.toFixed(1)}</>}
            </p>

            <div className="stream-watch-actions">
              <TrailerButton trailerUrl={title.trailer} title={title.title} />
            </div>

            <p className="stream-watch-overview">{title.overview}</p>
          </div>

          <div className="stream-watch-next">
            <span>Explore more</span>
            <Link href={`/browse?type=${title.mediaType}`}>Browse {title.mediaType === "tv" ? "TV shows" : "movies"} →</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
