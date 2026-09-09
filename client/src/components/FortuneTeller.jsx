import {useEffect,useRef,useState} from 'react';
import {getDeviceFortuneDeck,fortuneDate} from '../lib/fortunes.js';
import {createFortuneImage} from '../lib/fortuneCard.js';
import {beginFortuneReveal,fortuneRevealSteps,fortuneRevealDuration} from '../lib/fortuneReveal.js';
import NavIcon from './NavIcon.jsx';
import FortuneKeepsake from './FortuneKeepsake.jsx';
import './FortuneTeller.css';

export default function FortuneTeller() {
 const [yesNo,setYesNo]=useState(false);
 const mode=yesNo?'yesno':'fortune';
 const cancelReveal=useRef(null),drawing=useRef(false),ticketRef=useRef(null);
 const [busy,setBusy]=useState(false),[cardsByMode,setCardsByMode]=useState({fortune:null,yesno:null});
 const fortune=cardsByMode[mode];
 const setFortune=card=>setCardsByMode(current=>({...current,[mode]:card}));
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
   const filename=`the-fold-${fortune.mode==='yesno'?'answer':'fortune'}-${fortune.id}.png`;
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
   onReady:()=>{setFortune(getDeviceFortuneDeck(mode)());setBusy(false);drawing.current=false;}
  });
 };

 return <section className="fortune-teller" aria-labelledby="fortune-title">
  <header className="fortune-heading"><p className="fortune-eyebrow">Step closer. A card is waiting.</p><h1 id="fortune-title">The Fortune Teller</h1><p id="fortune-mode-help">Hold a yes-or-no question in mind. The teller has opinions.</p>
   <button type="button" className="fortune-mode-toggle" role="switch" aria-checked={yesNo} aria-label="Yes or no question mode" aria-describedby="fortune-mode-help" disabled={busy} onClick={()=>{if(!drawing.current)setYesNo(value=>!value);}}><span>Yes / No mode</span><span className={`fortune-mode-switch ${yesNo?'is-on':''}`} aria-hidden="true"><i/></span><span className="fortune-mode-state">{yesNo?'On':'Off'}</span></button>
  </header>
  <div className="fortune-stage" style={{'--fortune-wait-duration':`${fortuneRevealDuration}ms`}}>
   <div className={`fortune-cabinet ${busy?'is-revealing':''}`}>
    <div className="fortune-portrait"><img src="/assets/the-fold/fortune-teller.webp" width="1024" height="1536" alt="An antique fortune teller with a violet crystal ball, framed in gold and velvet" fetchPriority="high"/><img className="fortune-portrait-awake" src="/assets/the-fold/fortune-teller-awake.webp" width="1024" height="1536" alt="" aria-hidden="true" decoding="async"/></div>
    <div className="fortune-console"><span className="fortune-console-label">THE FOLD · {yesNo?'ASK THE TELLER':'FORTUNE HOUSE'}</span><button type="button" className="fortune-reveal" onClick={reveal} disabled={busy}><NavIcon name="fortune"/>{busy?yesNo?'The teller is considering it…':'Your fortune is unfolding…':yesNo?fortune?'Ask another question':'Reveal my answer':fortune?'Reveal another fortune':'Reveal my fortune'}</button><div className={`fortune-progress ${busy?'is-running':''}`} aria-hidden="true"><i/></div><p role="status" aria-live="polite">{busy?(yesNo?['The teller awakens…','A verdict, with a little attitude…','Your answer is taking shape…'][revealStep]:fortuneRevealSteps[revealStep].message):yesNo?'One question. One card. A little cheek.':'One wish. One card. No coin required.'}</p></div>
   </div>
   <div className={`fortune-delivery ${busy?'is-revealing':''}`}>
    <div className="fortune-slot" aria-hidden="true"/>
    <p className="fortune-status" role="status" aria-live="polite">{busy?'A message is on its way…':fortune?imageReady||imageError?yesNo?'Your answer is ready.':'Your fortune is ready.':'Finishing your card…':'Your card will arrive here.'}</p>
    {fortune?<>
     <article className={`fortune-ticket ${imageError?'is-fallback':''}`} key={fortune.issuedAt} ref={ticketRef} tabIndex="-1" aria-labelledby="fortune-card-title" aria-busy={!imageReady&&!imageError}>
      {imageReady?<img className="fortune-ticket-image" src={image.url} width="1000" height="1500" alt=""/>:!imageError?<div className="fortune-ticket-loading" aria-hidden="true"><NavIcon name="fortune"/><p>Preparing your keepsake…</p></div>:null}
      <div className={imageError?'fortune-ticket-copy':'fortune-ticket-copy sr-only'}>
       <div className="fortune-ticket-brand">THE FOLD</div><p className="fortune-ticket-label">{yesNo?'The teller’s verdict':'A fortune for you'}</p>
       <h2 id="fortune-card-title">{fortune.title}</h2><p className="fortune-message">{fortune.message}</p><p className="fortune-whisper">{fortune.whisper}</p>
       <div className="fortune-lucky"><span>Your lucky number</span><strong>{String(fortune.luckyNumber).padStart(2,'0')}</strong></div>
       <time dateTime={fortune.issuedAt}>{fortuneDate(fortune.issuedAt)}</time><small>enterthefold.io</small>
      </div>
     </article>
     {imageReady?<FortuneKeepsake key={image.url} image={image} fortune={fortune}/>:imageError?<div className="fortune-keep"><p>The card image couldn’t be prepared.</p><button type="button" onClick={()=>setAttempt(value=>value+1)}>Try preparing the card again</button></div>:null}
    </>:<div className={`fortune-awaiting ${busy?'is-busy':''}`} aria-hidden="true"><NavIcon name="fortune"/><p>{busy?yesNo?'The teller is choosing its words…':fortuneRevealSteps[revealStep].message:yesNo?'Ask nicely. Expect a little attitude.':'Some messages find you.'}</p><span>{busy?'A little patience. A little possibility.':yesNo?'Think of your question, then press the gold button.':'Press the gold button to receive yours.'}</span></div>}
    <p className="fortune-footnote">A little theatre for reflection and fun.<br/>Your future is yours.</p>
   </div>
  </div>
 </section>;
}
