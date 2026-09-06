const atlasUrl = import.meta.env.VITE_ATLAS_URL || '/shadow78_atlas.webp';

function atlasPosition(id) {
  if (id < 22) return [id % 11, id < 11 ? 0 : 1];
  const m = id - 22;
  return [m % 14, 2 + Math.floor(m / 14)];
}

export default function TarotCard({ card, position, reversed, revealed, onReveal, compact = false }) {
  const [x, y] = card ? atlasPosition(card.id) : [0, 6];
  const style = { '--x': `${-x * 100 / 14}%`, '--y': `${-y * 100 / 7}%`, '--atlas': `url(${atlasUrl})` };
  if (!revealed) {
    return <button type="button" className={`tarot-card hidden-card ${compact ? 'compact' : ''}`} onClick={onReveal}>
      <div className="card-art card-back" style={{ ...style, '--x': '0%', '--y': `${-6 * 100 / 7}%` }}><span>REVEAL</span></div>
      {position && <div className="card-copy"><small>{position}</small><strong>Hidden Card</strong></div>}
    </button>;
  }
  return <article className={`tarot-card ${reversed ? 'is-reversed' : ''} ${compact ? 'compact' : ''}`}>
    <div className="card-art" style={style} aria-label={card.name} />
    {!compact && <div className="card-copy">
      {position && <small>{position}</small>}
      <strong>{card.name}</strong>
      <div className="tags"><span>{reversed ? 'Reversed' : 'Upright'}</span><span>{card.type === 'major' ? 'Major' : card.suitName}</span><span>{card.element}</span></div>
      <p>{reversed ? card.reversed : card.upright}</p>
      <p className="direction-line">{card.advice}</p>
    </div>}
  </article>;
}
