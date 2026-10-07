"use client";

import { Search, X, Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { catalog } from "../utlis/catalog";

type NavItem = { label: string; href: string };
const navItems: NavItem[] = [
  { label: "Home", href: "/home" },
  { label: "Movies", href: "/home/movies" },
  { label: "TV Shows", href: "/home/tvshows" },
  { label: "New & Popular", href: "/home/recently" },
  { label: "My List", href: "/home/user/mylist" },
];

export default function Navbar({ authEnabled }: { authEnabled: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const matches = query.trim()
    ? catalog.filter((movie) => movie.title.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 5)
    : [];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setMenuOpen(false);
  }

  return (
    <>
      <header className={`stream-nav ${scrolled || pathname !== "/home" ? "stream-nav-solid" : ""}`}>
        <Link href="/home" className="stream-brand" aria-label="Prime IMDb home">PRIME<span>IMDb</span></Link>
        <nav className={`stream-nav-links ${menuOpen ? "stream-nav-links-open" : ""}`} aria-label="Main navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={pathname === item.href ? "active" : ""}>{item.label}</Link>
          ))}
        </nav>
        <div className="stream-nav-actions">
          <div className={`stream-search ${searchOpen ? "stream-search-open" : ""}`}>
            {searchOpen ? (
              <form onSubmit={submitSearch} className="stream-search-form" role="search">
                <Search size={19} aria-hidden="true" />
                <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Titles, movies, shows" aria-label="Search movies and shows" />
                <button type="button" onClick={() => { setSearchOpen(false); setQuery(""); }} aria-label="Close search"><X size={18} /></button>
                {query.trim() && (
                  <div className="stream-search-suggestions">
                    {matches.length ? matches.map((movie) => (
                      <Link key={movie.id} href={`/watch/${movie.id}`} target="_blank" rel="noopener noreferrer" onClick={() => setSearchOpen(false)}>
                        <Image src={movie.imageString} alt="" width={54} height={42} />
                        <span>{movie.title}<small>{movie.release} · {movie.category === "show" ? "Series" : "Movie"}</small></span>
                      </Link>
                    )) : <p>No titles found. Press Enter to view search.</p>}
                    <button type="submit" className="stream-see-results">See all results for “{query.trim()}”</button>
                  </div>
                )}
              </form>
            ) : <button className="stream-icon-button" onClick={() => setSearchOpen(true)} aria-label="Open search"><Search size={22} /></button>}
          </div>
          <Link href="/login" className="stream-sign-in">{authEnabled ? "Account" : "Sign in"}</Link>
          <button className="stream-icon-button stream-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu"><Menu size={22} /></button>
        </div>
      </header>
      <nav className="stream-mobile-nav" aria-label="Mobile navigation">
        <Link href="/home">Home</Link>
        <Link href="/home/movies">Movies</Link>
        <Link href="/home/tvshows">Series</Link>
        <Link href="/search">Search</Link>
      </nav>
    </>
  );
}
