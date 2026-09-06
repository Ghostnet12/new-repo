# 4K Shadow Deck asset migration

The production React client loads the 78 Shadow Deck card faces as individual WebP files from `client/public/assets/cards/00.webp` through `77.webp`.

The previous `client/public/shadow78_atlas.webp` sprite atlas has been removed from the runtime. Card rendering uses a normal `<img>` per card and lazy-loads compact gallery cards.

The individual assets are 2731×4096 WebP masters generated for this deck. `scripts/verify-card-assets.mjs` checks the expected 78-card file set.
