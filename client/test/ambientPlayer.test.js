import test from 'node:test';
import assert from 'node:assert/strict';
import { bindAmbientPageLifecycle, createAmbientPlayer } from '../src/lib/ambientPlayer.js';

class AudioStub extends EventTarget {
  src = ''; played = []; paused = true; ended = false; currentTime = 0; muted = false;
  play() { this.played.push(this.src); this.paused = false; return Promise.resolve(); }
  pause() { this.paused = true; this.dispatchEvent(new Event('pause')); }
  removeAttribute() { this.src = ''; }
  load() { this.currentTime = 0; this.ended = false; }
}
class PageStub extends EventTarget {
  visibilityState = 'visible';
  setVisible(visible) {
    this.visibilityState = visible ? 'visible' : 'hidden';
    this.dispatchEvent(new Event('visibilitychange'));
  }
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

test('leaving after several playlist loops releases audio and blocks background events', async () => {
  const audio = new AudioStub(), pageDocument = new PageStub(), pageWindow = new EventTarget();
  let state;
  const player = createAmbientPlayer(audio, { onState: next => state = next });
  const unbind = bindAmbientPageLifecycle(player, { pageDocument, pageWindow });
  player.start(); await settle();
  for (let i = 0; i < 24; i++) { audio.dispatchEvent(new Event('ended')); await settle(); }
  const attempts = audio.played.length;
  pageDocument.setVisible(false);
  assert.equal(state, 'suspended');
  assert.equal(audio.paused, true); assert.equal(audio.muted, true); assert.equal(audio.src, '');
  audio.dispatchEvent(new Event('ended')); audio.dispatchEvent(new Event('error'));
  player.start(); player.retry(); await settle();
  assert.equal(audio.played.length, attempts);
  assert.equal(audio.src, '');
  // A delayed system/media play event must not revive a hidden page.
  for (const event of ['play', 'playing']) {
    audio.paused = false;
    audio.dispatchEvent(new Event(event));
    assert.equal(audio.paused, true); assert.equal(audio.muted, true);
  }
  unbind(); player.destroy();
});

test('returning resumes the same song and position only once', async () => {
  const audio = new AudioStub(), pageDocument = new PageStub(), pageWindow = new EventTarget();
  const player = createAmbientPlayer(audio, { tracks: ['a', 'b', 'c'] });
  const unbind = bindAmbientPageLifecycle(player, { pageDocument, pageWindow });
  player.start(); await settle();
  const track = audio.src;
  audio.currentTime = 73.5;
  pageDocument.setVisible(false);
  assert.equal(audio.currentTime, 0);
  pageDocument.setVisible(true); await settle();
  pageWindow.dispatchEvent(new Event('pageshow'));
  pageDocument.setVisible(true); await settle();
  assert.deepEqual(audio.played, [track, track]);
  assert.equal(audio.currentTime, 73.5);
  assert.equal(audio.paused, false); assert.equal(audio.muted, false);
  unbind(); player.destroy();
});

test('pagehide stops audio even without visibilitychange and waits for a visible pageshow', async () => {
  const audio = new AudioStub(), pageDocument = new PageStub(), pageWindow = new EventTarget();
  const player = createAmbientPlayer(audio);
  const unbind = bindAmbientPageLifecycle(player, { pageDocument, pageWindow });
  player.start(); await settle();
  pageWindow.dispatchEvent(new Event('pagehide'));
  assert.equal(audio.paused, true); assert.equal(audio.src, '');
  // A visibility event alone must not reactivate a page still in the back/forward cache.
  pageDocument.setVisible(true); player.retry();
  assert.equal(audio.played.length, 1);
  pageDocument.setVisible(false);
  pageWindow.dispatchEvent(new Event('pageshow'));
  assert.equal(audio.played.length, 1);
  pageDocument.setVisible(true); await settle();
  assert.equal(audio.played.length, 2);
  unbind(); player.destroy();
});

test('music switched off stays off across leaving and returning', async () => {
  const audio = new AudioStub(), pageDocument = new PageStub(), pageWindow = new EventTarget();
  let state;
  const player = createAmbientPlayer(audio, { onState: next => state = next });
  const unbind = bindAmbientPageLifecycle(player, { pageDocument, pageWindow });
  player.start(); await settle();
  assert.equal(player.toggle(), false);
  pageDocument.setVisible(false); pageWindow.dispatchEvent(new Event('pagehide'));
  pageDocument.setVisible(true); pageWindow.dispatchEvent(new Event('pageshow'));
  player.retry(); await settle();
  assert.equal(state, 'off'); assert.equal(audio.played.length, 1);
  assert.equal(audio.paused, true); assert.equal(audio.muted, true); assert.equal(audio.src, '');
  unbind(); player.destroy();
});

test('a page opened in the background waits until visible before loading any music', async () => {
  const audio = new AudioStub(), pageDocument = new PageStub(), pageWindow = new EventTarget();
  pageDocument.visibilityState = 'hidden';
  const player = createAmbientPlayer(audio, { active: false });
  const unbind = bindAmbientPageLifecycle(player, { pageDocument, pageWindow });
  player.start(); player.retry(); await settle();
  assert.equal(audio.played.length, 0); assert.equal(audio.src, '');
  pageDocument.setVisible(true); await settle();
  assert.equal(audio.played.length, 1); assert.equal(audio.muted, false);
  unbind(); player.destroy();
});

test('a late play resolution cannot restart audio after leaving', async () => {
  const audio = new AudioStub(); let finish, state;
  audio.play = () => new Promise(resolve => finish = () => { audio.paused = false; resolve(); });
  const player = createAmbientPlayer(audio, { onState: next => state = next });
  player.start(); player.setActive(false);
  finish(); await settle();
  assert.equal(state, 'suspended'); assert.equal(audio.paused, true);
  assert.equal(audio.muted, true); assert.equal(audio.src, '');
  player.destroy();
});

test('a cancelled old play request cannot interrupt a newer visible playback', async () => {
  const audio = new AudioStub(); let rejectOld, state;
  audio.play = () => new Promise((_resolve, reject) => rejectOld = reject);
  const player = createAmbientPlayer(audio, { onState: next => state = next });
  player.start(); player.setActive(false);
  audio.play = AudioStub.prototype.play;
  player.setActive(true); await settle();
  rejectOld(Object.assign(new Error('Source released'), { name: 'AbortError' })); await settle();
  assert.equal(state, 'playing'); assert.equal(audio.paused, false); assert.equal(audio.muted, false);
  // A queued pause event from the released source must not turn the playing switch off.
  audio.dispatchEvent(new Event('pause'));
  assert.equal(state, 'playing');
  player.destroy();
});

test('retrying after every song failed attaches the newly selected track', async () => {
  const audio = new AudioStub(); let state;
  audio.play = function () { this.played.push(this.src); return Promise.reject(new Error('Unavailable')); };
  const player = createAmbientPlayer(audio, { tracks: ['a', 'b'], random: () => 0, onState: next => state = next });
  player.start(); await settle();
  assert.equal(state, 'error'); assert.deepEqual(audio.played, ['a', 'b']);
  audio.play = AudioStub.prototype.play;
  player.toggle(); await settle();
  assert.equal(state, 'playing'); assert.equal(audio.src, 'a');
  assert.deepEqual(audio.played, ['a', 'b', 'a']);
  player.destroy();
});

test('blocked autoplay still waits for a gesture after leaving and returning', async () => {
  const audio = new AudioStub(); let attempts = 0, state;
  audio.play = () => { attempts++; return Promise.reject(Object.assign(new Error(), { name: 'NotAllowedError' })); };
  const player = createAmbientPlayer(audio, { onState: next => state = next });
  player.start(); await settle();
  player.setActive(false); player.setActive(true); await settle();
  assert.equal(attempts, 1); assert.equal(state, 'blocked');
  audio.play = AudioStub.prototype.play;
  player.retry(); await settle();
  assert.equal(state, 'playing'); assert.equal(audio.muted, false);
  player.destroy();
});

test('teardown removes page handlers and cannot revive a destroyed player', async () => {
  const audio = new AudioStub(), pageDocument = new PageStub(), pageWindow = new EventTarget();
  const player = createAmbientPlayer(audio);
  let notifications = 0;
  const unbind = bindAmbientPageLifecycle({ setActive: value => { notifications++; player.setActive(value); } }, { pageDocument, pageWindow });
  player.start(); await settle();
  unbind(); player.destroy();
  const before = notifications;
  pageDocument.setVisible(false); pageWindow.dispatchEvent(new Event('pagehide'));
  pageDocument.setVisible(true); pageWindow.dispatchEvent(new Event('pageshow'));
  player.start(); player.retry(); player.setActive(true); player.toggle(); await settle();
  assert.equal(notifications, before); assert.equal(audio.played.length, 1);
  assert.equal(audio.paused, true); assert.equal(audio.muted, true); assert.equal(audio.src, '');
});
