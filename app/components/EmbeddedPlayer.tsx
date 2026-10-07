"use client";

import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [started, setStarted] = useState(false);
  const [playerSrc, setPlayerSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const securityTrip = () => {
    if (frameRef.current) frameRef.current.src = "about:blank";
    setPlayerSrc(null);
    setStarted(false);
    router.replace("/home");
  };

  useEffect(() => {
    if (!started) return;

    const onMessage = (event: MessageEvent<{ type?: string }>) => {
      if (event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.type === "PLAYBACK_SECURITY_TRIP") securityTrip();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const ctrlOrMeta = event.ctrlKey || event.metaKey;
      if (
        event.key === "F12" ||
        (ctrlOrMeta && event.shiftKey && ["i", "j", "c"].includes(key)) ||
        (ctrlOrMeta && key === "u")
      ) {
        event.preventDefault();
        event.stopPropagation();
        securityTrip();
      }
    };

    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      securityTrip();
    };

    const inspectViewport = () => {
      if (window.innerWidth < 900) return;
      const widthGap = Math.max(0, window.outerWidth - window.innerWidth);
      const heightGap = Math.max(0, window.outerHeight - window.innerHeight);
      if (widthGap > 180 || heightGap > 220) securityTrip();
    };

    window.addEventListener("message", onMessage);
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("contextmenu", onContextMenu, true);
    const timer = window.setInterval(inspectViewport, 1200);
    inspectViewport();

    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("contextmenu", onContextMenu, true);
      window.clearInterval(timer);
    };
  }, [started]);

  async function startPlayback() {
    if (!imdbId || loading) return;

    if (window.innerWidth >= 900) {
      const widthGap = Math.max(0, window.outerWidth - window.innerWidth);
      const heightGap = Math.max(0, window.outerHeight - window.innerHeight);
      if (widthGap > 180 || heightGap > 220) {
        securityTrip();
        return;
      }
    }

    let resumeAt = 0;
    const saved = localStorage.getItem(`watch-progress:${mediaKey}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { progress?: number };
        const progress = Number(parsed.progress || 0);
        if (Number.isFinite(progress) && progress > 10) resumeAt = Math.floor(progress);
      } catch {
        localStorage.removeItem(`watch-progress:${mediaKey}`);
      }
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
        <span>{loading ? "Securing playback…" : "Play"}</span>
      </button>
    );
  }

  return (
    <iframe
      ref={frameRef}
      src={playerSrc}
      title={`${title} secure player`}
      sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
      allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
      referrerPolicy="no-referrer"
      allowFullScreen
    />
  );
}
