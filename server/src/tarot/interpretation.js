import { calculateNatal } from './natal.js';
import { plainMeaning } from './cardStories.js';
import { cards, spreads, zodiacMajor } from './deck.js';
import { signs, numbers, elements, modalities, positionPrompts, knowledgeVersion, planetThemes, aspectLessons } from './knowledge.js';

export const digitSum = value => [...String(value)].reduce((sum, digit) => sum + (/\d/.test(digit) ? Number(digit) : 0), 0);
export function reduceNumber(value, masters = true) {
  let n = Number(value);
  while (n > 9 && !(masters && [11,22,33].includes(n))) n = digitSum(n);
  return n;
}
export function validBirthDate(value, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const [y,m,d] = value.split('-').map(Number), date = new Date(Date.UTC(y,m-1,d));
  return y >= 1900 && date.getUTCFullYear() === y && date.getUTCMonth() === m-1 && date.getUTCDate() === d && value <= now.toISOString().slice(0,10);
}
export function lifePathFor(birthday) {
  const parts = birthday.split('-').map(n => reduceNumber(Number(n)));
  return { value:reduceNumber(parts.reduce((a,b)=>a+b,0)), calculation:`Year ${parts[0]} + month ${parts[1]} + day ${parts[2]} = ${parts.reduce((a,b)=>a+b,0)} → ${reduceNumber(parts.reduce((a,b)=>a+b,0))}` };
}
export function nameNumberFor(name) {
  const normalized = String(name || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
  // Do not silently discard whole alphabets and present a partial result as complete.
  if (/[^A-Z\s'’-]/u.test(normalized) || !/[A-Z]/.test(normalized)) return null;
  const letters = normalized.replace(/[^A-Z]/g,'');
  const total = [...letters].reduce((sum,c)=>sum+(c.charCodeAt(0)-65)%9+1,0);
  return { value:reduceNumber(total), calculation:`${letters} → letter total ${total} → ${reduceNumber(total)}` };
}
export function personalContext(profile = {}, enabled = true) {
  const result = { birthCard:null, zodiac:null, zodiacCard:null, lifePath:null, nameNumber:null, layers:[], enabled, knowledgeVersion };
  if (!enabled) return result;
  const name = nameNumberFor(profile.name);
  if (name) {
    result.nameNumber = name.value;
    result.layers.push({title:`Name number ${name.value} · ${numbers[name.value].title}`,text:numbers[name.value].practice,calculation:name.calculation,kind:'name',note:'Based on the name entered. Traditional Expression numerology uses a full birth name; a first name alone is a name reflection.'});
  }
  if (!validBirthDate(profile.birthday)) return result;
  const [,m,d] = profile.birthday.split('-').map(Number), x = m*100+d;
  const cutoffs = [120,219,321,420,521,621,723,823,923,1023,1122,1222];
  const indices = [10,11,0,1,2,3,4,5,6,7,8,9];
  let index = 9;
  cutoffs.forEach((cut,i)=>{if(x>=cut) index=indices[i];});
  const chart = calculateNatal(profile);
  result.natal = chart;
  const sign = chart.status === 'ready' ? signs[chart.planets[0].signIndex] : signs[index];
  result.zodiac = sign.name;
  result.zodiacCard = cards[zodiacMajor[sign.name]];
  result.sign = sign;
  result.zodiacApproximate = chart.status !== 'ready';
  let birth = digitSum(profile.birthday);
  while (birth > 21) birth = digitSum(birth);
  result.birthCard = cards[birth];
  const path = lifePathFor(profile.birthday);
  result.lifePath = path.value;
  result.layers.push(
    {title:`${sign.name} · ${result.zodiacApproximate?'approximate Sun sign':'calculated Sun sign'}`,kind:'zodiac',text:`In the tropical zodiac, ${sign.name} is associated with ${sign.theme}. ${sign.practice}`,note:result.zodiacApproximate?'Calendar-date estimate. Add birth time and birthplace to calculate the natal chart.':`Calculated for ${chart.localTime} in ${chart.timeZone}. ${chart.timeAccuracy==='approximate'?'An approximate birth time can change angles and house placements.':'Birthplace coordinates and the entered birth time set the chart.'}`},
    {title:`${sign.element} · ${sign.modality}`,kind:'element',text:`${elements[sign.element].meaning} ${modalities[sign.modality]} ${elements[sign.element].practice}`},
    {title:`Life path ${path.value} · ${numbers[path.value].title}`,kind:'lifePath',text:numbers[path.value].practice,calculation:path.calculation,note:'Month, day and year are reduced separately, preserving 11, 22 and 33, then combined. Schools differ; this is the convention used here.'},
    {title:`Birth card · ${result.birthCard.name}`,kind:'birthCard',text:`A recurring reflection in this convention is ${result.birthCard.upright}. ${result.birthCard.advice}`,calculation:`Birth-date digit sum ${digitSum(profile.birthday)} → Major Arcana ${birth}`,note:'A symbolic correspondence, not a card secretly added to your draw.'}
  );
  return result;
}
const focus = {
 general:{label:'the situation on your mind',question:'Where does this show up in your everyday life?',step:'Choose one small action that will give you useful information.'},
 love:{label:'your relationships',question:'What does this suggest about the way you communicate needs and boundaries?',step:'Name one need clearly. Give the other person space to answer instead of guessing what they feel.'},
 career:{label:'your work and resources',question:'How might this affect your priorities, workload or next conversation at work?',step:'Choose one practical task: ask a question, finish a piece of work or clarify a responsibility.'},
 decision:{label:'the choice in front of you',question:'Which option fits this lesson, and what evidence would help you choose?',step:'Write down what you know about each option. Try the smallest reversible step before making a larger commitment.'},
 healing:{label:'what you are trying to recover from',question:'What would make the next few days gentler or more manageable?',step:'Choose one source of support or one boundary that gives you room to recover.'},
 growth:{label:'the change you want to make',question:'What small change would help you respond to this theme in an ordinary day?',step:'Pick a habit you can practice for a week, even on a difficult day.'}
};
const needs = {clarity:'understand what is happening',direction:'find a workable next step',closure:'decide what you are ready to put down',courage:'move forward without needing to feel fearless',understanding:'make sense of the pattern'};
export function interpretReading(input, entries, personal) {
  const selected = focus[input.focus] || focus.general;
  const last = entries.at(-1), first = entries[0];
  const dominant = Object.entries(entries.reduce((a,{card})=>{const key=card.suitName;if(key)a[key]=(a[key]||0)+1;return a;},{})).sort((a,b)=>b[1]-a[1]);
  const leading = dominant[0];
  const tied = leading && dominant[1]?.[1] === leading[1];
  const ranks = Object.entries(entries.reduce((a,{card})=>{if(card.rank)a[card.rank]=(a[card.rank]||0)+1;return a;},{})).filter(([,n])=>n>1);
  const majors = entries.filter(e=>e.card.type==='major').length;
  const reversals = entries.filter(e=>e.reversed).length;
  const cardNotes = entries.map(({card,position,reversed})=>({
    title:`${position} · ${card.name}${reversed?' (reversed)':''}`,
    text:plainMeaning(card,reversed),
    positionMeaning:`In “${position}”: ${positionPrompts[position] || 'Consider how this card’s lesson fits this part of your situation.'}`,
    relevance:`For ${selected.label}, ${selected.question.charAt(0).toLowerCase()+selected.question.slice(1)}`,
    practice:card.advice,
    orientation:reversed?'This is the card’s reversed meaning. It can describe a difficulty, an inward process or a recovery; it does not automatically mean the opposite of the upright card.':null
  }));
  const connections = [];
  if (personal.sign) {
    const matches = entries.filter(e=>e.card.element===personal.sign.element);
    connections.push({title:'Your zodiac alongside the cards',text:`${personal.zodiac} is associated with ${personal.sign.theme}. ${matches.length?`${matches.map(e=>e.card.name).join(', ')} ${matches.length===1?'shares':'share'} its ${personal.sign.element} symbolism.`:`This draw does not share your sign’s ${personal.sign.element} element; the different emphasis can offer another perspective.`} ${personal.sign.practice} In ${selected.label}, ask how that advice fits what you actually know.`});
    const zodiacDraw = entries.find(e=>e.card.id===personal.zodiacCard.id);
    if(zodiacDraw) connections.push({title:'A zodiac-card connection',text:`${zodiacDraw.card.name} is traditionally paired with ${personal.zodiac} and appears in “${zodiacDraw.position}”${zodiacDraw.reversed?' reversed':''}. Consider its theme of ${zodiacDraw.reversed?zodiacDraw.card.reversed:zodiacDraw.card.upright} from both perspectives. This is a symbolic overlap, not a stronger prediction.`});
  }
  if (personal.birthCard) {
    const match = entries.find(e=>e.card.id===personal.birthCard.id);
    connections.push({title:'Your birth card alongside this draw',text:match?`${personal.birthCard.name}, your birth card in this convention, also appears in “${match.position}”. Its ${match.reversed?'reversed':'upright'} theme gives you a second way to reflect on that position: ${match.reversed?match.card.reversed:match.card.upright}.`:`Your birth card, ${personal.birthCard.name}, offers this reminder: ${personal.birthCard.advice} Set that beside ${first.card.name} in “${first.position}” and consider whether the two themes support or challenge each other.`});
  }
  if (personal.lifePath) connections.push({title:'Your life path in practice',text:`Life path ${personal.lifePath} uses the theme of ${numbers[personal.lifePath].title.toLowerCase()}. ${numbers[personal.lifePath].practice} Alongside ${last.card.name} in “${last.position}”, use that as a way to explore ${last.reversed?last.card.reversed:last.card.upright}.`});
  if (personal.nameNumber) connections.push({title:'The name you brought to the reading',text:`Your entered name reduces to ${personal.nameNumber}, associated with ${numbers[personal.nameNumber].title.toLowerCase()}. ${numbers[personal.nameNumber].practice} Try that approach when considering ${first.card.name} and ${selected.label}.`});
  const presentIndex = spreads[input.spread]?.focusIndex || 0;
  const present = entries[presentIndex];
  const contrasting = entries[presentIndex===0?1:0] || first;
  const takeaway = `${input.profile?.name?`${input.profile.name}, the most useful message here is this: `:'The most useful message here is this: '}${last.card.advice} ${plainMeaning(present.card,present.reversed)}`;
  const story = [
    {title:'What is asking for attention',text:`${present.card.name} appears in “${present.position}”. ${plainMeaning(present.card,present.reversed)} ${positionPrompts[present.position]}`},
    {title:entries.length===1?'One card, one focus':'What adds context',text:entries.length===1?`Keep the reflection small enough to use today. ${positionPrompts[present.position]} Ask where ${present.card.name} fits something you have actually noticed, and where it does not.`:`${contrasting.card.name} appears in “${contrasting.position}”. ${plainMeaning(contrasting.card,contrasting.reversed)} Read it alongside ${present.card.name}: one position describes ${contrasting.position.toLowerCase()}, while the other describes ${present.position.toLowerCase()}. Together, they ask you to consider both parts before deciding what to do.`},
    {title:'How to use the closing card',text:`${last.card.name} closes the spread in “${last.position}”. ${plainMeaning(last.card,last.reversed)} A useful response is: ${last.card.advice} This is a direction to explore; the card does not establish what will happen.`}
  ];
  const examples = {
    general:'In everyday life, this might involve one conversation, responsibility or decision that keeps returning to your attention.',
    love:'In a relationship, this might look like asking what each of you needs, rather than trying to interpret silence or mixed messages.',
    career:'At work, this might look like clarifying an expectation, reviewing your workload or testing a small idea before committing more time.',
    decision:'For a decision, this might look like comparing the practical effects of two options and checking one assumption before choosing.',
    healing:'During a period of recovery, this might look like reducing one demand and making room for a person or routine that supports you.',
    growth:'For personal growth, this might look like choosing one behavior you can repeat, rather than trying to change your whole life at once.'
  };
  const application = `${examples[input.focus]||examples.general} In this draw, ${present.card.name} adds: ${present.card.advice} ${entries.length===1?'Try that in one ordinary moment today.':`Then ${last.card.name} brings the next step back to this: ${last.card.advice}`} These are examples to adapt, not claims that these events have happened to you.`;
  const actionPlan = [
    {title:'Name the real situation',text:`Write one sentence about ${selected.label}. Add one fact you can verify and one thing you still do not know.`},
    {title:`Try the lesson of ${last.card.name}`,text:last.card.advice},
    {title:'Check what changed',text:`After trying that step, notice what became clearer. Did it help you ${needs[input.need]||needs.clarity}? Keep the useful part and adjust anything that does not fit.`}
  ];
  if(personal.natal?.status==='ready') {
    const chart=personal.natal,moon=chart.planets.find(p=>p.name==='Moon'),asc=chart.angles.ascendant;
    const moonSign=signs[moon.signIndex],risingSign=signs[asc.signIndex];
    connections.push({title:'Your Moon and rising sign',text:`Your Moon is ${moon.label}, in house ${moon.house}; your rising sign is ${asc.label}. In astrological language, the Moon concerns emotional needs and rising describes your approach to new situations. ${moonSign.practice} ${risingSign.practice} Set these prompts beside ${present.card.name}: ${present.card.advice}`});
    const planetName={love:'Venus',career:'Saturn',decision:'Mercury',healing:'Moon',growth:'Mars',general:'Sun'}[input.focus]||'Sun';
    const planet=chart.planets.find(p=>p.name===planetName);
    const aspect=chart.aspects.find(a=>a.a===planetName||a.b===planetName) || chart.aspects.find(a=>['Sun','Moon','Mercury','Venus','Mars'].some(name=>name===a.a||name===a.b));
    if(aspect) connections.push({title:`A natal connection to consider · ${aspect.a} ${aspect.name.toLowerCase()} ${aspect.b}`,text:`${aspect.a} describes ${planetThemes[aspect.a]}. ${aspect.b} describes ${planetThemes[aspect.b]}. ${aspectLessons[aspect.name]} With ${present.card.name} in “${present.position}”, ask how those two needs fit the situation you brought to the reading. The closing card offers a way to respond: ${last.card.advice}`});
    connections.push({title:`${planetName} and your chosen focus`,text:`For ${selected.label}, we are highlighting ${planetName} at ${planet.label} in house ${planet.house}, the area of ${chart.houses[planet.house-1].meaning.toLowerCase()}. Its sign invites reflection on ${signs[planet.signIndex].theme}. ${signs[planet.signIndex].practice} Compare that with ${last.card.name} and its practical guidance. The complete chart below shows the other placements too.`});
  }
  const core = `${input.question?`You asked, “${input.question}” `:`This reading looks at ${selected.label}. `}You want to ${needs[input.need]||needs.clarity}. The explanation below connects the position of each card to its meaning, then brings those ideas back to a step you can use.`;
  return {knowledgeVersion,pattern:leading&&!tied?leading[0]:'A mixed perspective',core,takeaway,story,application,actionPlan,cardNotes,connections,
    dominant:leading&&!tied?`${leading[0]} cards appear ${leading[1]} time${leading[1]===1?'':'s'}. Give that part of everyday life some attention as you read the individual positions.`:'No single suit leads this draw. Make room for more than one part of the situation.',
    repetition:ranks.length ? `${ranks.map(([rank,n])=>`${rank} appears ${n} times`).join('; ')}. Compare what those cards ask in their different positions rather than assuming they mean exactly the same thing.` : 'No numbered rank or court role repeats in this draw. Look at the differences between the cards as well as their shared themes.',
    weight:`This draw includes ${majors} Major Arcana card${majors===1?'':'s'} and ${reversals} reversal${reversals===1?'':'s'}. Majors invite a broader view; reversals invite a closer look at how a theme is being expressed.`,
    shadow:`${last.card.name} offers a caution: ${last.card.shadow} Does that fit anything you have actually noticed? If not, you do not need to force it.`,
    nextMove:`${selected.step} ${last.card.advice}`,
    unchanged:`If you keep responding in the same way, consider whether the theme of ${last.reversed?last.card.reversed:last.card.upright} is likely to remain relevant. Your real circumstances matter more than this possibility.`,
    trajectory:`“${last.position}” is an invitation to consider ${last.reversed?last.card.reversed:last.card.upright}. ${last.card.advice} Notice what changes when you try that, rather than treating the card as a guarantee.`,
    finalMessage:`You do not have to solve the whole situation today. ${selected.step}`,
    realityCheck:'This is a symbolic reading for reflection. Keep what fits, question what does not, and use real conversations and evidence to guide your decisions.'};
}
export function buildReading(input, draw, reversed, readingId) {
  const spread = spreads[input.spread] || spreads.three;
  const personal = personalContext(input.profile, input.personalInfluence !== false);
  const entries = draw.map((card,i)=>({card,position:spread.positions[i],reversed:Boolean(reversed[i])}));
  return {readingId,spread:{key:input.spread,name:spread.name},profile:input.profile,question:input.question,focus:input.focus,need:input.need,cards:entries,personalization:personal,analysis:interpretReading(input,entries,personal)};
}
