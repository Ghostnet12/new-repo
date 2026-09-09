import {collectorHttp} from '../server/src/collectors/http.js';
import { reviews, reviewResult } from '../server/src/services/reviewService.js';
import { createHash } from 'node:crypto';
import mongoose from 'mongoose';
import { cards, spreads } from '../server/src/tarot/deck.js';
import { DECK_VERSION } from '../server/src/tarot/version.js';
import { generateReading } from '../server/src/services/readingService.js';
import { generateSchema, profileUpsertSchema, readingUpdateSchema, horoscopeSchema } from '../server/src/validation/schemas.js';
import { generateHoroscope } from '../server/src/services/horoscopeService.js';
import { connectMongo, dbStatus } from '../server/src/config/db.js';
import { Profile } from '../server/src/models/Profile.js';
import { Reading } from '../server/src/models/Reading.js';
import { dreamJournal, dreamResult, reflectOnDream } from '../server/src/services/dreamService.js';

const API_VERSION = '3.1.0';
const jsonHeaders = {
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
  'x-shadow-api': API_VERSION
};

function json(data, status = 200) {
  return Response.json(data, { status, headers: jsonHeaders });
}

function routeOf(request) {
  const url = new URL(request.url);
  return (url.searchParams.get('route') || '').replace(/^\/+|\/+$/g, '');
}

function clientHash(request) {
  const token = request.headers.get('x-shadow-client') || '';
  if (!/^[a-f0-9]{64}$/i.test(token)) return null;
  return createHash('sha256').update(token.toLowerCase()).digest('hex');
}

async function readJson(request) {
  try {
    const reader=request.body?.getReader();
    if(!reader) return null;
    let size=0;const chunks=[];
    try {
      while(true) {
        const {done,value}=await reader.read();if(done) break;
        size+=value.byteLength;if(size>1_048_576) return null;
        chunks.push(value);
      }
    } finally {await reader.cancel().catch(()=>{});}
    const bytes=new Uint8Array(size);let offset=0;
    for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
    return JSON.parse(new TextDecoder().decode(bytes));
  }
  catch { return null; }
}

function expiryDate() {
  const days = Number(process.env.READING_RETENTION_DAYS || 0);
  return Number.isFinite(days) && days > 0 ? new Date(Date.now() + days * 86400000) : null;
}

async function requireClient(request) {
  const hash = clientHash(request);
  return hash ? { hash } : { response: json({ error: 'Missing or invalid anonymous client token' }, 401) };
}

async function saveReading(hash, input, reading) {
  if (!await connectMongo()) return { persisted: false, persistenceError: 'database-unavailable' };
  try {
    await Profile.findOneAndUpdate(
      { clientHash: hash },
      { $set: { clientHash: hash, ...input.profile, preferredSpread: input.spread } },
      { upsert: true, setDefaultsOnInsert: true, runValidators:true }
    );
    await Reading.create({
      clientHash: hash,
      deckVersion: DECK_VERSION,
      spreadKey: input.spread,
      spreadName: reading.spread.name,
      question: input.question,
      focus: input.focus,
      need: input.need,
      profile: { name: input.profile.name, gender: input.profile.gender },
      personalization: reading.personalization,
      cards: reading.cards.map(x => ({ cardId: x.card.id, name: x.card.name, position: x.position, reversed: x.reversed })),
      analysis: reading.analysis,
      expiresAt: expiryDate()
    });
    return { persisted: true, persistenceError: '' };
  } catch (error) {
    console.error('Reading persistence failed:', error.message);
    return { persisted: false, persistenceError: 'database-write-failed' };
  }
}

export async function GET(request) {
  const route = routeOf(request);
  if(route.startsWith('collectors/'))return collectorHttp(request,route.slice('collectors/'.length));
  if (route === 'health') {
    await connectMongo();
    return json({ status: 'ok', database: dbStatus(), databaseConfigured: Boolean(process.env.MONGODB_URI), stack: 'Vercel Functions + MongoDB', apiVersion: API_VERSION });
  }
  if (route === 'deck') return json({ version: DECK_VERSION, cards, spreads, apiVersion: API_VERSION });

  if(route==='reviews'){const result=await reviewResult(()=>reviews.list(new URL(request.url).searchParams.get('page')));return json(result.body,result.status);}
  const auth = await requireClient(request);
  if (auth.response) return auth.response;
  if(route==='reviews/mine'){const result=await reviewResult(()=>reviews.mine(auth.hash));return json(result.body,result.status);}
  if(route==='dreams'){const result=await dreamResult(()=>dreamJournal.list(auth.hash,new URL(request.url).searchParams.get('page')));return json(result.body,result.status);}

  if (route === 'profile') {
    if (!await connectMongo()) return json({ error: 'MongoDB is not connected', database: dbStatus(), apiVersion: API_VERSION }, 503);
    const profile = await Profile.findOne({ clientHash: auth.hash }).lean();
    return json({ profile, database: dbStatus(), apiVersion: API_VERSION });
  }

  if (route === 'readings') {
    if (!await connectMongo()) return json({ error: 'MongoDB is not connected', database: dbStatus(), apiVersion: API_VERSION }, 503);
    const url = new URL(request.url);
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 12, 1), 50);
    const readings = await Reading.find({ clientHash: auth.hash }).sort({ createdAt: -1 }).limit(limit).select('spreadName question focus favorite createdAt').lean();
    return json({ readings, database: dbStatus(), apiVersion: API_VERSION });
  }

  if (route === 'selftest') {
    const reading = generateReading({ persist: false, profile: { name: 'Self Test', gender: '', birthday: '', preferredSpread: 'three' }, question: '', spread: 'three', focus: 'general', need: 'clarity', reversals: true });
    return json({ ok: reading.cards.length === 3, cards: reading.cards.length, database: dbStatus(), apiVersion: API_VERSION });
  }

  return json({ error: 'API route not found', route, apiVersion: API_VERSION }, 404);
}

export async function POST(request) {
  const route = routeOf(request);
  if(route.startsWith('collectors/'))return collectorHttp(request,route.slice('collectors/'.length));
  if (!['readings/generate','horoscopes/daily','reviews','dreams','dreams/reflect'].includes(route)) return json({ error: 'API route not found', route, apiVersion: API_VERSION }, 404);
  const auth = await requireClient(request);
  if (auth.response) return auth.response;
  const body = await readJson(request);
  if (!body) return json({ error: 'Invalid JSON body' }, 400);
  if(route==='reviews'){const result=await reviewResult(()=>reviews.save(auth.hash,body));return json(result.body,result.status);}
  if(route==='dreams'||route==='dreams/reflect'){
    const result=await dreamResult(()=>route==='dreams'?dreamJournal.save(auth.hash,body):reflectOnDream(body,{clientId:auth.hash}));
    return json(result.body,result.status);
  }
  if(route==='horoscopes/daily') {
    const parsed=horoscopeSchema.safeParse(body);
    if(!parsed.success) return json({error:'Invalid horoscope request',issues:parsed.error.issues},400);
    return json(await generateHoroscope(parsed.data,{clientId:auth.hash}));
  }
  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) return json({ error: 'Invalid reading request', issues: parsed.error.issues }, 400);
  const input = parsed.data;
  const reading = generateReading(input);
  let persisted = false, persistenceError = '';
  if (input.persist) ({ persisted, persistenceError } = await saveReading(auth.hash, input, reading));
  return json({ ...reading, deckVersion: DECK_VERSION, persisted, persistenceError, database: dbStatus(), apiVersion: API_VERSION });
}

export async function PUT(request) {
  const route = routeOf(request);
  if (route !== 'profile') return json({ error: 'API route not found', route, apiVersion: API_VERSION }, 404);
  const auth = await requireClient(request);
  if (auth.response) return auth.response;
  const body = await readJson(request);
  if (!body) return json({ error: 'Invalid JSON body' }, 400);
  const parsed = profileUpsertSchema.safeParse(body);
  if (!parsed.success) return json({ error: 'Invalid profile', issues: parsed.error.issues }, 400);
  if (!await connectMongo()) return json({ error: 'MongoDB is not connected', database: dbStatus(), apiVersion: API_VERSION }, 503);
  try {
    const profile = await Profile.findOneAndUpdate(
      { clientHash: auth.hash },
      { $set: { ...parsed.data, clientHash: auth.hash } },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators:true }
    ).lean();
    return json({ profile, database: dbStatus(), apiVersion: API_VERSION });
  } catch (error) {
    console.error('Profile save failed:', error.message);
    return json({ error: 'Profile save failed', database: dbStatus(), apiVersion: API_VERSION }, 500);
  }
}

export async function PATCH(request) {
  const route = routeOf(request);
  const match = route.match(/^readings\/item\/([a-f0-9]{24})$/i);
  if (!match) return json({ error: 'API route not found', route, apiVersion: API_VERSION }, 404);
  const auth = await requireClient(request);
  if (auth.response) return auth.response;
  const body=await readJson(request);
  const parsed=readingUpdateSchema.safeParse(body);
  if(!parsed.success) return json({error:'Invalid reading update',issues:parsed.error.issues},400);
  if (!await connectMongo()) return json({ error: 'MongoDB is not connected', database: dbStatus(), apiVersion: API_VERSION }, 503);
  const id = match[1];
  if (!mongoose.isValidObjectId(id)) return json({ error: 'Invalid reading id' }, 400);
  const reading = await Reading.findOneAndUpdate({ _id: id, clientHash: auth.hash }, { $set: parsed.data }, { new: true, runValidators:true }).select('spreadName question focus favorite notes createdAt').lean();
  if (!reading) return json({ error: 'Reading not found' }, 404);
  return json({ reading, database: dbStatus(), apiVersion: API_VERSION });
}

export async function DELETE(request) {
  const route = routeOf(request);
  if(route.startsWith('dreams/')){const auth=await requireClient(request);if(auth.response)return auth.response;const result=await dreamResult(()=>dreamJournal.remove(auth.hash,route.slice('dreams/'.length)));return json(result.body,result.status);}
  if(route==='reviews/mine'){const auth=await requireClient(request);if(auth.response)return auth.response;const result=await reviewResult(()=>reviews.remove(auth.hash));return json(result.body,result.status);}
  const match = route.match(/^readings\/item\/([a-f0-9]{24})$/i);
  if (!match) return json({ error: 'API route not found', route, apiVersion: API_VERSION }, 404);
  const auth = await requireClient(request);
  if (auth.response) return auth.response;
  if (!await connectMongo()) return json({ error: 'MongoDB is not connected', database: dbStatus(), apiVersion: API_VERSION }, 503);
  const id = match[1];
  if (!mongoose.isValidObjectId(id)) return json({ error: 'Invalid reading id' }, 400);
  const result = await Reading.deleteOne({ _id: id, clientHash: auth.hash });
  if (!result.deletedCount) return json({ error: 'Reading not found' }, 404);
  return json({ deleted: true, database: dbStatus(), apiVersion: API_VERSION });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: { ...jsonHeaders, 'allow': 'GET,POST,PUT,PATCH,DELETE,OPTIONS' } });
}
