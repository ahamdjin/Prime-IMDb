import type { NextConfig } from "next";

function safeEmbedOrigin() {
  try {
    return new URL(process.env.VIDEO_EMBED_BASE_URL || "https://vaplayer.ru").origin;
  } catch {
    return "https://vaplayer.ru";
  }
}

const embedOrigin = safeEmbedOrigin();

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https://image.tmdb.org https://challenges.cloudflare.com",
  "connect-src 'self' https://api.themoviedb.org https://vidapi.ru https://challenges.cloudflare.com",
  `frame-src 'self' ${embedOrigin} https://www.youtube.com https://www.youtube-nocookie.com https://challenges.cloudflare.com`,
  "media-src 'self' blob: https:",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        port: "",
        pathname: "/t/p/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/watch/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, private, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
      {
        source: "/player/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, private, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
      {
        source: "/api/playback/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, private, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
      {
        source: "/verify",
        headers: [
          { key: "Cache-Control", value: "no-store, private, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
      {
        source: "/api/access/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, private, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
    ];
  },
};

export default nextConfig;
