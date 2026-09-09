import mongoose from 'mongoose';
import {createHash} from 'node:crypto';
import manifest from '../../data/collector-first-edition.json' with {type:'json'};
import {Edition,CollectorCard} from './models.js';
import {prepareEdition} from './inventory.js';
const ids=['first-fortune','first-yesno'];
export const firstSeriesHash=createHash('sha256').update(JSON.stringify(manifest)).digest('hex');
// Only the fixed, reviewed first-series manifest may be bootstrapped. No caller
// supplies cards, positions, balances, or edition names. Existing stock is untouched.
export async function initialiseFirstSeries(){
 const existing=await Edition.find({_id:{$in:ids}}).select('_id manifest').lean();
 if(existing.length===2)return;
 const decks=ids.filter(id=>!existing.some(e=>e._id===id)).map(id=>{
  const mode=id.slice(6),cards=manifest.cards.filter(c=>c.mode===mode);
  if(cards.length!==2042||cards.filter(c=>c.joker).length!==4||new Set(cards.map(c=>c.messageHash)).size!==2042)throw Error('Invalid first-series manifest');
  return {id,mode,cards:prepareEdition(cards)};
 });
 try{await mongoose.connection.transaction(async session=>{
  for(const deck of decks){
   if(await Edition.exists({_id:deck.id}).session(session))continue;
   await Edition.create([{_id:deck.id,mode:deck.mode,label:manifest.label,total:2042,packLimit:203,jokersLeft:4,manifest:firstSeriesHash}],{session});
   await CollectorCard.insertMany(deck.cards.map((c,position)=>({...c,_id:c.id,id:undefined,edition:deck.id,position,serial:`${deck.mode==='fortune'?'F':'Y'}-${c.id.split('-').at(-1)}`})),{session});
  }
 });}catch(error){if(error.code===11000&&await Edition.countDocuments({_id:{$in:ids}})===2)return;throw error;}
}
