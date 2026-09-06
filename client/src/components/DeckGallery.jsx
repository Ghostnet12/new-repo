import TarotCard from './TarotCard.jsx';
export default function DeckGallery({ deck }) {
  if (!deck.length) return <section className="panel"><p>Loading deck…</p></section>;
  const groups = [['Major Arcana', deck.filter(c => c.type === 'major')], ['Wands · Fire', deck.filter(c => c.suit === 'wands')], ['Cups · Water', deck.filter(c => c.suit === 'cups')], ['Swords · Air', deck.filter(c => c.suit === 'swords')], ['Pentacles · Earth', deck.filter(c => c.suit === 'pentacles')]];
  return <section className="panel deck-panel"><div className="section-kicker">Rendered deck gallery</div><h2>All 78 Designs</h2>{groups.map(([title,cards]) => <div className="deck-group" key={title}><div className="deck-title"><span>{title}</span><span>{cards.length}</span></div><div className="deck-grid">{cards.map(c => <TarotCard key={c.id} card={c} compact revealed />)}</div></div>)}</section>;
}
