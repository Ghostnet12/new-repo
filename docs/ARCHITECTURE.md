# FRACTURE Shadow Deck — MERN Architecture

## Runtime
- React 19 + Vite 8 client
- Express 5 / Node 24 API
- MongoDB + Mongoose 9 persistence
- Vercel frontend + serverless Express API

## Boundaries
- `client/` owns UI, reveal state, navigation, and accessibility.
- `server/src/tarot/` owns the canonical 78-card data.
- `server/src/services/readingService.js` owns shuffling, personalization, and synthesis.
- MongoDB stores profiles and reading history only; reading generation remains usable without the database.

## Data model
- `Profile`: client id, name, gender, birthday, preferred spread.
- `Reading`: spread, question, profile snapshot, selected cards, analysis, favorite, notes.

## Security / reliability
- Helmet headers, CORS, rate limiting, request size limits, Zod validation.
- Guest-mode fallback when MongoDB is unavailable.
- Randomized draws are generated server-side using Node crypto.
- No claim that tarot predicts a guaranteed future; outputs are framed as reflective/conditional.

## Next recommended upgrades
1. Connect MongoDB Atlas and add indexes/backup policy.
2. Add real account authentication if cross-device private history is required.
3. Move the card atlas to first-party object storage/CDN instead of a raw GitHub URL.
4. Add shareable reading snapshots with explicit privacy controls.
5. Add admin-only deck/content editor and versioned meaning registry.
6. Add automated API/unit/E2E tests before promoting to production.
