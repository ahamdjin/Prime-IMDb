import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/home", "/browse", "/search"],
      disallow: [
        "/watch/",
        "/player/",
        "/api/playback/",
        "/api/access/",
      ],
    },
  };
}
