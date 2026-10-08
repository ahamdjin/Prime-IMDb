import { ArrowLeft, Play } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getMediaItem } from "@/app/utlis/tmdb";
import TrailerButton from "@/app/components/TrailerButton";
import EmbeddedPlayer from "@/app/components/EmbeddedPlayer";
import { buildVideoEmbedUrl, episodeNumber } from "@/app/utlis/player";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { anonymousAccessCookie, verifyAnonymousAccessToken } from "@/app/utlis/access-session";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ season?: string; episode?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Watch | Prime IMDb",
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function WatchPage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = await searchParams;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(anonymousAccessCookie.name)?.value;
  if (!verifyAnonymousAccessToken(accessToken)) {
    const requested = new URLSearchParams();
    if (query.season && /^\\d{1,4}$/.test(query.season)) requested.set("season", query.season);
    if (query.episode && /^\\d{1,4}$/.test(query.episode)) requested.set("episode", query.episode);
    const target = `/watch/${encodeURIComponent(id)}${requested.size ? `?${requested}` : ""}`;
    redirect(`/verify?next=${encodeURIComponent(target)}`);
  }
  const title = await getMediaItem(id);
  if (!title) notFound();

  const season = episodeNumber(query.season, 999);
  const episode = episodeNumber(query.episode);
  return (
    <main className="stream-watch-page">
      <div className="stream-watch-top">
        <Link href="/home" className="stream-watch-back"><ArrowLeft size={20} /> Back to browsing</Link>
        <Link href="/home" className="stream-brand">PRIME<span>IMDb</span></Link>
      </div>

      <div className="stream-player-shell">
        <div className="stream-player-frame">
          <EmbeddedPlayer
            key={`${title.key}-${season}-${episode}`}
            playerUrl={buildVideoEmbedUrl({ imdbId: title.imdbId, mediaType: title.mediaType, season, episode, autoplay: true }) || undefined}
            title={title.title}
            poster={title.backdrop || title.poster}
            mediaKey={`${title.imdbId || title.key}${title.mediaType === "tv" ? `-${season}-${episode}` : ""}`}
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
