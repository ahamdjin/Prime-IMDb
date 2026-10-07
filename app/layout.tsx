import type { Metadata } from "next";
import Link from "next/link";
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
  description: "Browse movies and TV shows and discover what to watch.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = hasAuth ? <NextAuthProvider>{children}</NextAuthProvider> : children;

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-black text-white">
        {content}
        <footer className="stream-credit stream-credit-minimal">
          <Link href="/credits">Credits</Link>
        </footer>
      </body>
    </html>
  );
}
