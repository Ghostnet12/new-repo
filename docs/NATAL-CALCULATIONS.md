# Natal calculations — natal-1.0

The browser and server share `server/src/tarot/natal.js`. The production calculator uses Astronomy Engine 2.1.19 (MIT license) and Temporal polyfill 0.5.1 (ISC license). Birthplace search loads city-timezones 1.3.4 only when requested; it searches the packaged city list locally. Birth details are sent to The Fold when the user requests a reading or saves a profile, not to a geocoding provider.

`astronomy.cjs` selects the package's declared CommonJS entry explicitly. The package's ESM `.js` entry lacks a module-type declaration and cannot be loaded when the serverless runtime disables automatic module-syntax detection. The test command disables both syntax detection and experimental ESM require support, matching that production constraint. Client bundling handles the adapter normally.

## Inputs and time

Required: Gregorian date from 1900 through today, local birth time to the minute, geographical latitude (north positive), longitude (east positive) and an IANA time zone. The city picker supplies coordinates and a time zone; manual fields permit correction. City coordinates represent a city center. Country/region selection matters where place names repeat.

Temporal resolves the historical civil offset from the runtime's IANA time-zone data. A skipped time at a forward clock change is rejected. A repeated hour is rejected until the user chooses the first or second occurrence. Never silently use noon or shift an invalid time. Future instants, invalid calendar dates, unknown zones and coordinates at the exact poles are rejected. Approximate time is labeled; unknown time does not produce a chart. Historical time-zone records, especially before 1970, and uncertain birth records can limit accuracy.

## Positions and houses

- Tropical, geocentric apparent Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune and Pluto.
- `Ecliptic(GeoVector(body, time, true)).elon` supplies longitude in the true ecliptic/equinox of date, with light-time and aberration handling. Do not substitute the heliocentric longitude helper.
- Local apparent sidereal time uses Greenwich apparent sidereal time plus longitude. True obliquity comes from the ecliptic-of-date to equator-of-date rotation.
- Ascendant is the eastern, rising intersection of the local horizon and ecliptic. Midheaven is the upper meridian intersection. Their opposite points are Descendant and Imum Coeli. Degenerate horizon/ecliptic alignment has no unique Ascendant and is rejected.
- Whole Sign house 1 starts at 0° of the Ascendant's sign. Each following sign forms the next house. The Midheaven remains a separate angle and need not fall in house 10. This is a declared convention, not a claim that all house systems agree.
- Apparent longitudinal speed is a centered one-day difference with wrap handling. Negative is retrograde, positive direct, and absolute speed below 0.003°/day is labeled stationary. This is an approximate motion classification, not an exact station-time search.
- Major planet-to-planet aspects: conjunction/opposition up to 6° orb (8° if Sun or Moon participates); square/trine 6°; sextile 4°. Separation uses the shortest angular distance. The UI reports exact aspect angle and orb, and explains each relationship.

Arcminute display is resolution, not guaranteed accuracy. Astronomy Engine's stated design target is around one arcminute; input uncertainty may dominate. Sidereal zodiac, Placidus or other house systems, nodes, asteroids, transits, progressions and aspect applying/separating phases are not calculated in this release.

## Reading integration

A valid requested chart replaces the approximate calendar Sun sign and is retained in the personalization snapshot. Moon/rising and the focus-relevant planet are connected to cards actually drawn; birth data never weights or replaces the random draw. Turning off personal symbolism removes all natal, zodiac and numerology connections while preserving entered details in the form. Both API and browser validation reject incomplete requested charts. The device fallback calls the same calculator and interpreter.

The chart's astronomical positions and its symbolic interpretations are identified separately. Planet, sign, house and aspect descriptions are original editorial text. They do not claim to establish a person's character or predict a specific event.

## Independent verification

`server/test/fixtures/natal-reference.json` records numerical output from a separate Swiss Ephemeris 2.10.03 installation, using `calc_ut` with MOSEPH and SPEED flags and `houses_ex` with Whole Sign (`W`). No Swiss Ephemeris code or runtime dependency is distributed with the app. Fixtures span Greenwich/J2000, New York, Sydney, Tromsø and an equatorial 1900 date.

All 50 planetary longitudes differ by less than one arcminute (largest observed difference approximately 0.00371°); Ascendant and Midheaven differ by less than 0.002° in every fixture, and all Whole Sign cusps agree. These are checks of the selected examples, not an exhaustive accuracy guarantee across all dates and locations. Regression tests also cover DST ambiguity, skipped hours, fractional offsets, invalid input, 0° wrap, sign boundaries, opt-out and server/device parity.

## Primary references

- [Astronomy Engine API and coordinate conventions](https://github.com/cosinekitty/astronomy/blob/master/source/js/README.md)
- [Astronomy Engine source, accuracy and license](https://github.com/cosinekitty/astronomy)
- [Temporal ZonedDateTime and disambiguation](https://tc39.es/proposal-temporal/docs/zoneddatetime.html)
- [City-timezones data package](https://github.com/kevinroberts/city-timezones)
- [Swiss Ephemeris programming reference, used for independent numerical verification](https://www.astro.com/swisseph/swephprg.htm)
