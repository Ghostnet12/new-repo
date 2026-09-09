import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {layoutFortuneCard,drawFortuneCard} from '../src/lib/fortuneCard.js';
const {cards}=JSON.parse(readFileSync(new URL('../../server/data/collector-first-edition.json',import.meta.url)));
const enrich=card=>({...card,limited:true,serial:card.id,editionLabel:'First Series',luckyNumber:99,issuedAt:'2026-09-30T12:00:00Z'});
test('every collector message and badge fits the original 2:3 artwork',()=>{
 const ctx=createCanvas(1000,1500).getContext('2d');
 for(const card of cards){const lines=layoutFortuneCard(ctx,enrich(card));assert.ok(lines.some(l=>l.text.includes('LIMITED EDITION')),card.id);for(const line of lines){ctx.font=line.font;assert.ok(ctx.measureText(line.text).width<=671,`${card.id}: wide text`);assert.ok(line.y+line.size<=1210,`${card.id}: low text`);}}
});
test('ordinary and joker collector PNGs render using the existing frame',async()=>{
 const frame=await loadImage(new URL('../public/assets/the-fold/fortune-card-ornate.webp',import.meta.url).pathname);
 for(const card of [cards[0],cards.find(c=>c.joker)]){const canvas=createCanvas(1000,1500);drawFortuneCard(canvas.getContext('2d'),enrich(card),frame);const png=canvas.toBuffer('image/png');assert.equal(png.readUInt32BE(16),1000);assert.equal(png.readUInt32BE(20),1500);}
});
