import test from 'node:test';
import assert from 'node:assert/strict';
import { cards, spreads } from '../src/tarot/deck.js';
import { generateReading } from '../src/services/readingService.js';

test('canonical deck contains 78 unique card ids and names', () => {
  assert.equal(cards.length, 78);
  assert.equal(new Set(cards.map(c => c.id)).size, 78);
  assert.equal(new Set(cards.map(c => c.name)).size, 78);
  assert.equal(cards.filter(c => c.type === 'major').length, 22);
  assert.equal(cards.filter(c => c.type === 'minor').length, 56);
});

test('all spreads generate the requested number of unique cards', () => {
  for (const [key, spread] of Object.entries(spreads)) {
    const reading = generateReading({ profile:{name:'Test',gender:'',birthday:'',preferredSpread:key}, question:'', spread:key, focus:'general', need:'clarity', reversals:true });
    assert.equal(reading.cards.length, spread.positions.length);
    assert.equal(new Set(reading.cards.map(x => x.card.id)).size, spread.positions.length);
    assert.ok(reading.analysis.finalMessage);
    assert.ok(reading.analysis.realityCheck);
  }
});

test('reversals can be disabled', () => {
  const reading = generateReading({ profile:{name:'Test',gender:'',birthday:'',preferredSpread:'celtic'}, question:'', spread:'celtic', focus:'general', need:'direction', reversals:false });
  assert.ok(reading.cards.every(x => x.reversed === false));
});

test('birthday personalization returns birth, zodiac and life-path context', () => {
  const reading = generateReading({ profile:{name:'Test',gender:'',birthday:'1990-05-12',preferredSpread:'three'}, question:'', spread:'three', focus:'general', need:'clarity', reversals:false });
  assert.ok(reading.personalization.birthCard);
  assert.ok(reading.personalization.zodiacCard);
  assert.equal(reading.personalization.zodiac, 'Taurus');
  assert.ok(Number.isInteger(reading.personalization.lifePath));
});
