import { useMemo, useState } from 'react';
import TarotCard from './TarotCard.jsx';

const FILTERS = [
  { key:'major', label:'Major Arcana' },
  { key:'wands', label:'Wands' },
  { key:'cups', label:'Cups' },
  { key:'swords', label:'Swords' },
  { key:'pentacles', label:'Pentacles' }
];

const PAGE_SIZE = 12;

export default function DeckGallery({ deck }) {
  const [filter, setFilter] = useState('major');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const groups = useMemo(() => ({
    major: deck.filter(c => c.type === 'major'),
    wands: deck.filter(c => c.suit === 'wands'),
    cups: deck.filter(c => c.suit === 'cups'),
    swords: deck.filter(c => c.suit === 'swords'),
    pentacles: deck.filter(c => c.suit === 'pentacles')
  }), [deck]);

  if (!deck.length) return <section className="panel"><p>Loading deck…</p></section>;

  const selected = groups[filter] || [];
  const shown = selected.slice(0, visible);
  const current = FILTERS.find(item => item.key === filter);

  const choose = (key) => {
    setFilter(key);
    setVisible(PAGE_SIZE);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return <section className="panel deck-panel">
    <div className="section-kicker">Progressive deck gallery</div>
    <h2>All 78 Designs</h2>
    <p className="muted">Browse one section at a time so mobile devices never have to decode the entire 78-card deck at once.</p>

    <div className="deck-filter-bar" role="tablist" aria-label="Tarot deck section">
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
      {visible < selected.length && <button className="deck-load-more" type="button" onClick={() => setVisible(v => Math.min(v + PAGE_SIZE, selected.length))}>
        Load {Math.min(PAGE_SIZE, selected.length - visible)} more cards
      </button>}
    </div>
  </section>;
}
