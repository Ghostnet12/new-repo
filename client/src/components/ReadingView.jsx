import NatalChart from './NatalChart.jsx';
import { PersonalLayers } from './KnowledgeGuide.jsx';
import { useEffect, useState } from 'react';
import TarotCard from './TarotCard.jsx';
import MoonDivider from './MoonDivider.jsx';
import NavIcon from './NavIcon.jsx';

export default function ReadingView({ reading }) {
  const [revealed, setRevealed] = useState([]);
  const [batchReveal, setBatchReveal] = useState(false);

  useEffect(() => {
    setRevealed(reading ? reading.cards.map(() => false) : []);
    setBatchReveal(false);
  }, [reading?.readingId]);

  if (!reading) return null;
  const revealedCount = revealed.filter(Boolean).length;
  const all = revealedCount === reading.cards.length;
  const single = reading.cards.length === 1;
  const revealAll = () => {
    setBatchReveal(true);
    setRevealed(reading.cards.map(() => true));
  };
  const revealOne = index => {
    setBatchReveal(false);
    setRevealed(r => r.map((v, idx) => idx === index ? true : v));
  };
  const persistence = reading.persisted ? 'Saved to Past Readings' : reading.localSaved ? 'Saved on this device' : 'This reading is not saved';
  const personal = reading.personalization || {};
  const personalDetails = [
    personal.birthCard?.name && ['Birth card', personal.birthCard.name],
    personal.zodiac && [personal.zodiacApproximate ? 'Sun sign · approximate' : 'Sun sign', personal.zodiac],
    personal.lifePath != null && ['Life path', personal.lifePath]
  ].filter(Boolean);

  return <section className="reading-stack" aria-labelledby="reading-result-title">
    <div className="panel reading-head">
      <div className="reading-heading">
        <div className="section-kicker">The veil opens</div>
        <h2 id="reading-result-title">{reading.spread.name}</h2>
        <p className="reading-byline">{reading.profile?.name ? `A reading for ${reading.profile.name}` : 'Your moment of reflection'}<span aria-hidden="true"> · </span>{reading.cards.length} {reading.cards.length===1?'card':'cards'} from the Shadow Deck</p>
        {reading.question && <blockquote className="reading-question">“{reading.question}”</blockquote>}
        <p className="reading-saved"><NavIcon name={reading.persisted || reading.localSaved ? 'check' : 'history'} />{persistence}</p>
      </div>
      {personalDetails.length > 0 && <dl className="reading-symbols">{personalDetails.map(([label, detail]) => <div key={label}><dt>{label}</dt><dd>{detail}</dd></div>)}</dl>}
    </div>
    <div className="reading-actions reveal-toolbar">
      <div><h3>{all ? (single ? 'Your card is open.' : 'The whole spread is open.') : 'Take a breath. Turn a card.'}</h3><p id="reveal-hint">{single ? (all ? 'Your interpretation follows the card below.' : 'Turn your card when you are ready.') : (all ? 'Your interpretation follows the cards below.' : 'Reveal each card at your own pace, or open the whole spread.')}</p></div>
      <div className="reveal-controls"><span className="reveal-progress" role="status" aria-live="polite" aria-atomic="true">{revealedCount} of {reading.cards.length} revealed</span><button type="button" onClick={revealAll} disabled={all} aria-describedby="reveal-hint"><NavIcon name={all ? 'check' : 'eye'} />{single ? (all ? 'Card revealed' : 'Reveal card') : (all ? 'All cards revealed' : 'Reveal all cards')}</button></div>
    </div>
    <div className={`spread-grid cards-${reading.cards.length} spread-stage`}>
      {reading.cards.map((entry, i) => <TarotCard key={`${reading.readingId}-${i}`} card={entry.card} position={entry.position} reversed={entry.reversed} revealed={!!revealed[i]} revealDelay={batchReveal ? Math.min(i, 9) * 75 : 0} onReveal={() => revealOne(i)} />)}
    </div>
    {all && <><MoonDivider compact /><Summary analysis={reading.analysis} personal={personal} /></>}
  </section>;
}

function Summary({ analysis, personal }) {
  return <div className="panel summary-panel summary-reveal">
    <div className="section-kicker">Beyond the individual cards</div><h2>What your spread is showing</h2>
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
