export const fortuneRevealSteps = [
 {at:0,message:'The teller awakens…'},
 {at:1500,message:'Your wish reaches the stars…'},
 {at:3200,message:'Your fortune is taking shape…'}
];
export const fortuneRevealDuration=4800;

// One cancellable performance; leaving the page must never produce a late card.
export function beginFortuneReveal({onStep,onReady,reducedMotion=false,schedule=setTimeout,unschedule=clearTimeout}) {
 const timers=[];let cancelled=false;
 if(reducedMotion){onReady();return ()=>{};}
 onStep(0);
 for(let step=1;step<fortuneRevealSteps.length;step++){
  timers.push(schedule(()=>{if(!cancelled)onStep(step);},fortuneRevealSteps[step].at));
 }
 timers.push(schedule(()=>{if(!cancelled)onReady();},fortuneRevealDuration));
 return ()=>{cancelled=true;timers.forEach(unschedule);};
}
