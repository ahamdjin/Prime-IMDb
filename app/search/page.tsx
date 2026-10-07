import Link from "next/link";
import CatalogCard from "../components/CatalogCard";
import Navbar from "../components/Navbar";
import { hasAuth } from "../utlis/runtime";
import { searchMedia } from "../utlis/tmdb";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const { q = "", page: requestedPage } = await searchParams;
  const query = q.trim().slice(0, 100);
  const page = Math.max(1, Math.min(500, Number(requestedPage) || 1));
  const data = await searchMedia(query, page);
  const pageUrl = (number: number) => `/search?q=${encodeURIComponent(query)}&page=${number}`;
  return (
    <><Navbar authEnabled={hasAuth} /><main className="stream-catalog-page stream-search-page">
      <div className="stream-catalog-heading"><p className="stream-kicker">FIND SOMETHING TO WATCH</p><h1>{query ? `Results for “${query}”` : "Search"}</h1><p>{query ? `${data.items.length} title${data.items.length === 1 ? "" : "s"} on this page` : "Use the search button above to find a movie or show."}</p></div>
      {data.source === "demo" && query && <p className="stream-demo-note">Searching the preview catalog.</p>}
      {data.items.length ? <div className="stream-grid">{data.items.map((movie) => <CatalogCard key={movie.key} movie={movie} poster />)}</div> : query && <p className="stream-empty">No titles found. Try another search.</p>}
      {data.totalPages > 1 && <nav className="stream-pagination" aria-label="Search pages">{page > 1 && <Link href={pageUrl(page - 1)}>← Previous</Link>}<span>Page {page} of {data.totalPages}</span>{page < data.totalPages && <Link href={pageUrl(page + 1)}>Next →</Link>}</nav>}
    </main></>
  );
}
