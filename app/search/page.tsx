import CatalogCard from "../components/CatalogCard";
import Navbar from "../components/Navbar";
import { catalog } from "../utlis/catalog";
import { hasAuth } from "../utlis/runtime";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim().slice(0, 100);
  const matches = query ? catalog.filter((movie) => `${movie.title} ${movie.overview} ${movie.category}`.toLowerCase().includes(query.toLowerCase())) : catalog;
  return (
    <>
      <Navbar authEnabled={hasAuth} />
      <main className="stream-catalog-page stream-search-page">
        <div className="stream-catalog-heading"><p className="stream-kicker">FIND SOMETHING TO WATCH</p><h1>{query ? `Results for “${query}”` : "Search"}</h1><p>{query ? `${matches.length} title${matches.length === 1 ? "" : "s"} found` : "Search from the top bar to find a movie or show."}</p></div>
        {matches.length ? <div className="stream-grid">{matches.map((movie) => <CatalogCard key={movie.id} movie={movie} />)}</div> : <p className="stream-empty">No titles found. Try another search.</p>}
      </main>
    </>
  );
}
