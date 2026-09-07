import test from 'node:test';
import assert from 'node:assert/strict';
import { restoreApiPath } from '../../api/index.js';

test('restores nested API path routed through Vercel function', () => {
  const req = { url: '/api/index.js?__path=readings/generate' };
  assert.equal(restoreApiPath(req), '/api/readings/generate');
  assert.equal(req.url, '/api/readings/generate');
});

test('preserves ordinary query parameters while removing routing marker', () => {
  const req = { url: '/api/index.js?__path=readings&limit=12' };
  assert.equal(restoreApiPath(req), '/api/readings?limit=12');
});

test('leaves direct /api request unchanged when no routing marker exists', () => {
  const req = { url: '/api' };
  assert.equal(restoreApiPath(req), '/api');
});
