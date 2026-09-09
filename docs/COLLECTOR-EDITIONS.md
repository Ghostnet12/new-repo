# The Fold collector editions

## Release state

Collector profiles, shared inventory, permanent collections, numbered PNGs and Stripe-hosted checkout are implemented. Payments default OFF. Existing free fortunes remain available; buyers choose Collector’s Edition. Do not turn on live checkout simply because a secret key has been supplied.

## Product and inventory

Each mode has 2,038 ordinary messages plus four jokers: 2,042 cards. Sell at most 203 packs of ten draws at USD 5.00 per pack per edition. Four jokers each consume a draw and credit three extra draws, so 2,030 paid draws plus 12 bonus draws exactly exhaust the edition. Credits belong to their edition, do not expire, and cannot be converted to cash. No transfers or resale marketplace is provided.

A cryptographic Fisher–Yates shuffle runs twice at edition initialisation. A reachability check rejects a candidate sequence that would strand jokers after all possible credits run out. Once saved, order is never shuffled again. A MongoDB transaction deducts a credit, advances the edition cursor, saves the issued card, and awards a joker bonus together. Unique card and owner/request indexes prevent duplicate issuance and duplicate rewards. Cards remain in the buyer’s collection permanently; there is no user delete endpoint or TTL on purchases, credits or cards.

Stock is reserved before redirecting to payment. Paid and pending packs both count against the 203-pack cap. Only a verified Stripe expired-session event releases a reservation. Never release a reservation merely because the browser closed or a timer elapsed: a payment may have completed. Each account may hold one unfinished checkout. A request ID binds the account and edition, and retries reuse it. Signed paid events grant ten credits once; success redirects do not grant credits. A paid session cannot later be expired locally. Unexpected paid-after-expired events fail closed for manual reconciliation.

## Content provenance

`server/data/collector-first-edition.json` is a deterministic, generated server-only manifest with 4,084 unique complete messages and stable IDs. Its original composition parts are in `collector-compositions.js`. The ordinary messages are curated two-part compositions: individual sentences recur across cards, but complete pairings do not. This is not 4,076 individually authored, unrelated paragraphs or unique artwork. The eight jokers have individual messages. The build script checks complete normalised messages against all 4,064 legacy fortunes. The shared frame stays the same; the complete message and numbered issue identify the collectible. Do not advertise unique artwork or exclusive copyright.

Generate it with `node scripts/build-collector-edition.mjs` before running tests or seeding. Its composition source is committed; the generated JSON is excluded from git.

To restock, author a NEW manifest and new edition IDs, check complete messages against EVERY earlier manifest, review close rewrites editorially, and retain old issued records. Never edit this manifest after seeding. The seed command rejects a changed manifest for an existing edition.

## Collector access

Collectors choose a username and a 12–128 character password. Passwords use salted scrypt. Sessions use hashed random tokens, a 30-day expiry and HttpOnly/Secure/SameSite=Strict cookies. A 48-character recovery key is shown at registration; only its hash is stored. Recovery changes the password and rotates that key, invalidating older sessions. This account is separate from the earlier anonymous reading profile. Collectors must save the recovery key; there is no email/password-reset service or ability to retrieve forgotten passwords. Back up the database before accepting sales.

## Prepare and connect Stripe

1. Describe the actual product to Stripe: numbered digital fortunes, random allocation, and four randomly placed jokers awarding three additional draws each. Stripe restricts games of chance with prizes of value. Obtain a clear determination for THIS bonus mechanic before activation; do not disguise it as donations. Policy: https://stripe.com/legal/restricted-businesses.
2. Use a Stripe sandbox/test key first. Set `STRIPE_SECRET_KEY` and create the webhook endpoint `https://enterthefold.io/api/collectors/webhook`. Subscribe to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `checkout.session.expired`. Put the endpoint signing secret in `STRIPE_WEBHOOK_SECRET`. Enter secrets only in the hosting provider’s server environment, never in frontend code or chat.
3. Set `COLLECTOR_SITE_ORIGIN` to the exact site origin. For local Express/Vite development use `http://localhost:5173`; cross-origin writes are rejected. The checkout product and USD 500-cent price are created server-side. No manual Payment Link or client publishable key is required for hosted checkout.
4. Against the intended MongoDB replica-set database, initialise indexes and both decks with `node scripts/seed-collector-edition.mjs --confirm-first-series` and the server’s `MONGODB_URI`. This command is idempotent and never reshuffles an existing edition. Seed a separate test database for sandbox testing. Never mix test purchases with the live inventory.
5. After the joker review, set `COLLECTOR_JOKER_REVIEW_COMPLETE=true`. Set `COLLECTOR_PAYMENTS_ENABLED=true` only in a sandbox deployment first. Verify payment, cancel/expiry, return, duplicate webhook, repeat click, recovery and saved image flows. Live and test webhook environments are checked.
6. To launch, use the live key, the live endpoint’s signing secret, and a fresh live database/edition with zero test draws. Enable the two flags only after actual account readiness and the product review. With either flag absent/false or either key absent, checkout stays closed.

The account can pay out to your bank through Stripe’s own onboarding. This application does not collect banking details.

## Reconciliation and operating limits

A checkout request that times out may have succeeded at Stripe. Its reservation deliberately stays held. Retry the same purchase request; Stripe idempotency reuses the session. If no session ID was recorded and the request is too old to retry, inspect Stripe’s session list by `client_reference_id` and reconcile manually before releasing stock. Do not create a fresh session under a different order ID to settle the old reservation. Refunds/disputes need operator review; this version does not automatically revoke already issued collectibles or perform refunds. Publish purchase/refund contact details before launching.

The public status response contains counts, never remaining messages or shuffled positions. The server-only manifest must never be imported into client code. Clients cannot submit prices, credit amounts, owners, card IDs or joker rewards.

## Verification

`node --test server/test/collectors.test.js` uses a temporary MongoDB replica set and covers payment retries, stock reservations and expiry, concurrent draws, both-mode isolation, full-edition exhaustion, private collections, recovery, request origins and signed payment events. The CI collector job runs these checks on the feature branch before production promotion. Build and existing fortune/card tests must also pass. A real Stripe sandbox purchase and webhook delivery remain a connection-time gate, not a claim made by these tests.
