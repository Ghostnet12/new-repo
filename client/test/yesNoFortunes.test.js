import test from 'node:test';
import assert from 'node:assert/strict';
import { createFortuneDeck, createYesNoDeck, getDeviceFortuneDeck, fortunes, fortuneDeckStorageKey } from '../src/lib/fortunes.js';
import { yesNoFortunes, yesNoDeckStorageKey } from '../src/lib/yesNoFortunes.js';
import { yesNoChapters } from '../src/lib/yesNoChapters.js';
import { layoutFortuneCard } from '../src/lib/fortuneCard.js';

const memoryStorage = () => {
 const values = new Map();
 return { values, getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
};
const normalize = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '');

test('the answer deck adds exactly 2,032 distinct complete messages with balanced verdicts', () => {
 assert.equal(yesNoFortunes.length, 2032);
 assert.equal(fortunes.length, 2032);
 for (const field of ['id', 'message']) assert.equal(new Set(yesNoFortunes.map(card => normalize(card[field]))).size, 2032, field);
 const originals = new Set(fortunes.flatMap(card => [card.id, normalize(card.message)]));
 assert.ok(yesNoFortunes.every(card => !originals.has(card.id) && !originals.has(normalize(card.message))));
 for (const answer of ['yes', 'no']) assert.equal(yesNoFortunes.filter(card => card.answer === answer).length, 1016);
 assert.ok(yesNoFortunes.every(card => card.mode === 'yesno' && card.title && card.whisper && card.message.length >= 20 && card.message.length <= 180 && /[.!?]$/.test(card.message)));
 for (const chapter of yesNoChapters) {
  const lines = chapter.messages.trim().split('\n');
  assert.equal(lines.length, 127, chapter.key);
  lines.forEach((line, index) => assert.equal(line.split('|')[0], String(index + 1).padStart(3, '0'), chapter.key));
 }
});

test('both modes keep independent saved queues while visitors alternate modes and refresh', () => {
 const storage = memoryStorage();
 let original = createFortuneDeck(() => .4, { storage }), answers = createYesNoDeck(() => .7, { storage });
 const first = original();
 assert.ok(!first.mode);
 assert.equal(storage.getItem(yesNoDeckStorageKey), null);
 const originalSnapshot = storage.getItem(fortuneDeckStorageKey);
 const pendingOriginal = JSON.parse(originalSnapshot).remaining;
 const firstAnswer = answers();
 assert.equal(firstAnswer.mode, 'yesno');
 assert.equal(storage.getItem(fortuneDeckStorageKey), originalSnapshot);
 const answerSnapshot = storage.getItem(yesNoDeckStorageKey);
 const pendingAnswers = JSON.parse(answerSnapshot).remaining;
 original = createFortuneDeck(() => .9, { storage });
 assert.equal(original().id, pendingOriginal.pop());
 assert.equal(storage.getItem(yesNoDeckStorageKey), answerSnapshot);
 answers = createYesNoDeck(() => .1, { storage });
 assert.equal(answers().id, pendingAnswers.pop());
 const anotherTab = createYesNoDeck(() => .3, { storage });
 assert.equal(anotherTab().id, pendingAnswers.pop());
 assert.equal(answers().id, pendingAnswers.pop());
 assert.equal(JSON.parse(storage.getItem(fortuneDeckStorageKey)).remaining.length, 2030);
 assert.equal(JSON.parse(storage.getItem(yesNoDeckStorageKey)).remaining.length, 2028);
});

test('all answer cards are dealt before reshuffling and the boundary never repeats', () => {
 for (const random of [Math.random, () => 0, () => .999999999]) {
  const draw = createYesNoDeck(random); let previous;
  for (let round = 0; round < 3; round++) {
   const seen = new Set(); let yes = 0;
   for (let index = 0; index < 2032; index++) {
    const card = draw();
    assert.notEqual(card.id, previous);
    assert.ok(!seen.has(card.id));
    assert.ok(Number.isInteger(card.luckyNumber) && card.luckyNumber >= 1 && card.luckyNumber <= 99);
    assert.ok(Number.isFinite(Date.parse(card.issuedAt)));
    seen.add(card.id); previous = card.id; if (card.answer === 'yes') yes++;
   }
   assert.equal(yes, 1016);
   assert.deepEqual(seen, new Set(yesNoFortunes.map(card => card.id)));
  }
 }
});

test('refreshing a fully dealt answer deck reshuffles without repeating the last card', () => {
 const storage = memoryStorage();
 storage.setItem(yesNoDeckStorageKey, JSON.stringify({ version: 1, size: 2032, remaining: [], last: yesNoFortunes[0].id }));
 const card = createYesNoDeck(() => 0, { storage })();
 assert.notEqual(card.id, yesNoFortunes[0].id);
 assert.equal(JSON.parse(storage.getItem(yesNoDeckStorageKey)).remaining.length, 2031);
});

test('corrupt and cross-deck snapshots cannot mix cards or overwrite the original deck', () => {
 const bad = ['not JSON', JSON.stringify({version:1,size:2032,remaining:[fortunes[1].id],last:fortunes[0].id}), JSON.stringify({version:1,size:2032,remaining:[yesNoFortunes[0].id,yesNoFortunes[0].id],last:null})];
 for (const raw of bad) {
  const storage = memoryStorage();
  createFortuneDeck(Math.random, {storage})();
  const original = storage.getItem(fortuneDeckStorageKey);
  storage.setItem(yesNoDeckStorageKey, raw);
  assert.equal(createYesNoDeck(Math.random, {storage})().mode, 'yesno');
  assert.equal(JSON.parse(storage.getItem(yesNoDeckStorageKey)).remaining.length, 2031);
  assert.equal(storage.getItem(fortuneDeckStorageKey), original);
 }
});

test('restricted storage still gives a complete, nonrepeating answer deck', () => {
 const storage = {getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
 const draw = createYesNoDeck(Math.random, {storage});
 assert.equal(new Set(Array.from({length:2032}, () => draw().id)).size, 2032);
});

test('failed answer writes do not replay the last saved snapshot', () => {
 const remaining = yesNoFortunes.slice(1).map(card => card.id);
 const raw = JSON.stringify({version:1,size:2032,remaining,last:yesNoFortunes[0].id});
 const draw = createYesNoDeck(Math.random, {storage:{getItem:()=>raw,setItem(){throw Error('quota');}}});
 for(let n = 0; n < 40; n++) assert.equal(draw().id, remaining.pop());
});

test('device mode selection retains the same deck instance and never consumes cards merely by switching', t => {
 const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
 const storage = memoryStorage();
 Object.defineProperty(globalThis, 'localStorage', {configurable:true,value:storage});
 t.after(() => original ? Object.defineProperty(globalThis, 'localStorage', original) : delete globalThis.localStorage);
 const regular = getDeviceFortuneDeck(), yesNo = getDeviceFortuneDeck('yesno');
 assert.notEqual(regular, yesNo);
 assert.equal(storage.values.size, 0);
 assert.equal(getDeviceFortuneDeck('fortune'), regular);
 assert.equal(getDeviceFortuneDeck('yesno'), yesNo);
 assert.equal(storage.values.size, 0);
 assert.ok(!regular().mode);
 assert.equal(yesNo().mode, 'yesno');
 assert.equal(storage.values.size, 2);
});

test('saved answer cards identify the verdict while original card labels remain unchanged', () => {
 const ctx = {font:'',measureText(text){return {width: text.length * Number.parseFloat(this.font) * .58};}};
 const fixed = {luckyNumber:42,issuedAt:'2026-09-09T12:00:00.000Z'};
 const regular = layoutFortuneCard(ctx, {...fortunes[0],...fixed});
 const yes = layoutFortuneCard(ctx, {...yesNoFortunes.find(card => card.answer === 'yes'),...fixed});
 const no = layoutFortuneCard(ctx, {...yesNoFortunes.find(card => card.answer === 'no'),...fixed});
 assert.ok(regular.some(line=>line.text==='A FORTUNE FOR YOU'));
 for(const lines of [yes,no]) {
  assert.ok(lines.some(line=>line.text==='THE TELLER’S VERDICT'));
  assert.ok(lines.every(line=>line.y>=262&&line.y+line.size<=1210));
 }
});
