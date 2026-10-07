"use client";

import { Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type PlayerEvent = {
  type?: string;
  data?: {
    player_status?: string;
    player_progress?: number;
    player_duration?: number;
  };
};

export default function EmbeddedPlayer({
  src,
  title,
  poster,
  mediaKey,
}: {
  src: string | null;
  title: string;
  poster: string;
  mediaKey: string;
}) {
  const [started, setStarted] = useState(false);
  const [playerSrc, setPlayerSrc] = useState<string | null>(null);

  const playerOrigin = useMemo(() => {
    if (!src) return null;
    try {
      return new URL(src).origin;
    } catch {
      return null;
    }
  }, [src]);

  useEffect(() => {
    if (!started || !playerOrigin) return;

    const onMessage = (event: MessageEvent<PlayerEvent>) => {
      if (event.origin !== playerOrigin) return;
      if (!event.data || event.data.type !== "PLAYER_EVENT") return;

      const status = event.data.data?.player_status;
      const progress = Number(event.data.data?.player_progress || 0);
      const duration = Number(event.data.data?.player_duration || 0);

      if (!Number.isFinite(progress) || progress < 0) return;

      if (status === "completed") {
        localStorage.removeItem(`watch-progress:${mediaKey}`);
        return;
      }

      if (["playing", "paused", "seeked"].includes(status || "")) {
        localStorage.setItem(
          `watch-progress:${mediaKey}`,
          JSON.stringify({ progress, duration, savedAt: Date.now() })
        );
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [started, mediaKey, playerOrigin]);

  function startPlayback() {
    if (!src) return;

    const url = new URL(src);
    const saved = localStorage.getItem(`watch-progress:${mediaKey}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { progress?: number };
        const progress = Number(parsed.progress || 0);
        if (Number.isFinite(progress) && progress > 10) {
          url.searchParams.set("resumeAt", String(Math.floor(progress)));
        }
      } catch {
        localStorage.removeItem(`watch-progress:${mediaKey}`);
      }
    }

    url.searchParams.set("autoplay", "1");
    setPlayerSrc(url.toString());
    setStarted(true);
  }

  if (!src) {
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
        aria-label={`Play ${title}`}
      >
        <span className="stream-player-start-icon"><Play size={34} fill="currentColor" /></span>
        <span>Play</span>
      </button>
    );
  }

  return (
    <iframe
      src={playerSrc}
      title={`${title} player`}
      sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
      allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
      referrerPolicy="no-referrer"
      allowFullScreen
    />
  );
}
