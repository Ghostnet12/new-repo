function cardAssets(card, compact) {
  const id = Number(card?.id);
  if (!Number.isInteger(id) || id < 0 || id > 77) return null;

  const stem = String(id).padStart(2, '0');
  const original = `/assets/cards/${stem}.webp`;

  if (!import.meta.env.PROD) {
    return { src: original, srcSet: undefined, sizes: undefined };
  }

  const thumb = `/assets/cards/thumb/${stem}.webp`;
  const web = `/assets/cards/web/${stem}.webp`;

  if (compact) {
    return { src: thumb, srcSet: undefined, sizes: undefined };
  }

  return {
    src: web,
    srcSet: `${thumb} 360w, ${web} 900w`,
    sizes: '(max-width: 620px) 46vw, (max-width: 900px) 30vw, 20vw'
  };
}

export default function TarotCard({ card, position, reversed, revealed, onReveal, compact = false, imageOnly = false }) {
  const assets = cardAssets(card, compact);

  if (!revealed) {
    return <button type="button" className={`tarot-card hidden-card ${compact ? 'compact' : ''}`} onClick={onReveal}>
      <div className="card-art card-back"><span>REVEAL</span></div>
      {position && <div className="card-copy"><small>{position}</small><strong>Hidden Card</strong></div>}
    </button>;
  }

  return <article className={`tarot-card ${reversed ? 'is-reversed' : ''} ${compact ? 'compact' : ''} ${imageOnly ? 'image-only' : ''}`}>
    <div className="card-art">
      {assets && <img
        src={assets.src}
        srcSet={assets.srcSet}
        sizes={assets.sizes}
        alt={card.name}
        loading={compact ? 'lazy' : 'eager'}
        decoding="async"
        fetchPriority={compact ? 'low' : 'auto'}
        width="360"
        height="540"
      />}
    </div>
    {!compact && !imageOnly && <div className="card-copy">
      {position && <small>{position}</small>}
      <strong>{card.name}</strong>
      <div className="tags"><span>{reversed ? 'Reversed' : 'Upright'}</span><span>{card.type === 'major' ? 'Major' : card.suitName}</span><span>{card.element}</span></div>
      <p>{reversed ? card.reversed : card.upright}</p>
      <p className="direction-line">{card.advice}</p>
    </div>}
  </article>;
}
