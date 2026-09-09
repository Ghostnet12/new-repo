import {useEffect,useRef,useState} from 'react';
import {getDeviceFortuneDeck,fortuneDate} from '../lib/fortunes.js';
import {createFortuneImage} from '../lib/fortuneCard.js';
import {beginFortuneReveal,fortuneRevealSteps,fortuneRevealDuration} from '../lib/fortuneReveal.js';
import NavIcon from './NavIcon.jsx';
import FortuneKeepsake from './FortuneKeepsake.jsx';
import './FortuneTeller.css';

export default function FortuneTeller() {
 const deck=useRef(null);
 if(!deck.current)deck.current=getDeviceFortuneDeck();
 const cancelReveal=useRef(null),drawing=useRef(false),ticketRef=useRef(null);
 const [busy,setBusy]=useState(false),[fortune,setFortune]=useState(null);
 const [revealStep,setRevealStep]=useState(0);
 const [image,setImage]=useState(null),[imageError,setImageError]=useState(false),[attempt,setAttempt]=useState(0);
 const imageReady=Boolean(fortune&&image?.id===fortune.id);
 useEffect(()=>()=>cancelReveal.current?.(),[]);
 useEffect(()=>{
  if(!fortune)return;
  let cancelled=false,url;
  setImage(null);setImageError(false);
  createFortuneImage(fortune).then(blob=>{
   if(cancelled)return;
   const filename=`the-fold-fortune-${fortune.id}.png`;
   const file=typeof File==='function'?new File([blob],filename,{type:'image/png'}):null;
   url=URL.createObjectURL(blob);setImage({url,file,filename,id:fortune.id});
  }).catch(()=>{if(!cancelled)setImageError(true);});
  return ()=>{cancelled=true;if(url)URL.revokeObjectURL(url);};
 },[fortune,attempt]);
 useEffect(()=>{
  if(!fortune||(!imageReady&&!imageError))return;
  ticketRef.current?.focus({preventScroll:true});
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  ticketRef.current?.scrollIntoView({behavior:reduced?'auto':'smooth',block:'nearest'});
 },[fortune,imageReady,imageError]);
 const reveal=()=>{
  if(drawing.current)return;
  drawing.current=true;
  setBusy(true);setFortune(null);setImage(null);setImageError(false);
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  cancelReveal.current?.();
  cancelReveal.current=beginFortuneReveal({
   reducedMotion:reduced,onStep:setRevealStep,
   onReady:()=>{setFortune(deck.current());setBusy(false);drawing.current=false;}
  });
 };

 return <section className="fortune-teller" aria-labelledby="fortune-title">
  <header className="fortune-heading"><p className="fortune-eyebrow">Step closer. A card is waiting.</p><h1 id="fortune-title">The Fortune Teller</h1><p>Hold a wish in mind. Let the teller choose your card.</p></header>
  <div className="fortune-stage" style={{'--fortune-wait-duration':`${fortuneRevealDuration}ms`}}>
   <div className={`fortune-cabinet ${busy?'is-revealing':''}`}>
    <div className="fortune-portrait"><img src="/assets/the-fold/fortune-teller.webp" width="1024" height="1536" alt="An antique fortune teller with a violet crystal ball, framed in gold and velvet" fetchPriority="high"/><img className="fortune-portrait-awake" src="/assets/the-fold/fortune-teller-awake.webp" width="1024" height="1536" alt="" aria-hidden="true" decoding="async"/></div>
    <div className="fortune-console"><span className="fortune-console-label">THE FOLD · FORTUNE HOUSE</span><button type="button" className="fortune-reveal" onClick={reveal} disabled={busy}><NavIcon name="fortune"/>{busy?'Your fortune is unfolding…':fortune?'Reveal another fortune':'Reveal my fortune'}</button><div className={`fortune-progress ${busy?'is-running':''}`} aria-hidden="true"><i/></div><p role="status" aria-live="polite">{busy?fortuneRevealSteps[revealStep].message:'One wish. One card. No coin required.'}</p></div>
   </div>
   <div className={`fortune-delivery ${busy?'is-revealing':''}`}>
    <div className="fortune-slot" aria-hidden="true"/>
    <p className="fortune-status" role="status" aria-live="polite">{busy?'A message is on its way…':fortune?imageReady||imageError?'Your fortune is ready.':'Finishing your card…':'Your card will arrive here.'}</p>
    {fortune?<>
     <article className={`fortune-ticket ${imageError?'is-fallback':''}`} key={fortune.issuedAt} ref={ticketRef} tabIndex="-1" aria-labelledby="fortune-card-title" aria-busy={!imageReady&&!imageError}>
      {imageReady?<img className="fortune-ticket-image" src={image.url} width="1000" height="1500" alt=""/>:!imageError?<div className="fortune-ticket-loading" aria-hidden="true"><NavIcon name="fortune"/><p>Preparing your keepsake…</p></div>:null}
      <div className={imageError?'fortune-ticket-copy':'fortune-ticket-copy sr-only'}>
       <div className="fortune-ticket-brand">THE FOLD</div><p className="fortune-ticket-label">A fortune for you</p>
       <h2 id="fortune-card-title">{fortune.title}</h2><p className="fortune-message">{fortune.message}</p><p className="fortune-whisper">{fortune.whisper}</p>
       <div className="fortune-lucky"><span>Your lucky number</span><strong>{String(fortune.luckyNumber).padStart(2,'0')}</strong></div>
       <time dateTime={fortune.issuedAt}>{fortuneDate(fortune.issuedAt)}</time><small>enterthefold.io</small>
      </div>
     </article>
     {imageReady?<FortuneKeepsake key={image.url} image={image} fortune={fortune}/>:imageError?<div className="fortune-keep"><p>The card image couldn’t be prepared.</p><button type="button" onClick={()=>setAttempt(value=>value+1)}>Try preparing the card again</button></div>:null}
    </>:<div className={`fortune-awaiting ${busy?'is-busy':''}`} aria-hidden="true"><NavIcon name="fortune"/><p>{busy?fortuneRevealSteps[revealStep].message:'Some messages find you.'}</p><span>{busy?'A little patience. A little possibility.':'Press the gold button to receive yours.'}</span></div>}
    <p className="fortune-footnote">A little theatre for reflection and fun.<br/>Your future is yours.</p>
   </div>
  </div>
 </section>;
}
