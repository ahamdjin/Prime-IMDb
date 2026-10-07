import CatalogCard from "@/app/components/CatalogCard";
import { catalog } from "@/app/utlis/catalog";
import { notFound } from "next/navigation";

const categories: Record<string, { title: string; category: string | null; subtitle: string }> = {
  movies: { title: "Movies", category: "movie", subtitle: "Stories for movie night." },
  tvshows: { title: "TV Shows", category: "show", subtitle: "Series worth staying in for." },
  recently: { title: "New & Popular", category: null, subtitle: "A little of everything, all in one place." },
};

export default async function CategoryPage({ params }: { params: Promise<{ genre: string }> }) {
  const { genre } = await params;
  const category = categories[genre];
  if (!category) notFound();
  const movies = category.category
    ? catalog.filter((movie) => movie.category === category.category)
    : [...catalog].reverse();

  return (
    <section className="stream-catalog-page">
      <div className="stream-catalog-heading"><p className="stream-kicker">EXPLORE PRIME IMDb</p><h1>{category.title}</h1><p>{category.subtitle}</p></div>
      <div className="stream-grid">{movies.map((movie) => <CatalogCard key={movie.id} movie={movie} />)}</div>
    </section>
  );
}
