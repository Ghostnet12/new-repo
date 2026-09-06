function cardAssetUrl(card) {
  const id = Number(card?.id);
  if (!Number.isInteger(id) || id < 0 || id > 77) return null;
  return `/assets/cards/${String(id).padStart(2, '0')}.webp`;
}

export default function TarotCard({ card, position, reversed, revealed, onReveal, compact = false }) {
  const src = cardAssetUrl(card);

  if (!revealed) {
    return <button type="button" className={`tarot-card hidden-card ${compact ? 'compact' : ''}`} onClick={onReveal}>
      <div className="card-art card-back"><span>REVEAL</span></div>
      {position && <div className="card-copy"><small>{position}</small><strong>Hidden Card</strong></div>}
    </button>;
  }

  return <article className={`tarot-card ${reversed ? 'is-reversed' : ''} ${compact ? 'compact' : ''}`}>
    <div className="card-art">
      {src && <img src={src} alt={card.name} loading={compact ? 'lazy' : 'eager'} decoding="async" />}
    </div>
    {!compact && <div className="card-copy">
      {position && <small>{position}</small>}
      <strong>{card.name}</strong>
      <div className="tags"><span>{reversed ? 'Reversed' : 'Upright'}</span><span>{card.type === 'major' ? 'Major' : card.suitName}</span><span>{card.element}</span></div>
      <p>{reversed ? card.reversed : card.upright}</p>
      <p className="direction-line">{card.advice}</p>
    </div>}
  </article>;
}
