import { pages, tabFromLocation, applyPageMetadata } from '../../shared/pages.js';
import Reviews from './components/Reviews.jsx';
import './styles/reviews.css';
import { calculateNatal, natalDefaults } from '../../server/src/tarot/natal.js';
import NatalForm from './components/NatalForm.jsx';
import NatalChart from './components/NatalChart.jsx';
import DeckGallery from './components/DeckGallery.jsx';
import KnowledgeGuide from './components/KnowledgeGuide.jsx';
import { localDeck } from './lib/localFallback.js';
import { useEffect, useRef, useState } from 'react';
import { api } from './lib/api.js';
import { deleteLocalReading, generateLocalReading, loadLocalHistory, loadLocalProfile, saveLocalProfile, saveLocalReading, toggleLocalFavorite } from './lib/localFallback.js';
import ReadingForm from './components/ReadingForm.jsx';
import ReadingView from './components/ReadingView.jsx';
import HistoryPanel from './components/HistoryPanel.jsx';
import HeroDecor from './components/HeroDecor.jsx';
import MoonDivider from './components/MoonDivider.jsx';
import DailyHoroscopes from './components/DailyHoroscopes.jsx';
import QuickMysticTools from './components/QuickMysticTools.jsx';
import { checkTextLimits } from '../../server/src/validation/limits.js';

const initialForm={name:'',gender:'',birthday:'',natal:{...natalDefaults},birthInfluence:true,spread:'three',focus:'general',need:'clarity',reversals:'yes',question:'',persist:false};
const navItems=[
 {id:'read',icon:'▱',label:'Tarot Reading'},
 {id:'history',icon:'▤',label:'Past Readings'},
 {id:'card',icon:'☼',label:'Card of the Day',tool:'card'},
 {id:'daily',icon:'☾',label:'Daily Horoscope'},
 {id:'natal',icon:'✦',label:'Birth Chart'},
 {id:'match',icon:'♡',label:'Compatibility',tool:'match'},
 {id:'learn',icon:'▥',label:'Learn'},
 {id:'reviews',icon:'☆',label:'Reviews'}
];

export default function App(){
 const formRef=useRef(null),readingRef=useRef(null);
 const [tab,updateTab]=useState(()=>tabFromLocation(location));
 const [quickTool,setQuickTool]=useState('');
 const setTab=next=>{window.history.pushState(null,'',pages[next]?.path||'/history');updateTab(next);setQuickTool('')};
 const navigate=(e,n)=>{if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();setTab(n)};
 const [form,setForm]=useState(initialForm),[reading,setReading]=useState(null),[history,setHistory]=useState([]),[dbReady,setDbReady]=useState(false),[dbState,setDbState]=useState('checking'),[loading,setLoading]=useState(false),[profileSaving,setProfileSaving]=useState(false),[profileStatus,setProfileStatus]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState('');

 useEffect(()=>{applyPageMetadata(tab);if(location.hash==='#daily-horoscopes'||location.hash==='#reviews')window.history.replaceState(null,'',pages[tab]?.path||'/')},[tab]);
 useEffect(()=>{const c=()=>updateTab(tabFromLocation(location));addEventListener('popstate',c);addEventListener('hashchange',c);return()=>{removeEventListener('popstate',c);removeEventListener('hashchange',c)}},[]);
 const mergeHistory=(remote=[])=>setHistory([...(remote||[]).map(x=>({...x,_local:false})),...loadLocalHistory()]);
 const refreshHistory=async(force=false)=>{if(!dbReady&&!force){mergeHistory([]);return}try{const h=await api('/api/readings?limit=12');mergeHistory(h.readings||[])}catch{mergeHistory([])}};
 const enterFold=()=>{setTab('read');requestAnimationFrame(()=>setTimeout(()=>formRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50))};

 useEffect(()=>{const saved=loadLocalProfile();if(saved)setForm(f=>({...f,name:saved.name||'',gender:saved.gender||'',birthday:saved.birthday||'',natal:{...natalDefaults,...saved.natal},spread:saved.preferredSpread||f.spread}));mergeHistory([]);(async()=>{const health=await api('/api/health').catch(()=>null);if(!health){setDbState('device-local');return}const s=health.database||'unknown';setDbState(s);setDbReady(s==='connected');if(s==='connected'){try{const[h,p]=await Promise.all([api('/api/readings?limit=12'),api('/api/profile').catch(()=>null)]);mergeHistory(h.readings||[]);if(p?.profile)setForm(f=>({...f,name:p.profile.name||f.name,gender:p.profile.gender||f.gender,birthday:p.profile.birthday||f.birthday,natal:p.profile.natal?{...natalDefaults,...p.profile.natal}:f.natal,spread:p.profile.preferredSpread||f.spread}))}catch{mergeHistory([])}}})()},[]);

 const saveProfile=async()=>{try{checkTextLimits(form)}catch(e){setError(e.message);return}setProfileSaving(true);setProfileStatus('');setError('');let p;try{p=saveLocalProfile({name:form.name,gender:form.gender,birthday:form.birthday,natal:form.natal,preferredSpread:form.spread})}catch{setError('Your device could not save this profile.');setProfileSaving(false);return}setProfileStatus('Profile remembered on this device.');try{const r=await api('/api/profile',{method:'PUT',body:JSON.stringify(p)}),s=r.database||'connected';setDbState(s);setDbReady(s==='connected');setProfileStatus(s==='connected'?'Profile remembered on this device and synced.':'Profile remembered on this device.')}catch{setDbReady(false)}finally{setProfileSaving(false)}};

 const generate=async()=>{try{checkTextLimits(form)}catch(e){setError(e.message);return}let working=form,messages=[];if(form.birthInfluence!==false&&form.natal?.enabled){const c=calculateNatal(form);if(c.status!=='ready'){working={...form,natal:{...form.natal,enabled:false}};messages.push('Full birth-chart details are incomplete, so this reading will use the personal symbolism you already provided.')}}setLoading(true);setProfileStatus('');setError('');setNotice('');let result,usedFallback=false;try{result=await api('/api/readings/generate',{method:'POST',body:JSON.stringify({persist:Boolean(working.persist),personalInfluence:working.birthInfluence!==false,profile:{name:working.name,gender:working.gender,birthday:working.birthday,natal:working.natal,preferredSpread:working.spread},question:working.question,spread:working.spread,focus:working.focus,need:working.need,reversals:working.reversals==='yes'})});const s=result.database||'unknown';setDbState(s);setDbReady(s==='connected')}catch(e){if(e.status&&e.status<500&&e.status!==429){setError(e.message);setLoading(false);return}try{result=generateLocalReading(working)}catch{setError('The reading could not be completed. Please try again.');setLoading(false);return}usedFallback=true;setDbState('device-local');setDbReady(false);messages.push('The Fold used the protected device oracle for this reading.')}if(working.persist){if(!result.persisted){try{saveLocalReading(result);result={...result,localSaved:true}}catch{messages.push('The reading is ready, but this device could not save it.')}}if(result.persisted){await refreshHistory(true);messages.push('Reading saved to Past Readings.')}else if(result.localSaved){mergeHistory([]);messages.push('Reading saved to Past Readings on this device.')}}setReading(result);if(!usedFallback&&result.localSaved&&!messages.some(m=>m.startsWith('Reading saved')))messages.push('Reading saved on this device.');setNotice(messages.join(' '));setTab('read');requestAnimationFrame(()=>setTimeout(()=>readingRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50));setLoading(false)};

 const toggleFavorite=async item=>{if(item._local){const l=toggleLocalFavorite(item.localId);setHistory(h=>[...h.filter(x=>!x._local),...l]);return}try{const r=await api(`/api/readings/item/${item._id}`,{method:'PATCH',body:JSON.stringify({favorite:!item.favorite})});setHistory(h=>h.map(x=>x._id===item._id?{...x,favorite:r.reading.favorite}:x))}catch(e){setError(e.message)}};
 const deleteReading=async item=>{if(item._local){const l=deleteLocalReading(item.localId);setHistory(h=>[...h.filter(x=>!x._local),...l]);return}try{await api(`/api/readings/item/${item._id}`,{method:'DELETE'});setHistory(h=>h.filter(x=>x._id!==item._id))}catch(e){setError(e.message)}};
 const chooseNav=item=>{if(item.tool){setQuickTool(item.tool);if(tab!=='read')setTab('read');requestAnimationFrame(()=>setTimeout(()=>document.querySelector('.quick-mystic-single')?.scrollIntoView({behavior:'smooth',block:'center'}),60));return}if(item.id==='history'){setTab('history');return}setTab(item.id)};

 return <div className="app-shell">
  <nav className="mystic-topbar" aria-label="Main navigation">
   <button className="mystic-brand" onClick={enterFold} aria-label="The Fold home"><span className="brand-eye">◉</span><b>THE FOLD</b><small>TRUTH LIVES IN THE SHADOWS</small></button>
   <div className="mystic-nav-scroll">{navItems.map(item=>{const active=item.tool?quickTool===item.tool:tab===item.id&&!quickTool;return <button key={item.id} className={active?'active':''} onClick={()=>chooseNav(item)}><span>{item.icon}</span><b>{item.label}</b></button>})}</div>
  </nav>

  <header className="hero fold-hero"><HeroDecor/><div className="side-whisper side-whisper-left">LOOK<br/>DEEPER.<br/>YOU<br/>ALREADY<br/>KNOW.</div><div className="side-whisper side-whisper-right">SOME<br/>QUESTIONS<br/>FIND<br/>YOU.</div><div className="hero-copy"><p>FRACTURE PRESENTS · THE SHADOW DECK</p><h1><span className="sr-only">The Fold</span><span className="title-wordmark" aria-hidden="true"/></h1><div className="hero-tagline">Truth lives in the shadows.</div><span>Seventy-eight cards. One honest question.<br/> A reading built around the pattern beneath the surface.</span><MoonDivider/><div className={`runtime-badge ${dbState==='checking'?'checking':'ok'}`} role="status"><i/>{dbState==='checking'?'CONNECTING TO THE ORACLE':dbState==='device-local'?'DEVICE ORACLE ACTIVE':'ORACLE ONLINE'}</div></div></header>

  <nav className="tabs mockup-tabs" aria-label="Reading navigation"><button className={tab==='read'&&!quickTool?'active':''} onClick={enterFold}>Enter The Fold</button><button className={tab==='history'?'active':''} onClick={()=>setTab('history')}>Past Readings</button></nav>

  <QuickMysticTools profile={form} mode={quickTool} onClose={()=>setQuickTool('')} onStartReading={enterFold}/>
  {tab==='reviews'&&<Reviews/>}
  {tab==='daily'&&<DailyHoroscopes value={form} onChange={setForm} onBirthChart={()=>setTab('natal')}/>} 
  {tab==='natal'&&<section className="panel knowledge-panel"><div className="section-kicker">Your birth sky</div><h2>Calculate Your Birth Chart</h2><NatalForm value={form} onChange={setForm} includeBirthday/><NatalChart chart={calculateNatal(form)}/><button className="secondary-button" onClick={()=>{setForm(f=>({...f,birthInfluence:true}));enterFold()}}>Use these details in a reading</button></section>}
  {tab==='deck'&&<DeckGallery deck={localDeck}/>} 
  {tab==='learn'&&<KnowledgeGuide profile={form}/>} 
  {notice&&<div className="notice-banner" role="status">{notice}</div>}

  {tab==='read'&&!quickTool&&<><div ref={formRef} className="two-col reading-form-anchor mockup-grid"><div className="panel-shell panel-shell-left"><ReadingForm value={form} onChange={setForm} onSubmit={generate} onSaveProfile={saveProfile} loading={loading} profileSaving={profileSaving} profileStatus={profileStatus} dbReady={dbReady} dbState={dbState} error={error}/></div><div className="panel-shell panel-shell-right"><section className="panel ritual-panel"><div className="section-kicker">Before the draw</div><h2>Open the Fold</h2><p className="ritual-intro">Start with the question that has some weight to it. You do not need perfect wording—just the thing that keeps pulling at you.</p><ol className="ritual-steps"><li><span>01</span><div><b>Name the tension.</b><small>Love, money, a choice, closure, a fear, or something you cannot quite shake.</small></div></li><li><span>02</span><div><b>Choose the lens.</b><small>Your spread decides how deeply the deck cuts into the question.</small></div></li><li><span>03</span><div><b>Ask for direction, not permission.</b><small>The deck reads patterns and pressure points.</small></div></li><li><span>04</span><div><b>Draw the cards.</b><small>Reversals and any personal symbolism you provide shape the interpretation.</small></div></li></ol><div className="ritual-note">Ask about the pattern —<br/>not the verdict.</div><div className="ritual-deck-preview"><div className="ritual-card-stack"/><p className="ritual-awaits">THE<br/>SHADOW DECK<br/>AWAITS<br/><span>✧</span></p></div></section></div></div><div ref={readingRef} className="reading-anchor"><ReadingView reading={reading}/></div></>}

  {tab==='history'&&<HistoryPanel history={history} dbReady={dbReady} onToggleFavorite={toggleFavorite} onDelete={deleteReading}/>} 
  {pages[tab]&&!quickTool&&<section className="seo-intro"><h2>{pages[tab].heading}</h2><p>{pages[tab].text}</p></section>}
  <footer className="mockup-footer"><span>FRACTURE</span><span>A DEEPER YOU AWAITS</span><span>TRUTH LIVES HERE</span><small className="developer-credit">David Northrop · Developer of FRACTURE<br/>© 2026 · All rights reserved</small></footer>
 </div>
}
