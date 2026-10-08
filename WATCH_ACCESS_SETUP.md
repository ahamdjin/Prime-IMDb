# Protected watch access — activation checklist

The public movie catalog stays accessible. When a visitor opens a protected `/watch/...` URL without a valid verified session, they are sent to `/verify`. Cloudflare Turnstile runs there and the server validates its single-use token with Cloudflare Siteverify before issuing an HttpOnly signed cookie for two hours. The same access cookie is checked by both the watch page and playback-session/player routes.

## Before deploying to production

1. Create a **Managed** Cloudflare Turnstile widget at https://dash.cloudflare.com/ under Turnstile. Add every frontend hostname where visitors will access the site (for example `prime-im-db.vercel.app` and your final custom domain). The widget is configured to only appear when interaction is required.
2. In the Vercel project `prime-im-db`, add:
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: public Turnstile sitekey
   - `TURNSTILE_SECRET_KEY`: private Turnstile secret (Production only, or Preview with separate staging widget)
3. Retain a stable strong server secret in `PLAYBACK_SESSION_SECRET` or `NEXTAUTH_SECRET`. Do not prefix these server secrets with `NEXT_PUBLIC_`.
4. Redeploy and verify an unrecognized visitor reaches `/verify`, receives the signed `prime_watch_verified` cookie only after a successful challenge, and can then watch the title.
5. Verify `POST /api/access/session` **without** a Turnstile token returns 400; an invalid token returns 403; while not configured it returns 503.
6. Verify `/watch/...`, `/player/...` and `/api/playback/session` require a valid cookie; public `/home`, `/browse` and `/search` remain open.
7. Confirm `/verify`, `/watch/...`, and `/player/...` return `noindex` and `no-store` instructions.

The activation is intentionally **fail-closed** when Turnstile keys are missing: merge only after configuring both environment variables or playback will be blocked.

## Limitations

Turnstile is an abuse-detection tool, not human identity proof; bots can occasionally pass. A verified anonymous cookie is not a login account. Server-side protection applies only to your application endpoints, not to a third-party provider's own publicly accessible embed URL. Streaming rights and copyright responsibilities remain unchanged.
