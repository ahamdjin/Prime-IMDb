import Link from "next/link";
import CatalogCard from "../components/CatalogCard";
import Navbar from "../components/Navbar";
import { hasAuth } from "../utlis/runtime";
import { browseMedia, getGenres } from "../utlis/tmdb";
import type { BrowseFilters } from "../utlis/tmdb";

export default async function BrowsePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const type: BrowseFilters["type"] = params.type === "movie" || params.type === "tv" ? params.type : "all";
  const sort: BrowseFilters["sort"] = params.sort === "top_rated" || params.sort === "newest" ? params.sort : "popular";
  const page = Math.max(1, Math.min(500, Number(params.page) || 1));
  const year = /^\d{4}$/.test(params.year || "") ? Number(params.year) : undefined;
  const allGenres = await getGenres();
  const names = [...new Set(allGenres.filter((item) => type === "all" || item.type === type).map((item) => item.name))].sort();
  const genre = names.includes(params.genre || "") ? params.genre || "" : "";
  const filters: BrowseFilters = { type, genre, sort, year, page };
  const data = await browseMedia(filters, allGenres);
  const title = type === "movie" ? "Movies" : type === "tv" ? "TV Shows" : "Browse";
  const makePageUrl = (number: number) => `/browse?${new URLSearchParams({ type, genre, sort, ...(year ? { year: String(year) } : {}), page: String(number) })}`;
  const years = Array.from({ length: new Date().getUTCFullYear() - 1899 }, (_, index) => new Date().getUTCFullYear() - index);
  return (
    <><Navbar authEnabled={hasAuth} /><main className="stream-catalog-page">
      <div className="stream-catalog-heading"><p className="stream-kicker">EXPLORE PRIME IMDb</p><h1>{title}</h1><p>Find something worth watching.</p></div>
      <form action="/browse" method="GET" className="stream-filter-bar" id="filters" aria-label="Browse filters">
        <label>Browse type<select name="type" defaultValue={type}><option value="all">Movies & TV</option><option value="movie">Movies</option><option value="tv">TV Shows</option></select></label>
        <label>Genre<select name="genre" defaultValue={genre}><option value="">All genres</option>{names.map((name) => <option key={name} value={name}>{name}</option>)}</select></label>
        <label>Year<select name="year" defaultValue={year || ""}><option value="">Any year</option>{years.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label>Sort by<select name="sort" defaultValue={sort}><option value="popular">Most popular</option><option value="top_rated">Top rated</option><option value="newest">Newest</option></select></label>
        <button type="submit">Apply filters</button>
        <Link href="/browse" className="stream-filter-reset">Reset</Link>
      </form>
      {data.source === "demo" && <p className="stream-demo-note">Preview catalog · More titles coming soon.</p>}
      {data.items.length ? <div className="stream-grid">{data.items.map((item) => <CatalogCard key={item.key} movie={item} poster />)}</div> : <p className="stream-empty">No titles match these filters.</p>}
      {data.totalPages > 1 && <nav className="stream-pagination" aria-label="Browse pages">{page > 1 && <Link href={makePageUrl(page - 1)}>← Previous</Link>}<span>Page {page} of {data.totalPages}</span>{page < data.totalPages && <Link href={makePageUrl(page + 1)}>Next →</Link>}</nav>}
    </main></>
  );
}
