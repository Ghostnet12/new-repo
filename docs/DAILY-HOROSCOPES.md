# Daily Horoscopes

The public page is `https://enterthefold.io/#daily-horoscopes`.

It works without an external API key: Astronomy Engine computes a daily tropical
sky at 12:00 UTC for the viewer's current calendar date. Original editorial
reflections follow the Moon sign, selected focus, and available profile layers.
The page identifies this as an original Fold reflection, never a fetched story.
It refreshes when the local day changes, including after a hidden tab is reopened.
Birth-date estimates are labeled; missing or unknown birth times never invent
a birth Moon, rising sign, houses or chart contacts. Browsing another sign turns
off personal chart layers. Numerology uses the calendar-year convention described
in the UI. There are no guaranteed predictions or claims of scientific accuracy.

## Enable the optional publisher feed and Qwen retelling

No paid account or resources were created. The implementation is prepared but live
publisher/Qwen access is **not enabled until credentials are configured**.

1. Obtain Prokerala developer credentials for a plan that permits the intended use.
   Set server-only `PROKERALA_CLIENT_ID` and `PROKERALA_CLIENT_SECRET` in the existing
   Vercel project's Production environment. No `VITE_` prefix.
2. The existing `MONGODB_URI` must be available. Public sign/day material is cached
   in `DailyHoroscopeCache`; profile data and questions never enter that cache.
   If the database cannot maintain the shared quota guard, the page uses its
   calculated reflection without calling the publisher.
3. To retell the dated horoscope with Qwen, set server-only `GROQ_API_KEY` and
   `GROQ_HOROSCOPE_MODEL` to a Qwen model available in that Groq account. On
   2026-09-08, Groq lists `qwen/qwen3.6-27b` and `qwen/qwen3.8-27b` as preview models.
   Model availability and free quotas can change; there is deliberately no silent
   model/provider fallback. Only the public sign/date/story is sent to Groq.
4. Redeploy and open the Daily Horoscopes page with a selected sign. Verify today's
   publisher date, visible attribution, and the retold theme. Until then the page
   transparently presents its original calculations. Tests mock the external
   providers; an authenticated live request still needs verification after setup.

Publisher authentication uses OAuth client credentials at
`https://api.prokerala.com/token`, then GET
`https://api.prokerala.com/v2/horoscope/daily?sign=...&datetime=...`.
The response must match the requested date and sign exactly. Undated, stale,
oversize, redirected, malformed, timed-out or rejected responses are not used.
There is no arbitrary URL scraping endpoint. Both Express and the Vercel Web
handler expose the same authenticated `POST /api/horoscopes/daily` route.

The shared database cache holds successful content for at most 24 hours with a
TTL index and an explicit freshness check. A per-key lease and five-minute failure
backoff limit repeated calls. No cron job or per-visitor model call is required.
A new day uses a new key. If the publisher works but AI is unavailable or exhausted,
its dated story remains under an attributed expandable section and the main
reading uses original Fold text. If the publisher is unavailable, only clearly
labeled calculated material appears. Personalized responses use `Cache-Control:
no-store`. Requests from changed/unmounted UI state are aborted and ignored.

The API docs currently list 250 credits per basic daily sign prediction. A full
month of all 12 signs can exceed a free plan. Use the account's quotas/spending
controls; this integration does not upgrade a plan. Groq free quotas also apply.

References checked 2026-09-08:
- Prokerala OpenAPI: https://api.prokerala.com/spec/astrology.v2.yaml
- Prokerala terms (API use, cache/attribution): https://api.prokerala.com/tos
- Prokerala account/plans: https://api.prokerala.com/pricing
- Groq compatibility: https://console.groq.com/docs/openai
- Groq models: https://console.groq.com/docs/models
- Groq free limits: https://console.groq.com/docs/rate-limits

## Text length

`server/src/validation/limits.js` defines 25,000 for every free-text input and
textarea, including name, question, birthplace label/search, time-zone input,
deck search and stored reading notes. Browser HTML maxLength, API validation,
Mongo schemas and local saves agree on JavaScript/HTML UTF-16 length. Date/time
and number controls retain format and range validation. APIs reject excess text
rather than silently truncating it. Express and Vercel accept bounded bodies up
to 1 MiB so 25,000 non-ASCII characters are not rejected by the previous 32 KiB
Express limit. Device-storage failures preserve the generated reading and explain
that it was not saved.
