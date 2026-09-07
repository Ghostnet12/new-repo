import { useEffect, useState } from 'react';
import TarotCard from './TarotCard.jsx';

export default function ReadingView({ reading }) {
  const [revealed, setRevealed] = useState([]);
  useEffect(() => setRevealed(reading ? reading.cards.map(() => false) : []), [reading?.readingId]);
  if (!reading) return null;
  const all = revealed.length && revealed.every(Boolean);
  const revealAll = () => setRevealed(reading.cards.map(() => true));
  const persistence = reading.persisted ? 'Cloud memory' : reading.localSaved ? 'Device memory' : 'Not kept';
  const oraclePath = reading.localFallback ? 'Device oracle' : 'Oracle online';
  return <section className="reading-stack">
    <div className="panel reading-head">
      <div><div className="section-kicker">The veil opens</div><h2>{reading.profile?.name || 'Seeker'} · {reading.spread.name}</h2><p className="muted">{reading.question ? `“${reading.question}” — ` : ''}This draw uses the complete 78-card Shadow Deck. {oraclePath}.</p></div>
      <div className="stat-grid">
        <div><small>Birth card</small><b>{reading.personalization.birthCard?.name || 'Not provided'}</b></div>
        <div><small>Sun sign</small><b>{reading.personalization.zodiac || 'Not provided'}</b></div>
        <div><small>Life path</small><b>{reading.personalization.lifePath ?? '—'}</b></div>
        <div><small>Memory</small><b>{persistence}</b></div>
      </div>
    </div>
    <div className="reading-actions"><button onClick={revealAll}>Lift Every Veil</button></div>
    <div className={`spread-grid cards-${reading.cards.length}`}>
      {reading.cards.map((entry, i) => <TarotCard key={`${reading.readingId}-${i}`} card={entry.card} position={entry.position} reversed={entry.reversed} revealed={!!revealed[i]} onReveal={() => setRevealed(r => r.map((v, idx) => idx === i ? true : v))} />)}
    </div>
    {all && <Summary analysis={reading.analysis} />}
  </section>;
}

function Summary({ analysis }) {
  return <div className="panel summary-panel">
    <div className="section-kicker">The whole spread speaking together</div><h2>What the Spread Is Showing</h2>
    <p className="core-reading">{analysis.core}</p>
    <div className="summary-grid">
      <Info title="Dominant current" text={analysis.dominant} /><Info title="Repeated pattern" text={analysis.repetition} /><Info title="Court / Major weight" text={analysis.weight} /><Info title="Shadow pressure" text={analysis.shadow} /><Info title="What to do next" text={analysis.nextMove} /><Info title="If nothing changes" text={analysis.unchanged} />
    </div>
    <div className="trajectory"><h3>Conditional direction</h3><p>{analysis.trajectory}</p></div>
    <div className="final-direction"><small>Final direction</small><p>{analysis.finalMessage}</p></div>
    <p className="reality-check">{analysis.realityCheck}</p>
  </div>;
}
function Info({ title, text }) { return <div className="info-box"><h3>{title}</h3><p>{text}</p></div>; }
