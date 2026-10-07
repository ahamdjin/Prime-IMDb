"use client";

import { Play } from "lucide-react";
import { useState } from "react";

export default function EmbeddedPlayer({
  src,
  title,
  poster,
}: {
  src: string | null;
  title: string;
  poster: string;
}) {
  const [started, setStarted] = useState(false);

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

  if (!started) {
    return (
      <button
        type="button"
        className="stream-player-start"
        style={{ backgroundImage: `linear-gradient(0deg, rgba(8,9,11,.92), rgba(0,0,0,.16)), url(${poster})` }}
        onClick={() => setStarted(true)}
        aria-label={`Play ${title}`}
      >
        <span className="stream-player-start-icon"><Play size={34} fill="currentColor" /></span>
        <span>Play</span>
      </button>
    );
  }

  return (
    <iframe
      src={src}
      title={`${title} player`}
      allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
  );
}
