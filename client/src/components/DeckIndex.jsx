import { useMemo, useState } from 'react';

const MAJORS = ['The Fool','The Magician','The High Priestess','The Empress','The Emperor','The Hierophant','The Lovers','The Chariot','Strength','The Hermit','Wheel of Fortune','Justice','The Hanged Man','Death','Temperance','The Devil','The Tower','The Star','The Moon','The Sun','Judgement','The World'];
const RANKS = ['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Page','Knight','Queen','King'];
const GROUPS = [
  { key:'major', label:'Major Arcana', cards:MAJORS },
  { key:'wands', label:'Wands', cards:RANKS.map(rank => `${rank} of Wands`) },
  { key:'cups', label:'Cups', cards:RANKS.map(rank => `${rank} of Cups`) },
  { key:'swords', label:'Swords', cards:RANKS.map(rank => `${rank} of Swords`) },
  { key:'pentacles', label:'Pentacles', cards:RANKS.map(rank => `${rank} of Pentacles`) }
];

export default function DeckIndex() {
  const [active, setActive] = useState('major');
  const group = useMemo(() => GROUPS.find(item => item.key === active) || GROUPS[0], [active]);

  return <section className="panel deck-safe-index">
    <div className="section-kicker">Complete 78 · safe index</div>
    <h2>Shadow Deck</h2>
    <p className="muted">Browse the complete deck without loading card artwork. This tab now stays inside The Fold instead of navigating away from the app.</p>

    <div className="deck-safe-tabs" role="tablist" aria-label="Shadow Deck sections">
      {GROUPS.map(item => <button
        key={item.key}
        type="button"
        role="tab"
        aria-selected={active === item.key}
        className={active === item.key ? 'active' : ''}
        onClick={() => setActive(item.key)}
      >{item.label}<small>{item.cards.length}</small></button>)}
    </div>

    <div className="deck-safe-list" aria-live="polite">
      <div className="deck-safe-head"><strong>{group.label}</strong><span>{group.cards.length} cards</span></div>
      {group.cards.map((name, index) => <div className="deck-safe-row" key={name}><span>{String(index + 1).padStart(2,'0')}</span><b>{name}</b></div>)}
    </div>

    <div className="deck-safe-note">Artwork is intentionally not mounted on this tab while we isolate the iPhone WebKit crash. The full 78-card deck remains intact.</div>
  </section>;
}
