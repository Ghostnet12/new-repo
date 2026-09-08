import { TEXT_LIMIT } from '../../../server/src/validation/limits.js';
import { useState } from 'react';
import TarotCard from './TarotCard.jsx';
const filters=[['all','All 78 cards'],['major','Major Arcana'],['wands','Wands'],['cups','Cups'],['swords','Swords'],['pentacles','Pentacles']];
export default function DeckGallery({deck}) {
 const [filter,setFilter]=useState('all'),[query,setQuery]=useState('');
 const shown=deck.filter(card=>(filter==='all'||card.type===filter||card.suit===filter)&&`${card.name} ${card.upright} ${card.reversed}`.toLowerCase().includes(query.toLowerCase().trim()));
 return <section className="panel knowledge-panel deck-panel" aria-labelledby="deck-title"><div className="collection-heading"><div><div className="section-kicker">A language of symbols</div><h2 id="deck-title">The Shadow Deck</h2></div><span className="collection-count">78 cards</span></div><p className="collection-intro">Get to know the cards. Explore their upright and reversed meanings, and find a question to carry with you.</p>
 <label className="deck-search">Find a card<input maxLength={TEXT_LIMIT} type="search" placeholder="Search names or meanings…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
 <div className="guide-tabs" aria-label="Deck filters">{filters.map(([key,label])=><button key={key} aria-pressed={filter===key} className={filter===key?'active':''} onClick={()=>setFilter(key)}>{label}</button>)}</div>
 <p className="deck-results-count" role="status" aria-live="polite">{shown.length} of 78 cards{query.trim() ? ` matching “${query.trim()}”` : ''}</p><div className="full-deck-grid">{shown.map(card=><div className="deck-entry" key={card.id}><TarotCard card={card} compact revealed/><h3>{card.name}</h3><details><summary>Explore meanings<span className="sr-only"> for {card.name}</span></summary><p><b>Upright:</b> {card.upright}.</p><p><b>Reversed:</b> {card.reversed}.</p><p><b>Try this:</b> {card.advice}</p><small>{card.element} · {card.suitName||'Major Arcana'}</small></details></div>)}</div>{!shown.length&&<p>No cards match that search. Try a card name or a word such as “hope”.</p>}</section>;
}
