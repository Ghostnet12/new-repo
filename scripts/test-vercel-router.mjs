import assert from 'node:assert/strict';
import { GET, POST, PUT, OPTIONS } from '../api/router.js';

const token = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const headers = { 'content-type': 'application/json', 'x-shadow-client': token };

const health = await GET(new Request('https://shadow.test/api/router?route=health', { headers }));
assert.equal(health.status, 200);
const healthJson = await health.json();
assert.equal(healthJson.status, 'ok');
assert.equal(healthJson.apiVersion, '3.1.0');

const deck = await GET(new Request('https://shadow.test/api/router?route=deck', { headers }));
assert.equal(deck.status, 200);
const deckJson = await deck.json();
assert.equal(deckJson.cards.length, 78);
assert.equal(deckJson.apiVersion, '3.1.0');

const reading = await POST(new Request('https://shadow.test/api/router?route=readings%2Fgenerate', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    persist: false,
    spread: 'three',
    focus: 'general',
    need: 'clarity',
    reversals: true,
    profile: { name: 'Vercel Route Test', gender: '', birthday: '', preferredSpread: 'three' }
  })
}));
assert.equal(reading.status, 200);
const readingJson = await reading.json();
assert.equal(readingJson.cards.length, 3);
assert.equal(readingJson.apiVersion, '3.1.0');
assert.ok(readingJson.analysis?.finalMessage);

// With no MONGODB_URI in CI, PUT must reach our function and return a database
// availability response. A 405 here means Vercel method routing regressed.
const profile = await PUT(new Request('https://shadow.test/api/router?route=profile', {
  method: 'PUT',
  headers,
  body: JSON.stringify({ name: 'Vercel Route Test', gender: '', birthday: '', preferredSpread: 'three' })
}));
assert.notEqual(profile.status, 405);
assert.equal(profile.status, 503);
const profileJson = await profile.json();
assert.equal(profileJson.apiVersion, '3.1.0');

const options = OPTIONS();
assert.equal(options.status, 204);
assert.match(options.headers.get('allow') || '', /POST/);
assert.match(options.headers.get('allow') || '', /PUT/);

console.log('Vercel router: GET, POST, PUT and OPTIONS method handling passed.');
