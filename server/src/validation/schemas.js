import { TEXT_LIMIT, TEXT_LIMIT_MESSAGE } from './limits.js';
import { calculateNatal } from '../tarot/natal.js';
import { z } from 'zod';
import { signs } from '../tarot/knowledge.js';
import { calendarDay } from '../tarot/horoscope.js';
function validBirthday(value){if(value==='')return true;if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const[year,month,day]=value.split('-').map(Number);const date=new Date(Date.UTC(year,month-1,day));const now=new Date();const today=Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate());return year>=1900&&date.getUTCFullYear()===year&&date.getUTCMonth()===month-1&&date.getUTCDate()===day&&date.getTime()<=today}
const birthdaySchema=z.string().max(10).refine(validBirthday,'Birthday must be a valid calendar date between 1900 and today');
const natalSchema=z.object({enabled:z.boolean().default(false),time:z.string().max(5).default(''),place:z.string().max(TEXT_LIMIT, TEXT_LIMIT_MESSAGE).trim().default(''),latitude:z.string().max(24).default(''),longitude:z.string().max(24).default(''),timezone:z.string().max(TEXT_LIMIT, TEXT_LIMIT_MESSAGE).trim().default(''),timeAccuracy:z.enum(['exact','approximate','unknown']).default('exact'),disambiguation:z.enum(['reject','earlier','later']).default('reject')});
const profileSchema=z.object({name:z.string().max(TEXT_LIMIT, TEXT_LIMIT_MESSAGE).trim().optional().default(''),gender:z.string().max(TEXT_LIMIT, TEXT_LIMIT_MESSAGE).trim().optional().default(''),birthday:birthdaySchema.optional().default(''),natal:natalSchema.optional(),preferredSpread:z.enum(['three','shadow','love','career','celtic']).optional().default('three')});
export const generateSchema=z.object({personalInfluence:z.boolean().optional().default(true),persist:z.boolean().optional().default(false),profile:profileSchema.optional().default({}),question:z.string().max(TEXT_LIMIT, TEXT_LIMIT_MESSAGE).trim().optional().default(''),spread:z.enum(['three','shadow','love','career','celtic']).default('three'),focus:z.enum(['general','love','career','decision','healing','growth']).default('general'),need:z.enum(['clarity','direction','closure','courage','understanding']).default('clarity'),reversals:z.boolean().default(true)}).superRefine((input,ctx)=>{
 if(input.personalInfluence && input.profile.natal?.enabled) {const chart=calculateNatal(input.profile);if(chart.status!=='ready')ctx.addIssue({code:'custom',path:['profile','natal'],message:chart.message});}
});
export const profileUpsertSchema=profileSchema;

export const horoscopeSchema=z.object({
 profile:profileSchema.optional().default({}),
 sign:z.enum(['profile',...signs.map(sign=>sign.name.toLowerCase())]).default('profile'),
 timeZone:z.string().max(TEXT_LIMIT,TEXT_LIMIT_MESSAGE).default('UTC').refine(value=>{try{calendarDay(value);return true;}catch{return false;}},'Choose a valid time zone.'),
 focus:z.enum(['general','love','career','decision','healing','growth']).default('general')
});

export const readingUpdateSchema=z.object({favorite:z.boolean().optional(),notes:z.string().max(TEXT_LIMIT,TEXT_LIMIT_MESSAGE).optional()});
