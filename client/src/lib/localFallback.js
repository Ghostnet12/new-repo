import { buildReading } from '../../../server/src/tarot/interpretation.js';
import { cards, spreads } from '../../../server/src/tarot/deck.js';

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

export function generateLocalReading(form) {
  const spread = spreads[form.spread] || spreads.three;
  const draw = shuffleTake(spread.positions.length);
  const reversed = draw.map(() => form.reversals === 'yes' && secureInt(100) < 30);
  const profile = { name: form.name || '', gender: form.gender || '', birthday: form.birthInfluence === false ? '' : form.birthday || '', preferredSpread: form.spread || 'three' };
  const input = { ...form, profile, focus:form.focus || 'general', need:form.need || 'clarity', personalInfluence:form.birthInfluence !== false };
  return { ...buildReading(input, draw, reversed, crypto.randomUUID()), persisted:false, database:'device-local', localFallback:true, apiVersion:'device-3.1.0' };
}
