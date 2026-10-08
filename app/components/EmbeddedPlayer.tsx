"use client";

import { Play } from "lucide-react";
import { useState } from "react";
import ProviderPlayerFrame from "./ProviderPlayerFrame";

export default function EmbeddedPlayer({
  playerUrl,
  title,
  poster,
  mediaKey,
}: {
  playerUrl?: string;
  title: string;
  poster: string;
  mediaKey: string;
}) {
  const [playerSrc, setPlayerSrc] = useState<string | null>(null);

  function startPlayback() {
    if (!playerUrl) return;
    const url = new URL(playerUrl);
    try {
      const saved = localStorage.getItem(`watch-progress:${mediaKey}`);
      if (saved) {
        const parsed = JSON.parse(saved) as { progress?: number };
        const progress = Number(parsed.progress || 0);
        if (Number.isFinite(progress) && progress > 10) {
          url.searchParams.set("resumeAt", String(Math.floor(progress)));
        }
      }
    } catch {
      // Playback also works when browser storage is unavailable.
    }
    setPlayerSrc(url.toString());
  }

  if (!playerUrl) {
    return (
      <div
        className="stream-player-placeholder"
        style={{ backgroundImage: `linear-gradient(0deg, rgba(8,9,11,.96), rgba(0,0,0,.18)), url(${poster})` }}
      >
        <p>Full video player is unavailable for this title.</p>
      </div>
    );
  }

  if (!playerSrc) {
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

  return <ProviderPlayerFrame src={playerSrc} title={`${title} player`} />;
}
