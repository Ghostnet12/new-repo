# The Fortune Teller

Added September 9, 2026 at `/fortune-teller`, linked from the main navigation, menu and footer. The normal reading hero is omitted on this route so the activity appears directly below navigation.

- Original fictional mechanical-teller artwork generated for The Fold; optimized to a 1024 × 1536 WebP (287 KB). No film logos, actor likenesses or copied fortune text.
- Thirty-two original fortune messages, dealt from a shuffled collection. Each is seen once before reshuffling, with no immediate repeat across collections. The collection resets when the feature unmounts.
- Each draw includes a random number from 1–99 and its issue date. This is explicitly a playful reflection, not a prediction.
- A 1.8-second reveal and paper-card entrance; visitors requesting reduced motion get an immediate reveal without animation.
- Keepsake cards export locally to PNG. Blob URLs are revoked on replacement/unmount. A failed image preparation offers a retry. Downloads follow the visitor's browser's normal download behavior.
- No new service, credentials, payment requirement or server endpoint. No user questions or personal details are collected. Existing ambient music stays mounted during page navigation.

Validation: `node --test client/test/fortunes.test.js`, production client build, static checks of all eight public pages and the sitemap, and live HTTP/asset checks after deployment. Browser interaction and mobile download behavior have not been tested in a real browser in this change.
