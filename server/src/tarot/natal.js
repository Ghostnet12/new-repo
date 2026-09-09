import { Body, GeoVector, Ecliptic, SiderealTime, Rotation_ECT_EQD } from './astronomy.cjs';
import { Temporal } from '@js-temporal/polyfill';
import { signs, houses } from './knowledge.js';
import {natalDefaults} from '../../../shared/natalDefaults.js';

export {natalDefaults};
export const planetNames = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
export const normalizeAngle = a => ((a % 360) + 360) % 360;
export const angleDistance = (a,b) => Math.abs(((a-b+540)%360)-180);
const rad = Math.PI/180, deg = 180/Math.PI;
const aspectRules = [{name:'Conjunction',angle:0,orb:6},{name:'Sextile',angle:60,orb:4},{name:'Square',angle:90,orb:6},{name:'Trine',angle:120,orb:6},{name:'Opposition',angle:180,orb:6}];
export function zodiacPosition(longitude) {
  const n = normalizeAngle(longitude), index = Math.floor(n/30);
  // Display uses truncation so 29°59′ never incorrectly wraps into another sign.
  return {longitude:n,sign:signs[index].name,signIndex:index,degree:Math.floor(n%30),minute:Math.floor((n%1)*60),label:`${Math.floor(n%30)}°${String(Math.floor((n%1)*60)).padStart(2,'0')}′ ${signs[index].name}`};
}
export function resolveBirthTime(birthday, natal) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday||'') || !/^([01]\d|2[0-3]):[0-5]\d$/.test(natal.time||'')) throw new Error('Enter a valid birth date and local birth time.');
  const [year,month,day] = birthday.split('-').map(Number),[hour,minute] = natal.time.split(':').map(Number);
  if(year<1900) throw new Error('Birth charts are supported from 1900 onward.');
  const fields={year,month,day,hour,minute,timeZone:natal.timezone};
  let early,late;
  try {
    early=Temporal.ZonedDateTime.from(fields,{overflow:'reject',disambiguation:'earlier'});
    late=Temporal.ZonedDateTime.from(fields,{overflow:'reject',disambiguation:'later'});
  } catch { throw new Error('Check the calendar date and IANA time zone, such as America/Chicago.'); }
  const wanted=Temporal.PlainDateTime.from({year,month,day,hour,minute});
  if (!early.toPlainDateTime().equals(wanted)||!late.toPlainDateTime().equals(wanted)) throw new Error('That local time was skipped when the clocks changed. Check the time on the birth record; it cannot be shifted automatically.');
  const ambiguous=early.epochMilliseconds!==late.epochMilliseconds;
  if(ambiguous&&!['earlier','later'].includes(natal.disambiguation)) throw new Error('That clock time happened twice. Select the first or second occurrence under Clock-change handling.');
  const chosen=natal.disambiguation==='later'?late:early;
  if(chosen.epochMilliseconds>Date.now()) throw new Error('Birth date and time must be in the past.');
  return {date:new Date(chosen.epochMilliseconds),utc:chosen.toInstant().toString(),offset:chosen.offset,timeZone:chosen.timeZoneId,ambiguous};
}
export function calculateAngles(date,latitude,longitude) {
  const theta=normalizeAngle(SiderealTime(date)*15+longitude)*rad;
  const eps=Math.atan2(Rotation_ECT_EQD(date).rot[1][2],Rotation_ECT_EQD(date).rot[1][1]);
  const lat=latitude*rad;
  const a=Math.cos(lat)*Math.cos(theta);
  const b=Math.cos(lat)*Math.sin(theta)*Math.cos(eps)+Math.sin(lat)*Math.sin(eps);
  if(Math.hypot(a,b)<1e-10) throw new Error('The horizon and ecliptic are aligned at this location and time, so a unique rising sign is unavailable.');
  let asc=Math.atan2(-a,b);
  // Choose the eastern (rising) intersection of the horizon and ecliptic.
  const rising=-Math.cos(lat)*Math.sin(theta)*Math.cos(asc)+Math.cos(lat)*Math.cos(theta)*Math.cos(eps)*Math.sin(asc);
  if(rising<0) asc+=Math.PI;
  const mc=Math.atan2(Math.sin(theta),Math.cos(theta)*Math.cos(eps));
  return {ascendant:zodiacPosition(asc*deg),midheaven:zodiacPosition(mc*deg),descendant:zodiacPosition(asc*deg+180),imumCoeli:zodiacPosition(mc*deg+180)};
}
export function longitudeAt(name,date) { return Ecliptic(GeoVector(Body[name],date,true)).elon; }
export function calculateAspects(planets) {
  const found=[];
  for(let i=0;i<planets.length;i++) for(let j=i+1;j<planets.length;j++) {
    const a=planets[i],b=planets[j],separation=angleDistance(a.longitude,b.longitude);
    for(const rule of aspectRules) {
      const allowed=['Sun','Moon'].some(n=>n===a.name||n===b.name)&&[0,180].includes(rule.angle)?8:rule.orb;
      const orb=Math.abs(separation-rule.angle);
      if(orb<=allowed) found.push({a:a.name,b:b.name,name:rule.name,angle:rule.angle,separation,orb,allowedOrb:allowed});
    }
  }
  return found.sort((a,b)=>a.orb-b.orb);
}
export function calculateNatal(profile={}) {
  const n={...natalDefaults,...profile.natal};
  if(!n.enabled) return {status:'not_requested'};
  if(n.timeAccuracy==='unknown') return {status:'incomplete',message:'An unknown birth time cannot produce a reliable rising sign or houses. Turn off the natal chart to continue with tarot and date-based symbolism.'};
  if(!profile.birthday||!n.time||!n.timezone||String(n.latitude).trim()===''||String(n.longitude).trim()==='') return {status:'incomplete',message:'Add your birth date, local birth time, birthplace coordinates and time zone to calculate the chart.'};
  const latitude=Number(n.latitude),longitude=Number(n.longitude);
  if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>=90||Math.abs(longitude)>180) return {status:'invalid',message:'Latitude must be between −90 and 90 (excluding the poles); longitude must be between −180 and 180.'};
  try {
    const time=resolveBirthTime(profile.birthday,n),angles=calculateAngles(time.date,latitude,longitude),firstSign=angles.ascendant.signIndex;
    const planets=planetNames.map(name=>{
      const position=zodiacPosition(longitudeAt(name,time.date));
      const before=longitudeAt(name,new Date(time.date.getTime()-43200000)),after=longitudeAt(name,new Date(time.date.getTime()+43200000));
      const speed=((after-before+540)%360)-180;
      return {name,...position,house:((position.signIndex-firstSign+12)%12)+1,speed,motion:Math.abs(speed)<.003?'Stationary':speed<0?'Retrograde':'Direct'};
    });
    return {status:'ready',version:'natal-1.0',engine:'Astronomy Engine 2.1.19',zodiac:'Tropical',houseSystem:'Whole Sign',utc:time.utc,offset:time.offset,timeZone:time.timeZone,ambiguousTime:time.ambiguous,place:n.place||'Entered coordinates',latitude,longitude,timeAccuracy:n.timeAccuracy,localTime:`${profile.birthday} ${n.time}`,angles,planets,aspects:calculateAspects(planets),houses:houses.map((meaning,i)=>({number:i+1,meaning,...zodiacPosition((firstSign+i)*30)})),note:'Geocentric apparent planetary longitudes in the true ecliptic of date. Displayed to the arcminute; birth-time and city-coordinate uncertainty can be larger. Whole Sign houses begin at 0° of each sign; the Midheaven is a separate angle and need not lie in house 10.'};
  } catch(error) {return {status:'invalid',message:error.message};}
}
