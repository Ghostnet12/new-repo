import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const cards = join(root, 'client', 'public', 'assets', 'cards');
const webDir = join(cards, 'web');
const thumbDir = join(cards, 'thumb');

if (!existsSync(cards)) {
  throw new Error(`Missing Shadow Deck asset directory: ${cards}`);
}

await mkdir(webDir, { recursive: true });
await mkdir(thumbDir, { recursive: true });

const background = { r: 9, g: 7, b: 10, alpha: 1 };

async function render(input, output, width, height, quality) {
  await sharp(input)
    .rotate()
    .resize({ width, height, fit: 'contain', background, withoutEnlargement: true })
    .webp({ quality, effort: 5, smartSubsample: true })
    .toFile(output);
}

for (let id = 0; id < 78; id += 1) {
  const stem = String(id).padStart(2, '0');
  const input = join(cards, `${stem}.webp`);
  if (!existsSync(input)) throw new Error(`Missing card asset ${stem}.webp`);

  await Promise.all([
    render(input, join(webDir, `${stem}.webp`), 900, 1350, 82),
    render(input, join(thumbDir, `${stem}.webp`), 360, 540, 76)
  ]);
}

console.log('Generated responsive Shadow Deck card derivatives: 78 web + 78 thumbnails.');
