import test from 'node:test';
import assert from 'node:assert/strict';
import {beginFortuneReveal,fortuneRevealSteps,fortuneRevealDuration} from '../src/lib/fortuneReveal.js';

function clock() {
 const jobs=[];
 return {jobs,schedule(fn,at){const job={fn,at};jobs.push(job);return job;},unschedule(job){job.cancelled=true;}};
}

test('the theatrical sequence reaches each stage before dealing one card',()=>{
 const time=clock(),events=[];
 beginFortuneReveal({...time,onStep:step=>events.push(['step',step]),onReady:()=>events.push(['card'])});
 assert.deepEqual(events,[['step',0]]);
 const jobs=time.jobs.sort((a,b)=>a.at-b.at);
 assert.deepEqual(jobs.map(job=>job.at),[fortuneRevealSteps[1].at,fortuneRevealSteps[2].at,fortuneRevealDuration]);
 jobs.forEach(job=>job.fn());
 assert.deepEqual(events,[['step',0],['step',1],['step',2],['card']]);
});

test('leaving the page cancels every pending stage and prevents a late card',()=>{
 const time=clock(),events=[];
 const cancel=beginFortuneReveal({...time,onStep:step=>events.push(step),onReady:()=>events.push('card')});
 cancel();
 assert.ok(time.jobs.every(job=>job.cancelled));
 // Even an already-queued callback cannot update the page after cancellation.
 time.jobs.forEach(job=>job.fn());
 assert.deepEqual(events,[0]);
});

test('reduced motion deals immediately without scheduling the performance',()=>{
 const time=clock(),events=[];
 const cancel=beginFortuneReveal({...time,reducedMotion:true,onStep:step=>events.push(step),onReady:()=>events.push('card')});
 assert.deepEqual(events,['card']);assert.equal(time.jobs.length,0);cancel();
});
