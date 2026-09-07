import { randomInt, randomUUID } from 'node:crypto';
import { cards, spreads } from '../tarot/deck.js';
import { buildReading } from '../tarot/interpretation.js';
export function generateReading(input) {
  const deck = cards.slice();
  for(let i=deck.length-1;i>0;i--) {const j=randomInt(i+1);[deck[i],deck[j]]=[deck[j],deck[i]];}
  const draw = deck.slice(0,spreads[input.spread].positions.length);
  return buildReading(input,draw,draw.map(()=>input.reversals && randomInt(100)<30),randomUUID());
}
