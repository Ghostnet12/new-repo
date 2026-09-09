import test from 'node:test';
import assert from 'node:assert/strict';
import {createFortuneDeck,fortunes,fortuneDeckStorageKey} from '../src/lib/fortunes.js';
import {pages,tabFromLocation} from '../../shared/pages.js';
import {readFile} from 'node:fs/promises';

function memoryStorage(initial=null) {
 let value=initial;
 return {
  getItem(key){assert.equal(key,fortuneDeckStorageKey);return value;},
  setItem(key,next){assert.equal(key,fortuneDeckStorageKey);value=next;}
 };
}

test('the collection contains 2,000 additional complete, distinct fortunes',()=>{
 assert.equal(fortunes.length,2032);
 assert.equal(fortunes.filter(card=>card.id.startsWith('fold-')).length,2000);
 const normalize=value=>value.toLowerCase().replace(/[^a-z0-9]/g,'');
 for(const key of ['id','title','message']) {
  assert.ok(fortunes.every(card=>typeof card[key]==='string'&&card[key].trim().length>0));
  assert.equal(new Set(fortunes.map(card=>normalize(card[key]))).size,2032,key);
 }
 assert.ok(fortunes.every(card=>card.whisper?.trim()&&!card.message.includes('|')&&!card.message.includes('undefined')));
});

test('refreshes retain the unfinished collection and every card is seen before reshuffling',()=>{
 const storage=memoryStorage();let draw=createFortuneDeck(Math.random,{storage});
 const seen=new Set();let last;
 for(let i=0;i<fortunes.length;i++) {
  if(i%17===0)draw=createFortuneDeck(Math.random,{storage});
  const card=draw();assert.ok(!seen.has(card.id));seen.add(card.id);last=card.id;
 }
 assert.equal(seen.size,2032);
 assert.deepEqual(JSON.parse(storage.getItem(fortuneDeckStorageKey)).remaining,[]);
 const next=createFortuneDeck(Math.random,{storage})();
 assert.notEqual(next.id,last);
 assert.equal(JSON.parse(storage.getItem(fortuneDeckStorageKey)).remaining.length,2031);
});

test('a resumed deck deals the saved order, including completed draws in another tab',()=>{
 const storage=memoryStorage();const firstTab=createFortuneDeck(()=>.4,{storage});firstTab();
 const pending=JSON.parse(storage.getItem(fortuneDeckStorageKey)).remaining;
 const secondTab=createFortuneDeck(()=>.8,{storage});
 assert.equal(secondTab().id,pending.pop());
 assert.equal(firstTab().id,pending.pop());
 assert.equal(createFortuneDeck(()=>.2,{storage})().id,pending.pop());
});

test('bad or obsolete stored decks recover to a complete usable collection',()=>{
 const valid={version:1,size:fortunes.length,remaining:[fortunes[1].id],last:fortunes[0].id};
 const invalid=['broken JSON',JSON.stringify({...valid,version:0}),JSON.stringify({...valid,size:32}),
  JSON.stringify({...valid,remaining:['missing-card']}),JSON.stringify({...valid,last:'missing-card'}),
  JSON.stringify({...valid,remaining:[fortunes[1].id,fortunes[1].id]}),
  JSON.stringify({...valid,remaining:[fortunes[0].id]}),JSON.stringify({...valid,remaining:{}})];
 for(const value of invalid) {
  const storage=memoryStorage(value);const draw=createFortuneDeck(Math.random,{storage});
  const drawn=draw();assert.ok(fortunes.some(card=>card.id===drawn.id));
  assert.equal(JSON.parse(storage.getItem(fortuneDeckStorageKey)).remaining.length,2031);
 }
});

test('blocked storage still deals without early repeats',()=>{
 const storage={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
 const draw=createFortuneDeck(Math.random,{storage});
 assert.equal(new Set(Array.from({length:fortunes.length},()=>draw().id)).size,fortunes.length);
});

test('failed writes cannot replay a stale saved draw',()=>{
 const pending=fortunes.slice(1).map(card=>card.id);
 const raw=JSON.stringify({version:1,size:fortunes.length,remaining:pending,last:fortunes[0].id});
 const storage={getItem(){return raw;},setItem(){throw Error('quota exceeded');}};
 const draw=createFortuneDeck(Math.random,{storage});
 for(let i=0;i<20;i++)assert.equal(draw().id,pending.pop());
});

test('refreshing an exhausted collection cannot immediately repeat its last card',()=>{
 for(const [random,last] of [[()=>0,fortunes[0].id],[()=>.999999999,fortunes.at(-1).id]]) {
  const storage=memoryStorage(JSON.stringify({version:1,size:fortunes.length,remaining:[],last}));
  assert.notEqual(createFortuneDeck(random,{storage})().id,last);
  assert.equal(JSON.parse(storage.getItem(fortuneDeckStorageKey)).remaining.length,2031);
 }
});

test('each collection is fully dealt, including across several reshuffles',()=>{
 const draw=createFortuneDeck();let last;
 for(let round=0;round<5;round++){
  const ids=new Set();
  for(let i=0;i<fortunes.length;i++){
   const card=draw();
   assert.notEqual(card.id,last);assert.ok(!ids.has(card.id));
   assert.ok(Number.isInteger(card.luckyNumber)&&card.luckyNumber>=1&&card.luckyNumber<=99);
   assert.ok(Number.isFinite(Date.parse(card.issuedAt)));
   ids.add(card.id);last=card.id;
  }
  assert.deepEqual(ids,new Set(fortunes.map(card=>card.id)));
 }
});

test('extreme random values keep the boundary safe and number in range',()=>{
 for(const random of [()=>0,()=>.999999999]){
  const draw=createFortuneDeck(random);let last;
  for(let i=0;i<fortunes.length*3;i++){
   const card=draw();assert.notEqual(card.id,last);
   assert.ok(card.luckyNumber===1||card.luckyNumber===99);last=card.id;
  }
 }
});

test('drawn cards cannot mutate the source collection',()=>{
 const original=JSON.stringify(fortunes);const card=createFortuneDeck()();
 card.title='changed';card.message='changed';
 assert.equal(JSON.stringify(fortunes),original);
});

test('fortune URL resolves on direct entry and has a production route',async()=>{
 const path=pages.fortune.path;
 assert.equal(tabFromLocation({pathname:path,hash:''}),'fortune');
 assert.equal(tabFromLocation({pathname:path+'/',hash:''}),'fortune');
 const config=JSON.parse(await readFile(new URL('../../vercel.json',import.meta.url),'utf8'));
 assert.ok(config.routes.some(route=>route.src===path+'/?'&&route.dest===path+'/index.html'));
});
