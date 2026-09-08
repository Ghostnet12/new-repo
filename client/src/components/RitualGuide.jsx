import NavIcon from './NavIcon.jsx';

const steps = [
  ['Name the tension.', 'A choice, a connection, a feeling you can’t quite shake.'],
  ['Choose your lens.', 'A quick reflection or a deeper look. Let your question guide the spread.'],
  ['Stay curious.', 'Look for patterns and possibilities. Your choices are still yours.'],
  ['Turn the cards.', 'Take what resonates. Give the rest a little time.']
];

export default function RitualGuide({ onDeck }) {
  return <aside className="panel ritual-panel" aria-labelledby="ritual-title">
    <div className="section-kicker">Before the draw</div>
    <h2 id="ritual-title">A little stillness.<br/><em>A different perspective.</em></h2>
    <p className="ritual-intro">You don’t need the perfect question. Just a moment to listen to the one you already have.</p>
    <ol className="ritual-steps">{steps.map(([title, text], index) => <li key={title}><span aria-hidden="true">0{index + 1}</span><div><b>{title}</b><small>{text}</small></div></li>)}</ol>
    <blockquote className="ritual-note">Ask about the pattern —<br/><em>not the verdict.</em></blockquote>
    <div className="ritual-deck-preview">
      <img className="ritual-deck-art" src="/assets/the-fold/deck-preview.png" alt="The Shadow Deck: black tarot cards with gold celestial artwork on violet velvet" loading="lazy" width="1536" height="1024" />
      <img className="ritual-crystal-ball" src="/assets/the-fold/crystal-ball.jpeg" alt="Violet all-seeing-eye crystal ball on an ornate gold stand" loading="lazy" width="1254" height="1254" />
    </div>
    <div className="ritual-deck-caption"><span><small>THE SHADOW DECK</small><b>Seventy-eight ways to look deeper.</b></span><button type="button" onClick={onDeck} aria-label="Explore the full Shadow Deck"><NavIcon name="arrow" /></button></div>
  </aside>;
}
