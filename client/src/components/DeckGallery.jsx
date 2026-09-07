import { useMemo, useState } from 'react';
import TarotCard from './TarotCard.jsx';

const FILTERS = [
  { key:'major', label:'Major Arcana' },
  { key:'wands', label:'Wands' },
  { key:'cups', label:'Cups' },
  { key:'swords', label:'Swords' },
  { key:'pentacles', label:'Pentacles' }
];

function initialPageSize() {
  if (typeof window === 'undefined') return 8;
  return window.matchMedia('(max-width: 620px)').matches ? 4 : 8;
}

export default function DeckGallery({ deck }) {
  const pageSize = initialPageSize();
  const [filter, setFilter] = useState(null);
  const [visible, setVisible] = useState(pageSize);

  const groups = useMemo(() => ({
    major: deck.filter(c => c.type === 'major'),
    wands: deck.filter(c => c.suit === 'wands'),
    cups: deck.filter(c => c.suit === 'cups'),
    swords: deck.filter(c => c.suit === 'swords'),
    pentacles: deck.filter(c => c.suit === 'pentacles')
  }), [deck]);

  if (!deck.length) return <section className="panel"><p>Loading deck…</p></section>;

  const choose = (key) => {
    setFilter(key);
    setVisible(pageSize);
  };

  if (!filter) {
    return <section className="panel deck-panel deck-threshold">
      <div className="section-kicker">The complete 78</div>
      <h2>Shadow Deck</h2>
      <p className="muted">Choose a section to browse. Cards are opened in small batches so iPhone Safari never has to decode the full deck at once.</p>
      <div className="deck-section-grid" aria-label="Tarot deck sections">
        {FILTERS.map(item => <button key={item.key} type="button" className="deck-section-card" onClick={() => choose(item.key)}>
          <span>{item.label}</span>
          <small>{groups[item.key].length} cards</small>
        </button>)}
      </div>
    </section>;
  }

  const selected = groups[filter] || [];
  const shown = selected.slice(0, visible);
  const current = FILTERS.find(item => item.key === filter);

  return <section className="panel deck-panel">
    <div className="section-kicker">Progressive deck gallery</div>
    <h2>{current?.label}</h2>
    <p className="muted">Only a small thumbnail batch is mounted at a time. The 4K masters remain untouched.</p>

    <div className="deck-filter-bar" role="tablist" aria-label="Tarot deck section">
      <button type="button" onClick={() => setFilter(null)}>Sections</button>
      {FILTERS.map(item => <button
        key={item.key}
        type="button"
        role="tab"
        aria-selected={filter === item.key}
        className={filter === item.key ? 'active' : ''}
        onClick={() => choose(item.key)}
      >{item.label}<small>{groups[item.key].length}</small></button>)}
    </div>

    <div className="deck-group">
      <div className="deck-title"><span>{current?.label}</span><span>{Math.min(visible, selected.length)} / {selected.length}</span></div>
      <div className="deck-grid progressive-deck-grid">
        {shown.map(c => <TarotCard key={c.id} card={c} compact revealed />)}
      </div>
      {visible < selected.length && <button className="deck-load-more" type="button" onClick={() => setVisible(v => Math.min(v + pageSize, selected.length))}>
        Load {Math.min(pageSize, selected.length - visible)} more cards
      </button>}
    </div>
  </section>;
}
