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

export default function TarotCard({ card, position, reversed, revealed, onReveal, compact = false, revealDelay = 0 }) {
  const assets = cardAssets(card, compact);
  const revealStyle = { '--reveal-delay': `${Math.max(0, Number(revealDelay) || 0)}ms` };

  if (!revealed) {
    return <button type="button" className={`tarot-card hidden-card fold-card-back ${compact ? 'compact' : ''}`} onClick={onReveal} aria-label={`Reveal ${position || 'tarot card'}`}>
      <div className="card-art card-back">
        <span className="back-frame" aria-hidden="true" />
        <span className="back-corner back-corner-a" aria-hidden="true">✦</span>
        <span className="back-corner back-corner-b" aria-hidden="true">✦</span>
        <span className="back-corner back-corner-c" aria-hidden="true">✦</span>
        <span className="back-corner back-corner-d" aria-hidden="true">✦</span>
        <span className="back-moon back-moon-top" aria-hidden="true">☾</span>
        <span className="back-moon back-moon-bottom" aria-hidden="true">☽</span>
        <span className="back-eye" aria-hidden="true"><span className="back-eye-iris"><span className="back-eye-pupil" /></span></span>
        <span className="back-brand" aria-hidden="true">THE FOLD</span>
        <span className="back-reveal">REVEAL</span>
      </div>
      {position && <div className="card-copy"><small>{position}</small><strong>Hidden Card</strong></div>}
    </button>;
  }

  return <article className={`tarot-card revealed-card ${reversed ? 'is-reversed' : ''} ${compact ? 'compact' : ''}`} style={revealStyle}>
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
