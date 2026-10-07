"use client";

import { Play } from "lucide-react";
import { useState } from "react";
import type { MediaType } from "../utlis/media-types";

export default function EmbeddedPlayer({
  imdbId,
  mediaType,
  season,
  episode,
  title,
  poster,
  mediaKey,
}: {
  imdbId?: string;
  mediaType: MediaType;
  season: number;
  episode: number;
  title: string;
  poster: string;
  mediaKey: string;
}) {
  const [started, setStarted] = useState(false);
  const [playerSrc, setPlayerSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function startPlayback() {
    if (!imdbId || loading) return;
    setError(null);

    let resumeAt = 0;
    try {
      const saved = localStorage.getItem(`watch-progress:${mediaKey}`);
      if (saved) {
        const parsed = JSON.parse(saved) as { progress?: number };
        const progress = Number(parsed.progress || 0);
        if (Number.isFinite(progress) && progress > 10) resumeAt = Math.floor(progress);
      }
    } catch {
      // Playback also works when browser storage is unavailable.
    }

    setLoading(true);
    try {
      const response = await fetch("/api/playback/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "PrimeIMDbPlayer",
        },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({
          imdbId,
          mediaType,
          season,
          episode,
          resumeAt,
        }),
      });

      if (!response.ok) throw new Error("Playback session rejected");
      const data = await response.json() as { playerPath?: string };
      if (!data.playerPath?.startsWith("/player/")) throw new Error("Invalid player session");

      setPlayerSrc(data.playerPath);
      setStarted(true);
    } catch {
      setPlayerSrc(null);
      setStarted(false);
      setError("Playback could not start. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!imdbId) {
    return (
      <div
        className="stream-player-placeholder"
        style={{ backgroundImage: `linear-gradient(0deg, rgba(8,9,11,.96), rgba(0,0,0,.18)), url(${poster})` }}
      >
        <p>Full video player is unavailable for this title.</p>
      </div>
    );
  }

  if (!started || !playerSrc) {
    return (
      <button
        type="button"
        className="stream-player-start"
        style={{ backgroundImage: `linear-gradient(0deg, rgba(8,9,11,.92), rgba(0,0,0,.16)), url(${poster})` }}
        onClick={startPlayback}
        disabled={loading}
        aria-label={`Play ${title}`}
      >
        <span className="stream-player-start-icon"><Play size={34} fill="currentColor" /></span>
        <span>{loading ? "Loading player…" : error ? "Try again" : "Play"}</span>
        {error && <span role="alert">{error}</span>}
      </button>
    );
  }

  return (
    <iframe
      src={playerSrc}
      title={`${title} secure player`}
      sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
      allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
      referrerPolicy="no-referrer"
      allowFullScreen
    />
  );
}
