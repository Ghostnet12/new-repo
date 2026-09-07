function cardAssets(card) {
  const id = Number(card?.id);
  if (!Number.isInteger(id) || id < 0 || id > 77) return null;

  const stem = String(id).padStart(2, '0');
  const base = `${import.meta.env.BASE_URL}assets/cards/`;
  const original = `${base}${stem}.webp`;
  return {
    original,
    src: import.meta.env.PROD ? `${base}web/${stem}.webp` : original,
    srcSet: import.meta.env.PROD
      ? `${base}thumb/${stem}.webp 360w, ${base}web/${stem}.webp 900w`
      : undefined
  };
}

export default function TarotCard({ card, position, reversed, revealed, onReveal, compact = false, revealDelay = 0 }) {
  const assets = cardAssets(card);
  const revealStyle = { '--reveal-delay': `${Math.max(0, Number(revealDelay) || 0)}ms` };

  if (!revealed) {
    return <button type="button" className={`tarot-card hidden-card fold-card-back ${compact ? 'compact' : ''}`} onClick={onReveal} aria-label={`Reveal ${position || 'tarot card'}`}>
      <div className="card-art card-back">
        <span className="back-reveal">REVEAL CARD</span>
      </div>
      {position && <div className="card-copy"><small>{position}</small><strong>Hidden Card</strong></div>}
    </button>;
  }

  return <article className={`tarot-card revealed-card ${reversed ? 'is-reversed' : ''} ${compact ? 'compact' : ''}`} style={revealStyle}>
    <div className="card-art">
      {assets && <img
        key={card.id}
        src={assets.src}
        srcSet={assets.srcSet}
        sizes={compact ? '(max-width: 620px) 33vw, (max-width: 900px) 25vw, 190px' : '(max-width: 620px) 50vw, (max-width: 900px) 33vw, 380px'}
        alt={card.name}
        loading={compact ? 'lazy' : 'eager'}
        decoding="async"
        fetchPriority={compact ? 'low' : 'high'}
        width="360"
        height="540"
        onError={(event) => {
          const image = event.currentTarget;
          if (image.getAttribute('src') === assets.original) return;
          image.removeAttribute('srcset');
          image.setAttribute('src', assets.original);
        }}
      />}
      <span className="revealed-glint" aria-hidden="true" />
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
