import test from 'node:test';
import assert from 'node:assert/strict';
import {spreadChoices,spreads} from '../../shared/spreads.js';
import {generateSchema,profileUpsertSchema} from '../src/validation/schemas.js';
import {generateReading} from '../src/services/readingService.js';
import {generateLocalReading} from '../../client/src/lib/localFallback.js';
import {buildReading} from '../src/tarot/interpretation.js';
import {positionPrompts} from '../src/tarot/knowledge.js';

const expectedCounts={three:3,shadow:5,love:5,career:5,celtic:10,daily:1,clarity:3,balance:3,crossroads:5,release:4,newMoon:4,fullMoon:4,horseshoe:7};

test('every visible spread can be selected, saved as a preference, and read online or on device',()=>{
 assert.deepEqual(spreadChoices.map(choice=>choice.id),Object.keys(expectedCounts));
 for(const choice of spreadChoices) {
  const count=expectedCounts[choice.id];
  assert.equal(Number(choice.count),count);
  const input=generateSchema.parse({spread:choice.id,profile:{preferredSpread:choice.id},personalInfluence:false,reversals:false});
  assert.equal(profileUpsertSchema.parse({preferredSpread:choice.id}).preferredSpread,choice.id);
  const online=generateReading(input);
  const local=generateLocalReading({spread:choice.id,birthInfluence:false,reversals:'no'});
  for(const reading of [online,local]) {
   assert.equal(reading.cards.length,count);
   assert.equal(reading.spread.key,choice.id);
   assert.equal(reading.spread.name,spreads[choice.id].name);
   assert.equal(new Set(reading.cards.map(entry=>entry.card.id)).size,count);
   assert.deepEqual(reading.cards.map(entry=>entry.position),spreads[choice.id].positions);
   assert.ok(reading.cards.every(entry=>entry.reversed===false));
   assert.deepEqual(reading.analysis.connections,[]);
   assert.ok(!JSON.stringify(reading.analysis).includes('undefined'));
   reading.cards.forEach((entry,index)=>{
    assert.ok(positionPrompts[entry.position]?.length>30);
    assert.ok(reading.analysis.cardNotes[index].positionMeaning.includes(positionPrompts[entry.position]));
   });
  }
  const reconstructed=buildReading({...input,profile:local.profile},local.cards.map(entry=>entry.card),local.cards.map(entry=>entry.reversed),local.readingId);
  assert.deepEqual(local.analysis,reconstructed.analysis);
 }
});

test('unknown spread IDs cannot enter reading or profile persistence',()=>{
 for(const spread of ['invented','__proto__','',null,42]) {
  assert.equal(generateSchema.safeParse({spread}).success,false);
  assert.equal(profileUpsertSchema.safeParse({preferredSpread:spread}).success,false);
 }
});

test('the daily one-card story has its own focus rather than comparing a card with itself',()=>{
 const reading=generateReading(generateSchema.parse({spread:'daily',personalInfluence:false}));
 assert.equal(reading.analysis.story[1].title,'One card, one focus');
 assert.ok(!reading.analysis.story[1].text.includes('Read it alongside'));
 assert.ok(!reading.analysis.application.includes('Then '));
 assert.equal(reading.analysis.application.split(reading.cards[0].card.name).length-1,1);
});

test('Horseshoe centers its present reflection on the second position',()=>{
 const reading=generateReading(generateSchema.parse({spread:'horseshoe',personalInfluence:false}));
 assert.ok(reading.analysis.story[0].text.startsWith(reading.cards[1].card.name+' appears in “Where You Stand”'));
 assert.ok(reading.analysis.story[1].text.startsWith(reading.cards[0].card.name));
});
