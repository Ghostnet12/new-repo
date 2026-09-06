import { createHash } from 'node:crypto';

const TOKEN_PATTERN = /^[a-f0-9]{64}$/;

export function requireAnonymousIdentity(req, res, next) {
  const token = req.get('x-shadow-client') || '';
  if (!TOKEN_PATTERN.test(token)) {
    return res.status(400).json({ error: 'Missing or invalid anonymous client token' });
  }
  req.clientHash = createHash('sha256').update(token).digest('hex');
  next();
}
