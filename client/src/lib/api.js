import { getClientToken } from './clientId.js';

const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

function routedPath(path) {
  if (API_BASE) return `${API_BASE}${path}`;
  if (!path.startsWith('/api/')) return path;
  const logical = path.slice(5);
  const q = logical.indexOf('?');
  const route = q >= 0 ? logical.slice(0, q) : logical;
  const query = q >= 0 ? logical.slice(q + 1) : '';
  const params = new URLSearchParams(query);
  params.set('route', route);
  return `/api/router?${params.toString()}`;
}

export async function api(path, options = {}) {
  const response = await fetch(routedPath(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Shadow-Client': getClientToken(),
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
  return payload;
}
