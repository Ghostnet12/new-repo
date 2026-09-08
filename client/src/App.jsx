import { pages, tabFromLocation, applyPageMetadata } from '../../shared/pages.js';
import NavIcon from './components/NavIcon.jsx';
import TopNavigation from './components/TopNavigation.jsx';
import RitualGuide from './components/RitualGuide.jsx';
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
import AmbientMusic from './components/AmbientMusic.jsx';
import HeroDecor from './components/HeroDecor.jsx';
import MoonDivider from './components/MoonDivider.jsx';
import DailyHoroscopes from './components/DailyHoroscopes.jsx';
import QuickMysticTools from './components/QuickMysticTools.jsx';
import { checkTextLimits } from '../../server/src/validation/limits.js';

const scrollBehavior=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
const initialForm={name:'',gender:'',birthday:'',natal:{...natalDefaults},birthInfluence:true,spread:'three',focus:'general',need:'clarity',reversals:'yes',question:'',persist:false};
const navItems=[
 {id:'read',label:'Tarot Reading'},
 {id:'history',label:'Past Readings'},
 {id:'card',label:'Card of the Day',tool:'card'},
 {id:'daily',label:'Daily Horoscope'},
 {id:'natal',label:'Birth Chart'},
 {id:'match',label:'Compatibility',tool:'match'},
 {id:'learn',label:'Learn'},
 {id:'reviews',label:'Reviews'}
];

export default function App(){
 const formRef=useRef(null),readingRef=useRef(null);
 const [tab,updateTab]=useState(()=>tabFromLocation(location));
 const [quickTool,setQuickTool]=useState('');
 const setTab=next=>{window.history.pushState(null,'',pages[next]?.path||'/history');updateTab(next);setQuickTool('');requestAnimationFrame(()=>window.scrollTo({top:0,behavior:scrollBehavior()}))};
 const [form,setForm]=useState(initialForm),[reading,setReading]=useState(null),[history,setHistory]=useState([]),[dbReady,setDbReady]=useState(false),[dbState,setDbState]=useState('checking'),[loading,setLoading]=useState(false),[profileSaving,setProfileSaving]=useState(false),[profileStatus,setProfileStatus]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState('');

 useEffect(()=>{applyPageMetadata(tab);if(location.hash==='#daily-horoscopes'||location.hash==='#reviews')window.history.replaceState(null,'',pages[tab]?.path||'/')},[tab]);
 useEffect(()=>{const c=()=>{updateTab(tabFromLocation(location));setQuickTool('')};addEventListener('popstate',c);addEventListener('hashchange',c);return()=>{removeEventListener('popstate',c);removeEventListener('hashchange',c)}},[]);
 const mergeHistory=(remote=[])=>setHistory([...(remote||[]).map(x=>({...x,_local:false})),...loadLocalHistory()]);
 const refreshHistory=async(force=false)=>{if(!dbReady&&!force){mergeHistory([]);return}try{const h=await api('/api/readings?limit=12');mergeHistory(h.readings||[])}catch{mergeHistory([])}};
 const enterFold=()=>{setTab('read');requestAnimationFrame(()=>setTimeout(()=>formRef.current?.scrollIntoView({behavior:scrollBehavior(),block:'start'}),50))};

 useEffect(()=>{const saved=loadLocalProfile();if(saved)setForm(f=>({...f,name:saved.name||'',gender:saved.gender||'',birthday:saved.birthday||'',natal:{...natalDefaults,...saved.natal},spread:saved.preferredSpread||f.spread}));mergeHistory([]);(async()=>{const health=await api('/api/health').catch(()=>null);if(!health){setDbState('device-local');return}const s=health.database||'unknown';setDbState(s);setDbReady(s==='connected');if(s==='connected'){try{const[h,p]=await Promise.all([api('/api/readings?limit=12'),api('/api/profile').catch(()=>null)]);mergeHistory(h.readings||[]);if(p?.profile)setForm(f=>({...f,name:p.profile.name||f.name,gender:p.profile.gender||f.gender,birthday:p.profile.birthday||f.birthday,natal:p.profile.natal?{...natalDefaults,...p.profile.natal}:f.natal,spread:p.profile.preferredSpread||f.spread}))}catch{mergeHistory([])}}})()},[]);

 const saveProfile=async()=>{try{checkTextLimits(form)}catch(e){setError(e.message);return}setProfileSaving(true);setProfileStatus('');setError('');let p;try{p=saveLocalProfile({name:form.name,gender:form.gender,birthday:form.birthday,natal:form.natal,preferredSpread:form.spread})}catch{setError('Your device could not save this profile.');setProfileSaving(false);return}setProfileStatus('Profile remembered on this device.');try{const r=await api('/api/profile',{method:'PUT',body:JSON.stringify(p)}),s=r.database||'connected';setDbState(s);setDbReady(s==='connected');setProfileStatus(s==='connected'?'Profile remembered on this device and synced.':'Profile remembered on this device.')}catch{setDbReady(false)}finally{setProfileSaving(false)}};

 const generate=async()=>{try{checkTextLimits(form)}catch(e){setError(e.message);return}let working=form,messages=[];if(form.birthInfluence!==false&&form.natal?.enabled){const c=calculateNatal(form);if(c.status!=='ready'){working={...form,natal:{...form.natal,enabled:false}};messages.push('Full birth-chart details are incomplete, so this reading will use the personal symbolism you already provided.')}}setLoading(true);setProfileStatus('');setError('');setNotice('');let result,usedFallback=false;try{result=await api('/api/readings/generate',{method:'POST',body:JSON.stringify({persist:Boolean(working.persist),personalInfluence:working.birthInfluence!==false,profile:{name:working.name,gender:working.gender,birthday:working.birthday,natal:working.natal,preferredSpread:working.spread},question:working.question,spread:working.spread,focus:working.focus,need:working.need,reversals:working.reversals==='yes'})});const s=result.database||'unknown';setDbState(s);setDbReady(s==='connected')}catch(e){if(e.status&&e.status<500&&e.status!==429){setError(e.message);setLoading(false);return}try{result=generateLocalReading(working)}catch{setError('The reading could not be completed. Please try again.');setLoading(false);return}usedFallback=true;setDbState('device-local');setDbReady(false);messages.push('The Fold used the protected device oracle for this reading.')}if(working.persist){if(!result.persisted){try{saveLocalReading(result);result={...result,localSaved:true}}catch{messages.push('The reading is ready, but this device could not save it.')}}if(result.persisted){await refreshHistory(true);messages.push('Reading saved to Past Readings.')}else if(result.localSaved){mergeHistory([]);messages.push('Reading saved to Past Readings on this device.')}}setReading(result);if(!usedFallback&&result.localSaved&&!messages.some(m=>m.startsWith('Reading saved')))messages.push('Reading saved on this device.');setNotice(messages.join(' '));setTab('read');requestAnimationFrame(()=>setTimeout(()=>readingRef.current?.scrollIntoView({behavior:scrollBehavior(),block:'start'}),50));setLoading(false)};

 const toggleFavorite=async item=>{if(item._local){const l=toggleLocalFavorite(item.localId);setHistory(h=>[...h.filter(x=>!x._local),...l]);return}try{const r=await api(`/api/readings/item/${item._id}`,{method:'PATCH',body:JSON.stringify({favorite:!item.favorite})});setHistory(h=>h.map(x=>x._id===item._id?{...x,favorite:r.reading.favorite}:x))}catch(e){setError(e.message)}};
 const deleteReading=async item=>{if(item._local){const l=deleteLocalReading(item.localId);setHistory(h=>[...h.filter(x=>!x._local),...l]);return}try{await api(`/api/readings/item/${item._id}`,{method:'DELETE'});setHistory(h=>h.filter(x=>x._id!==item._id))}catch(e){setError(e.message)}};
 const focusProfile=(field='reading-name')=>{enterFold();requestAnimationFrame(()=>setTimeout(()=>{const details=document.getElementById('personal-details');if(details)details.open=true;document.getElementById(field)?.focus({preventScroll:true});details?.scrollIntoView({behavior:scrollBehavior(),block:'center'})},60))};
 const chooseNav=item=>{if(item.tool){if(tab!=='read')setTab('read');setQuickTool(item.tool);requestAnimationFrame(()=>setTimeout(()=>document.querySelector('.quick-mystic-single')?.scrollIntoView({behavior:scrollBehavior(),block:'center'}),60));return}if(item.id==='history'){setTab('history');return}setTab(item.id)};

 return <div className="app-shell">
  <a className="skip-link" href="#reading-content">Skip to content</a>
  <TopNavigation items={navItems} activeId={quickTool==='card'?'card':quickTool==='match'?'match':tab} onChoose={chooseNav} onHome={()=>{setTab('read');window.scrollTo({top:0,behavior:scrollBehavior()})}} onProfile={()=>focusProfile()} onDeck={()=>setTab('deck')}/>
  <AmbientMusic />


  <header className={`hero fold-hero ${tab!=='read'||quickTool?'hero-compact':''}`}><HeroDecor/><div className="side-whisper side-whisper-left">LOOK<br/>DEEPER.<br/>YOU<br/>ALREADY<br/>KNOW.</div><div className="side-whisper side-whisper-right">SOME<br/>QUESTIONS<br/>FIND<br/>YOU.</div><div className="hero-copy"><p>FRACTURE PRESENTS · THE SHADOW DECK</p><h1><span className="sr-only">The Fold</span><span className="title-wordmark" aria-hidden="true"/></h1><div className="hero-tagline">Truth lives in the shadows.</div><span>Seventy-eight cards. One honest question.<br/> A reading built around the pattern beneath the surface.</span><MoonDivider/><div className={`runtime-badge ${dbState==='checking'?'checking':'ok'}`} role="status"><i/>{dbState==='checking'?'PREPARING YOUR READING':dbState==='device-local'?'READY WHEN YOU ARE':'ORACLE ONLINE'}</div></div></header>

  <nav className="tabs mockup-tabs" aria-label="Reading navigation"><button className={tab==='read'&&!quickTool?'active':''} onClick={enterFold}> <NavIcon name="eye"/>Begin reading</button><button className={tab==='history'?'active':''} onClick={()=>setTab('history')}> <NavIcon name="history"/>Past readings</button></nav>

  <main id="reading-content" tabIndex="-1">
  <QuickMysticTools profile={form} mode={quickTool} onClose={()=>setQuickTool('')} onStartReading={enterFold} onAddBirthDate={()=>focusProfile('reading-birthday')}/>
  {tab==='reviews'&&<Reviews/>}
  {tab==='daily'&&<DailyHoroscopes value={form} onChange={setForm} onBirthChart={()=>setTab('natal')}/>} 
  {tab==='natal'&&<section className="panel knowledge-panel"><div className="section-kicker">Your birth sky</div><h2>Calculate Your Birth Chart</h2><NatalForm value={form} onChange={setForm} includeBirthday/><NatalChart chart={calculateNatal(form)}/><button className="secondary-button" onClick={()=>{setForm(f=>({...f,birthInfluence:true}));enterFold()}}>Use these details in a reading</button></section>}
  {tab==='deck'&&<DeckGallery deck={localDeck}/>} 
  {tab==='learn'&&<KnowledgeGuide profile={form}/>} 
  {notice&&<div className="notice-banner" role="status">{notice}</div>}

  {tab==='read'&&!quickTool&&<><div ref={formRef} className="two-col reading-form-anchor mockup-grid"><div className="panel-shell panel-shell-left"><ReadingForm value={form} onChange={setForm} onSubmit={generate} onSaveProfile={saveProfile} loading={loading} profileSaving={profileSaving} profileStatus={profileStatus} dbReady={dbReady} dbState={dbState} error={error}/></div><div className="panel-shell panel-shell-right"><RitualGuide onDeck={()=>setTab('deck')}/></div></div><div ref={readingRef} className="reading-anchor"><ReadingView reading={reading}/></div></>}

  {tab==='history'&&<HistoryPanel history={history} dbReady={dbReady} onToggleFavorite={toggleFavorite} onDelete={deleteReading}/>} 
  {pages[tab]&&!quickTool&&<section className="seo-intro"><h2>{pages[tab].heading}</h2><p>{pages[tab].text}</p></section>}
  </main>
  <footer className="mockup-footer"><span>FRACTURE</span><span>A DEEPER YOU AWAITS</span><span>TRUTH LIVES HERE</span><small className="developer-credit">David Northrop · Developer of FRACTURE<br/>© 2026 · All rights reserved</small></footer>
 </div>
}
