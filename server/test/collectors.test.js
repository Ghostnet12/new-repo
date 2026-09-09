import test,{before,after,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,randomInt} from 'node:crypto';
import mongoose from 'mongoose';
import {MongoMemoryReplSet} from 'mongodb-memory-server';
import Stripe from 'stripe';
import {readFileSync} from 'node:fs';
import {connectMongo} from '../src/config/db.js';
import {collectorModels,Edition,CollectorCard,Wallet,PackOrder,Draw} from '../src/collectors/models.js';
import {reservePack,settlePack,drawCard,prepareEdition,shuffleTwice,canCompleteDeck} from '../src/collectors/inventory.js';
import {collectorHttp,paymentConfig} from '../src/collectors/http.js';
import {signIn,account,sessionCookie} from '../src/collectors/auth.js';
const corpus=JSON.parse(readFileSync(new URL('../data/collector-first-edition.json',import.meta.url)));
let db;
before(async()=>{db=await MongoMemoryReplSet.create({replSet:{count:1}});process.env.MONGODB_URI=db.getUri();process.env.COLLECTOR_SITE_ORIGIN='https://enterthefold.io';await connectMongo();await Promise.all(collectorModels.map(m=>m.init()));});
after(async()=>{await mongoose.disconnect();await db?.stop();});
beforeEach(async()=>{await Promise.all(collectorModels.map(m=>m.deleteMany({})));delete process.env.COLLECTOR_PAYMENTS_ENABLED;delete process.env.COLLECTOR_JOKER_REVIEW_COMPLETE;delete process.env.STRIPE_SECRET_KEY;delete process.env.STRIPE_WEBHOOK_SECRET;});
async function seed(mode='fortune'){
 const cards=prepareEdition(corpus.cards.filter(c=>c.mode===mode));const id=`first-${mode}`;
 await Edition.create({_id:id,mode,label:'First Series',total:2042,packLimit:203,jokersLeft:4});
 await CollectorCard.insertMany(cards.map((c,position)=>({...c,_id:c.id,edition:id,position,serial:`${mode}-${position}`})));
 return cards;
}
function paid(order){return {id:`cs_test_${order._id}`,client_reference_id:order._id,metadata:{edition:order.edition,owner:String(order.owner)},mode:'payment',amount_total:500,currency:'usd',payment_status:'paid',status:'complete',livemode:false};}
async function buy(owner,edition='first-fortune'){const order=await reservePack(owner,edition,randomUUID());await settlePack(paid(order),'checkout.session.completed');return order;}
test('two shuffles, complete corpus counts, unique messages, and reachable bonuses',()=>{
 assert.equal(corpus.cards.length,4084);assert.equal(new Set(corpus.cards.map(c=>c.messageHash)).size,4084);
 let calls=0;shuffleTwice([1,2,3,4],n=>{calls++;return n-1;});assert.equal(calls,6);
 for(const mode of ['fortune','yesno']){const cards=corpus.cards.filter(c=>c.mode===mode);assert.equal(cards.filter(c=>c.joker).length,4);for(let i=0;i<30;i++)assert.ok(canCompleteDeck(prepareEdition(cards),2030));}
 assert.equal(canCompleteDeck([{joker:false},{joker:true}],1),false);
});
test('payment retries award ten once; an expired event cannot revoke a paid order',async()=>{
 await seed();const owner=new mongoose.Types.ObjectId();const id=randomUUID();
 const a=await reservePack(owner,'first-fortune',id);const b=await reservePack(owner,'first-fortune',id);assert.equal(a._id,b._id);
 await Promise.all(Array.from({length:8},()=>settlePack(paid(a),'checkout.session.completed')));
 await settlePack({...paid(a),status:'expired',payment_status:'unpaid'},'checkout.session.expired');
 assert.equal((await Wallet.findOne({owner})).credits,10);assert.equal((await Edition.findById('first-fortune')).packsReserved,1);
});
test('only one buyer reserves the final pack; verified expiry releases it exactly once',async()=>{
 await seed();await Edition.updateOne({_id:'first-fortune'},{$set:{packsReserved:202}});
 const attempts=await Promise.allSettled(Array.from({length:12},()=>reservePack(new mongoose.Types.ObjectId(),'first-fortune',randomUUID())));
 const wins=attempts.filter(r=>r.status==='fulfilled');assert.equal(wins.length,1);
 const expired={...paid(wins[0].value),status:'expired',payment_status:'unpaid'};
 await settlePack(expired,'checkout.session.expired');await settlePack(expired,'checkout.session.expired');
 assert.equal((await Edition.findById('first-fortune')).packsReserved,202);
});
test('concurrent buyers get distinct cards; a repeated draw returns its original card',async()=>{
 await seed();const a=new mongoose.Types.ObjectId(),b=new mongoose.Types.ObjectId();await buy(a);await buy(b);
 const id=randomUUID();const draws=await Promise.all([drawCard(a,'first-fortune',id),drawCard(a,'first-fortune',id),drawCard(b,'first-fortune',randomUUID())]);
 assert.equal(draws[0].id,draws[1].id);assert.notEqual(draws[0].id,draws[2].id);assert.equal(await Draw.countDocuments(),2);
 assert.equal((await Wallet.findOne({owner:a})).credits,9+(draws[0].joker?3:0));
 const after=await drawCard(a,'first-fortune',id);assert.deepEqual(after,draws[0]);
});
test('mode credits are separate and insufficient credit cannot consume inventory',async()=>{
 await seed();await seed('yesno');const owner=new mongoose.Types.ObjectId();await buy(owner);
 await assert.rejects(drawCard(owner,'first-yesno',randomUUID()),/no draws/);
 assert.equal((await Edition.findById('first-yesno')).cursor,0);
 const attacker=new mongoose.Types.ObjectId();const order=await PackOrder.findOne({owner});await assert.rejects(reservePack(attacker,order.edition,order._id),/another order/);
});
test('sold-out rollback preserves credits and issued cards remain saved',async()=>{
 await seed();const owner=new mongoose.Types.ObjectId();await buy(owner);await drawCard(owner,'first-fortune',randomUUID());
 await Edition.updateOne({_id:'first-fortune'},{$set:{cursor:2042}});const credits=(await Wallet.findOne({owner})).credits;
 await assert.rejects(drawCard(owner,'first-fortune',randomUUID()),/out of cards/);
 assert.equal((await Wallet.findOne({owner})).credits,credits);assert.equal(await Draw.countDocuments({owner}),1);
});
test('the entire edition fulfils 203 packs plus all four jokers with no leftover credits',async()=>{
 await seed();const owner=new mongoose.Types.ObjectId();for(let i=0;i<203;i++)await buy(owner);
 await assert.rejects(buy(new mongoose.Types.ObjectId()),/no unreserved packs/);
 let jokers=0;for(let i=0;i<2042;i++){const card=await drawCard(owner,'first-fortune',randomUUID());if(card.joker)jokers++;}
 assert.equal(jokers,4);assert.equal((await Wallet.findOne({owner})).credits,0);assert.equal(await Draw.countDocuments(),2042);assert.equal((await Edition.findById('first-fortune')).jokersLeft,0);
});
test('collector sign-in, private collections, and single-use recovery keys',async()=>{
 const a=await signIn('register',{username:'first_buyer',password:'a sufficiently long password'});
 const b=await signIn('register',{username:'second_buyer',password:'another long password'});
 await seed();await buy(a.user.id);await drawCard(a.user.id,'first-fortune',randomUUID());
 const req=token=>new Request('https://enterthefold.io/api/collectors/collection',{headers:{cookie:`fold_collector=${token}`}});
 assert.equal((await (await collectorHttp(req(a.token),'collection')).json()).cards.length,1);
 assert.equal((await (await collectorHttp(req(b.token),'collection')).json()).cards.length,0);
 const reset=await signIn('recover',{username:'first_buyer',password:'changed password value',recoveryCode:a.recoveryCode});
 assert.equal(await account(req(a.token)),null);assert.ok(await account(req(reset.token)));
 await assert.rejects(signIn('recover',{username:'first_buyer',password:'other changed password',recoveryCode:a.recoveryCode}),/not recognised/);
 assert.match(sessionCookie(a.token),/HttpOnly; SameSite=Strict/);
});
test('checkout stays disabled, cross-origin writes fail, and invalid webhooks grant no credits',async()=>{
 assert.equal(paymentConfig().enabled,false);
 const user=await signIn('register',{username:'safe_buyer',password:'an adequately long password'});
 const request=(origin='https://enterthefold.io')=>new Request('https://enterthefold.io/api/collectors/checkout',{method:'POST',headers:{origin,cookie:`fold_collector=${user.token}`},body:'{}'});
 assert.equal((await collectorHttp(request(),'checkout')).status,503);
 assert.equal((await collectorHttp(request('https://elsewhere.test'),'checkout')).status,403);
 process.env.STRIPE_SECRET_KEY='sk_test_placeholder';process.env.STRIPE_WEBHOOK_SECRET='whsec_placeholder';
 const bad=new Request('https://enterthefold.io/api/collectors/webhook',{method:'POST',body:'{}'});
 assert.equal((await collectorHttp(bad,'webhook')).status,400);assert.equal(await Wallet.countDocuments(),0);
});
test('signed webhook verifies amount and environment before granting an order',async()=>{
 process.env.STRIPE_SECRET_KEY='sk_test_placeholder';process.env.STRIPE_WEBHOOK_SECRET='whsec_placeholder';await seed();
 const owner=new mongoose.Types.ObjectId(),order=await reservePack(owner,'first-fortune',randomUUID());
 const stripe=new Stripe('sk_test_placeholder');
 async function send(data,live=false){const payload=JSON.stringify({id:'evt_test',type:'checkout.session.completed',livemode:live,data:{object:data}});const signature=stripe.webhooks.generateTestHeaderString({payload,secret:'whsec_placeholder'});return collectorHttp(new Request('https://enterthefold.io/api/collectors/webhook',{method:'POST',headers:{'stripe-signature':signature},body:payload}),'webhook');}
 assert.equal((await send({...paid(order),amount_total:1})).status,400);assert.equal((await send(paid(order),true)).status,400);assert.equal(await Wallet.countDocuments(),0);
 assert.equal((await send(paid(order))).status,200);assert.equal((await Wallet.findOne({owner})).credits,10);
});
