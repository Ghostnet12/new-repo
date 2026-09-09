import test from 'node:test';
import assert from 'node:assert/strict';
import {canShareFortune,shareFortune} from '../src/lib/fortuneShare.js';

const file=new File([new Uint8Array([137,80,78,71,13,10,26,10])],'the-fold-fortune.png',{type:'image/png'});

test('hands the prepared PNG to native sharing during the tap, without a URL or rendering delay',async()=>{
 let payload;
 const device={canShare:({files})=>files[0]===file,share:data=>{payload=data;return Promise.resolve();}};
 const result=shareFortune(file,device);
 assert.deepEqual(payload,{files:[file]});
 assert.equal(payload.files[0].type,'image/png');
 assert.equal(await result,'shared');
});

test('missing, unsupported, or throwing file-sharing capability falls back to the image preview',async()=>{
 const unexpected=()=>assert.fail('Native sharing should not be called');
 for(const device of [null,{}, {share:unexpected}, {share:unexpected,canShare:()=>false}, {share:unexpected,canShare:()=>{throw new Error('Unavailable');}}]){
  assert.equal(canShareFortune(file,device),false);
  assert.equal(await shareFortune(file,device),'preview');
 }
 assert.equal(await shareFortune(null,{share:unexpected,canShare:()=>true}),'preview');
});

test('a blocked or failed native share uses the preview instead of silently downloading',async()=>{
 for(const name of ['NotAllowedError','DataError','TypeError']){
  const device={canShare:()=>true,share:()=>Promise.reject(Object.assign(new Error('Blocked'),{name}))};
  assert.equal(await shareFortune(file,device),'preview');
 }
});

test('dismissing the sharing menu stays cancelled rather than opening a fallback',async()=>{
 const device={canShare:()=>true,share:()=>Promise.reject(Object.assign(new Error('Dismissed'),{name:'AbortError'}))};
 assert.equal(await shareFortune(file,device),'cancelled');
});
