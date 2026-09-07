import NatalChart from './NatalChart.jsx';
import { PersonalLayers } from './KnowledgeGuide.jsx';
import { useEffect, useState } from 'react';
import TarotCard from './TarotCard.jsx';
import MoonDivider from './MoonDivider.jsx';

export default function ReadingView({ reading }) {
  const [revealed, setRevealed] = useState([]);
  const [batchReveal, setBatchReveal] = useState(false);

  useEffect(() => {
    setRevealed(reading ? reading.cards.map(() => false) : []);
    setBatchReveal(false);
  }, [reading?.readingId]);

  if (!reading) return null;
  const all = revealed.length && revealed.every(Boolean);
  const revealAll = () => {
    setBatchReveal(true);
    setRevealed(reading.cards.map(() => true));
  };
  const revealOne = index => {
    setBatchReveal(false);
    setRevealed(r => r.map((v, idx) => idx === index ? true : v));
  };
  const persistence = reading.persisted ? 'Cloud memory' : reading.localSaved ? 'Device memory' : 'Not kept';
  const oraclePath = reading.localFallback ? 'Device oracle' : 'Oracle online';

  return <section className="reading-stack">
    <div className="panel reading-head">
      <div><div className="section-kicker">The veil opens</div><h2>{reading.profile?.name || 'Seeker'} · {reading.spread.name}</h2><p className="muted">{reading.question ? `“${reading.question}” — ` : ''}This draw uses the complete 78-card Shadow Deck. {oraclePath}.</p></div>
      <div className="stat-grid">
        <div><small>Birth card</small><b>{reading.personalization.birthCard?.name || 'Not provided'}</b></div>
        <div><small>{reading.personalization.zodiacApproximate?'Sun sign · approximate':'Sun sign'}</small><b>{reading.personalization.zodiac || 'Not provided'}</b></div>
        <div><small>Life path</small><b>{reading.personalization.lifePath ?? '—'}</b></div>
        <div><small>Memory</small><b>{persistence}</b></div>
      </div>
    </div>
    <MoonDivider compact />
    <div className="reading-actions"><button onClick={revealAll}>☾ Lift Every Veil ☽</button></div>
    <div className={`spread-grid cards-${reading.cards.length} spread-stage`}>
      {reading.cards.map((entry, i) => <TarotCard key={`${reading.readingId}-${i}`} card={entry.card} position={entry.position} reversed={entry.reversed} revealed={!!revealed[i]} revealDelay={batchReveal ? Math.min(i, 9) * 75 : 0} onReveal={() => revealOne(i)} />)}
    </div>
    {all && <><MoonDivider compact /><Summary analysis={reading.analysis} personal={reading.personalization} /></>}
  </section>;
}

function Summary({ analysis, personal }) {
  return <div className="panel summary-panel summary-reveal">
    <div className="section-kicker">The whole spread speaking together</div><h2>What the Spread Is Showing</h2>
    <div className="reading-takeaway"><h3>Your reading in plain English</h3><p>{analysis.takeaway || analysis.core}</p></div>
    <p className="core-reading">{analysis.core}</p>
    {analysis.story?.length>0&&<div className="reading-story"><h3>The story your cards tell</h3>{analysis.story.map(item=><article key={item.title}><h4>{item.title}</h4><p>{item.text}</p></article>)}</div>}
    {analysis.application&&<div className="reading-application"><h3>What this could look like in your life</h3><p>{analysis.application}</p></div>}
    {analysis.actionPlan?.length>0&&<div className="reading-action-plan"><h3>Leave with a clear next step</h3><ol>{analysis.actionPlan.map(item=><li key={item.title}><h4>{item.title}</h4><p>{item.text}</p></li>)}</ol></div>}
    {analysis.cardNotes?.length > 0 && <div className="position-readings"><h3>Your cards, one at a time</h3>{analysis.cardNotes.map(item=><article className="knowledge-card" key={item.title}><h3>{item.title}</h3><p>{item.text}</p>{item.positionMeaning&&<p>{item.positionMeaning}</p>}{item.relevance&&<p>{item.relevance}</p>}{item.orientation&&<small>{item.orientation}</small>}<p><b>A practical reflection:</b> {item.practice}</p></article>)}</div>}
    {analysis.connections?.length > 0 && <><h3>How your personal details connect</h3><div className="knowledge-grid">{analysis.connections.map(item=><Info key={item.title} title={item.title} text={item.text}/>)}</div></>}
    <details className="personal-guide"><summary>Your symbolism & calculations</summary><PersonalLayers personal={personal}/></details>
    {personal?.natal?.status==='ready'&&<details className="personal-guide"><summary>Your full natal chart & meanings</summary><NatalChart chart={personal.natal}/></details>}
    <details className="personal-guide"><summary>More about the spread’s patterns</summary><div className="summary-grid">
      <Info title="The main theme" text={analysis.dominant} /><Info title="Repeated pattern" text={analysis.repetition} /><Info title="The shape of this draw" text={analysis.weight} /><Info title="Something to watch" text={analysis.shadow} /><Info title="What to do next" text={analysis.nextMove} /><Info title="If nothing changes" text={analysis.unchanged} />
    </div>
    </details><div className="trajectory"><h3>A possible way forward</h3><p>{analysis.trajectory}</p></div>
    <div className="final-direction"><small>Final direction</small><p>{analysis.finalMessage}</p></div>
    <p className="reality-check">{analysis.realityCheck}</p>
  </div>;
}
function Info({ title, text }) { return <div className="info-box"><h3>{title}</h3><p>{text}</p></div>; }
