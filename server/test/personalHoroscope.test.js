import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDailyHoroscope } from '../src/tarot/horoscope.js';
import { generateHoroscope } from '../src/services/horoscopeService.js';
import { personalReadingData, personalizeDailyReading, reservePersonalReading } from '../src/services/personalHoroscope.js';
import { horoscopeSchema } from '../src/validation/schemas.js';
import { POST } from '../../api/router.js';

const now=new Date('2026-09-08T09:00:00Z');
const env={GROQ_API_KEY:'test-private-key',GROQ_HOROSCOPE_MODEL:'qwen/qwen3.6-27b'};
const profile={name:'Private Test Person',gender:'private-gender-value',birthday:'1990-03-12',natal:{enabled:true,time:'12:30',place:'private-birthplace',latitude:'41.88',longitude:'-87.63',timezone:'America/Chicago',timeAccuracy:'exact',disambiguation:'reject'}};
const career={profile,sign:'profile',focus:'career',need:'courage',context:'I keep putting off asking my manager for more responsibility.',timeZone:'America/Los_Angeles',personalize:true};
const source={mode:'rewritten',status:'ready',name:'Prokerala',date:'2026-09-08',reflection:{theme:'Allow time for one clear conversation today.',meaning:'A useful question can help clarify an assumption.',action:'Ask one question and listen.'}};
const completionFor=data=>({choices:[{finish_reason:'stop',message:{content:JSON.stringify({
  theme:`You want ${data.need.toLowerCase()} around ${data.focus.toLowerCase()}. Start with the situation you described: ${data.situation}`,
  meaning:`For ${data.focus.toLowerCase()}, the chart detail ${data.facts[0]?.label||'shared daily sky'} gives you a starting point. Consider this alongside the situation you described, and check what fits your actual experience.`,
  action:`Write one useful question about ${data.focus.toLowerCase()} before your next conversation.`,
  question:`What do you need to understand about ${data.focus.toLowerCase()}?`,
  connections:data.facts.slice(0,2).map(fact=>({id:fact.id,text:`For the situation you described, ${fact.label} adds this practical consideration: ${fact.meaning}`}))
})}}]});

test('personal data contains derived chart context and the note, excluding raw identity and birth fields',()=>{
  const reading=buildDailyHoroscope(career,{now,source});
  const data=personalReadingData(career,reading),serialized=JSON.stringify(data);
  assert.equal(data.situation,career.context);
  assert.equal(data.focus,'Work & direction');
  assert.equal(data.need,'Courage');
  assert.ok(data.facts.some(fact=>fact.id==='focus-planet'&&fact.label.includes('Saturn')));
  assert.ok(data.facts.some(fact=>fact.id==='birth-moon'));
  assert.ok(data.facts.some(fact=>fact.id==='life-path'));
  for(const value of [profile.name,profile.gender,profile.birthday,profile.natal.time,profile.natal.place,profile.natal.latitude,profile.natal.longitude,profile.natal.timezone]) assert.ok(!serialized.includes(value),`Raw field leaked: ${value}`);
  assert.ok(data.facts.every(fact=>!('calculation' in fact)),'raw name/date calculations are not forwarded');
});

test('same-sign visitors have distinct private answers while sharing only the public source',async()=>{
  const other={...career,profile:{...profile,birthday:'1991-03-12',natal:{...profile.natal,time:'06:30'}},focus:'love',need:'understanding',context:'Our conversations keep turning into interruptions. I want us to hear each other.'};
  const publicBefore=structuredClone(source),publicCalls=[],privateCalls=[];
  const publisher=async(...args)=>{publicCalls.push(args);return source;};
  const fetchImpl=async(url,options)=>{
    assert.equal(url,'https://api.groq.com/openai/v1/chat/completions');
    const body=JSON.parse(options.body),data=JSON.parse(body.messages[1].content);
    assert.equal(body.reasoning_effort,'none');
    assert.equal(body.reasoning_format,'hidden');
    privateCalls.push(data);
    return Response.json(completionFor(data));
  };
  const personalize=(input,reading,options)=>personalizeDailyReading(input,reading,{...options,env,fetchImpl,allow:async()=>true});
  const [first,second]=await Promise.all([
    generateHoroscope(career,{now,publisher,personalize,clientId:'a'.repeat(64)}),
    generateHoroscope(other,{now,publisher,personalize,clientId:'b'.repeat(64)})
  ]);
  assert.equal(first.sign.name,second.sign.name);
  assert.equal(first.perspective.mode,'ai');assert.equal(second.perspective.mode,'ai');
  assert.notEqual(first.perspective.theme,second.perspective.theme);
  assert.notEqual(first.perspective.meaning,second.perspective.meaning);
  assert.notEqual(first.perspective.action,second.perspective.action);
  assert.notDeepEqual(privateCalls[0].facts,privateCalls[1].facts);
  assert.deepEqual(source,publicBefore,'personalization never mutates the shared publisher object');
  for(const args of publicCalls) {
    assert.equal(args[0],'pisces');assert.equal(args[1],'2026-09-08');
    assert.deepEqual(Object.keys(args[2]),['now']);
  }
  assert.doesNotMatch(JSON.stringify(second.perspective),/manager|responsibility/);
  assert.doesNotMatch(JSON.stringify(first.perspective),/interruptions/);
});

test('typing does not call private AI, and incomplete or browsed charts never create natal facts',async()=>{
  let calls=0;
  await generateHoroscope({...career,personalize:false},{now,publisher:async()=>source,personalize:async()=>{calls++;}});
  assert.equal(calls,0);
  const partial={...career,profile:{...profile,natal:{...profile.natal,timeAccuracy:'unknown'}}};
  const unknown=buildDailyHoroscope(partial,{now,source});
  assert.ok(!unknown.perspective.facts.some(fact=>['birth-moon','rising','moon-house','focus-planet'].includes(fact.id)));
  const browse=buildDailyHoroscope({...career,sign:'leo'},{now,source});
  assert.deepEqual(browse.perspective.facts.map(fact=>fact.id),['sun']);
  assert.equal(personalReadingData({...career,sign:'leo'},browse).birthTimeAccuracy,null);
  const empty={profile:{name:'Only A Name'},sign:'profile',focus:'general',timeZone:'UTC',personalize:true};
  const missing=await personalizeDailyReading(empty,buildDailyHoroscope(empty,{now}),{env,fetchImpl:async()=>{calls++;},allow:async()=>true});
  assert.equal(missing.status,'needs_context');assert.equal(calls,0);
});

test('unsupported evidence, interrupted output and provider failures keep the personal overview',async()=>{
  const reading=buildDailyHoroscope(career,{now,source});
  const data=personalReadingData(career,reading);
  const unknown=completionFor(data);
  const answer=JSON.parse(unknown.choices[0].message.content);
  answer.connections[0].id='invented-birth-fact';
  unknown.choices[0].message.content=JSON.stringify(answer);
  for(const [response,status] of [
    [unknown,'invalid_output'],
    [{choices:[{finish_reason:'length',message:{content:'{}'}}]},'invalid_output']
  ]) {
    const result=await personalizeDailyReading(career,reading,{env,allow:async()=>true,fetchImpl:async()=>Response.json(response)});
    assert.equal(result.mode,'guided');assert.equal(result.status,status);
    assert.equal(result.meaning,reading.perspective.meaning);
    assert.ok(!JSON.stringify(result).includes('invented-birth-fact'));
  }
  const quota=await personalizeDailyReading(career,reading,{env,allow:async()=>true,fetchImpl:async()=>Response.json({error:'private-provider-body'},{status:429})});
  assert.equal(quota.status,'rate_limited');assert.equal(quota.mode,'guided');
  assert.doesNotMatch(JSON.stringify(quota),/private-provider-body|test-private-key/);
  let calls=0;
  const limited=await personalizeDailyReading(career,reading,{env,allow:async()=>false,fetchImpl:async()=>{calls++;}});
  assert.equal(limited.status,'limited');assert.equal(calls,0);
});

test('personal generation budgets count requests without storing personal content',async()=>{
  const counts=new Map();
  const model={findOneAndUpdate:async(filter,update)=>{
    assert.deepEqual(Object.keys(update).sort(),['$inc','$setOnInsert']);
    assert.deepEqual(Object.keys(update.$setOnInsert),['expiresAt']);
    const count=counts.get(filter._id)||0;
    if(count>=filter.used.$lt) throw Object.assign(new Error('duplicate lease'),{code:11000});
    counts.set(filter._id,count+update.$inc.used);
    return {_id:filter._id,used:count+1};
  }};
  const options={now,model,connect:async()=>true};
  const client='a'.repeat(64);
  for(let n=0;n<6;n++) assert.equal(await reservePersonalReading(client,options),true);
  assert.equal(await reservePersonalReading(client,options),false);
  assert.equal(await reservePersonalReading('b'.repeat(64),options),true);
  assert.equal(await reservePersonalReading(client,{...options,now:new Date(+now+10*60_000)}),true);
  assert.equal(await reservePersonalReading('invalid',options),false);
});

test('the personal note accepts 25,000 characters and the API rejects excess before processing',async()=>{
  const context='文'.repeat(25_000);
  assert.equal(horoscopeSchema.parse({context,personalize:true}).context,context);
  assert.equal(horoscopeSchema.safeParse({context:context+'文'}).success,false);
  const request=body=>new Request('https://test.invalid/api/router?route=horoscopes/daily',{
    method:'POST',headers:{'content-type':'application/json','x-shadow-client':'a'.repeat(64)},body:JSON.stringify(body)
  });
  const response=await POST(request({context,profile:{},personalize:false}));
  assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
  assert.equal((await response.json()).perspective.hasDetails,true);
  assert.equal((await POST(request({context:context+'文'}))).status,400);
});
