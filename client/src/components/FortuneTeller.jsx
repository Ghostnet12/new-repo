import {useEffect,useRef,useState} from 'react';
import {createFortuneDeck,fortuneDate} from '../lib/fortunes.js';
import {createFortuneImage} from '../lib/fortuneCard.js';
import NavIcon from './NavIcon.jsx';
import './FortuneTeller.css';

export default function FortuneTeller() {
 const deck=useRef(null);
 if(!deck.current)deck.current=createFortuneDeck();
 const timer=useRef(null),ticketRef=useRef(null);
 const [busy,setBusy]=useState(false),[fortune,setFortune]=useState(null);
 const [image,setImage]=useState(null),[imageError,setImageError]=useState(false),[attempt,setAttempt]=useState(0);
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 useEffect(()=>{
  if(!fortune)return;
  let cancelled=false,url;
  setImage(null);setImageError(false);
  createFortuneImage(fortune).then(blob=>{
   if(cancelled)return;
   url=URL.createObjectURL(blob);setImage({url,id:fortune.id});
  }).catch(()=>{if(!cancelled)setImageError(true);});
  return ()=>{cancelled=true;if(url)URL.revokeObjectURL(url);};
 },[fortune,attempt]);
 useEffect(()=>{
  if(!fortune)return;
  ticketRef.current?.focus({preventScroll:true});
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  ticketRef.current?.scrollIntoView({behavior:reduced?'auto':'smooth',block:'nearest'});
 },[fortune]);
 const reveal=()=>{
  if(timer.current!==null)return;
  setBusy(true);setFortune(null);setImage(null);setImageError(false);
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  timer.current=setTimeout(()=>{
   setFortune(deck.current());setBusy(false);timer.current=null;
  },reduced?0:1800);
 };

 return <section className="fortune-teller" aria-labelledby="fortune-title">
  <header className="fortune-heading"><p className="fortune-eyebrow">Step closer. A card is waiting.</p><h1 id="fortune-title">The Fortune Teller</h1><p>Hold a wish in mind. Let the teller choose your card.</p></header>
  <div className="fortune-stage">
   <div className={`fortune-cabinet ${busy?'is-revealing':''}`}>
    <div className="fortune-portrait"><img src="/assets/the-fold/fortune-teller.webp" width="1024" height="1536" alt="An antique mechanical fortune teller with a glowing violet crystal ball, framed in gold and velvet" fetchPriority="high"/></div>
    <div className="fortune-console"><span className="fortune-console-label">THE FOLD · FORTUNE HOUSE</span><button type="button" className="fortune-reveal" onClick={reveal} disabled={busy}><NavIcon name="fortune"/>{busy?'Your fortune is unfolding…':fortune?'Reveal another fortune':'Reveal my fortune'}</button><p>One wish. One card. No coin required.</p></div>
   </div>
   <div className="fortune-delivery" aria-busy={busy}>
    <div className="fortune-slot" aria-hidden="true"/>
    <p className="fortune-status" role="status" aria-live="polite">{busy?'The teller is choosing your card…':fortune?'Your fortune is ready.':'Your card will arrive here.'}</p>
    {fortune?<>
     <article className="fortune-ticket" key={fortune.issuedAt} ref={ticketRef} tabIndex="-1" aria-labelledby="fortune-card-title">
      <div className="fortune-ticket-brand">THE FOLD</div><p className="fortune-ticket-label">A fortune for you</p>
      <h2 id="fortune-card-title">{fortune.title}</h2><p className="fortune-message">{fortune.message}</p><p className="fortune-whisper">{fortune.whisper}</p>
      <div className="fortune-lucky"><span>Your lucky number</span><strong>{String(fortune.luckyNumber).padStart(2,'0')}</strong></div>
      <time dateTime={fortune.issuedAt}>{fortuneDate(fortune.issuedAt)}</time><small>enterthefold.io</small>
     </article>
     <div className="fortune-keep">
      {image?.id===fortune.id?<a href={image.url} download={`the-fold-fortune-${fortune.id}.png`}><NavIcon name="download"/>Save my fortune card</a>:imageError?<><p>The image couldn’t be prepared.</p><button type="button" onClick={()=>setAttempt(value=>value+1)}>Try saving again</button></>:<p role="status">Preparing your keepsake…</p>}
     </div>
    </>:<div className="fortune-awaiting" aria-hidden="true"><NavIcon name="fortune"/><p>{busy?'A whisper takes shape.':'Some messages find you.'}</p><span>{busy?'Your card is on its way.':'Press the gold button to receive yours.'}</span></div>}
    <p className="fortune-footnote">A little theatre for reflection and fun.<br/>Your future is yours.</p>
   </div>
  </div>
 </section>;
}
