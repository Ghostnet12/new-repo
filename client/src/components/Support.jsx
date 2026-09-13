import NavIcon from './NavIcon.jsx';
import { donationLink } from '../../../shared/donations.js';
import './Support.css';

export default function Support({onReviews}) {
 const checkout = donationLink();
 return <section className="panel fold-support" aria-labelledby="support-title">
  <div className="support-emblem"><NavIcon name="support"/></div>
  <div className="section-kicker">Support The Fold</div>
  <h2 id="support-title">Keep the magic growing.</h2>
  <p>The Fold is an independent creative project by David Northrop, free for everyone to explore. Our free experiences are staying free; limited-edition collector cards are an optional purchase. Every card, every melody and every detail is part of a space built for a little reflection.</p>
  <p>Optional donations help cover the monthly server and hosting costs that keep The Fold running, along with the AI usage costs behind our dream reflections and daily horoscopes. Those features bring a little more depth, personality and entertainment to your visit, with responses written in The Fold’s own voice.</p>
  <p>If you enjoy spending time here and would like to contribute, your support helps keep the magic available to everyone. Donations are always optional. You’re just as welcome here either way.</p>
  <div className="support-donation" aria-labelledby="donation-title">
   <h3 id="donation-title">A little support. A little more magic.</h3>
   {checkout ? <>
    <p>Choose the amount that feels right for you on Stripe’s secure payment page. This is a one-time donation, with no subscription or automatic renewal.</p>
    <a className="donation-button" href={checkout}>Donate your chosen amount <NavIcon name="arrow"/></a>
    <p className="donation-help">Choose your amount, review it, then confirm your payment. Stripe will show a thank-you message when you finish.</p>
   </> : <p>Online donations are being connected. Thank you for wanting to support The Fold. In the meantime, sharing the site or leaving a review helps us grow.</p>}
  </div>
  <h3>Your words matter, too.</h3>
  <p>Sharing The Fold with a friend or leaving an honest review is a meaningful way to help it grow today.</p>
  <button type="button" className="secondary-button" onClick={onReviews}>Leave a review <NavIcon name="arrow"/></button>
  <small>With gratitude, David · Creator of The Fold</small>
 </section>;
}
