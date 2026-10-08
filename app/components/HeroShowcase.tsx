"use client";

import { ChevronLeft, ChevronRight, Info, Play } from "lucide-react";
import Link from "next/link";
import WatchLink from "./WatchLink";
import { useState } from "react";
import type { MediaItem } from "../utlis/media-types";

export default function HeroShowcase({ movies }: { movies: MediaItem[] }) {
  const [index, setIndex] = useState(0);
  if (!movies.length) return null;
  const movie = movies[index];
  const choose = (next: number) => setIndex((next + movies.length) % movies.length);
  return (
    <section className="stream-hero" aria-label="Featured titles">
      <div className="stream-hero-image" style={{ backgroundImage: `url("${movie.backdrop}")` }} />
      <div className="stream-hero-grad" />
      <button className="stream-hero-arrow stream-hero-prev" onClick={() => choose(index - 1)} aria-label="Previous featured title"><ChevronLeft /></button>
      <button className="stream-hero-arrow stream-hero-next" onClick={() => choose(index + 1)} aria-label="Next featured title"><ChevronRight /></button>
      <div className="stream-hero-content" key={movie.key}>
        <p className="stream-eyebrow"><span className="stream-eyebrow-bar" /> PRIME <b>{movie.mediaType === "tv" ? "SERIES" : "FILM"}</b></p>
        <h1>{movie.title}</h1>
        <p className="stream-hero-meta"><span>{movie.year || "New"}</span><span>{movie.mediaType === "tv" ? "Series" : "Movie"}</span>{movie.rating > 0 && <span>★ {movie.rating.toFixed(1)}</span>}<span>HD</span></p>
        <p className="stream-hero-description">{movie.overview}</p>
        <div className="stream-hero-actions">
          <WatchLink href={`/watch/${movie.key}`} className="stream-play-button"><Play size={21} fill="currentColor" /> View title</WatchLink>
          <WatchLink href={`/watch/${movie.key}`} className="stream-info-button"><Info size={21} /> More Info</WatchLink>
        </div>
      </div>
      <div className="stream-hero-dots">{movies.map((item, dot) => <button key={item.key} className={dot === index ? "active" : ""} onClick={() => choose(dot)} aria-label={`Feature ${item.title}`} />)}</div>
    </section>
  );
}
