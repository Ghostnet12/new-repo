import { useMemo, useState } from 'react';
import TarotCard from './TarotCard.jsx';
import { localDeck } from '../lib/localFallback.js';

const GROUPS = [
  { key:'major', label:'Major Arcana', cards:localDeck.filter(card => card.type === 'major') },
  { key:'wands', label:'Wands', cards:localDeck.filter(card => card.suit === 'wands') },
  { key:'cups', label:'Cups', cards:localDeck.filter(card => card.suit === 'cups') },
  { key:'swords', label:'Swords', cards:localDeck.filter(card => card.suit === 'swords') },
  { key:'pentacles', label:'Pentacles', cards:localDeck.filter(card => card.suit === 'pentacles') },
  { key:'all', label:'All 78', cards:localDeck }
];

export default function FullDeckV2() {
  const [groupKey, setGroupKey] = useState('major');
  const [selectedId, setSelectedId] = useState(() => GROUPS[0].cards[0]?.id ?? 0);
  const [openId, setOpenId] = useState(null);

  const group = useMemo(() => GROUPS.find(item => item.key === groupKey) || GROUPS[0], [groupKey]);
  const selectedCard = useMemo(() => group.cards.find(card => card.id === Number(selectedId)) || group.cards[0], [group, selectedId]);
  const openCard = useMemo(() => openId == null ? null : group.cards.find(card => card.id === openId) || null, [group, openId]);

  const chooseGroup = (key) => {
    const next = GROUPS.find(item => item.key === key) || GROUPS[0];
    setGroupKey(next.key);
    setSelectedId(next.cards[0]?.id ?? 0);
    setOpenId(null);
  };

  const move = (delta) => {
    if (!openCard) return;
    const index = group.cards.findIndex(card => card.id === openCard.id);
    if (index < 0) return;
    const nextIndex = Math.min(group.cards.length - 1, Math.max(0, index + delta));
    const next = group.cards[nextIndex];
    if (!next) return;
    setSelectedId(next.id);
    setOpenId(next.id);
  };

  return <section className="panel fdv2-shell">
    <div className="section-kicker">Complete 78 · rebuilt clean</div>
    <h2>Full Deck</h2>
    <p className="muted">This is the rebuilt deck browser. Entering this tab mounts no card artwork. Choose a section and card first, then open exactly one image using the same TarotCard renderer that already works in readings.</p>

    <div className="fdv2-groups" role="tablist" aria-label="Full Deck sections">
      {GROUPS.map(item => <button
        key={item.key}
        type="button"
        role="tab"
        aria-selected={groupKey === item.key}
        className={groupKey === item.key ? 'active' : ''}
        onClick={() => chooseGroup(item.key)}
      >{item.label}<small>{item.cards.length}</small></button>)}
    </div>

    <div className="fdv2-picker">
      <label htmlFor="fdv2-card-select">Choose a card</label>
      <select
        id="fdv2-card-select"
        value={selectedCard?.id ?? ''}
        onChange={event => {
          setSelectedId(Number(event.target.value));
          setOpenId(null);
        }}
      >
        {group.cards.map(card => <option key={card.id} value={card.id}>{card.name}</option>)}
      </select>
      <button
        type="button"
        className="primary-button fdv2-open"
        disabled={!selectedCard}
        onClick={() => selectedCard && setOpenId(selectedCard.id)}
      >View Card Artwork</button>
    </div>

    {!openCard && <div className="fdv2-idle">
      <strong>No artwork loaded.</strong>
      <span>The tab stays text-only until you explicitly open a card.</span>
    </div>}

    {openCard && <div className="fdv2-viewer">
      <div className="fdv2-card-stage">
        <TarotCard key={openCard.id} card={openCard} revealed={true} reversed={false} imageOnly={true} />
      </div>
      <div className="fdv2-card-copy">
        <small>{group.label}</small>
        <h3>{openCard.name}</h3>
        <span>Card {String(openCard.id + 1).padStart(2, '0')} of 78</span>
      </div>
      <div className="fdv2-controls">
        <button type="button" onClick={() => move(-1)} disabled={group.cards[0]?.id === openCard.id}>← Previous</button>
        <button type="button" onClick={() => setOpenId(null)}>Hide Artwork</button>
        <button type="button" onClick={() => move(1)} disabled={group.cards[group.cards.length - 1]?.id === openCard.id}>Next →</button>
      </div>
    </div>}

    <div className="fdv2-note">Rebuilt from zero: no old gallery component, no deck-only image renderer, no automatic image mounting, and no page navigation.</div>
  </section>;
}
