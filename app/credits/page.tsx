import Link from "next/link";

export default function CreditsPage() {
  return (
    <main className="stream-credits-page">
      <Link href="/home" className="stream-watch-back">← Back home</Link>
      <h1>Credits</h1>
      <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
      <p>Streaming availability is provided by the configured video provider.</p>
      <p><a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">The Movie Database (TMDB)</a></p>
    </main>
  );
}
