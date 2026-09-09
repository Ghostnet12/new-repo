import { checkTextLimits } from '../../../server/src/validation/limits.js';
import { natalDefaults } from '../../../server/src/tarot/natal.js';
import { buildReading } from '../../../server/src/tarot/interpretation.js';
import { cards, spreads } from '../../../server/src/tarot/deck.js';

export {loadLocalProfile,saveLocalProfile,loadLocalHistory,saveLocalReading,toggleLocalFavorite,deleteLocalReading} from './deviceStorage.js';

export const localDeck = cards;

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
  checkTextLimits(form);
  const spread = spreads[form.spread] || spreads.three;
  const draw = shuffleTake(spread.positions.length);
  const reversed = draw.map(() => form.reversals === 'yes' && secureInt(100) < 30);
  const profile = { name: form.name || '', gender: form.gender || '', birthday: form.birthday || '', preferredSpread: form.spread || 'three', natal: { ...natalDefaults, ...form.natal } };
  const input = { ...form, profile, focus:form.focus || 'general', need:form.need || 'clarity', personalInfluence:form.birthInfluence !== false };
  return { ...buildReading(input, draw, reversed, crypto.randomUUID()), persisted:false, database:'device-local', localFallback:true, apiVersion:'device-3.1.0' };
}
