import { buildDailyHoroscope, calendarDay, horoscopeIdentity } from '../tarot/horoscope.js';
import { dailyPublisher } from './horoscopeSources.js';

export async function generateHoroscope(input) {
  const now=new Date();
  const {sign}=horoscopeIdentity(input);
  const source=await dailyPublisher(sign?.name.toLowerCase(),calendarDay(input.timeZone,now),{now});
  return buildDailyHoroscope(input,{now,source});
}
