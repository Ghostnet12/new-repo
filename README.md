# FRACTURE — The Shadow Deck

A full 78-card gothic tarot web app built as a MERN application with a React/Vite client, Express/Node API, optional MongoDB persistence, and a production-ready Vercel layout.

## Current production architecture

- React 19 + Vite client in `client/`
- Express 5 API on Node 24 in `server/`
- Vercel serverless entry in `api/index.js`
- MongoDB + Mongoose persistence when `MONGODB_URI` is configured
- Guest-mode readings when MongoDB is unavailable
- 78 individual 4K WebP masters in `client/public/assets/cards/00.webp` through `77.webp`
- No sprite sheet or runtime atlas dependency
- Build-time responsive card derivatives generated with Sharp:
  - `assets/cards/web/` — 900×1350 reading images
  - `assets/cards/thumb/` — 360×540 gallery thumbnails
- Responsive `srcset` delivery so mobile clients do not download every 4K master
- Full artwork preserved with `object-fit: contain`, including cards with narrower native aspect ratios

## Card ranges

- `00`–`21`: Major Arcana
- `22`–`35`: Wands
- `36`–`49`: Cups
- `50`–`63`: Swords
- `64`–`77`: Pentacles

The 4K files are the canonical artwork masters. Web and thumbnail renditions are generated during production builds and are intentionally not committed.

## Local setup

```bash
cp .env.example .env
npm ci
npm run dev
```

Client: `http://localhost:5173`  
API: `http://localhost:4000`

MongoDB is optional for guest readings. It is required only for saved profiles and reading history.

## Production build

```bash
npm ci
node scripts/verify-card-assets.mjs
npm run build
```

`npm run build` automatically runs the image derivative generator before Vite. The Vercel build output is `client/dist`.

## Deployment

The production Vercel project is `fracture-shadow-deck-mern-v2`, connected to the `main` branch of `Ghostnet12/new-repo`. Production persistence uses the `MONGODB_URI` environment variable.

## Environment variables

- `MONGODB_URI` — optional Atlas connection string; omit for guest-only mode
- `FRONTEND_ORIGIN` — allowed browser origin(s), comma-separated when needed
- `PORT` — local Express port; defaults to the configured runtime value
- `VITE_API_BASE` — optional API base override; blank uses same-origin `/api`
- `READING_RETENTION_DAYS` — optional TTL for persisted readings; `0` disables automatic expiry

## API

Public:

- `GET /api/health`
- `GET /api/deck`

Anonymous-device protected routes require the `X-Shadow-Client` header. The server hashes that possession token before storage.

- `POST /api/readings/generate` — generate a server-authoritative reading; persistence is opt-in
- `GET /api/readings` — saved readings for the current anonymous device
- `PATCH /api/readings/item/:id` — update favorite/notes for an owned reading
- `DELETE /api/readings/item/:id` — delete an owned reading
- `GET /api/profile` — get the current device profile
- `PUT /api/profile` — create/update the current device profile

## Verification

GitHub Actions uses a frozen `npm ci` install and verifies:

1. all 78 individual 4K card masters exist;
2. server syntax and unit tests pass;
3. the React production build succeeds;
4. 78 web and 78 thumbnail derivatives are generated;
5. Express starts successfully;
6. `/api/health` responds;
7. `/api/deck` returns exactly 78 cards;
8. a real three-card reading is generated successfully.

See `docs/ARCHITECTURE.md` for deeper design decisions and future upgrades.
