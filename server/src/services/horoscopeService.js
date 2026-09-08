import { buildDailyHoroscope, calendarDay, horoscopeIdentity } from '../tarot/horoscope.js';
import { dailyPublisher } from './horoscopeSources.js';
import { personalizeDailyReading } from './personalHoroscope.js';

export async function generateHoroscope(input,{now=new Date(),clientId,publisher=dailyPublisher,personalize=personalizeDailyReading}={}) {
  const started=Date.now();
  const {sign}=horoscopeIdentity(input);
  const source=await publisher(sign?.name.toLowerCase(),calendarDay(input.timeZone,now),{now});
  const reading=buildDailyHoroscope(input,{now,source});
  if(input.personalize) reading.perspective=await personalize(input,reading,{clientId,timeout:Math.min(10_000,25_000-(Date.now()-started))});
  return reading;
}
