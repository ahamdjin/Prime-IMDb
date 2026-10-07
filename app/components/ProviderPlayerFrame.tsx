"use client";

export default function ProviderPlayerFrame({ src }: { src: string }) {
  return (
    <iframe
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
