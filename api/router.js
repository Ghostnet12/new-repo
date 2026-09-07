import { createHash } from 'node:crypto';
import mongoose from 'mongoose';
import { cards, spreads } from '../server/src/tarot/deck.js';
import { DECK_VERSION } from '../server/src/tarot/version.js';
import { generateReading } from '../server/src/services/readingService.js';
import { generateSchema, profileUpsertSchema } from '../server/src/validation/schemas.js';
import { connectMongo, dbStatus } from '../server/src/config/db.js';
import { Profile } from '../server/src/models/Profile.js';
import { Reading } from '../server/src/models/Reading.js';

const API_VERSION = '3.0.0';
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
  try { return await request.json(); }
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
      { upsert: true, setDefaultsOnInsert: true }
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
      personalization: {
        birthCard: reading.personalization.birthCard ? { id: reading.personalization.birthCard.id, name: reading.personalization.birthCard.name } : null,
        zodiac: reading.personalization.zodiac,
        zodiacCard: reading.personalization.zodiacCard ? { id: reading.personalization.zodiacCard.id, name: reading.personalization.zodiacCard.name } : null,
        lifePath: reading.personalization.lifePath
      },
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
  if (route === 'health') {
    await connectMongo();
    return json({ status: 'ok', database: dbStatus(), databaseConfigured: Boolean(process.env.MONGODB_URI), stack: 'Vercel Functions + MongoDB', apiVersion: API_VERSION });
  }
  if (route === 'deck') return json({ version: DECK_VERSION, cards, spreads, apiVersion: API_VERSION });

  const auth = await requireClient(request);
  if (auth.response) return auth.response;

  if (route === 'profile') {
    if (!await connectMongo()) return json({ error: 'MongoDB is not connected', database: dbStatus() }, 503);
    const profile = await Profile.findOne({ clientHash: auth.hash }).lean();
    return json({ profile, database: dbStatus() });
  }

  if (route === 'readings') {
    if (!await connectMongo()) return json({ error: 'MongoDB is not connected', database: dbStatus() }, 503);
    const url = new URL(request.url);
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 12, 1), 50);
    const readings = await Reading.find({ clientHash: auth.hash }).sort({ createdAt: -1 }).limit(limit).select('spreadName question focus favorite createdAt').lean();
    return json({ readings, database: dbStatus() });
  }

  if (route === 'selftest') {
    const reading = generateReading({ persist: false, profile: { name: 'Self Test', gender: '', birthday: '', preferredSpread: 'three' }, question: '', spread: 'three', focus: 'general', need: 'clarity', reversals: true });
    return json({ ok: reading.cards.length === 3, cards: reading.cards.length, database: dbStatus(), apiVersion: API_VERSION });
  }

  return json({ error: 'API route not found', route }, 404);
}

export async function POST(request) {
  const route = routeOf(request);
  if (route !== 'readings/generate') return json({ error: 'API route not found', route }, 404);
  const auth = await requireClient(request);
  if (auth.response) return auth.response;
  const body = await readJson(request);
  if (!body) return json({ error: 'Invalid JSON body' }, 400);
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
  if (route !== 'profile') return json({ error: 'API route not found', route }, 404);
  const auth = await requireClient(request);
  if (auth.response) return auth.response;
  const body = await readJson(request);
  if (!body) return json({ error: 'Invalid JSON body' }, 400);
  const parsed = profileUpsertSchema.safeParse(body);
  if (!parsed.success) return json({ error: 'Invalid profile', issues: parsed.error.issues }, 400);
  if (!await connectMongo()) return json({ error: 'MongoDB is not connected', database: dbStatus() }, 503);
  try {
    const profile = await Profile.findOneAndUpdate(
      { clientHash: auth.hash },
      { $set: { ...parsed.data, clientHash: auth.hash } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();
    return json({ profile, database: dbStatus() });
  } catch (error) {
    console.error('Profile save failed:', error.message);
    return json({ error: 'Profile save failed', database: dbStatus() }, 500);
  }
}

export async function PATCH(request) {
  const route = routeOf(request);
  const match = route.match(/^readings\/item\/([a-f0-9]{24})$/i);
  if (!match) return json({ error: 'API route not found', route }, 404);
  const auth = await requireClient(request);
  if (auth.response) return auth.response;
  if (!await connectMongo()) return json({ error: 'MongoDB is not connected', database: dbStatus() }, 503);
  const id = match[1];
  if (!mongoose.isValidObjectId(id)) return json({ error: 'Invalid reading id' }, 400);
  const body = await readJson(request) || {};
  const update = {};
  if (typeof body.favorite === 'boolean') update.favorite = body.favorite;
  if (typeof body.notes === 'string') update.notes = body.notes.slice(0, 2000);
  const reading = await Reading.findOneAndUpdate({ _id: id, clientHash: auth.hash }, { $set: update }, { new: true }).select('spreadName question focus favorite notes createdAt').lean();
  if (!reading) return json({ error: 'Reading not found' }, 404);
  return json({ reading, database: dbStatus() });
}

export async function DELETE(request) {
  const route = routeOf(request);
  const match = route.match(/^readings\/item\/([a-f0-9]{24})$/i);
  if (!match) return json({ error: 'API route not found', route }, 404);
  const auth = await requireClient(request);
  if (auth.response) return auth.response;
  if (!await connectMongo()) return json({ error: 'MongoDB is not connected', database: dbStatus() }, 503);
  const id = match[1];
  if (!mongoose.isValidObjectId(id)) return json({ error: 'Invalid reading id' }, 400);
  const result = await Reading.deleteOne({ _id: id, clientHash: auth.hash });
  if (!result.deletedCount) return json({ error: 'Reading not found' }, 404);
  return json({ deleted: true, database: dbStatus() });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: { ...jsonHeaders, 'allow': 'GET,POST,PUT,PATCH,DELETE,OPTIONS' } });
}
