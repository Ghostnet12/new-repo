import { useState } from 'react';
import TarotCard from './TarotCard.jsx';
const filters=[['all','All 78 cards'],['major','Major Arcana'],['wands','Wands'],['cups','Cups'],['swords','Swords'],['pentacles','Pentacles']];
export default function DeckGallery({deck}) {
 const [filter,setFilter]=useState('all'),[query,setQuery]=useState('');
 const shown=deck.filter(card=>(filter==='all'||card.type===filter||card.suit===filter)&&`${card.name} ${card.upright} ${card.reversed}`.toLowerCase().includes(query.toLowerCase().trim()));
 return <section className="panel knowledge-panel deck-panel"><div className="section-kicker">The complete 78</div><h2>The Shadow Deck</h2><p>Explore every card. Open its meanings to read the upright message, reversed message and a practical reflection.</p>
 <label className="deck-search">Find a card<input type="search" placeholder="Search names or meanings…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
 <div className="guide-tabs" aria-label="Deck filters">{filters.map(([key,label])=><button key={key} aria-pressed={filter===key} className={filter===key?'active':''} onClick={()=>setFilter(key)}>{label}</button>)}</div>
 <p role="status">{shown.length} of 78 cards</p><div className="full-deck-grid">{shown.map(card=><div className="deck-entry" key={card.id}><TarotCard card={card} compact revealed/><h3>{card.name}</h3><details><summary>Explore meanings</summary><p><b>Upright:</b> {card.upright}.</p><p><b>Reversed:</b> {card.reversed}.</p><p><b>Try this:</b> {card.advice}</p><small>{card.element} · {card.suitName||'Major Arcana'}</small></details></div>)}</div>{!shown.length&&<p>No cards match that search. Try a card name or a word such as “hope”.</p>}</section>;
}
