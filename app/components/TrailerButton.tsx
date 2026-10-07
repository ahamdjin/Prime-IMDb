"use client";

import { useState } from "react";
import { PlayCircle, X } from "lucide-react";

export default function TrailerButton({
  trailerUrl,
  title,
}: {
  trailerUrl?: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  if (!trailerUrl) return null;

  return (
    <>
      <button type="button" className="stream-trailer-button" onClick={() => setOpen(true)}>
        <PlayCircle size={18} /> Watch trailer
      </button>
      {open && (
        <div className="stream-trailer-modal" role="dialog" aria-modal="true" aria-label={`${title} trailer`}>
          <button type="button" className="stream-trailer-close" onClick={() => setOpen(false)} aria-label="Close trailer">
            <X size={22} />
          </button>
          <div className="stream-trailer-video">
            <iframe
              src={`${trailerUrl}?autoplay=1&rel=0`}
              title={`${title} trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}
