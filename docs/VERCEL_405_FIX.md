# Vercel 405 API routing fix

Vercel exposes `api/index.js` as the function route `/api`. Rewriting API requests to `/api/index.js` can resolve to the source file rather than the function route, causing non-GET requests such as `POST /api/readings/generate` to return HTTP 405.

The production rewrite must target `/api`, not `/api/index.js`:

```json
{ "source": "/api/:path*", "destination": "/api" }
```

The original request pathname remains available to the Express app, so its `/api/health`, `/api/deck`, `/api/profile`, and `/api/readings/*` routes continue to match.
