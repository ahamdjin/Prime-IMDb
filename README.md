# Prime IMDb

A Netflix-style movie and TV discovery site built with Next.js. Visitors can browse without signing in, search titles, filter by type, genre, year, and sort order, open a title's YouTube trailer when TMDB has one, and save titles to My List in their browser.

## TMDB setup

Add one of these environment variables on the server (Vercel Project Settings → Environment Variables → Production), then redeploy:

- `TMDB_API_READ_TOKEN`: TMDB **API Read Access Token** (recommended)
- `TMDB_API_KEY`: TMDB v3 API key

Do not use a `NEXT_PUBLIC_` prefix or put the key in client code. The app requests TMDB data from the Next.js server and builds image URLs from the returned poster/backdrop paths. If no credential is set or TMDB is unavailable, it displays the bundled 11-title preview catalog.

The home page uses TMDB trending, popular, top-rated, and now-playing lists. Browse uses TMDB Discover with type, genre, year, and sort filters. Search uses TMDB multi-search. Results are paginated so visitors can browse beyond the first page. The title page embeds an available YouTube trailer; TMDB data does not provide full movie or episode playback.

## Run locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`. To use the full catalog locally, add `TMDB_API_READ_TOKEN` or `TMDB_API_KEY` to `.env.local`.

Accounts remain optional. Without a database and sign-in provider, the Sign in page explains that login is unavailable. My List remains local to each browser.

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB. TMDB data and images are subject to [TMDB's terms](https://www.themoviedb.org/api-terms-of-use). The site displays TMDB's approved logo and attribution in its footer.
