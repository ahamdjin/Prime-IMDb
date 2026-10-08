"use client";

import { Search, X, Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { MediaItem } from "../utlis/media-types";
import WatchLink from "./WatchLink";

type NavItem = { label: string; href: string };
const navItems: NavItem[] = [
  { label: "Home", href: "/home" },
  { label: "Movies", href: "/browse?type=movie" },
  { label: "TV Shows", href: "/browse?type=tv" },
  { label: "Browse", href: "/browse" },
  { label: "Genres", href: "/browse#filters" },
  { label: "My List", href: "/home/user/mylist" },
];

export default function Navbar({ authEnabled }: { authEnabled: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<MediaItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => { if (searchOpen) inputRef.current?.focus(); }, [searchOpen]);
  useEffect(() => {
    const value = query.trim();
    if (value.length < 2) { setMatches([]); return; }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/media/search?q=${encodeURIComponent(value)}`, { signal: controller.signal });
        const data = await response.json() as { items: MediaItem[] };
        setMatches(data.items);
      } catch { if (!controller.signal.aborted) setMatches([]); }
    }, 280);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setMenuOpen(false);
  }
  const active = (item: NavItem) => pathname === item.href || (item.label === "Browse" && pathname === "/browse");
  return (
    <>
      <header className={`stream-nav ${scrolled || pathname !== "/home" ? "stream-nav-solid" : ""}`}>
        <Link href="/home" className="stream-brand" aria-label="Prime IMDb home">PRIME<span>IMDb</span></Link>
        <nav className={`stream-nav-links ${menuOpen ? "stream-nav-links-open" : ""}`} aria-label="Main navigation">
          {navItems.map((item) => <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)} className={active(item) ? "active" : ""}>{item.label}</Link>)}
        </nav>
        <div className="stream-nav-actions">
          <div className={`stream-search ${searchOpen ? "stream-search-open" : ""}`}>
            {searchOpen ? (
              <form onSubmit={submitSearch} className="stream-search-form" role="search">
                <Search size={19} aria-hidden="true" />
                <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Titles, movies, shows" aria-label="Search movies and shows" />
                <button type="button" onClick={() => { setSearchOpen(false); setQuery(""); }} aria-label="Close search"><X size={18} /></button>
                {query.trim() && <div className="stream-search-suggestions">
                  {matches.length ? matches.map((movie) => <WatchLink key={movie.key} href={`/watch/${movie.key}`} onBeforeNavigate={() => setSearchOpen(false)}>
                    <Image src={movie.poster} alt="" width={54} height={42} />
                    <span>{movie.title}<small>{movie.year || "—"} · {movie.mediaType === "tv" ? "Series" : "Movie"}</small></span>
                  </WatchLink>) : <p>No matching titles yet. Press Enter for results.</p>}
                  <button type="submit" className="stream-see-results">See all results for “{query.trim()}”</button>
                </div>}
              </form>
            ) : <button className="stream-icon-button" onClick={() => setSearchOpen(true)} aria-label="Open search"><Search size={22} /></button>}
          </div>
          <Link href="/login" className="stream-sign-in">{authEnabled ? "Account" : "Sign in"}</Link>
          <button className="stream-icon-button stream-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu"><Menu size={22} /></button>
        </div>
      </header>
      <nav className="stream-mobile-nav" aria-label="Mobile navigation"><Link href="/home">Home</Link><Link href="/browse?type=movie">Movies</Link><Link href="/browse?type=tv">Series</Link><Link href="/browse">Browse</Link><Link href="/search">Search</Link></nav>
    </>
  );
}
