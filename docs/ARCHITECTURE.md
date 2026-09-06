# FRACTURE Shadow Deck — MERN Architecture

## Runtime
- React 19 + Vite 8 client
- Express 5 / Node 24 API
- MongoDB + Mongoose 9 persistence
- Vercel frontend + serverless Express API

## Boundaries
- `client/` owns UI, reveal state, navigation, and accessibility.
- `server/src/tarot/` owns the canonical 78-card data.
- `server/src/services/readingService.js` owns cryptographic shuffling, personalization, and synthesis.
- MongoDB stores profiles and reading history only; reading generation remains usable without the database.

## Anonymous identity
The browser creates a random 256-bit token and sends it in `X-Shadow-Client`. The API stores only a SHA-256 hash of that token; the raw token is never written to MongoDB or put into route URLs. This provides a stronger anonymous-history boundary than a guessable public identifier, but it is still bearer-token access, not a substitute for account authentication.

## Data model
- `Profile`: hashed anonymous identity, name, gender, birthday, preferred spread.
- `Reading`: hashed anonymous identity, spread, question, profile snapshot, selected cards, analysis, favorite, notes.

## Security / reliability
- Helmet headers, explicit CORS support, rate limiting, request size limits, Zod validation.
- Guest-mode fallback when MongoDB is unavailable.
- Randomized draws use Node `crypto.randomInt` server-side.
- Birthday input is validated as a real calendar date.
- Reading mutations are scoped to the caller's hashed anonymous identity.
- No claim that tarot predicts a guaranteed future; outputs are framed as reflective/conditional.

## Quality gates
GitHub Actions installs clean dependencies, performs server syntax checks, runs Node unit tests, builds the React client, starts the Express API, verifies `/api/health`, confirms the canonical deck contains 78 cards, and generates a real reading through the HTTP API.

## Next recommended upgrades
1. Connect MongoDB Atlas and set `MONGODB_URI` in the deployment environment.
2. Add real account authentication before describing reading history as private cross-device storage.
3. Move the card atlas to first-party object storage/CDN instead of a raw GitHub URL.
4. Add shareable reading snapshots with explicit privacy controls.
5. Add admin-only deck/content editor and versioned meaning registry.
6. Add browser E2E tests after the preview deployment is stable.
