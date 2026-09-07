import test from 'node:test';
import assert from 'node:assert/strict';
import { personalContext, lifePathFor, nameNumberFor, validBirthDate, buildReading } from '../src/tarot/interpretation.js';
import { cards, spreads } from '../src/tarot/deck.js';
import { generateSchema } from '../src/validation/schemas.js';
import { generateLocalReading } from '../../client/src/lib/localFallback.js';
import { plainMeaning } from '../src/tarot/cardStories.js';

test('component reduction preserves masters and matches published worked example',()=>{
 assert.equal(lifePathFor('1980-10-22').value,5);
 assert.equal(lifePathFor('1990-05-12').value,9);
 assert.equal(lifePathFor('2000-01-08').value,11);
 assert.equal(lifePathFor('2000-09-11').value,22);
});
test('name mapping normalizes supported accents without inventing unsupported names',()=>{
 assert.equal(nameNumberFor('A B C').value,6);
 assert.equal(nameNumberFor('José').value,nameNumberFor('Jose').value);
 assert.equal(nameNumberFor('李明'),null);
 assert.equal(nameNumberFor('Alex 李'),null);
 assert.equal(nameNumberFor(''),null);
});
test('all calendar sign ranges and year wrap are correct and explicitly approximate',()=>{
 const dates=['03-21','04-20','05-21','06-21','07-23','08-23','09-23','10-23','11-22','12-22','01-20','02-19'];
 const names=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
 dates.forEach((date,i)=>{const p=personalContext({birthday:`1990-${date}`});assert.equal(p.zodiac,names[i]);assert.equal(p.zodiacApproximate,true);assert.ok(p.zodiacCard);});
 assert.equal(personalContext({birthday:'1990-01-19'}).zodiac,'Capricorn');
 assert.equal(personalContext({birthday:'1990-03-20'}).zodiac,'Pisces');
});
test('invalid dates never generate birthday symbolism',()=>{
 for(const birthday of ['2001-02-29','2026-02-30','1899-12-31','2099-01-01','not a date']) {assert.equal(validBirthDate(birthday),false);assert.equal(personalContext({birthday}).lifePath,null);}
 assert.equal(validBirthDate('2000-02-29'),true);
});
test('opt out is preserved by schema and removes every personal layer',()=>{
 const input=generateSchema.parse({personalInfluence:false,profile:{name:'Alice',birthday:'1990-05-12'}});
 const reading=buildReading(input,cards.slice(0,3),[false,false,false],'test');
 assert.equal(reading.personalization.nameNumber,null);
 assert.equal(reading.personalization.zodiac,null);
 assert.deepEqual(reading.analysis.connections,[]);
});
test('every spread has position-specific notes, reversed meanings and contextual advice',()=>{
 for(const [key,spread] of Object.entries(spreads)) {
 const draw=cards.slice(0,spread.positions.length);
 const input={profile:{name:'Alice',birthday:'1990-05-12'},spread:key,focus:'career',need:'clarity',question:'How can I improve my work?'};
 const r=buildReading(input,draw,draw.map(()=>true),'test');
 assert.equal(r.analysis.cardNotes.length,draw.length);
 assert.equal(r.analysis.cardNotes[0].text,plainMeaning(draw[0],true));
 assert.match(r.analysis.cardNotes[0].relevance,/work/);
 assert.ok(r.analysis.cardNotes.every(n=>n.positionMeaning.length>30&&n.practice.length>15));
 assert.equal(r.analysis.story.length,3);
 assert.equal(r.analysis.actionPlan.length,3);
 assert.ok(r.analysis.takeaway.includes(draw.at(-1).advice));
 assert.ok(r.analysis.application.includes(draw.at(-1).name));
 assert.ok(r.analysis.connections.length>=3);
 assert.ok(r.analysis.cardNotes.every(n=>!n.text.includes('undefined')));
 }
});
test('all 78 cards have distinct, authored meanings in both orientations',()=>{
 const meanings=cards.flatMap(card=>[plainMeaning(card),plainMeaning(card,true)]);
 assert.equal(new Set(meanings).size,156);
 assert.ok(meanings.every(text=>text&&!text.includes('undefined')&&!text.includes('invites reflection on')));
});
test('personalization changes connections, not cards; gender does not stereotype',()=>{
 const input={profile:{name:'Alice',birthday:'1990-05-12',gender:'Woman'},spread:'three',focus:'love',need:'direction',question:''};
 const a=buildReading(input,cards.slice(0,3),[false,true,false],'same');
 const b=buildReading({...input,profile:{...input.profile,gender:'Man'}},cards.slice(0,3),[false,true,false],'same');
 assert.deepEqual(a.analysis,b.analysis);
 const c=buildReading({...input,profile:{...input.profile,birthday:'1980-10-22'}},cards.slice(0,3),[false,true,false],'same');
 assert.deepEqual(a.cards,c.cards);assert.notDeepEqual(a.analysis.connections,c.analysis.connections);
});
test('device fallback uses the same interpreter and opt-out rules',()=>{
 const form={name:'Alice',birthday:'1990-05-12',birthInfluence:true,spread:'celtic',focus:'decision',need:'clarity',question:'Which next step?',reversals:'no'};
 const local=generateLocalReading(form);
 const reconstructed=buildReading({...form,profile:local.profile},local.cards.map(e=>e.card),local.cards.map(e=>e.reversed),local.readingId);
 assert.deepEqual(local.analysis,reconstructed.analysis);
 assert.equal(local.cards.length,10);assert.equal(new Set(local.cards.map(e=>e.card.id)).size,10);
 const off=generateLocalReading({...form,birthInfluence:false});assert.deepEqual(off.analysis.connections,[]);
});
