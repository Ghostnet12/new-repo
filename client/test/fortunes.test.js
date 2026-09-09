import test from 'node:test';
import assert from 'node:assert/strict';
import {createFortuneDeck,fortunes} from '../src/lib/fortunes.js';
import {pages,tabFromLocation} from '../../shared/pages.js';
import {readFile} from 'node:fs/promises';

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
