import mongoose from 'mongoose';
import {randomInt} from 'node:crypto';
import {Edition,CollectorCard,Wallet,PackOrder,Draw} from './models.js';
import {fail} from './auth.js';
export const PACK_DRAWS=10,PACK_CENTS=500,JOKER_BONUS=3;
export const validId=id=>typeof id==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
export function shuffleTwice(cards,random=randomInt){const deck=[...cards];for(let pass=0;pass<2;pass++)for(let i=deck.length-1;i>0;i--){const j=random(i+1);[deck[i],deck[j]]=[deck[j],deck[i]];}return deck;}
export async function reservePack(owner,edition,requestId){
 if(!validId(requestId))fail(400,'A valid purchase request is required.');
 return mongoose.connection.transaction(async session=>{
  const prior=await PackOrder.findById(requestId).session(session);
  if(prior){if(String(prior.owner)!==String(owner)||prior.edition!==edition)fail(409,'That purchase request belongs to another order.');return prior.toObject();}
  if(await PackOrder.exists({owner,state:'reserved'}).session(session))fail(409,'You already have a checkout waiting. Return to it or allow it to expire.');
  const stock=await Edition.findOneAndUpdate({_id:edition,state:'ready',$expr:{$lt:['$packsReserved','$packLimit']}},{$inc:{packsReserved:1}},{new:true,session});
  if(!stock)fail(409,'This edition has no unreserved packs left.');
  const [order]=await PackOrder.create([{_id:requestId,owner,edition,checkoutExpiresAt:new Date(Date.now()+3600000)}],{session});return order.toObject();
 });
}
export async function settlePack(stripeSession,eventType){
 const orderId=stripeSession.client_reference_id;
 if(!validId(orderId))return;
 return mongoose.connection.transaction(async session=>{
  const order=await PackOrder.findById(orderId).session(session);if(!order)return;
  if(stripeSession.metadata?.edition!==order.edition||stripeSession.metadata?.owner!==String(order.owner)||stripeSession.mode!=='payment'||stripeSession.amount_total!==PACK_CENTS||stripeSession.currency!=='usd')fail(400,'Payment does not match the reserved pack.');
  if(order.stripeSession&&order.stripeSession!==stripeSession.id)fail(400,'Payment session does not match the reserved pack.');
  if(order.state==='paid')return;
  if(eventType==='checkout.session.expired'){
   if(order.state==='reserved'&&stripeSession.status==='expired'&&stripeSession.payment_status==='unpaid'){
    order.state='expired';order.stripeSession=stripeSession.id;await order.save({session});
    await Edition.updateOne({_id:order.edition},{$inc:{packsReserved:-1}},{session});
   }return;
  }
  if(stripeSession.payment_status!=='paid')return;
  if(order.state==='expired')fail(409,'Expired order received a payment; reconciliation is required.');
  order.state='paid';order.stripeSession=stripeSession.id;order.livemode=stripeSession.livemode;order.paidAt=new Date();await order.save({session});
  await Wallet.findOneAndUpdate({owner:order.owner,edition:order.edition},{$inc:{credits:PACK_DRAWS}},{upsert:true,session});
 });
}
export async function drawCard(owner,edition,requestId){
 if(!validId(requestId))fail(400,'A valid draw request is required.');
 return mongoose.connection.transaction(async session=>{
  const prior=await Draw.findOne({owner,requestId}).session(session);
  if(prior){if(prior.edition!==edition)fail(409,'That draw belongs to another edition.');return prior.card;}
  const wallet=await Wallet.findOneAndUpdate({owner,edition,credits:{$gte:1}},{$inc:{credits:-1}},{session,new:true});
  if(!wallet)fail(409,'You have no draws remaining for this edition.');
  const stock=await Edition.findOneAndUpdate({_id:edition,$expr:{$lt:['$cursor','$total']}},{$inc:{cursor:1}},{session,new:false});
  if(!stock)fail(409,'This edition is out of cards. Your unused draw has been kept.');
  const card=await CollectorCard.findOne({edition,position:stock.cursor}).session(session).lean();
  if(!card)fail(503,'This edition needs attention. Your draw has been kept.');
  const issued={id:card._id,mode:card.mode,title:card.title,message:card.message,whisper:card.whisper,joker:card.joker,edition:stock._id,editionLabel:stock.label,serial:card.serial,limited:true,luckyNumber:randomInt(1,100),issuedAt:new Date().toISOString()};
  if(card.joker){await Wallet.updateOne({_id:wallet._id},{$inc:{credits:JOKER_BONUS}},{session});await Edition.updateOne({_id:edition},{$inc:{jokersLeft:-1}},{session});}
  await Draw.create([{owner,requestId,edition,cardId:card._id,card:issued}],{session});return issued;
 });
}

export function canCompleteDeck(cards,paidDraws){let credits=paidDraws;for(const card of cards){if(credits<=0)return false;credits-=1;if(card.joker)credits+=JOKER_BONUS;}return credits===0;}
export function prepareEdition(cards,random=randomInt){const paid=cards.length-cards.filter(c=>c.joker).length*JOKER_BONUS;for(let attempt=0;attempt<1000;attempt++){const shuffled=shuffleTwice(cards,random);if(canCompleteDeck(shuffled,paid))return shuffled;}throw new Error('Unable to prepare a reachable edition');}
