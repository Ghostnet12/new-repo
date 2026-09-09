# Dream Journal

The `/dream-journal` page uses the approved moonlit-journal artwork as a 219 KB WebP hero, with real, responsive writing controls and reflection and journal panels. It is linked in the primary navigation, Explore menu, footer and public sitemap. Dream writing stays in App state while navigating between site tabs.

## Reflections

`POST /api/dreams/reflect` uses the existing Groq connection: `GROQ_API_KEY` and `GROQ_HOROSCOPE_MODEL`. An optional `GROQ_DREAM_MODEL` overrides the model for this feature. No additional provider credentials are required.

Only the submitted dream, chosen feeling, optional waking-life note and public research notes are sent to Groq. The UI discloses this before submission. Profile and birth information, browser identity and saved journal entries are not forwarded. Each proposed theme includes an excerpt checked against the supplied dream. This verifies that quoted details exist, not that an interpretation is scientifically established. The prompt emphasizes personal associations and uncertainty, with no diagnosis, predictions or fixed symbol meanings.

The provider request has an 18-second deadline. Missing configuration, rate limits, invalid output or failures return explicitly labeled guided reflection prompts, never a fabricated AI success. Source notes cite Kahn (2019), Wamsley et al. (2010) and Edwards et al. (2015); these studies do not validate individual interpretations.

## Journal storage

- `GET /api/dreams?page=1` returns 12 entries at a time for the current anonymous browser identity.
- `POST /api/dreams` explicitly saves or updates an entry. A client-generated UUID makes retries idempotent.
- `DELETE /api/dreams/:id` removes only an entry belonging to that browser.

Records are stored in MongoDB (`FoldDreamEntry`), scoped to the existing hashed `X-Shadow-Client` token. Reflection and save budgets use separate namespaces, each six requests per ten minutes. No dream text is stored in the budget counters, shared caches or application logs. Responses use `Cache-Control: no-store`. Saving is separate from generating a reflection, and an unavailable database returns an error rather than a false saved confirmation.

This is an anonymous journal tied to this browser, not an authenticated account or a cross-device sync feature. Other people sharing the browser can open it; clearing site data can remove access. The page explains this alongside the journal. Removing a saved entry does not discard any copy still open in the writing form.

## Release validation

`node --test server/test/dreamService.test.js server/test/vercelRouter.test.js server/test/vercelRouting.test.js server/test/personalHoroscope.test.js client/test/ambientPlayer.test.js`

37 checks pass, covering owner isolation, idempotent updates, pagination, request bounds, unsupported AI details, provider failures, route protection and existing reading, horoscope and music behavior. `npm run build --workspace client` passes and generates nine public routes and the sitemap. Source review covers responsive layouts, accessible controls and confirmations, cancellation on navigation and stale-list handling. This release does not claim physical-device or browser visual verification.
