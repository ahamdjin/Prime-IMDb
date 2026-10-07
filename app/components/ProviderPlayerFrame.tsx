"use client";

import { useEffect, useRef } from "react";

export default function ProviderPlayerFrame({ src }: { src: string }) {
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let tripped = false;

    const trip = () => {
      if (tripped) return;
      tripped = true;
      if (frameRef.current) frameRef.current.src = "about:blank";
      window.parent.postMessage({ type: "PLAYBACK_SECURITY_TRIP" }, "*");
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
        trip();
      }
    };

    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      trip();
    };

    const inspectViewport = () => {
      if (window.innerWidth < 900) return;
      const widthGap = Math.max(0, window.outerWidth - window.innerWidth);
      const heightGap = Math.max(0, window.outerHeight - window.innerHeight);
      if (widthGap > 180 || heightGap > 220) trip();
    };

    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("contextmenu", onContextMenu, true);
    const timer = window.setInterval(inspectViewport, 1200);
    inspectViewport();

    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("contextmenu", onContextMenu, true);
      window.clearInterval(timer);
    };
  }, []);

  return (
    <iframe
      ref={frameRef}
      src={src}
      title="Secure video player"
      sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
      allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
      referrerPolicy="no-referrer"
      allowFullScreen
      style={{ width: "100%", height: "100%", border: 0 }}
    />
  );
}
