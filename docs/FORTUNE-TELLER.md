# The Fortune Teller

Added September 9, 2026 at `/fortune-teller`, linked from the main navigation, menu and footer. The normal reading hero is omitted on this route so the activity appears directly below navigation.

- Original fictional mechanical-teller artwork generated for The Fold; optimized to a 1024 × 1536 WebP (287 KB). No film logos, actor likenesses or copied fortune text.
- Thirty-two original fortune messages, dealt from a shuffled collection. Each is seen once before reshuffling, with no immediate repeat across collections. The collection resets when the feature unmounts.
- Each draw includes a random number from 1–99 and its issue date. This is explicitly a playful reflection, not a prediction.
- A 4.8-second, three-stage performance (awakening, listening, inscription), followed by a stationary fortune card. The waiting area has no floating card or orbit animation. Pending stages are cancelled on navigation. Reduced-motion visitors receive an immediate card without animation.
- The teller has a matching lighting variant with bright ruby-red eyes and a stronger violet ball glow; the lighting effect activates only while a card is being made. Both the initial state and completed-card state return to the subdued original artwork. Layered images preserve alignment across screen sizes. Gold/plum celestial artwork frames both the on-page card and its download.
- Keepsake cards export locally to 1000 × 1500 PNG. The ornate frame loads from the same origin and is cached; text is measured to fit the clean parchment area. Blob URLs are revoked on replacement/unmount. A failed image preparation offers a retry. Downloads follow the visitor's browser's normal download behavior.
- No new service, credentials, payment requirement or server endpoint. No user questions or personal details are collected. Existing ambient music stays mounted during page navigation.

Validation: `node --test client/test/fortunes.test.js client/test/fortuneReveal.test.js`, production client build, static checks of all eight public pages and the sitemap, and live HTTP/asset checks after deployment. All 32 PNG layouts were rendered with native Canvas and checked for text bounds; a complete export was visually inspected. Browser interaction and mobile download behavior have not been tested in a real browser in this change.
