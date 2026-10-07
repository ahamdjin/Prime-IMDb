import type { Metadata } from "next";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./stream.css";
import { NextAuthProvider } from "./components/NextAuthProvider";
import { hasAuth } from "./utlis/runtime";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prime IMDb | Movies & TV Shows",
  description:
    "Browse movies and TV shows and watch trailers on Prime IMDb.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-black text-white">
        {hasAuth ? <NextAuthProvider>{children}</NextAuthProvider> : children}
        <footer className="stream-credit"><a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer"><Image src="/tmdb-logo.svg" alt="TMDB" width={154} height={20} /></a><p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p></footer>
      </body>
    </html>
  );
}
