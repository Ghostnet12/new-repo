import { useMemo, useState } from 'react';

const cards=['The Fool','The Magician','The High Priestess','The Empress','The Emperor','The Hierophant','The Lovers','The Chariot','Strength','The Hermit','Wheel of Fortune','Justice','The Hanged Man','Death','Temperance','The Devil','The Tower','The Star','The Moon','The Sun','Judgement','The World'];
const messages=['Begin before you feel completely ready.','Use what is already in your hands.','Listen before you push for an answer.','Give the thing you value room to grow.','Create structure around what matters.','Question the rule before following it.','Choose what matches your values.','Pick a direction and move with intention.','Soft control is still strength.','Make room for your own voice.','Notice what is changing without forcing it.','Choose the fairest next step.','A different angle may reveal the opening.','Release what has already ended.','Balance beats urgency today.','Name the attachment before it names the choice.','What falls away may expose what is real.','Keep one honest hope in view.','Uncertainty is information, not a verdict.','Let clarity be simple.','Use what you learned and decide.','Close the loop before opening another.'];
const hash=s=>[...s].reduce((a,c)=>((a*31)+c.charCodeAt(0))>>>0,7);

export default function QuickMysticTools({profile,onStartReading,mode,onClose}){
 const [otherDate,setOtherDate]=useState('');
 const today=new Date().toISOString().slice(0,10); const index=hash(today)%cards.length;
 const compatibility=useMemo(()=>{if(!profile?.birthday||!otherDate)return null;return 55+(hash(profile.birthday+'|'+otherDate)%41)},[profile?.birthday,otherDate]);
 if(!mode)return null;
 return <section className="quick-mystic quick-mystic-single" aria-label="Mystic tool">
  <div className="quick-mystic-result">
   <button className="quick-close" type="button" onClick={onClose} aria-label="Close">×</button>
   {mode==='card'&&<><em>YOUR CARD TODAY</em><h3>{cards[index]}</h3><p>{messages[index]}</p><button className="quick-start" onClick={onStartReading}>Use this in a full reading</button></>}
   {mode==='match'&&<><em>SYMBOLIC COMPATIBILITY</em>{!profile?.birthday?<><p>Add your birth date in Your Information first.</p><button className="quick-start" onClick={onStartReading}>Add my birth date</button></>:<><label>Other person's birth date<input type="date" value={otherDate} onChange={e=>setOtherDate(e.target.value)}/></label>{compatibility&&<><h3>{compatibility}% resonance</h3><p>A playful symbolic comparison for reflection, not a prediction of relationship success.</p></>}</>}</>}
   {mode==='daily'&&<><em>TODAY'S PERSONAL LENS</em><h3>{profile?.name?`${profile.name}, today asks for ${cards[index]}`:`Today asks for ${cards[index]}`}</h3><p>{messages[index]} Use this as a reflection prompt, or open a full reading for more context.</p><button className="quick-start" onClick={onStartReading}>Start my reading</button></>}
  </div>
 </section>;
}
