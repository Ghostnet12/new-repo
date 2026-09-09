import {useEffect,useRef,useState} from 'react';
import NavIcon from './NavIcon.jsx';

export default function HistoryPanel({history,dbReady,loading=false,onStartReading,onToggleFavorite,onDelete}) {
 const [confirmId,setConfirmId]=useState(null),[busyId,setBusyId]=useState(null),[error,setError]=useState(''),[feedback,setFeedback]=useState('');
 const pending=useRef(false),active=useRef(true),confirmationRef=useRef(null),deleteTrigger=useRef(null),headingRef=useRef(null);
 useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
 useEffect(()=>{if(confirmId)confirmationRef.current?.querySelector('button')?.focus();},[confirmId]);
 const cancelDelete=()=>{setConfirmId(null);deleteTrigger.current?.focus();};
 const perform=async(action,item)=>{
  if(pending.current)return;
  pending.current=true;setBusyId(item._id||item.localId);setError('');setFeedback(action==='delete'?'Removing reading…':'Saving favorite…');
  try{
   await (action==='delete'?onDelete(item):onToggleFavorite(item));
   if(active.current){
    setFeedback(action==='delete'?'Reading removed from Past Readings.':item.favorite?'Reading removed from favorites.':'Reading marked as a favorite.');
    if(action==='delete'){setConfirmId(null);headingRef.current?.focus({preventScroll:true});}
   }
  }catch(e){
   if(active.current){setFeedback('');setError(item._local?'This browser could not update the saved reading. Please try again.':e.message||'That change could not be saved. Please try again.');}
  }finally{pending.current=false;if(active.current)setBusyId(null);}
 };
 return <section className="panel history-panel" aria-labelledby="history-title" aria-busy={loading||Boolean(busyId)}>
  <div className="collection-heading"><div><div className="section-kicker">Your reading journal</div><h2 id="history-title" ref={headingRef} tabIndex="-1">Past readings</h2></div><span className="collection-count">{history.length} saved</span></div>
  <p className="collection-intro">A question can look different with a little distance.</p>
  {!dbReady&&<p className="history-storage"><NavIcon name="history"/>Readings saved on this device stay in this browser.</p>}
  <p className="history-feedback" role="status" aria-live="polite">{loading?'Checking your saved readings…':feedback}</p>
  {error&&<div className="error-banner" role="alert">{error}</div>}
  {!history.length&&!loading?<div className="history-empty"><NavIcon name="history"/><h3>Your first page is still unwritten.</h3><p>Choose “Keep this reading” before you draw the cards. Your saved questions will be here when you want to return.</p><button type="button" className="secondary-button" onClick={onStartReading}>Begin a reading</button></div>:
   <div className="history-list">{history.map(item=>{
    const id=item._id||item.localId;
    return <article key={id}>
     <div className="history-top"><div><small><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'})}</time> · {item._local?'On this device':'Synced'}</small><h3>{item.spreadName}</h3></div>
      <div className="history-actions"><button type="button" disabled={Boolean(busyId)||confirmId===id} className={item.favorite?'is-favorite':''} onClick={()=>perform('favorite',item)} aria-label={item.favorite?'Remove favorite':'Mark favorite'} aria-pressed={Boolean(item.favorite)}><NavIcon name="reviews"/></button><button type="button" disabled={Boolean(busyId)} className="danger" onClick={event=>{deleteTrigger.current=event.currentTarget;setConfirmId(id);setError('');}}>Delete</button></div>
     </div><p className="history-question">{item.question?'“'+item.question+'”':'A general reading'}</p>
     {confirmId===id&&<div className="history-confirmation" ref={confirmationRef} role="group" aria-label="Confirm removal" onKeyDown={event=>{if(event.key==='Escape'&&!busyId){event.stopPropagation();cancelDelete();}}}>
      <p>Remove this saved reading? This cannot be undone.</p><button type="button" className="secondary-button" disabled={Boolean(busyId)} onClick={cancelDelete}>Keep reading</button><button type="button" className="secondary-button danger" disabled={Boolean(busyId)} onClick={()=>perform('delete',item)}>{busyId===id?'Removing…':'Remove reading'}</button>
     </div>}
    </article>;
   })}</div>}
 </section>;
}
