# FRACTURE — The Shadow Deck (MERN v2)

A full 78-card gothic tarot web app rebuilt from the original static prototype into a MERN architecture.

## Stack
- React 19.2 + Vite 8 client
- Express 5 on Node 24 LTS
- MongoDB + Mongoose 9
- Vercel-ready monorepo

## Local setup
```bash
cp .env.example .env
npm install
npm run dev
```
Client: http://localhost:5173  
API: http://localhost:4000

MongoDB is optional for guest-mode readings, but required for saved profiles/history.

## API
- `GET /api/health`
- `GET /api/deck`
- `POST /api/readings/generate`
- `GET /api/readings/:clientId`
- `PATCH /api/readings/item/:id`
- `GET /api/profiles/:clientId`
- `PUT /api/profiles/:clientId`

See `docs/ARCHITECTURE.md` for design decisions and next upgrades.
