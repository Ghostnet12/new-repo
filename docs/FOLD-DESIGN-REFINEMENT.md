# The Fold — design refinement

September 8, 2026. Continues the navigation and crystal-ball work in pull request #29.

## Direction and references

Preserve The Fold's celestial eye, Shadow Deck, violet atmosphere, black surfaces, and warm gold. Give the reading itself clearer hierarchy and more space.

- [Labyrinthos](https://labyrinthos.co/) groups learning resources, card meanings, and spreads into explicit destinations. Applied here as visible spread choices with card counts and descriptions, plus direct access to the full deck.
- [CHANI](https://www.chani.com/) gives daily horoscopes and introductory astrology clear entry points. Applied here as distinct navigation destinations, concise guidance, and shorter headers when using a tool or visiting another section.
- [The Pattern](https://www.thepattern.com/) presents personal themes in everyday language. Applied in the second pass as clearer reading guidance, a prominent question, and less technical language around saved readings.

These are interaction and organization references. The Fold retains its own artwork and original interface copy.

## Changes

- Refined the full-width black-and-gold navigation, active state, outline icons, responsive scrolling, and keyboard-accessible menu.
- Kept the supplied crystal-ball photograph beside the Shadow Deck, with softer edges and a caption linking to the full deck.
- Replaced the spread dropdown with five accessible radio choices using the existing spread IDs.
- Added optional question prompts that disappear once the visitor writes a question.
- Grouped optional personal details and retained reversed cards, saved readings, gender, birth-chart details, focus, need, and profile memory.
- Removed autofocus on arrival, respected reduced-motion preferences, and added a skip-to-content link.
- Kept the profile button and Compatibility's birth-date prompt connected to the newly collapsible personal-details section.

## Initial refinement verification

- Production client build and whitespace validation passed; the build still emits all six public pages and SEO files.
- Browser review at desktop size and 320, 390, 768, and 1024-pixel iframe widths. No horizontal document overflow observed at the measured 320, 768, and 1024 widths. The navigation scrolls within its own row on narrow screens.
- Tested a question prompt, five-card Shadow Compass selection, optional personal details, reading submission, and all-card reveal through to the rendered interpretation. Used synthetic input and left saving unchecked.
- Tested menu opening, Escape dismissal, daily horoscope navigation, Card of the Day from a different section, and Compatibility's return to the birth-date field.
- All three in-page image elements loaded successfully.
- Browser preview initially exposed the existing CommonJS astronomy adapter directly, which prevented rendering. Vite now aliases that adapter to the installed package's ESM browser entry. The server adapter, package versions, and calculation source remain intact. [Vite alias configuration](https://vite.dev/config/shared-options.html#resolve-alias).

No production deployment is part of this review update.

## Second pass: carry the design through the reading

- Made the main reading action more prominent in warm gold; increased question-prompt targets and used full-width spread choices on phones.
- Gave the drawn reading a question-led header, a clear saved status, and personal symbolism only when those details are available.
- Added a live card-reveal count and a descriptive reveal-all control that shows when the whole spread is open.
- Enlarged card meanings and interpretation text, with three reading columns on desktop, two on tablets, and one on phones.
- Refined the existing Past Readings collection, empty state, dates, favorite state, and action targets.
- Aligned the deck gallery's headings, search, filters, card meanings, and result count with the reading interface. Card-specific accessible labels identify each meanings disclosure.

The second pass passed the production client build and `git diff --check`. Review confirmed that the existing draw, favorite, delete, and filtering handlers are retained. This pass has not had a new browser review; the browser checks above apply to the initial refinement.

## Review images

These images show the initial refinement, before the second pass to controls, reading results, journal, and deck gallery.

Initial desktop overview:

![The Fold redesigned desktop page](design/the-fold-refined-desktop.jpg)

Phone-width reading form (local responsive QA frame):

![The Fold phone-width reading form](design/the-fold-refined-mobile.jpg)
