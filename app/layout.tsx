import type { Metadata } from "next";
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
      </body>
    </html>
  );
}
