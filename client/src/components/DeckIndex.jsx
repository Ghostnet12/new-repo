import { useMemo, useState } from 'react';

const MAJORS = ['The Fool','The Magician','The High Priestess','The Empress','The Emperor','The Hierophant','The Lovers','The Chariot','Strength','The Hermit','Wheel of Fortune','Justice','The Hanged Man','Death','Temperance','The Devil','The Tower','The Star','The Moon','The Sun','Judgement','The World'];
const RANKS = ['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Page','Knight','Queen','King'];

const section = (key, label, start, names) => ({
  key,
  label,
  cards:names.map((name, index) => ({ id:start + index, name }))
});

const SECTIONS = [
  section('major', 'Major Arcana', 0, MAJORS),
  section('wands', 'Wands', 22, RANKS.map(rank => `${rank} of Wands`)),
  section('cups', 'Cups', 36, RANKS.map(rank => `${rank} of Cups`)),
  section('swords', 'Swords', 50, RANKS.map(rank => `${rank} of Swords`)),
  section('pentacles', 'Pentacles', 64, RANKS.map(rank => `${rank} of Pentacles`))
];

const ALL = { key:'all', label:'All 78', cards:SECTIONS.flatMap(item => item.cards) };
const GROUPS = [ALL, ...SECTIONS];

function safePageSize() {
  if (typeof window === 'undefined') return 4;
  return window.matchMedia('(max-width: 620px)').matches ? 4 : 8;
}

function safeImage(id) {
  return `/assets/cards/safe/${String(id).padStart(2, '0')}.jpg`;
}

export default function DeckIndex() {
  const [active, setActive] = useState('all');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(safePageSize);
  const group = useMemo(() => GROUPS.find(item => item.key === active) || ALL, [active]);
  const pages = Math.max(1, Math.ceil(group.cards.length / pageSize));
  const safePage = Math.min(page, pages - 1);
  const start = safePage * pageSize;
  const visible = group.cards.slice(start, start + pageSize);

  const chooseGroup = (key) => {
    setActive(key);
    setPage(0);
  };

  return <section className="panel deck-safe-index">
    <div className="section-kicker">Complete 78 · visual safe mode</div>
    <h2>Shadow Deck</h2>
    <p className="muted">The artwork is back. This tab stays inside The Fold and mounts only {pageSize} lightweight card images at once; moving pages removes the previous images from memory.</p>

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

    <div className="deck-art-grid" aria-live="polite">
      {visible.map(card => <article className="deck-art-card" key={card.id}>
        <img
          src={safeImage(card.id)}
          alt={card.name}
          width="240"
          height="360"
          decoding="async"
          loading="eager"
          fetchPriority="low"
        />
        <div className="deck-art-copy"><small>Card {String(card.id + 1).padStart(2, '0')}</small><b>{card.name}</b></div>
      </article>)}
    </div>

    <div className="deck-page-controls">
      <button type="button" disabled={safePage === 0} onClick={() => setPage(value => Math.max(0, value - 1))}>← Previous</button>
      <span>{start + 1}–{Math.min(start + pageSize, group.cards.length)} of {group.cards.length}</span>
      <button type="button" disabled={safePage >= pages - 1} onClick={() => setPage(value => Math.min(pages - 1, value + 1))}>Next →</button>
    </div>

    <div className="deck-safe-note">These are dedicated 240×360 baseline JPEG viewing copies. The original 78 high-resolution Shadow Deck masters remain untouched.</div>
  </section>;
}
