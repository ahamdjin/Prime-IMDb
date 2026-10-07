"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import type { MediaItem } from "../utlis/media-types";
import CatalogCard from "./CatalogCard";

export default function TitleRail({ title, movies, ranked = false }: { title: string; movies: MediaItem[]; ranked?: boolean }) {
  const rail = useRef<HTMLDivElement>(null);
  if (!movies.length) return null;
  const move = (direction: number) => rail.current?.scrollBy({ left: direction * rail.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <section className="stream-rail-section" aria-label={title}>
      <div className="stream-rail-heading"><h2>{title}</h2></div>
      <div className="stream-rail-wrap">
        <button onClick={() => move(-1)} className="stream-rail-arrow stream-rail-arrow-left" aria-label={`Scroll ${title} left`}><ChevronLeft size={28} /></button>
        <div ref={rail} className="stream-rail">{movies.map((movie, index) => <CatalogCard key={movie.key} movie={movie} rank={ranked ? index + 1 : undefined} />)}</div>
        <button onClick={() => move(1)} className="stream-rail-arrow stream-rail-arrow-right" aria-label={`Scroll ${title} right`}><ChevronRight size={28} /></button>
      </div>
    </section>
  );
}
