# FRACTURE Shadow Deck — MERN Architecture v2

## Runtime
- React 19 + Vite 8 client
- Express 5 / Node 24 API
- MongoDB + Mongoose 9 persistence
- Vercel frontend + serverless Express API

## Boundaries
- `client/` owns UI, reveal state, navigation and accessibility.
- `client/public/shadow78_atlas.webp` is the first-party production artwork atlas shipped by Vite.
- `server/src/tarot/` owns canonical 78-card data and a versioned deck identifier.
- `server/src/services/readingService.js` owns cryptographic shuffling, personalization and synthesis.
- MongoDB is optional: guest readings work when persistence is unavailable.

## Anonymous identity and privacy
- The browser creates a random 256-bit bearer token and sends it as `X-Shadow-Client`.
- The API stores only a SHA-256 hash of that token and scopes profiles, history, updates and deletes to it.
- Persistence is opt-in per reading instead of automatic.
- Saved reading snapshots omit the raw birthday; the profile keeps birthday only when the user explicitly chooses persistence.
- `READING_RETENTION_DAYS` can enable automatic MongoDB TTL deletion; `0` keeps saved readings until the user deletes them.
- This is strong anonymous single-device ownership, not cross-device account authentication.

## Reliability and security
- Server-side `crypto.randomInt` owns the draw; the browser cannot select cards.
- Zod validates inputs and real calendar dates.
- Helmet, CORS, body-size limits and rate limits stay at the API boundary.
- Card artwork is served from the app's own origin instead of a third-party runtime dependency.
- GitHub Actions runs server checks, unit tests, React build and HTTP API smoke tests before merge.
- Every saved reading stores a deck version for provenance.

## Data model
- `Profile`: hashed anonymous identity, optional name/gender/birthday and preferred spread.
- `Reading`: hashed anonymous identity, deck version, spread, question, non-birthday profile snapshot, derived personalization, selected cards, analysis, favorite/notes and optional expiry.

## Remaining product-level upgrades
1. Enable MongoDB Atlas AI/client access, then configure `MONGODB_URI`, indexes and backups.
2. Add real account authentication only if cross-device private history is required.
3. Add explicit revocable share tokens if users want to publish a reading.
4. Add an admin-only, versioned deck/content editor before meanings become remotely editable.
5. Add browser E2E coverage after the first MERN preview is stable.
