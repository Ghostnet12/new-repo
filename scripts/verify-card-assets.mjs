import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'client', 'public', 'assets', 'cards');
if (!existsSync(dir)) {
  console.error(`Missing card asset directory: ${dir}`);
  process.exit(1);
}

const files = new Set(readdirSync(dir));
const missing = [];
for (let id = 0; id < 78; id += 1) {
  const name = `${String(id).padStart(2, '0')}.webp`;
  if (!files.has(name)) missing.push(name);
}

if (missing.length) {
  console.error(`Missing ${missing.length} Shadow Deck card asset(s): ${missing.join(', ')}`);
  process.exit(1);
}

const unexpected = [...files].filter((name) => /^\d{2}\.webp$/.test(name) && Number(name.slice(0, 2)) > 77);
if (unexpected.length) {
  console.error(`Unexpected numbered card assets: ${unexpected.join(', ')}`);
  process.exit(1);
}

console.log('Verified 78 individual Shadow Deck card assets.');
