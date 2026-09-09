import {writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fortuneOpenings,fortuneClosings,yesOpenings,noOpenings,yesClosings,noClosings} from '../server/data/collector-compositions.js';
import {fortunes} from '../client/src/lib/fortunes.js';
import {yesNoFortunes} from '../client/src/lib/yesNoFortunes.js';
const normalise=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
const existing=new Set([...fortunes,...yesNoFortunes].map(c=>normalise(c.message)));
const cards=[],seen=new Set(existing);
function card(mode,message,title,joker=false){const key=normalise(message);if(seen.has(key))throw Error('Duplicate message');seen.add(key);const number=cards.filter(c=>c.mode===mode).length+1;cards.push({id:`first-${mode}-${String(number).padStart(4,'0')}`,mode,title,message,whisper:joker?'Three extra draws have joined your collection.':'One original issue. A little magic to keep.',joker,messageHash:createHash('sha256').update(key).digest('hex')});}
function pairs(openings,closings,count,mode,title){let n=0;for(let i=0;i<openings.length;i++)for(let j=0;j<closings.length;j++){if(n++>=count)return;card(mode,`${openings[i]} ${closings[(j+i)%closings.length]}`,typeof title==='function'?title(i):title);}}
pairs(fortuneOpenings,fortuneClosings,2038,'fortune','A little possibility');
pairs(yesOpenings,yesClosings,1019,'yesno','The teller says yes');
pairs(noOpenings,noClosings,1019,'yesno','The teller says no');
const jokers={fortune:[['The velvet exception','The teller has found three extra invitations tucked beneath the velvet. They are yours; apparently even destiny occasionally overpacks.'],['The generous ghost','A generous ghost has paid a visit to the machine. Three extra draws are yours, and the ghost refuses to discuss its accounting.'],['The moon’s mischief','The moon has slipped three extra draws into your pocket. It asks only that you look suitably surprised.'],['The secret compartment','A little compartment has opened where nobody remembered building one. Inside: three extra draws and absolutely no sensible explanation.']],yesno:[['The oracle’s loophole','The oracle has discovered a loophole in its own dramatic procedures. Three extra questions are yours to put to the glass.'],['The cheeky benefactor','A cheeky benefactor has sponsored three extra draws. The teller insists it was not flirting. The teller is not convincing.'],['The paperwork incident','Someone filed Generosity instead of Ominous Silence. Three extra draws have been credited before management notices.'],['The generous verdict','The verdict is yes to three extra draws. For once, the crystal ball has provided an answer with useful supporting evidence.']]};
for(const [mode,entries] of Object.entries(jokers))for(const [title,message] of entries)card(mode,message,title,true);
for(const mode of ['fortune','yesno'])if(cards.filter(c=>c.mode===mode).length!==2042)throw Error('Wrong edition size');
const output={version:1,label:'First Series',composed:true,cards};
writeFileSync(new URL('../server/data/collector-first-edition.json',import.meta.url),JSON.stringify(output,null,2)+'\n');
console.log(`${cards.length} unique complete messages; none matches the ${existing.size} existing fortunes. Composition parts intentionally recur; complete messages do not.`);
