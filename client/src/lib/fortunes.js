// Original fortunes written for The Fold. This is a playful, local card draw.
import {expandedFortunes} from './fortuneChapters.js';
import {yesNoFortunes,yesNoDeckStorageKey} from './yesNoFortunes.js';
const originalFortunes = [
 ['the-unopened-door', 'The unopened door', 'A door you stopped noticing is about to look different. Before you search for another key, try the handle you already hold.', 'Look again.'],
 ['the-small-beginning', 'The small beginning', 'Something important will arrive disguised as a small beginning. Give the first imperfect step a chance to become a path.', 'Begin with what you have.'],
 ['the-returning-spark', 'The returning spark', 'An old idea is waiting for a new version of you. This time, you may have the patience to give it a home.', 'Revisit what still glows.'],
 ['the-kind-stranger', 'The kind stranger', 'A brief conversation may leave a longer echo than you expect. Be curious about the person whose story is different from yours.', 'Leave room for surprise.'],
 ['the-quiet-answer', 'The quiet answer', 'The answer you seek may arrive after you stop rehearsing the question. Make a little quiet, and notice what remains.', 'Listen between the noise.'],
 ['the-turn-in-the-road', 'The turn in the road', 'A change of direction need not be a loss of progress. The view ahead may be asking you to take the slower, more interesting road.', 'Let the route change.'],
 ['the-unwritten-letter', 'The unwritten letter', 'There is a sentence you have been carrying for too long. When you find a kind way to say it, a little weight may lift.', 'Choose one honest sentence.'],
 ['the-open-window', 'The open window', 'Fresh air is finding its way into an old routine. A small change in an ordinary day may be the beginning of a different season.', 'Make room for something new.'],
 ['the-hidden-garden', 'The hidden garden', 'What you have been tending quietly may be stronger than it looks. Do not mistake a season of roots for a season without growth.', 'Keep tending the roots.'],
 ['the-borrowed-lantern', 'The borrowed lantern', 'You do not have to light the whole road yourself. A thoughtful question may bring help from a direction you had not considered.', 'Let someone offer a light.'],
 ['the-mended-thread', 'The mended thread', 'A connection can change without disappearing. One small gesture, freely given, may weave a little warmth into the space between you.', 'Offer warmth without a bargain.'],
 ['the-second-look', 'The second look', 'An ordinary object will remind you of something you thought you had forgotten. Follow the memory far enough to find what it still teaches.', 'Notice the familiar.'],
 ['the-paper-boat', 'The paper boat', 'You cannot command every current. Send one good intention into the world, then leave a little room for the unexpected shore.', 'Release one small worry.'],
 ['the-unexpected-guest', 'The unexpected guest', 'Delight may arrive without an appointment. Keep a little space in your day for the invitation that makes you smile.', 'Welcome a little play.'],
 ['the-patient-star', 'The patient star', 'You are allowed to move toward something before you can explain it perfectly. A steady interest is sometimes a better guide than a grand plan.', 'Follow the steady light.'],
 ['the-open-hand', 'The open hand', 'A good thing may ask you to loosen your grip on how it must arrive. Notice the possibilities that do not resemble your first wish.', 'Hold the wish lightly.'],
 ['the-soft-courage', 'The soft courage', 'Your next brave moment may be quiet. Asking, beginning, resting or saying no can each turn a small key in a very large lock.', 'Courage can whisper.'],
 ['the-forgotten-song', 'The forgotten song', 'Something that once made you feel alive is humming at the edge of your attention. Give it a few minutes and see what remembers you.', 'Return to a small joy.'],
 ['the-clear-table', 'The clear table', 'An answer may appear in the space you make for it. Finish one little task, put one thing down, and let the next thought arrive unhurried.', 'Clear a little space.'],
 ['the-golden-hour', 'The golden hour', 'A moment worth keeping may look ordinary while it is happening. Slow down enough to notice the light on the life already around you.', 'Be here for the good part.'],
 ['the-new-language', 'The new language', 'Something difficult may become clearer when you describe it differently. A new word, a sketch or a story could open what force could not.', 'Try another way of seeing.'],
 ['the-next-page', 'The next page', 'The chapter ahead does not require you to erase the one behind it. Carry the lesson, leave room in the margin, and turn the page.', 'Take the lesson with you.'],
 ['the-right-question', 'The right question', 'The next useful question may be smaller than the one you keep asking. Look for the choice that belongs to today, and begin there.', 'Ask what is yours to do.'],
 ['the-quiet-craft', 'The quiet craft', 'A skill you practice without applause is becoming part of you. One day, what feels difficult now may become the way you help someone else.', 'Keep making the small things.'],
 ['the-other-side', 'The other side', 'A different perspective is waiting close by. Try listening without preparing your reply, and see which detail changes the story.', 'Let curiosity lead.'],
 ['the-red-ribbon', 'The red ribbon', 'There is something worth celebrating before everything is finished. Mark a small milestone; even a long journey needs a place to smile.', 'Celebrate a little progress.'],
 ['the-wildflower', 'The wildflower', 'A good idea may grow outside the place you planned for it. Pay attention to what comes easily when you stop trying to impress anyone.', 'Notice what grows naturally.'],
 ['the-evening-lantern', 'The evening lantern', 'Not every loose end needs to be tied tonight. Some things become clearer after a pause, a meal or a kinder conversation with yourself.', 'Leave room for tomorrow.'],
 ['the-secret-pocket', 'The secret pocket', 'You may rediscover a strength you have been treating as ordinary. Ask what people turn to you for, and consider giving that gift a little more room.', 'Value what comes from you.'],
 ['the-first-light', 'The first light', 'A beginning rarely announces itself with certainty. Watch for the small feeling of possibility that returns, even after a doubtful day.', 'Let possibility be enough.'],
 ['the-unexpected-map', 'The unexpected map', 'A detour may show you something your original plan could not. Stay attentive to what you learn along the way, even when the road bends.', 'Collect the unexpected lesson.'],
 ['the-wish-you-keep', 'The wish you keep', 'One wish keeps returning for a reason worth exploring. Give it a real hour, a blank page or one practical step, and see what it becomes.', 'Give the wish some time.']
].map(([id,title,message,whisper])=>Object.freeze({id,title,message,whisper}));
export const fortunes=Object.freeze([...originalFortunes,...expandedFortunes.map(card=>Object.freeze(card))]);
export const fortuneDeckStorageKey='the-fold-fortune-deck-v1';

// Deal the full collection before reshuffling, with no repeat at the boundary.
export function createFortuneDeck(random=Math.random,{storage=null,collection=fortunes,storageKey=fortuneDeckStorageKey}={}) {
 const byId=new Map(collection.map(card=>[card.id,card]));
 let remaining=[];
 let previous=null,seenSnapshot;
 const restore=()=>{
  try {
   const raw=storage?.getItem(storageKey);
   if(raw===seenSnapshot)return;
   seenSnapshot=raw;
   if(!raw||raw.length>200000)return;
   const saved=JSON.parse(raw);
   if(saved?.version!==1||saved.size!==collection.length||!Array.isArray(saved.remaining)||saved.remaining.length>collection.length)return;
   if(saved.last!==null&&!byId.has(saved.last))return;
   if(new Set(saved.remaining).size!==saved.remaining.length||saved.remaining.some(id=>!byId.has(id)||id===saved.last))return;
   remaining=[...saved.remaining];previous=saved.last;
  } catch { /* Storage restrictions must not prevent a fortune. */ }
 };
 restore();
 return () => {
   // Pick up completed draws in other tabs, while retaining memory if storage fails.
   restore();
   if(!remaining.length) {
   remaining=collection.map(card=>card.id);
   for(let i=remaining.length-1;i>0;i--) {
    const j=Math.floor(random()*(i+1));
    [remaining[i],remaining[j]]=[remaining[j],remaining[i]];
   }
   if(remaining.at(-1)===previous) [remaining[0],remaining[remaining.length-1]]=[remaining.at(-1),remaining[0]];
  }
  const fortune=byId.get(remaining.pop());
  previous=fortune.id;
  try {
   if(storage){
    const snapshot=JSON.stringify({version:1,size:collection.length,remaining,last:previous});
    storage.setItem(storageKey,snapshot);seenSnapshot=snapshot;
   }
  } catch { /* Keep the in-memory deck when a write is unavailable. */ }
  return {...fortune,luckyNumber:1+Math.floor(random()*99),issuedAt:new Date().toISOString()};
 };
}

export function createYesNoDeck(random=Math.random,{storage=null}={}) {
 return createFortuneDeck(random,{storage,collection:yesNoFortunes,storageKey:yesNoDeckStorageKey});
}
const deviceDecks=new Map();
export function getDeviceFortuneDeck(mode='fortune') {
 const key=mode==='yesno'?'yesno':'fortune';
 if(!deviceDecks.has(key)){
  let storage=null;
  try{storage=globalThis.localStorage;}catch{ /* Private browsers may block storage. */ }
  deviceDecks.set(key,key==='yesno'?createYesNoDeck(Math.random,{storage}):createFortuneDeck(Math.random,{storage}));
 }
 return deviceDecks.get(key);
}

export function fortuneDate(issuedAt) {
 return new Date(issuedAt).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
}
