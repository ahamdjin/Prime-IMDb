import HeroShowcase from "../components/HeroShowcase";
import TitleRail from "../components/TitleRail";
import { catalog } from "../utlis/catalog";

export default function HomePage() {
  const featured = [catalog[0], catalog[7], catalog[3], catalog[4], catalog[5]];
  return (
    <div className="stream-page">
      <HeroShowcase movies={featured} />
      <div className="stream-rows">
        <TitleRail title="Top 10 Today" movies={catalog.slice(0, 10)} ranked />
        <TitleRail title="Trending Now" movies={[...catalog].reverse()} />
        <TitleRail title="Movies" movies={catalog.filter((movie) => movie.category === "movie" || movie.category === "recent")} />
        <TitleRail title="Series" movies={catalog.filter((movie) => movie.category === "show")} />
      </div>
    </div>
  );
}
