import { Temporal } from '@js-temporal/polyfill';
import { longitudeAt, zodiacPosition, normalizeAngle, angleDistance, calculateAspects, planetNames } from './natal.js';
import { personalContext, reduceNumber, digitSum } from './interpretation.js';
import { signs, numbers, planetThemes } from './knowledge.js';

export const HOROSCOPE_VERSION = 'daily-1';
export function calendarDay(timeZone = 'UTC', now = new Date()) {
  return Temporal.Instant.from(now.toISOString()).toZonedDateTimeISO(timeZone).toPlainDate().toString();
}
export function nextDayStart(timeZone, now = new Date()) {
  return Temporal.Instant.from(now.toISOString()).toZonedDateTimeISO(timeZone).add({days:1}).startOfDay().toInstant().toString();
}

const moonPrompts = [
  ['Start with one honest move', 'If you have been waiting for the perfect moment, choose a small beginning you can actually make today. Momentum is useful when it leaves room to listen.', 'What could I begin without needing to finish it today?'],
  ['Give yourself something steady', 'Return to what makes the day feel manageable: a familiar routine, an uncluttered space or a promise you can keep. Comfort can support change without becoming a reason to avoid it.', 'What would make today feel more grounded?'],
  ['Ask the question underneath', 'Let curiosity loosen an assumption. A clear question or a short conversation may tell you more than another hour spent trying to guess the answer.', 'What am I assuming that I could simply ask?'],
  ['Make room for what you feel', 'Notice what you need before automatically taking care of everyone else. You can be kind and still ask for space, reassurance or a slower pace.', 'What do I need that I have not said out loud?'],
  ['Let something real be seen', 'Give a little time to something that feels like you. Share the idea, make the thing or enjoy a moment without turning the response into a verdict on your worth.', 'What would I express if it did not need applause?'],
  ['Make one thing easier', 'Choose a practical adjustment that would help your day. You do not have to fix everything for your effort to count; a useful improvement is enough.', 'Which small repair would give me the most relief?'],
  ['Include yourself in the balance', 'Look for an agreement that makes room for both sides. Keeping the peace works best when it includes what you actually need, rather than a yes you will resent later.', 'Where would a fairer agreement include my needs?'],
  ['Be honest about what matters', 'If something feels loaded, name the feeling before deciding what it means. Trust grows through clear boundaries and consistent actions, not through tests the other person does not know they are taking.', 'What would trust look like in an ordinary action?'],
  ['Leave room for a wider view', 'A change of perspective can be useful without requiring a dramatic change of life. Read, explore or ask someone how they see it, then bring one insight back to the choice in front of you.', 'What perspective have I not considered yet?'],
  ['Choose a promise you can keep', 'Give your energy a realistic shape. One clear priority and a stopping point can do more for you than a long list that treats rest as something you must earn.', 'What is enough for today, in concrete terms?'],
  ['Try a different way through', 'Step back from the familiar script and ask whether it still fits. An experiment, a conversation with a friend or a little distance can help you see another option.', 'Which rule am I following that I am allowed to reconsider?'],
  ['Listen, then find your footing', 'Leave a little space to reflect before responding. Feelings and imagination may offer a useful starting point; a practical check can help you decide what to do with them.', 'What do I feel, and what do I actually know?']
];
export const dailyFocus = {
  general:{label:'Everyday life',text:'Look for where this theme meets your actual day: one task, one conversation or one decision. Keep the part that helps and leave room for your own judgment.',action:'Choose one manageable action and a time to do it.'},
  love:{label:'Love & connection',text:'Bring the theme into a conversation about a need or a boundary. This reading cannot tell you what another person secretly feels; their words and actions give you that information.',action:'Say one need clearly, then make space for an honest answer.'},
  career:{label:'Work & direction',text:'Apply the theme to what is within your control at work: preparation, communication and follow-through. Let real information guide decisions about money and commitments.',action:'Pick one useful task, define what finished means, and begin there.'},
  decision:{label:'A decision',text:'Use the theme to examine the choice rather than to choose for you. Write down what each option asks of you, what you know, and what still needs checking.',action:'Find one missing fact before making the next commitment.'},
  healing:{label:'Rest & closure',text:'You do not need to force a breakthrough today. Try the theme as a way to name what hurts, identify a boundary or recognize the kind of support you need.',action:'Choose one gentle boundary or supportive conversation for today.'},
  growth:{label:'Personal growth',text:'Notice one repeated response without turning it into a criticism of yourself. The useful question is whether a small change would serve you better this time.',action:'Try one different response and notice what you learn.'}
};

export function dailySky(day) {
  // A fixed, explicitly displayed instant gives every visitor the same daily sky.
  const instant = new Date(`${day}T12:00:00.000Z`);
  const planets = planetNames.map(name => {
    const position = zodiacPosition(longitudeAt(name, instant));
    const before = longitudeAt(name, new Date(+instant - 43200000));
    const after = longitudeAt(name, new Date(+instant + 43200000));
    const speed = ((after - before + 540) % 360) - 180;
    return {name, ...position, motion:Math.abs(speed)<.003?'Stationary':speed<0?'Retrograde':'Direct'};
  });
  const phaseAngle = normalizeAngle(planets[1].longitude - planets[0].longitude);
  const phaseNames = ['New Moon','Waxing Crescent','First Quarter','Waxing Gibbous','Full Moon','Waning Gibbous','Last Quarter','Waning Crescent'];
  const phase = phaseNames[Math.floor((phaseAngle + 22.5) / 45) % 8];
  return {instant:instant.toISOString(),planets,phase,phaseAngle,aspects:calculateAspects(planets)};
}

export function horoscopeIdentity(input) {
  const browsing = input.sign && input.sign !== 'profile';
  const personal = browsing ? null : personalContext(input.profile || {});
  const sign = browsing ? signs.find(s=>s.name.toLowerCase()===input.sign) : personal?.sign;
  return {personal,sign:sign||null,basis:browsing?'chosen sign':!sign?'general sky':personal.zodiacApproximate?'approximate Sun sign':'calculated Sun sign'};
}

function chartContacts(sky, chart) {
  const targets = [...chart.planets.filter(p=>['Sun','Moon','Venus','Mars'].includes(p.name)), {name:'Ascendant',...chart.angles.ascendant}];
  const rules = [{name:'conjunct',angle:0},{name:'sextile',angle:60},{name:'square',angle:90},{name:'trine',angle:120},{name:'opposite',angle:180}];
  const contacts=[];
  for (const moving of sky.planets) for (const birth of targets) for (const rule of rules) {
    const orb = Math.abs(angleDistance(moving.longitude,birth.longitude)-rule.angle);
    if(orb<=2) contacts.push({moving:moving.name,birth:birth.name,aspect:rule.name,orb});
  }
  return contacts.sort((a,b)=>a.orb-b.orb).slice(0,3);
}

export function buildDailyHoroscope(input, {now=new Date(),source=null}={}) {
  const timeZone=input.timeZone||'UTC', date=calendarDay(timeZone,now), sky=dailySky(date);
  const {personal,sign,basis}=horoscopeIdentity(input);
  const moon=sky.planets[1], sun=sky.planets[0];
  const [headline,overview,question]=moonPrompts[moon.signIndex];
  const focus = dailyFocus[input.focus] || dailyFocus.general;
  const layers=[];
  if(sign) layers.push({title:`${sign.name} · ${basis}`,text:`${sign.name}'s traditional theme of ${sign.theme} gives you a way into today's reflection. ${sign.practice}`});
  if(personal?.natal?.status==='ready') {
    const chart=personal.natal, birthMoon=chart.planets[1], rising=chart.angles.ascendant;
    layers.push({title:`Your Moon in ${birthMoon.sign}`,text:`Your birth Moon is traditionally read as a reflection of emotional needs. ${signs[birthMoon.signIndex].practice} Today's Moon is in ${moon.sign}; it describes a different, passing layer.`});
    const house=((moon.signIndex-rising.signIndex+12)%12)+1;
    layers.push({title:`Today's Moon in your ${house}${house===1?'st':house===2?'nd':house===3?'rd':'th'} house`,text:`Using your ${rising.sign} rising sign and Whole Sign houses, this places the daily Moon in the area of ${chart.houses[house-1].meaning.toLowerCase()}. Ask where that topic needs a little attention in your actual day.`});
    for(const contact of chartContacts(sky,chart)) {
      const easy=['trine','sextile'].includes(contact.aspect);
      const birthTheme=planetThemes[contact.birth]||'the way you approach new situations';
      layers.push({title:`Today's ${contact.moving} ${contact.aspect} your birth ${contact.birth}`,text:`This connects the traditional themes of ${planetThemes[contact.moving]} with ${birthTheme}. ${easy?'Look for a small opening: a conversation, habit or choice that lets those needs support each other.':'If those needs seem to compete, pause and name what each one is asking for. A small adjustment can make room for both.'} The calculated angle is within ${contact.orb.toFixed(1)}° of exact. Notice whether the reflection fits your experience.`,kind:'transit'});
    }
  }
  if(personal?.lifePath) {
    const birthday=input.profile.birthday;
    const [,month,day]=birthday.split('-').map(Number), [year,todayMonth,todayDay]=date.split('-').map(Number);
    const personalYear=reduceNumber(month+day+digitSum(year),false);
    const personalMonth=reduceNumber(personalYear+todayMonth,false);
    const personalDay=reduceNumber(personalMonth+todayDay,false);
    layers.push({title:`Personal day ${personalDay} · ${numbers[personalDay].title}`,text:numbers[personalDay].practice,calculation:`Calendar-year convention: personal year ${personalYear} + month ${todayMonth} → ${personalMonth}; + day ${todayDay} → ${personalDay}. A symbolic numerology layer.`});
  }
  if(personal?.nameNumber) layers.push({title:`Name reflection ${personal.nameNumber}`,text:numbers[personal.nameNumber].practice});
  const chartMessage=personal?.natal?.status && !['ready','not_requested'].includes(personal.natal.status) ? personal.natal.message : '';
  return {
    version:HOROSCOPE_VERSION,date,timeZone,nextUpdateAt:nextDayStart(timeZone,now),createdAt:now.toISOString(),
    sign,basis,headline,overview,question,focus,layers,chartMessage,
    sky:{instant:sky.instant,sun,moon,phase:sky.phase,planets:sky.planets},
    source:source||{mode:'calculated',status:'not_connected',message:'An original Fold reflection from the calculated sky. A publisher feed is not connected.'},
    method:'Tropical, geocentric sky at 12:00 UTC on the displayed date. Moon phases use eight equal longitude sectors. The Moon can change signs during the day. Birth-chart contacts use a 2° orb. Astrology and numerology are symbolic reflection practices, not guaranteed predictions.'
  };
}
