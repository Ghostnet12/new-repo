import test from 'node:test';
import assert from 'node:assert/strict';
import {api} from '../src/lib/api.js';
import {getClientToken} from '../src/lib/clientId.js';
import {loadLocalProfile,saveLocalProfile,loadLocalHistory,saveLocalReading,toggleLocalFavorite,deleteLocalReading} from '../src/lib/deviceStorage.js';

function storageFor(t,descriptor) {
 const original=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
 Object.defineProperty(globalThis,'localStorage',{configurable:true,...descriptor});
 t.after(()=>{if(original)Object.defineProperty(globalThis,'localStorage',original);else delete globalThis.localStorage;});
}
function memoryStorage(t) {
 const values=new Map();
 storageFor(t,{value:{getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)}});
 return values;
}

test('restricted browser storage does not block initial data or the current anonymous session',t=>{
 storageFor(t,{get(){throw new Error('Storage is blocked');}});
 assert.equal(loadLocalProfile(),null);
 assert.deepEqual(loadLocalHistory(),[]);
 const token=getClientToken();
 assert.match(token,/^[a-f0-9]{64}$/);
 assert.equal(getClientToken(),token);
 assert.throws(()=>saveLocalProfile({name:'Test'}),/Storage is blocked/);
});

test('malformed stored data recovers without crashing the first page',t=>{
 const values=memoryStorage(t);
 values.set('fracture-shadow-profile-v3','not JSON');
 values.set('fracture-shadow-history-v3','not JSON');
 assert.equal(loadLocalProfile(),null);assert.deepEqual(loadLocalHistory(),[]);
 values.set('fracture-shadow-profile-v3','42');
 values.set('fracture-shadow-history-v3',JSON.stringify([null,42,{}, {localId:'broken',spreadName:'Test',createdAt:'not a date'}]));
 assert.equal(loadLocalProfile(),null);assert.deepEqual(loadLocalHistory(),[]);
});

test('device profile, saving, favorites and removal retain their existing storage keys and behavior',t=>{
 const values=memoryStorage(t);
 saveLocalProfile({name:'Test',birthday:'1990-05-12',preferredSpread:'horseshoe'});
 assert.equal(loadLocalProfile().preferredSpread,'horseshoe');
 assert.ok(values.has('fracture-shadow-profile-v3'));
 saveLocalReading({readingId:'first',spread:{name:'Horseshoe'},question:'A test question'});
 saveLocalReading({readingId:'second',spread:{name:'Daily Lantern'}});
 assert.deepEqual(loadLocalHistory().map(item=>item.localId),['second','first']);
 toggleLocalFavorite('first');
 assert.equal(loadLocalHistory().find(item=>item.localId==='first').favorite,true);
 deleteLocalReading('second');
 assert.deepEqual(loadLocalHistory().map(item=>item.localId),['first']);
 assert.ok(values.has('fracture-shadow-history-v3'));
});

test('a failed device write is reported and does not silently remove a reading',t=>{
 const values=memoryStorage(t);
 saveLocalReading({readingId:'kept',spread:{name:'Three Veils'}});
 globalThis.localStorage.setItem=()=>{throw Error('Quota exceeded');};
 assert.throws(()=>deleteLocalReading('kept'),/Quota exceeded/);
 assert.equal(JSON.parse(values.get('fracture-shadow-history-v3'))[0].localId,'kept');
});

test('API requests carry the existing browser identity and preserve validation errors',async t=>{
 const values=memoryStorage(t);values.set('fracture-shadow-deck-client-token','a'.repeat(64));
 t.mock.method(globalThis,'fetch',async(path,options)=>{
  assert.equal(path,'/api/readings/generate');
  assert.equal(options.headers['X-Shadow-Client'],'a'.repeat(64));
  assert.equal(options.method,'POST');
  return Response.json({issues:[{message:'Choose a valid spread.'}]},{status:400});
 });
 await assert.rejects(api('/api/readings/generate',{method:'POST',body:'{}'}),error=>error.status===400&&error.message==='Choose a valid spread.');
});

test('a stalled request times out once without issuing a duplicate request',async t=>{
 memoryStorage(t);let calls=0,requestSignal;
 t.mock.method(globalThis,'fetch',(_path,{signal})=>{
  calls++;requestSignal=signal;
  return new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('Cancelled','AbortError')),{once:true}));
 });
 await assert.rejects(api('/api/profile',{timeoutMs:5}),/connection took too long/);
 assert.equal(calls,1);assert.equal(requestSignal.aborted,true);
});

test('leaving an in-flight view retains cancellation rather than showing a timeout error',async t=>{
 memoryStorage(t);
 t.mock.method(globalThis,'fetch',(_path,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('Cancelled','AbortError')),{once:true})));
 const controller=new AbortController();
 const request=api('/api/horoscopes/daily',{signal:controller.signal,timeoutMs:1000});
 controller.abort();
 await assert.rejects(request,error=>error.name==='AbortError');
});

test('unreadable responses provide a usable retry message',async t=>{
 memoryStorage(t);
 t.mock.method(globalThis,'fetch',async()=>new Response('<html>Unavailable</html>',{headers:{'Content-Type':'text/html'}}));
 await assert.rejects(api('/api/profile'),/Please try again/);
 t.mock.method(globalThis,'fetch',async()=>new Response('{broken',{headers:{'Content-Type':'application/json'}}));
 await assert.rejects(api('/api/profile'),/Please try again/);
});

test('a successful response clears its timeout instead of aborting later',async t=>{
 memoryStorage(t);let requestSignal;
 t.mock.method(globalThis,'fetch',async(_path,{signal})=>{requestSignal=signal;return Response.json({ok:true});});
 assert.deepEqual(await api('/api/health',{timeoutMs:5}),{ok:true});
 await new Promise(resolve=>setTimeout(resolve,10));
 assert.equal(requestSignal.aborted,false);
});
