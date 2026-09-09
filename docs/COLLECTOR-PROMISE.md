# The collector promise

The Fold sells a small moment of theatre and a downloadable digital keepsake. The free fortune teller remains available. A paid card must be worth reading without its serial number, scarcity label or bonus.

## What the buyer receives

- One numbered issue removed atomically from a shared, finite edition.
- An account-backed collection and a full-resolution 1000 × 1500 PNG using the same layout as the on-page card.
- A distinct complete message, an edition label and an issue number. Shared frame artwork is disclosed.
- Four individually written Jokers in each first-series mode, clearly marked. Existing bonus rules remain subject to payment-provider approval.

The number identifies a site-issued collectible; it cannot stop somebody copying a downloaded PNG. Do not promise exclusive artwork, copyright ownership, resale profit, investment value or scientifically reliable prediction. Do not call every card rare simply because it has a serial number. The four-Joker label is an edition count, not a promise of winning odds for a particular pack.

## Editorial release standard

Every future paid fortune needs a specific title, a coherent image or situation, and a memorable emotional turn or joke. Its closing line must add something. Read it without the frame: would somebody want to keep it? Humor should tease a situation without humiliating the recipient, asserting another person's private feelings, or presenting consequential advice as certainty.

Do not generate inventory by taking the Cartesian product of openings and endings. Check duplicate complete messages, substantive repeated sentences, repeated titles, close paraphrases and recycled punchlines against all earlier collections. Automated checks cannot certify originality or taste; a complete editorial reading is still required. Each batch must also pass the actual saved-card layout checks.

`node scripts/audit-collector-writing.mjs --require-ready` is the current first-series mechanical release check. Runtime checkout also requires this check to pass; supplying Stripe keys or enabling payment flags cannot override it. The current composed first series fails and remains unavailable for purchase. It is prepared inventory, not an editorially approved paid product.

Already initialised stock must not be rewritten or reshuffled in place. A fully reviewed replacement must be released under new edition IDs, with old collections retained. The 16 individually written examples in `server/data/collector-editorial-studies.json` establish the writing direction. They are studies, not issued inventory, and do not represent a completed rewrite of 4,076 ordinary cards.

## Honest previews

Owner and promotional samples must say PREVIEW and must not debit stock, claim ownership, issue a real card or grant bonus draws. Use the production card renderer, not a prettier unrelated mockup. The current sample uses the individually written first-series Joker “The cheeky benefactor” and its actual catalogue serial Y-2040.
