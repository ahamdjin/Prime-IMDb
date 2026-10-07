"use client";

import { ChevronLeft, ChevronRight, Info, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { CatalogMovie } from "../utlis/catalog";

export default function HeroShowcase({ movies }: { movies: CatalogMovie[] }) {
  const [index, setIndex] = useState(0);
  const movie = movies[index];
  const choose = (next: number) => setIndex((next + movies.length) % movies.length);
  return (
    <section className="stream-hero" aria-label="Featured titles">
      <div className="stream-hero-image" style={{ backgroundImage: `url("${movie.imageString}")` }} />
      <div className="stream-hero-grad" />
      <button className="stream-hero-arrow stream-hero-prev" onClick={() => choose(index - 1)} aria-label="Previous featured title"><ChevronLeft /></button>
      <button className="stream-hero-arrow stream-hero-next" onClick={() => choose(index + 1)} aria-label="Next featured title"><ChevronRight /></button>
      <div className="stream-hero-content" key={movie.id}>
        <p className="stream-eyebrow"><span className="stream-eyebrow-bar" /> PRIME <b>{movie.category === "show" ? "SERIES" : "FILM"}</b></p>
        <h1>{movie.title}</h1>
        <p className="stream-hero-meta"><span>{movie.release}</span><span>{movie.age}+</span><span>{movie.category === "show" ? "Series" : "Movie"}</span><span>HD</span></p>
        <p className="stream-hero-description">{movie.overview}</p>
        <div className="stream-hero-actions">
          <Link href={`/watch/${movie.id}`} target="_blank" rel="noopener noreferrer" className="stream-play-button"><Play size={21} fill="currentColor" /> Play trailer</Link>
          <Link href={`/watch/${movie.id}`} className="stream-info-button"><Info size={21} /> More Info</Link>
        </div>
      </div>
      <div className="stream-hero-dots">{movies.map((item, dot) => <button key={item.id} className={dot === index ? "active" : ""} onClick={() => choose(dot)} aria-label={`Feature ${item.title}`} />)}</div>
    </section>
  );
}
