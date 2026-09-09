import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import mongoose from 'mongoose';
import {connectMongo} from '../server/src/config/db.js';
import {collectorModels,Edition,CollectorCard} from '../server/src/collectors/models.js';
import {prepareEdition} from '../server/src/collectors/inventory.js';
if(!process.argv.includes('--confirm-first-series'))throw Error('Pass --confirm-first-series to initialise the two shared decks. Existing decks are never reshuffled.');
if(!await connectMongo())throw Error('MONGODB_URI must point to the intended replica-set database.');
try{
 await Promise.all(collectorModels.map(m=>m.init()));
 const file=readFileSync(new URL('../server/data/collector-first-edition.json',import.meta.url));const data=JSON.parse(file);const manifest=createHash('sha256').update(file).digest('hex');
 for(const mode of ['fortune','yesno']){
  const id=`first-${mode}`,cards=data.cards.filter(c=>c.mode===mode);
  if(cards.length!==2042||cards.filter(c=>c.joker).length!==4||new Set(cards.map(c=>c.messageHash)).size!==2042)throw Error('Invalid edition manifest');
  const previous=await Edition.findById(id);if(previous){if(previous.manifest!==manifest)throw Error('Existing edition differs; never replace issued messages.');console.log(`${id}: already initialised; no changes`);continue;}
  const shuffled=prepareEdition(cards);
  await mongoose.connection.transaction(async session=>{
   await Edition.create([{_id:id,mode,label:data.label,total:2042,packLimit:203,jokersLeft:4,manifest}],{session});
   await CollectorCard.insertMany(shuffled.map((c,position)=>({...c,_id:c.id,id:undefined,edition:id,position,serial:`${mode==='fortune'?'F':'Y'}-${c.id.split('-').at(-1)}`})),{session});
  });console.log(`${id}: 2,042 cards, double shuffle saved`);
 }
}finally{await mongoose.disconnect();}
