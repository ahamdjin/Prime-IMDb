"use client";

export default function ProviderPlayerFrame({ src, title = "Video player" }: { src: string; title?: string }) {
  return (
    <iframe
      src={src}
      title={title}
      allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
      referrerPolicy="strict-origin"
      allowFullScreen
      style={{ width: "100%", height: "100%", border: 0 }}
    />
  );
}
