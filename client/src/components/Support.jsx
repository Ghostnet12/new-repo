import NavIcon from './NavIcon.jsx';
import './Support.css';

export default function Support({onReviews}) {
 return <section className="panel fold-support" aria-labelledby="support-title">
  <div className="support-emblem"><NavIcon name="support"/></div>
  <div className="section-kicker">Support The Fold</div>
  <h2 id="support-title">Keep the magic growing.</h2>
  <p>The Fold is an independent creative project by David Northrop. Every card, every melody and every detail is part of a space built for a little reflection.</p>
  <p>Your support helps sustain the artwork, music and development that bring this world to life.</p>
  <div className="support-coming"><span>Financial support · Coming soon</span><p>A way to contribute is on its way. Thank you for wanting to be part of what comes next.</p></div>
  <h3>Your words matter, too.</h3>
  <p>Sharing The Fold with a friend or leaving an honest review is a meaningful way to help it grow today.</p>
  <button type="button" className="secondary-button" onClick={onReviews}>Leave a review <NavIcon name="arrow"/></button>
  <small>With gratitude, David · Creator of The Fold</small>
 </section>;
}
