import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const cards = join(root, 'client', 'public', 'assets', 'cards');
const webDir = join(cards, 'web');
const thumbDir = join(cards, 'thumb');
const safeDir = join(cards, 'safe');

if (!existsSync(cards)) {
  throw new Error(`Missing Shadow Deck asset directory: ${cards}`);
}

await Promise.all([
  mkdir(webDir, { recursive: true }),
  mkdir(thumbDir, { recursive: true }),
  mkdir(safeDir, { recursive: true })
]);

const background = { r: 9, g: 7, b: 10, alpha: 1 };

async function renderWebp(input, output, width, height, quality) {
  await sharp(input)
    .rotate()
    .resize({ width, height, fit: 'contain', background, withoutEnlargement: true })
    .webp({ quality, effort: 5, smartSubsample: true })
    .toFile(output);
}

async function renderSafeJpeg(input, output) {
  await sharp(input)
    .rotate()
    .resize({ width: 240, height: 360, fit: 'contain', background, withoutEnlargement: true })
    .flatten({ background })
    .jpeg({ quality: 68, progressive: false, mozjpeg: false, chromaSubsampling: '4:2:0' })
    .toFile(output);
}

for (let id = 0; id < 78; id += 1) {
  const stem = String(id).padStart(2, '0');
  const input = join(cards, `${stem}.webp`);
  if (!existsSync(input)) throw new Error(`Missing card asset ${stem}.webp`);

  await Promise.all([
    renderWebp(input, join(webDir, `${stem}.webp`), 900, 1350, 82),
    renderWebp(input, join(thumbDir, `${stem}.webp`), 360, 540, 76),
    renderSafeJpeg(input, join(safeDir, `${stem}.jpg`))
  ]);
}

console.log('Generated Shadow Deck derivatives: 78 web WebP + 78 thumbnail WebP + 78 safe JPEG.');
