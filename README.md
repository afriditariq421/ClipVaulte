# ClipVault

A video-saving web app for **public** YouTube, TikTok and Instagram links. Next.js (App Router) + TypeScript + Tailwind, provider/adapter backend, job queue (memory or Postgres), rate limiting (memory or Upstash), strict URL allowlisting.

Rebrand: set `NEXT_PUBLIC_SITE_NAME` and edit `lib/site.ts`.

## Legal & platform risk (read first)
- Official APIs (YouTube Data API, TikTok/Instagram oEmbed) give **metadata only, not files**. Without an extractor the app shows details and says downloads are disabled. It never fakes a result.
- File downloads use the open-source **yt-dlp** binary, **off by default** (`YTDLP_ENABLED=false`). Saving videos from these platforms can violate their terms of service and, for others' content, copyright law. You, the operator, carry that risk. Platforms also break extractors and block datacenter IPs regularly; expect maintenance (keep yt-dlp updated).
- The app never uses cookies/credentials, so private, login-gated and DRM content is out of reach by design.
- Privacy/Terms/AUP pages are drafts. Have a lawyer review them.

## Quick start
```bash
npm install
cp .env.example .env          # then edit
npm run dev                   # http://localhost:3000
```
Without any config you get the full UI, validation, metadata via oEmbed (YouTube/TikTok; Instagram needs `INSTAGRAM_OEMBED_TOKEN`), in-memory jobs and rate limits.

### Enable downloads
```bash
pip install -U yt-dlp   # or download the binary; must be on PATH or set YTDLP_PATH
# .env: YTDLP_ENABLED=true
```
yt-dlp only needs `ffmpeg` if you later add merged formats; this app lists progressive (single-file) formats only.

### Database (optional, required for a separate worker)
```bash
# .env: DATABASE_URL=postgres://user:pass@host:5432/db   (DATABASE_SSL=true on Supabase/managed)
npm run migrate
```
### Redis rate limiting (optional)
Create an Upstash Redis database, set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. If Upstash is unreachable the app falls back to the in-memory limiter.

### Tests / checks
```bash
npm test               # 79 tests: URL/SSRF, API, rate limit, jobs, providers, security, SSR UI
npm run typecheck
npm run audit:prod     # npm audit
npm run scan:secrets   # working tree + full git history
```

## Deploy
The file-serving model needs **a host with a persistent disk shared by web and worker**. Vercel serverless can host the UI/API, but it cannot run yt-dlp or share a disk, so downloads need a VPS/container host (Fly, Railway, Render, a VPS) or you must add object storage (S3/R2) yourself (not included).

**Docker (recommended):**
```bash
echo "POSTGRES_PASSWORD=$(openssl rand -base64 24)" >> .env
echo "ADMIN_TOKEN=$(openssl rand -base64 48)" >> .env
# set SITE_URL=https://your.domain and TRUST_PROXY=true (behind your reverse proxy) in .env
docker compose up -d --build
docker compose exec web npm run migrate
```
**Metadata-only on Vercel:** import the repo, set `SITE_URL`, leave `YTDLP_ENABLED=false`.

**Custom domain:** point DNS at your host/Vercel, terminate TLS there, set `SITE_URL` to the https origin (it feeds canonical URLs, sitemap and the CSRF origin check).

**TRUST_PROXY:** only `true` behind a proxy that overwrites `X-Forwarded-For`/`X-Real-IP`. Otherwise clients could spoof IPs and dodge rate limits. When `false`, all clients share one bucket.

## Operations
- **Monitoring:** `GET /api/admin/metrics` with `Authorization: Bearer $ADMIN_TOKEN` (404 if the token is unset/wrong). Counters are per-instance, in memory, no personal data. Errors are logged to stdout with detail; users only see generic messages. Ship stdout to your log service.
- **Rate limits:** `ANALYZE_RATE_LIMIT`, `DOWNLOAD_RATE_LIMIT`, `RATE_LIMIT_WINDOW_SECONDS`, `COOLDOWN_SECONDS`.
- **File retention:** `JOB_TTL_MINUTES`; cleanup runs on the worker every minute and opportunistically on new jobs.

## Add a platform
1. Add it to `PLATFORMS` and `isVideoPath` in `lib/platform.ts` (exact host allowlist + path rules), plus tests.
2. Register a `Provider` in `lib/providers/index.ts` (reuse `BaseProvider` or implement `Provider`).
3. Add it to `fetchOEmbed` endpoints if it has a public oEmbed, a thumbnail host in `safeThumbnail` and the CSP `img-src` in `next.config.ts`.
4. Add a page in `lib/content.ts` + `app/<slug>/page.tsx` only if it has real content.

## Security model (summary)
Exact-hostname allowlist and canonical rebuild of every URL (no userinfo/ports/IPs); oEmbed calls go to fixed hosts; yt-dlp is run with `execFile` (no shell), `--` before the URL, no cookies/config, and a minimal child environment (no secrets); JSON-only + Origin/Sec-Fetch-Site checks (CSRF); 4 KB body cap; zod strict schemas; format ids re-validated against the provider's list; unguessable UUID job ids; download paths pinned inside `DOWNLOAD_DIR`; constant-time admin token check; CSP, HSTS, frame-deny/nosniff/COOP/CORP headers; no CORS headers (same-origin only); source maps off; `X-Powered-By` off.
