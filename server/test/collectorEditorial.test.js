import test from 'node:test';
import assert from 'node:assert/strict';
import {assessCollectorWriting} from '../src/collectors/editorial.js';
import {paymentConfig} from '../src/collectors/http.js';
const a={title:'The borrowed ladder',message:'You have climbed enough ladders leaning against somebody else’s wall. Choose where your own window belongs.'};
const b={title:'The borrowed map',message:'You have climbed enough ladders leaning against somebody else’s wall. The view is not a contract.'};
test('recombined endings and serial changes cannot pass the collector writing check',()=>{
 const report=assessCollectorWriting({cards:[{...a,id:'one'},{...b,id:'two'}]});
 assert.equal(report.duplicateMessages,0);assert.equal(report.repeatedSentences,1);assert.equal(report.passes,false);
});
test('composition disclosure and repeated titles are release blockers',()=>{
 assert.equal(assessCollectorWriting({composed:true,cards:[a]}).passes,false);
 assert.equal(assessCollectorWriting({cards:[a,{title:a.title,message:'The kettle can finish boiling while you decide what to say.'}]}).passes,false);
 assert.equal(assessCollectorWriting({cards:[a]}).passes,true);
});
test('Stripe configuration cannot enable sales of the repetitive first series',()=>{
 const names=['STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','COLLECTOR_PAYMENTS_ENABLED','COLLECTOR_JOKER_REVIEW_COMPLETE'];
 const before=names.map(n=>process.env[n]);
 try{
  Object.assign(process.env,{STRIPE_SECRET_KEY:'sk_test_editorial_check',STRIPE_WEBHOOK_SECRET:'whsec_editorial_check',COLLECTOR_PAYMENTS_ENABLED:'true',COLLECTOR_JOKER_REVIEW_COMPLETE:'true'});
  assert.equal(paymentConfig().configured,true);assert.equal(paymentConfig().enabled,false);
 }finally{names.forEach((name,i)=>{if(before[i]===undefined)delete process.env[name];else process.env[name]=before[i];});}
});
