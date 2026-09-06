import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const root = process.cwd();
const dir = path.join(root, 'client', 'public', 'atlas4k');
const manifest = JSON.parse(await readFile(path.join(dir, 'manifest.json'), 'utf8'));
const parts = [];
for (let i = 0; i < manifest.parts; i++) {
  const name = `${String(i).padStart(2, '0')}.txt`;
  parts.push((await readFile(path.join(dir, name), 'utf8')).trim());
}
const data = Buffer.from(parts.join(''), 'base64');
const sha256 = createHash('sha256').update(data).digest('hex');
if (data.length !== manifest.bytes) throw new Error(`Atlas byte length mismatch: ${data.length} != ${manifest.bytes}`);
if (sha256 !== manifest.sha256) throw new Error(`Atlas SHA-256 mismatch: ${sha256}`);
await writeFile(path.join(root, 'client', 'public', 'shadow78_atlas.webp'), data);
console.log(`Assembled Shadow Deck atlas: ${data.length} bytes · ${sha256.slice(0,12)}…`);
