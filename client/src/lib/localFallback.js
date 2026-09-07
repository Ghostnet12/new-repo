import { cards, spreads, suits, zodiacMajor } from '../../../server/src/tarot/deck.js';

const PROFILE_KEY = 'fracture-shadow-profile-v3';
const HISTORY_KEY = 'fracture-shadow-history-v3';

export const localDeck = cards;

function safeParse(value, fallback) {
  try { return JSON.parse(value); } catch { return fallback; }
}

export function loadLocalProfile() {
  return safeParse(localStorage.getItem(PROFILE_KEY), null);
}

export function saveLocalProfile(profile) {
  const clean = {
    name: String(profile?.name || '').slice(0, 50),
    gender: String(profile?.gender || '').slice(0, 30),
    birthday: String(profile?.birthday || '').slice(0, 10),
    preferredSpread: profile?.preferredSpread || 'three'
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(clean));
  return clean;
}

export function loadLocalHistory() {
  const value = safeParse(localStorage.getItem(HISTORY_KEY), []);
  return Array.isArray(value) ? value.slice(0, 50) : [];
}

function writeHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  return history.slice(0, 50);
}

export function saveLocalReading(reading) {
  const history = loadLocalHistory();
  const entry = {
    localId: reading.readingId || crypto.randomUUID(),
    _local: true,
    spreadName: reading.spread?.name || 'Tarot Reading',
    question: reading.question || '',
    focus: reading.focus || 'general',
    favorite: false,
    createdAt: new Date().toISOString()
  };
  return writeHistory([entry, ...history.filter(x => x.localId !== entry.localId)]);
}

export function toggleLocalFavorite(localId) {
  return writeHistory(loadLocalHistory().map(x => x.localId === localId ? { ...x, favorite: !x.favorite } : x));
}

export function deleteLocalReading(localId) {
  return writeHistory(loadLocalHistory().filter(x => x.localId !== localId));
}

function secureInt(max) {
  if (!Number.isInteger(max) || max <= 0) return 0;
  const range = 0x100000000;
  const limit = range - (range % max);
  const value = new Uint32Array(1);
  do { crypto.getRandomValues(value); } while (value[0] >= limit);
  return value[0] % max;
}

function shuffleTake(n) {
  const a = cards.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = secureInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

function count(values) {
  const out = {};
  for (const value of values) out[value] = (out[value] || 0) + 1;
  return Object.entries(out).sort((a, b) => b[1] - a[1]);
}

function digitSum(value) {
  return String(value).replace(/\D/g, '').split('').reduce((a, b) => a + Number(b), 0);
}
function birthIndex(value) {
  let n = digitSum(value);
  while (n > 21) n = String(n).split('').reduce((a, b) => a + Number(b), 0);
  return n;
}
function lifePath(value) {
  let n = digitSum(value);
  while (n > 9 && ![11, 22, 33].includes(n)) n = String(n).split('').reduce((a, b) => a + Number(b), 0);
  return n;
}
function zodiac(value) {
  const [, m, d] = value.split('-').map(Number), x = m * 100 + d;
  if (x >= 321 && x <= 419) return 'Aries'; if (x >= 420 && x <= 520) return 'Taurus';
  if (x >= 521 && x <= 620) return 'Gemini'; if (x >= 621 && x <= 722) return 'Cancer';
  if (x >= 723 && x <= 822) return 'Leo'; if (x >= 823 && x <= 922) return 'Virgo';
  if (x >= 923 && x <= 1022) return 'Libra'; if (x >= 1023 && x <= 1121) return 'Scorpio';
  if (x >= 1122 && x <= 1221) return 'Sagittarius'; if (x >= 1222 || x <= 119) return 'Capricorn';
  if (x <= 218) return 'Aquarius'; return 'Pisces';
}
function personalization(birthday) {
  if (!birthday) return { birthCard: null, zodiac: null, zodiacCard: null, lifePath: null };
  const sign = zodiac(birthday);
  return { birthCard: cards[birthIndex(birthday)], zodiac: sign, zodiacCard: cards[zodiacMajor[sign]], lifePath: lifePath(birthday) };
}

function analyze(input, draw, reversed, personal) {
  const n = draw.length;
  const majors = draw.filter(c => c.type === 'major');
  const minors = draw.filter(c => c.type === 'minor');
  const suitCounts = count(minors.map(c => c.suit));
  const rankCounts = count(minors.map(c => c.rank));
  const courts = minors.filter(c => ['Page', 'Knight', 'Queen', 'King'].includes(c.rank));
  const dominantSuit = suitCounts[0] && suitCounts[0][1] > 1 ? suitCounts[0] : null;
  const repeatedRank = rankCounts[0] && rankCounts[0][1] > 1 ? rankCounts[0] : null;
  const last = draw[n - 1], mid = draw[Math.floor((n - 1) / 2)];
  const shadowCard = draw.find((c, i) => reversed[i] || [13, 15, 16, 18].includes(c.id));
  const revCount = reversed.filter(Boolean).length;
  const resonance = personal.birthCard ? draw.some(c => c.id === personal.birthCard.id || c.id === personal.zodiacCard.id) : false;
  const focusText = { general:'the part of life carrying the most weight', love:'relationship dynamics, reciprocity and boundaries', career:'work, money, purpose and practical opportunity', decision:'the choice in front of you and the evidence it needs', healing:'closure, recovery and patterns that need less access to you', growth:'the identity and behavior you are strengthening' }[input.focus];
  const needText = { clarity:'separate facts, interpretations and unknowns', direction:'choose the next useful move without needing the entire future solved', closure:'decide what no longer deserves another cycle', courage:'act while some uncertainty remains', understanding:'see the pattern before defending or condemning it' }[input.need];
  const dominant = dominantSuit ? `${suits[dominantSuit[0]].name} appears ${dominantSuit[1]} times: ${suits[dominantSuit[0]].domain}.` : (majors.length >= Math.ceil(n / 2) ? 'Major Arcana carry unusual weight in this spread.' : 'No single suit dominates; multiple life layers are interacting.');
  const repetition = repeatedRank ? `${repeatedRank[0]} repeats ${repeatedRank[1]} times, so that developmental stage deserves extra attention.` : 'No rank repeats strongly enough to dominate the pattern.';
  const weight = `${majors.length} Major Arcana · ${courts.length} Court card${courts.length === 1 ? '' : 's'} · ${revCount} reversed.${resonance ? ' A birth/zodiac correspondence also appears.' : ''}`;
  const core = (input.question ? `You asked, “${input.question}” ` : `This reading centers on ${focusText}. `) + `The spread moves from ${draw[0].name} through ${mid.name} toward ${last.name}. ${dominantSuit ? `${suits[dominantSuit[0]].name} is the loudest everyday layer, emphasizing ${suits[dominantSuit[0]].domain}. ` : ''}${majors.length >= Math.ceil(n / 2) ? 'The high Major-Arcana weight points to a broader transition or identity-level lesson. ' : ''}Because you asked for ${input.need}, the practical task is to ${needText}. ${revCount ? `${revCount} reversal${revCount === 1 ? '' : 's'} suggest part of the pressure is internal, resisted, delayed or overexpressed.` : 'The upright-heavy draw makes the main tensions easier to identify directly.'}`;
  const nextByFocus = { general:'Do one concrete thing that creates new information by tomorrow.', love:'State one need or boundary plainly; replace guessing with an honest conversation or a conscious decision not to chase ambiguity.', career:'Take one outward action another person can respond to: apply, pitch, ship, schedule, ask or prioritize.', decision:'Separate observable facts from assumptions, then make the smallest reversible move that gives you new information.', healing:'Reduce access to one repeating trigger and protect time for recovery, support or closure.', growth:'Choose one behavior small enough to repeat for seven days, including on low-motivation days.' };
  return {
    pattern: dominantSuit ? `${suits[dominantSuit[0]].name} · ${dominantSuit[1]}` : majors.length >= Math.ceil(n / 2) ? 'Major-heavy' : 'Layered / mixed',
    core, dominant, repetition, weight,
    shadow: shadowCard ? `${shadowCard.name}: ${shadowCard.shadow}` : 'No heavy shadow marker dominates. The caution is confusing a possible interpretation with a verified fact.',
    nextMove: `${nextByFocus[input.focus]} The closing card adds: ${last.advice}`,
    unchanged: reversed[n - 1] ? `If the response does not change, the reversed side of ${last.name}—${last.reversed}—may remain active.` : `If nothing changes, watch the shadow side of ${last.name}: ${last.shadow}`,
    trajectory: reversed[n - 1] ? `${last.name} closes the spread reversed. Repeating the current response may preserve ${last.reversed}; acting on its corrective lesson makes ${last.upright} more available. That is conditional direction, not destiny.` : `${last.name} closes the spread upright. If your actions support its lesson—${last.advice.toLowerCase()}—the available direction is ${last.upright}. Its warning still matters: ${last.shadow}`,
    finalMessage: `${last.advice} Use ${last.name} as the closing instruction, then let evidence, values and deliberate action—not the deck—make the actual decision.`,
    realityCheck: 'Reality check: name one observable fact that supports the interpretation and one that challenges it. Keep what clarifies your choices; do not force the cards to fit.'
  };
}

export function generateLocalReading(form) {
  const spread = spreads[form.spread] || spreads.three;
  const draw = shuffleTake(spread.positions.length);
  const reversed = draw.map(() => form.reversals === 'yes' && secureInt(100) < 30);
  const profile = { name: form.name || '', gender: form.gender || '', birthday: form.birthday || '', preferredSpread: form.spread || 'three' };
  const personal = personalization(profile.birthday);
  return {
    readingId: crypto.randomUUID(),
    spread: { key: form.spread || 'three', name: spread.name },
    profile,
    question: form.question || '',
    focus: form.focus || 'general',
    need: form.need || 'clarity',
    cards: draw.map((card, i) => ({ card, position: spread.positions[i], reversed: reversed[i] })),
    personalization: personal,
    analysis: analyze({ ...form, profile }, draw, reversed, personal),
    persisted: false,
    database: 'device-local',
    localFallback: true,
    apiVersion: 'device-3.1.0'
  };
}
