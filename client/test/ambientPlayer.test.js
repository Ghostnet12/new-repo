import test from 'node:test';
import assert from 'node:assert/strict';
import { createAmbientPlayer } from '../src/lib/ambientPlayer.js';

class AudioStub extends EventTarget {
  src = ''; played = []; paused = true; ended = false;
  play() { this.played.push(this.src); this.paused = false; return Promise.resolve(); }
  pause() { this.paused = true; this.dispatchEvent(new Event('pause')); }
  removeAttribute() { this.src = ''; }
  load() {}
}
const settle = () => new Promise(resolve => setImmediate(resolve));
test('shuffle visits every song and avoids repeating across playlist cycles', async () => {
  const audio = new AudioStub();
  const player = createAmbientPlayer(audio, { tracks:['a','b','c'], random:() => 0.4 });
  player.start(); await settle();
  for(let i=0;i<8;i++) { audio.dispatchEvent(new Event('ended')); await settle(); }
  for(let i=0;i<9;i+=3) assert.equal(new Set(audio.played.slice(i,i+3)).size,3);
  for(let i=1;i<9;i++) assert.notEqual(audio.played[i],audio.played[i-1]);
  player.destroy();
});
test('remembered off makes no request, and gestures do not enable it', () => {
  const audio = new AudioStub();
  const player=createAmbientPlayer(audio,{enabled:false});
  player.start(); player.retry();
  assert.equal(audio.src,''); assert.equal(audio.played.length,0);
  player.destroy();
});
test('blocked autoplay retries after a gesture and can then be turned off', async () => {
  const audio = new AudioStub(); let state;
  audio.play=()=>Promise.reject(Object.assign(new Error(),{name:'NotAllowedError'}));
  const player=createAmbientPlayer(audio,{onState:s=>state=s});
  player.start(); await settle(); assert.equal(state,'blocked');
  audio.play=AudioStub.prototype.play;
  player.retry(); await settle(); assert.equal(state,'playing');
  assert.equal(player.toggle(),false); assert.equal(state,'off'); assert.equal(audio.paused,true);
  player.retry(); assert.equal(state,'off'); player.destroy();
});
test('turning off during pending playback prevents a late restart', async () => {
  const audio = new AudioStub(); let finish,state;
  audio.play=()=>new Promise(resolve=>finish=()=>{audio.paused=false;resolve();});
  const player=createAmbientPlayer(audio,{onState:s=>state=s});
  player.start(); player.toggle(); finish(); await settle();
  assert.equal(state,'off'); assert.equal(audio.paused,true); player.destroy();
});
test('unavailable tracks are skipped with a bounded retry count', async () => {
  const audio=new AudioStub(); let attempts=0,state;
  audio.play=()=>{attempts++;return Promise.reject(new Error('Unavailable'));};
  const player=createAmbientPlayer(audio,{tracks:['a','b','c'],onState:s=>state=s});
  player.start(); await settle();
  assert.equal(attempts,3); assert.equal(state,'error'); player.destroy();
});
test('cleanup removes playback listeners and releases the media source', async () => {
  const audio=new AudioStub(); const player=createAmbientPlayer(audio);
  player.start(); await settle(); player.destroy();
  audio.dispatchEvent(new Event('ended')); player.retry();
  assert.equal(audio.played.length,1);assert.equal(audio.src,'');assert.equal(audio.paused,true);
});
