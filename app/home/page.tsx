import HeroShowcase from "../components/HeroShowcase";
import TitleRail from "../components/TitleRail";
import { getHomeData } from "../utlis/tmdb";

export default async function HomePage() {
  const data = await getHomeData();
  return (
    <div className="stream-page">
      <HeroShowcase movies={data.featured} />
      <div className="stream-rows">
        {data.source === "demo" && <p className="stream-demo-note">Preview catalog · Add a TMDB credential in Vercel to load the full catalog.</p>}
        {data.rows.map((row) => <TitleRail key={row.title} title={row.title} movies={row.items} ranked={"ranked" in row && row.ranked} />)}
      </div>
    </div>
  );
}
