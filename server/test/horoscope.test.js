import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDailyHoroscope, calendarDay, nextDayStart } from '../src/tarot/horoscope.js';
import { parsePublisherResponse, collectPublisher } from '../src/services/horoscopeSources.js';
import { generateSchema, profileUpsertSchema, horoscopeSchema, readingUpdateSchema } from '../src/validation/schemas.js';
import { Profile } from '../src/models/Profile.js';
import { Reading } from '../src/models/Reading.js';
import { POST, PATCH } from '../../api/router.js';
import app from '../src/app.js';
import { saveLocalProfile } from '../../client/src/lib/localFallback.js';

const now=new Date('2026-09-08T09:00:00Z');
const natal={enabled:true,time:'12:30',place:'Chicago',latitude:'41.88',longitude:'-87.63',timezone:'America/Chicago',timeAccuracy:'exact',disambiguation:'reject'};
const token='a'.repeat(64);
const input={profile:{name:'Test Seeker',birthday:'1990-03-12',natal},sign:'profile',focus:'love',timeZone:'America/Chicago'};

test('daily horoscope changes date and sky, uses viewer zone and DST midnight',()=>{
  assert.equal(calendarDay('Pacific/Honolulu',new Date('2026-09-08T01:00:00Z')),'2026-09-07');
  assert.equal(nextDayStart('America/New_York',new Date('2026-03-08T05:00:00Z')),'2026-03-09T04:00:00Z');
  const first=buildDailyHoroscope(input,{now});
  const second=buildDailyHoroscope(input,{now:new Date(+now+86400000)});
  assert.equal(first.sign.name,'Pisces');
  assert.equal(first.basis,'calculated Sun sign');
  assert.notEqual(first.sky.moon.longitude,second.sky.moon.longitude);
  assert.notEqual(first.date,second.date);
  assert.ok(first.layers.some(layer=>layer.title.startsWith('Your Moon in')));
  assert.ok(first.layers.some(layer=>layer.title.startsWith('Personal day ')));
  assert.equal(first.focus.label,'Love & connection');
  assert.equal(first.source.mode,'calculated');
  assert.match(first.source.message,/not connected/);
});

test('no birthday or unknown time never fabricates a birth Moon, rising sign, or natal houses',()=>{
  const general=buildDailyHoroscope({profile:{},sign:'profile',timeZone:'UTC'},{now});
  assert.equal(general.sign,null);
  assert.deepEqual(general.layers,[]);
  const partial=buildDailyHoroscope({...input,profile:{...input.profile,natal:{...natal,timeAccuracy:'unknown'}}},{now});
  assert.equal(partial.basis,'approximate Sun sign');
  assert.ok(partial.chartMessage);
  assert.ok(!partial.layers.some(layer=>/Your Moon|your \d.* house/.test(layer.title)));
  const browse=buildDailyHoroscope({...input,sign:'leo'},{now});
  assert.equal(browse.sign.name,'Leo');
  assert.equal(browse.layers.length,1);
  assert.equal(horoscopeSchema.safeParse({...input,timeZone:'not/a-zone'}).success,false);
});

test('publisher content must match both the requested date and sign',()=>{
  const data={status:'ok',data:{daily_prediction:{date:'2026-09-08',sign_name:'Pisces',prediction:'Make room for one useful conversation today.'}}};
  assert.match(parsePublisherResponse(data,'pisces','2026-09-08'),/conversation/);
  assert.throws(()=>parsePublisherResponse(data,'aries','2026-09-08'));
  assert.throws(()=>parsePublisherResponse(data,'pisces','2026-09-09'));
  assert.throws(()=>parsePublisherResponse({status:'ok',data:{}},'pisces','2026-09-08'));
});

test('source adapter handles a dated feed, Qwen output, and exhausted AI quota',async()=>{
  const env={PROKERALA_CLIENT_ID:'test-client',PROKERALA_CLIENT_SECRET:'test-secret',GROQ_API_KEY:'test-key',GROQ_HOROSCOPE_MODEL:'test-model'};
  let quota=false;const requests=[];
  const fetchImpl=async(url,options)=>{
    requests.push({url,options});
    if(url.endsWith('/token')) return Response.json({access_token:'test-access',expires_in:3600});
    if(url.includes('/horoscope/daily')) return Response.json({status:'ok',data:{daily_prediction:{date:'2026-09-08',sign_name:'Pisces',prediction:'Give yourself time to ask a clear question and listen carefully to the answer.'}}});
    if(quota) return Response.json({error:'quota'},{status:429});
    return Response.json({choices:[{message:{content:JSON.stringify({theme:'Give an important conversation a little more breathing room today.',meaning:'One direct question can help you test an assumption and hear what the other person means.',action:'Ask one clear question, then listen.'})}}]});
  };
  const result=await collectPublisher('pisces','2026-09-08',{env,fetchImpl,now});
  assert.equal(result.mode,'rewritten');
  assert.equal(result.original,undefined);
  assert.equal(result.url,'https://www.prokerala.com/');
  const modelBody=JSON.parse(requests.find(r=>r.url.includes('groq.com')).options.body);
  assert.deepEqual(Object.keys(JSON.parse(modelBody.messages[1].content)).sort(),['date','publisherText','sign']);
  quota=true;
  const fallback=await collectPublisher('pisces','2026-09-08',{env,fetchImpl,now});
  assert.equal(fallback.mode,'publisher');
  assert.match(fallback.original,/question/);
  let calls=0;
  const missing=await collectPublisher('pisces','2026-09-08',{env:{},fetchImpl:()=>calls++});
  assert.equal(missing.mode,'calculated');assert.equal(calls,0);
});

test('25,000-character text survives schemas, models and local profile storage; 25,001 fails',()=>{
  const text='文'.repeat(25_000), tooLong=text+'文';
  assert.equal(generateSchema.parse({question:text}).question.length,25_000);
  assert.equal(profileUpsertSchema.parse({name:text,natal:{place:text}}).name.length,25_000);
  assert.equal(readingUpdateSchema.parse({notes:text}).notes.length,25_000);
  assert.equal(generateSchema.safeParse({question:tooLong}).success,false);
  assert.equal(profileUpsertSchema.safeParse({name:tooLong}).success,false);
  assert.equal(readingUpdateSchema.safeParse({notes:tooLong}).success,false);
  assert.equal(new Profile({clientHash:token,name:text,natal:{place:text}}).validateSync(),undefined);
  assert.equal(new Reading({clientHash:token,deckVersion:'test',question:text,notes:text,analysis:{message:'test'}}).validateSync(),undefined);
  assert.ok(new Reading({clientHash:token,deckVersion:'test',question:tooLong,analysis:{message:'test'}}).validateSync());
  let saved;
  const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{setItem:(_key,value)=>{saved=value;}}});
  try {saveLocalProfile({name:text});assert.equal(JSON.parse(saved).name,text);assert.throws(()=>saveLocalProfile({name:tooLong}));}
  finally {if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete globalThis.localStorage;}
});

test('Vercel and Express accept long Unicode reading requests and serve the new horoscope route',async()=>{
  const text='文'.repeat(25_000);
  const request=(route,body,method='POST')=>new Request(`https://test.invalid/api/router?route=${route}`,{method,headers:{'content-type':'application/json','x-shadow-client':token},body:JSON.stringify(body)});
  const response=await POST(request('readings/generate',{question:text,persist:false}));
  assert.equal(response.status,200);assert.equal((await response.json()).question,text);
  assert.equal((await POST(request('readings/generate',{question:text+'x'}))).status,400);
  assert.equal((await PATCH(request(`readings/item/${'a'.repeat(24)}`,{notes:text+'x'},'PATCH'))).status,400);
  const daily=await POST(request('horoscopes/daily',{profile:{},timeZone:'UTC'}));
  assert.equal(daily.status,200);assert.equal((await daily.json()).source.mode,'calculated');
  const server=app.listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));
  try {
    const port=server.address().port;
    const send=async(path,body)=>fetch(`http://127.0.0.1:${port}/api/${path}`,{method:'POST',headers:{'content-type':'application/json','x-shadow-client':token},body:JSON.stringify(body)});
    const long=await send('readings/generate',{question:text,persist:false});
    assert.equal(long.status,200);assert.equal((await long.json()).question,text);
    const horoscope=await send('horoscopes/daily',{profile:{},timeZone:'UTC'});
    assert.equal(horoscope.status,200);assert.equal((await horoscope.json()).source.mode,'calculated');
  } finally {await new Promise(resolve=>server.close(resolve));}
});
