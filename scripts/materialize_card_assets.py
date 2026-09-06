#!/usr/bin/env python3
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / 'asset-source' / 'shadow78_transport.webp'
out = ROOT / 'client' / 'public' / 'assets' / 'cards'
out.mkdir(parents=True, exist_ok=True)

sheet = Image.open(source).convert('RGB')
CELL_W, CELL_H = 256, 384
expected = (14 * CELL_W, 6 * CELL_H)
if sheet.size != expected:
    raise SystemExit(f'Unexpected source sheet size {sheet.size}; expected {expected}')

def cell_for_id(card_id):
    if card_id < 11:
        return card_id, 0
    if card_id < 22:
        return card_id - 11, 1
    minor = card_id - 22
    return minor % 14, 2 + minor // 14

for card_id in range(78):
    col, row = cell_for_id(card_id)
    box = (col * CELL_W, row * CELL_H, (col + 1) * CELL_W, (row + 1) * CELL_H)
    card = sheet.crop(box)
    card.save(out / f'{card_id:02d}.webp', 'WEBP', quality=92, method=6)

print(f'Wrote 78 individual card assets to {out}')
