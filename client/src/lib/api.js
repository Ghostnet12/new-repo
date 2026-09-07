import { getClientToken } from './clientId.js';

const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

export async function api(path, options = {}) {
  // Vercel routes /api/* to its function; Vite proxies the same paths to Express.
  // Calling /api/router directly would rewrite its route parameter to "router".
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Shadow-Client': getClientToken(),
      ...(options.headers || {})
    }
  });
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : {};

  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
  if (!contentType.includes('application/json')) throw new Error('The API returned the website instead of JSON. Please refresh after the latest deployment finishes.');
  return payload;
}
