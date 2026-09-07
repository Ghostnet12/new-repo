import test from 'node:test';
import assert from 'node:assert/strict';
import { GET, POST, PUT } from '../../api/router.js';

const TOKEN = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

function withToken(init = {}) {
  return { ...init, headers: { 'content-type': 'application/json', 'x-shadow-client': TOKEN, ...(init.headers || {}) } };
}

test('Vercel GET deck returns all 78 cards', async () => {
  const response = await GET(new Request('https://shadow.test/api/router?route=deck'));
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.cards.length, 78);
  assert.equal(payload.apiVersion, '3.1.0');
});

test('Vercel POST reading generation works without MongoDB', async () => {
  const previous = process.env.MONGODB_URI;
  delete process.env.MONGODB_URI;
  try {
    const request = new Request('https://shadow.test/api/router?route=readings/generate', withToken({
      method: 'POST',
      body: JSON.stringify({ spread: 'three', focus: 'general', need: 'clarity', reversals: true, persist: false, profile: { name: 'CI Seeker' } })
    }));
    const response = await POST(request);
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.cards.length, 3);
    assert.ok(payload.analysis.finalMessage);
    assert.equal(payload.persisted, false);
    assert.equal(payload.apiVersion, '3.1.0');
  } finally {
    if (previous === undefined) delete process.env.MONGODB_URI; else process.env.MONGODB_URI = previous;
  }
});

test('Vercel PUT profile reaches application handler instead of platform 405', async () => {
  const previous = process.env.MONGODB_URI;
  delete process.env.MONGODB_URI;
  try {
    const request = new Request('https://shadow.test/api/router?route=profile', withToken({
      method: 'PUT',
      body: JSON.stringify({ name: 'CI Seeker', gender: '', birthday: '', preferredSpread: 'three' })
    }));
    const response = await PUT(request);
    assert.equal(response.status, 503);
    const payload = await response.json();
    assert.equal(payload.database, 'not-configured');
    assert.equal(payload.apiVersion, '3.1.0');
  } finally {
    if (previous === undefined) delete process.env.MONGODB_URI; else process.env.MONGODB_URI = previous;
  }
});
