import app from '../server/src/app.js';

export function restoreApiPath(req) {
  const url = new URL(req.url || '/api', 'http://vercel.internal');
  const routedPath = url.searchParams.get('__path');
  if (routedPath === null) return req.url;

  url.searchParams.delete('__path');
  const query = url.searchParams.toString();
  const cleanPath = String(routedPath).replace(/^\/+/, '');
  req.url = `/api/${cleanPath}${query ? `?${query}` : ''}`;
  return req.url;
}

export default function handler(req, res) {
  restoreApiPath(req);
  return app(req, res);
}
