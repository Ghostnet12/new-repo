import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculateNatal, calculateAspects, angleDistance, resolveBirthTime, zodiacPosition} from '../src/tarot/natal.js';
import {personalContext, buildReading} from '../src/tarot/interpretation.js';
import {generateSchema} from '../src/validation/schemas.js';
import {generateLocalReading} from '../../client/src/lib/localFallback.js';

const reference=JSON.parse(readFileSync(new URL('./fixtures/natal-reference.json',import.meta.url)));
const profile={name:'Sample Reader',birthday:'1980-10-22',natal:{enabled:true,time:'14:30',place:'New York',latitude:'40.7128',longitude:'-74.006',timezone:'America/New_York',timeAccuracy:'exact',disambiguation:'reject'}};

test('planetary longitudes, angles and Whole Sign cusps match independent ephemeris fixtures',()=>{
 for(const f of reference.fixtures){
  const c=calculateNatal({birthday:f.utc.slice(0,10),natal:{enabled:true,time:f.utc.slice(11,16),latitude:String(f.latitude),longitude:String(f.longitude),timezone:'UTC'}});
  assert.equal(c.status,'ready',f.label);
  assert.equal(c.planets.length,10);
  for(const p of c.planets){
   assert.ok(angleDistance(p.longitude,f.planets[p.name].longitude)<1/60,`${f.label} ${p.name} within one arcminute`);
   if(Math.abs(f.planets[p.name].speed)>.01)assert.equal(p.motion,f.planets[p.name].speed<0?'Retrograde':'Direct',`${f.label} ${p.name} motion`);
   assert.equal(p.house,((Math.floor(f.planets[p.name].longitude/30)-Math.floor(f.ascendant/30)+12)%12)+1);
  }
  assert.ok(angleDistance(c.angles.ascendant.longitude,f.ascendant)<.002,`${f.label} rising`);
  assert.ok(angleDistance(c.angles.midheaven.longitude,f.midheaven)<.002,`${f.label} meridian`);
  assert.deepEqual(c.houses.map(h=>h.longitude),f.houses);
  assert.ok(Math.abs(angleDistance(c.angles.ascendant.longitude,c.angles.descendant.longitude)-180)<1e-9);
 }
});
test('birthplace local time uses historical daylight saving and fractional time-zone offsets',()=>{
 assert.equal(resolveBirthTime(profile.birthday,profile.natal).utc,'1980-10-22T18:30:00Z');
 assert.equal(resolveBirthTime('1980-12-22',profile.natal).utc,'1980-12-22T19:30:00Z');
 assert.equal(resolveBirthTime('2000-01-01',{...profile.natal,time:'12:00',timezone:'Asia/Kathmandu'}).utc,'2000-01-01T06:15:00Z');
});
test('DST gaps are rejected, while repeated clock times require an explicit occurrence',()=>{
 assert.throws(()=>resolveBirthTime('2024-03-10',{...profile.natal,time:'02:30'}),/skipped/);
 assert.throws(()=>resolveBirthTime('2024-11-03',{...profile.natal,time:'01:30'}),/happened twice/);
 const first=resolveBirthTime('2024-11-03',{...profile.natal,time:'01:30',disambiguation:'earlier'});
 const second=resolveBirthTime('2024-11-03',{...profile.natal,time:'01:30',disambiguation:'later'});
 assert.equal(first.utc,'2024-11-03T05:30:00Z');assert.equal(second.utc,'2024-11-03T06:30:00Z');
 assert.equal(second.date-first.date,3600000);
});
test('missing, unknown and invalid birth details never manufacture a chart',()=>{
 assert.equal(calculateNatal({}).status,'not_requested');
 for(const change of [{time:''},{latitude:''},{longitude:''},{timeAccuracy:'unknown'}])assert.equal(calculateNatal({...profile,natal:{...profile.natal,...change}}).status,'incomplete');
 for(const change of [{latitude:'90'},{longitude:'181'},{latitude:'no'},{timezone:'Invalid/Place'},{time:'24:00'}])assert.equal(calculateNatal({...profile,natal:{...profile.natal,...change}}).status,'invalid');
 for(const birthday of ['1900-02-29','2000-02-30','1899-01-01','2099-01-01'])assert.equal(calculateNatal({...profile,birthday}).status,'invalid');
 assert.equal(calculateNatal({...profile,natal:{...profile.natal,latitude:'0',longitude:'0'}}).status,'ready');
});
test('sign boundaries and aspects correctly cross zero degrees',()=>{
 assert.equal(zodiacPosition(359.999).label,'29°59′ Pisces');
 assert.equal(zodiacPosition(360).sign,'Aries');
 assert.equal(zodiacPosition(-1).sign,'Pisces');
 const pair=(a,b)=>calculateAspects([{name:'Mercury',longitude:a},{name:'Venus',longitude:b}]);
 assert.equal(pair(359,1)[0].name,'Conjunction');assert.equal(pair(359,1)[0].orb,2);
 assert.equal(pair(359,89)[0].name,'Square');
 assert.equal(pair(359,179)[0].name,'Opposition');
 assert.equal(pair(0,45).length,0);
 assert.equal(pair(0,7).length,0);
 assert.equal(calculateAspects([{name:'Sun',longitude:0},{name:'Moon',longitude:7}])[0].name,'Conjunction');
});
test('calculated Sun corrects a boundary-date estimate and chart snapshot reaches readings',()=>{
 const input={...profile,birthday:'2024-03-20',natal:{...profile.natal,time:'12:00',timezone:'UTC'}};
 const p=personalContext(input);assert.equal(p.zodiac,'Aries');assert.equal(p.zodiacApproximate,false);assert.equal(p.natal.status,'ready');
 assert.equal(personalContext({birthday:input.birthday}).zodiac,'Pisces');
 const form={...profile,birthInfluence:true,spread:'three',focus:'career',need:'clarity',question:'What should I focus on at work?',reversals:'no'};
 const local=generateLocalReading(form);
 const server=buildReading({...form,profile:local.profile,personalInfluence:true},local.cards.map(e=>e.card),local.cards.map(e=>e.reversed),local.readingId);
 assert.deepEqual(local.personalization,server.personalization);assert.deepEqual(local.analysis,server.analysis);
 assert.equal(local.personalization.natal.planets.length,10);
 assert.ok(local.analysis.connections.some(c=>c.title==='Your Moon and rising sign'));
 assert.ok(local.analysis.connections.some(c=>c.title==='Saturn and your chosen focus'));
 const off=generateLocalReading({...form,birthInfluence:false});
 assert.equal(off.personalization.natal,undefined);assert.deepEqual(off.analysis.connections,[]);
 assert.deepEqual(off.profile.natal,local.profile.natal);
});
test('API rejects incomplete requested charts but accepts explicit personal-symbolism opt-out',()=>{
 assert.equal(generateSchema.safeParse({profile}).success,true);
 const incomplete={...profile,natal:{...profile.natal,time:''}};
 assert.equal(generateSchema.safeParse({profile:incomplete}).success,false);
 assert.equal(generateSchema.safeParse({profile:incomplete,personalInfluence:false}).success,true);
 assert.equal(generateSchema.safeParse({profile:{...profile,natal:{...profile.natal,time:'01:30'}},question:'Sample'}).success,true);
});
