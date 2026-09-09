# Tarot spread expansion — September 9, 2026

The five original choices remain first: Three-card reading, Shadow Compass, Black Rose, Iron Key and Celtic Cross. Eight additional choices appear in an accessible native disclosure, “Explore 8 more spreads.” Its summary identifies a selected additional spread even when the disclosure is closed.

| Additional spread | Cards | Purpose |
| --- | ---: | --- |
| Daily Lantern | 1 | One theme to notice and practice today |
| Clear Lens | 3 | Situation, complication and a useful response |
| Mind, Body & Spirit | 3 | Thoughts, everyday care and meaning |
| Crossroads | 5 | Compare two options and choose a reversible next step |
| Letting Go | 4 | Examine a pattern and make room for something useful |
| New Moon Intentions | 4 | Name an intention, gather support and begin |
| Full Moon Reflection | 4 | Notice, appreciate, release and carry a lesson forward |
| Horseshoe | 7 | Background, present circumstances, influences and a possible direction |

## Research and adaptations

These are symbolic reflection layouts. Position labels, descriptions and prompts are original to The Fold. The additions draw on established spread themes without copying another site's readings, artwork or explanatory paragraphs.

- [Biddy Tarot: Easy three-card tarot spreads](https://biddytarot.com/blog/easy-three-card-tarot-spreads/) informed Clear Lens and Mind, Body & Spirit through the situation/advice and mind/body/spirit patterns. The Fold uses its own labels and practical questions.
- [Labyrinthos: Making tough choices](https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/making-tough-choices-a-5-card-tarot-spread-for-decision-making) informed the decision-comparison theme. Crossroads is an original five-position arrangement; its prompts do not reproduce that source's exact layout. Visitors name options A and B in their existing question field.
- [Labyrinthos: Tarot spread collection](https://labyrinthos.co/pages/tarot-spreads-list) and [Full moon tarot spread](https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/a-full-moon-tarot-spread-to-add-to-your-full-moon-ritual) supplied examples of lunar ritual and reflection themes. The Fold's two four-card moon arrangements are original adaptations, usable at any time; this feature does not calculate the lunar phase.
- [Learn Religions: Seven-card Horseshoe](https://www.learnreligions.com/seven-card-horseshoe-tarot-spread-2562801) describes the seven-position progression behind Horseshoe. The Fold renames those positions and supplies original guidance. Cards display in a responsive numbered sequence, not a fixed U-shaped diagram.
- Daily Lantern and Letting Go are original arrangements around familiar single-card reflection and release themes. No claim is made that one arrangement is the definitive traditional version.

## Shared behavior

`shared/spreads.js` is the registry used by the form, API validation, server deck and device reading. Every new position has explicit guidance in the shared knowledge reference. Readings still draw unique cards from the existing 78-card deck, preserve reversal and personal-symbolism settings, and support the existing history/profile flows.

The one-card view uses singular labels and a centered card. Four- and seven-card readings use responsive grids. Horseshoe's present-focused story uses its second position. Decision, body and unseen-influence prompts call for reflection and observable information; they do not establish outcomes, diagnose health, or claim access to another person's private thoughts.

## Verification

`server/test/spreads.test.js` checks all 13 visible choices through API validation, preferred-spread validation, server generation and device generation, including card counts, distinct cards, position order, explicit prompts, disabled reversals, personal-layer opt-out and interpreter parity. It also checks invalid IDs and the one-card and Horseshoe story behavior. Existing interpretation and reading-service tests exercise all registered spreads. Client production build and live API/asset checks complete the release verification.
