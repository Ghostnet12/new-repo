# Shadow Deck card asset source

Production renders one card file per card from `client/public/assets/cards/00.webp` through `77.webp`.

The `shadow78_transport.part*.b64` files are temporary build transport only. GitHub Actions reconstructs the transport image, crops the 78 exact card designs, and commits each card as an individual WebP. The React app does not render from a sprite sheet.

The full-resolution generated masters remain the archival source; the assets under `client/public/assets/cards/` are browser delivery derivatives.
