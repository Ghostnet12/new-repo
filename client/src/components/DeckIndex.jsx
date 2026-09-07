import { useMemo, useState } from 'react';
import TarotCard from './TarotCard.jsx';
import { localDeck } from '../lib/localFallback.js';

const GROUPS = [
  { key:'all', label:'All 78', cards:localDeck },
  { key:'major', label:'Major Arcana', cards:localDeck.filter(card => card.type === 'major') },
  { key:'wands', label:'Wands', cards:localDeck.filter(card => card.suit === 'wands') },
  { key:'cups', label:'Cups', cards:localDeck.filter(card => card.suit === 'cups') },
  { key:'swords', label:'Swords', cards:localDeck.filter(card => card.suit === 'swords') },
  { key:'pentacles', label:'Pentacles', cards:localDeck.filter(card => card.suit === 'pentacles') }
];

function safePageSize() {
  if (typeof window === 'undefined') return 2;
  return window.matchMedia('(max-width: 620px)').matches ? 2 : 4;
}

export default function DeckIndex() {
  const [active, setActive] = useState('all');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(safePageSize);
  const group = useMemo(() => GROUPS.find(item => item.key === active) || GROUPS[0], [active]);
  const pages = Math.max(1, Math.ceil(group.cards.length / pageSize));
  const safePage = Math.min(page, pages - 1);
  const start = safePage * pageSize;
  const visible = group.cards.slice(start, start + pageSize);

  const chooseGroup = (key) => {
    setActive(key);
    setPage(0);
  };

  return <section className="panel deck-safe-index">
    <div className="section-kicker">Complete 78 · homepage renderer</div>
    <h2>Shadow Deck</h2>
    <p className="muted">Full Deck now uses the same TarotCard rendering path as the cards that already work on the homepage. Only {pageSize} cards are mounted at once on this device.</p>

    <div className="deck-safe-tabs" role="tablist" aria-label="Shadow Deck sections">
      {GROUPS.map(item => <button
        key={item.key}
        type="button"
        role="tab"
        aria-selected={active === item.key}
        className={active === item.key ? 'active' : ''}
        onClick={() => chooseGroup(item.key)}
      >{item.label}<small>{item.cards.length}</small></button>)}
    </div>

    <div className="deck-page-bar">
      <div><strong>{group.label}</strong><span>{group.cards.length} cards</span></div>
      <div className="deck-page-count">Page {safePage + 1} of {pages}</div>
    </div>

    <div className="deck-homepage-grid" aria-live="polite">
      {visible.map(card => <div className="deck-homepage-card" key={card.id}>
        <TarotCard card={card} revealed={true} reversed={false} imageOnly={true} />
        <div className="deck-art-copy"><small>Card {String(card.id + 1).padStart(2, '0')}</small><b>{card.name}</b></div>
      </div>)}
    </div>

    <div className="deck-page-controls">
      <button type="button" disabled={safePage === 0} onClick={() => setPage(value => Math.max(0, value - 1))}>← Previous</button>
      <span>{start + 1}–{Math.min(start + pageSize, group.cards.length)} of {group.cards.length}</span>
      <button type="button" disabled={safePage >= pages - 1} onClick={() => setPage(value => Math.min(pages - 1, value + 1))}>Next →</button>
    </div>

    <div className="deck-safe-note">This tab no longer uses its own image renderer or separate JPEG path. It reuses the same production card component and responsive assets as the homepage.</div>
  </section>;
}
