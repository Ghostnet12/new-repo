import { pages, tabFromLocation, applyPageMetadata } from '../../shared/pages.js';
import {readingFaqs} from '../../shared/readingFaqs.js';
import PageLink from './components/PageLink.jsx';
import './styles/discovery.css';
import NavIcon from './components/NavIcon.jsx';
import TopNavigation from './components/TopNavigation.jsx';
import RitualGuide from './components/RitualGuide.jsx';
import './styles/reviews.css';
import {natalDefaults} from '../../shared/natalDefaults.js';
import {spreadIds} from '../../shared/spreads.js';
import PageBoundary,{PageLoading} from './components/PageBoundary.jsx';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { api } from './lib/api.js';
import { deleteLocalReading, loadLocalHistory, loadLocalProfile, saveLocalProfile, saveLocalReading, toggleLocalFavorite } from './lib/deviceStorage.js';
import ReadingForm from './components/ReadingForm.jsx';
import HistoryPanel from './components/HistoryPanel.jsx';
import HeroDecor from './components/HeroDecor.jsx';
import MoonDivider from './components/MoonDivider.jsx';
import QuickMysticTools from './components/QuickMysticTools.jsx';
import { checkTextLimits } from '../../server/src/validation/limits.js';

const FortuneTeller=lazy(()=>import('./components/FortuneTeller.jsx'));
const DreamJournal=lazy(()=>import('./components/DreamJournal.jsx'));
const Reviews=lazy(()=>import('./components/Reviews.jsx'));
const Support=lazy(()=>import('./components/Support.jsx'));
const BirthChartPage=lazy(()=>import('./components/BirthChartPage.jsx'));
const KnowledgeGuide=lazy(()=>import('./components/KnowledgeGuide.jsx'));
const DeckGallery=lazy(()=>import('./components/DeckGallery.jsx'));
const DailyHoroscopes=lazy(()=>import('./components/DailyHoroscopes.jsx'));
const ReadingView=lazy(()=>import('./components/ReadingView.jsx'));
function restoreProfile(current,saved){
 if(!saved)return current;
 const fields=Object.fromEntries(['name','gender','birthday'].filter(key=>typeof saved[key]==='string').map(key=>[key,saved[key]]));
 return {...current,...fields,natal:{...natalDefaults,...(saved.natal&&typeof saved.natal==='object'?saved.natal:{})},spread:spreadIds.includes(saved.preferredSpread)?saved.preferredSpread:current.spread};
}
const scrollBehavior=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
const initialForm={name:'',gender:'',birthday:'',natal:{...natalDefaults},birthInfluence:true,spread:'three',focus:'general',need:'clarity',reversals:'yes',question:'',persist:false};
const navItems=[
 {id:'read',label:'Tarot Reading'},
 {id:'fortune',label:'Fortune Teller'},
 {id:'dream',label:'Dream Journal'},
 {id:'history',label:'Past Readings'},
 {id:'card',label:'Card of the Day',tool:'card'},
 {id:'daily',label:'Daily Horoscope'},
 {id:'natal',label:'Birth Chart'},
 {id:'match',label:'Compatibility',tool:'match'},
 {id:'learn',label:'Learn'},
 {id:'reviews',label:'Reviews'},
 {id:'support',label:'Support The Fold'}
];

export default function App(){
 const formRef=useRef(null),readingRef=useRef(null);
 const navigation=useRef(0),formEdited=useRef(false),generation=useRef(false),profilePending=useRef(false),historyRequest=useRef(0);
 const [tab,updateTab]=useState(()=>tabFromLocation(location));
 const [quickTool,setQuickTool]=useState('');
 const currentTab=useRef(tab),currentTool=useRef('');
 const [form,setForm]=useState(()=>restoreProfile(initialForm,loadLocalProfile()));
 const [dreamDraft,setDreamDraft]=useState({entryId:null,text:'',mood:'',context:'',reflection:null,saved:false});
 const [reading,setReading]=useState(null),[history,setHistory]=useState(loadLocalHistory);
 const [dbReady,setDbReady]=useState(false),[dbState,setDbState]=useState('checking');
 const [loading,setLoading]=useState(false),[historyLoading,setHistoryLoading]=useState(true),[profileSaving,setProfileSaving]=useState(false);
 const [profileStatus,setProfileStatus]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState(''),[unseenReading,setUnseenReading]=useState(false);
 const changeForm=next=>{formEdited.current=true;setForm(next);};

 const setTab=(next,{target='top',tool='',field='reading-name'}={})=>{
  const revision=++navigation.current;
  const changed=currentTab.current!==next||currentTool.current!==tool;
  const path=pages[next]?.path||'/history';
  if(location.pathname!==path||location.hash)window.history.pushState(null,'',path);
  currentTab.current=next;currentTool.current=tool;updateTab(next);setQuickTool(tool);
  if(target==='reading')setUnseenReading(false);
  requestAnimationFrame(()=>{
   if(navigation.current!==revision)return;
   const main=document.getElementById('reading-content');
   let element=target==='form'?formRef.current:target==='reading'?readingRef.current:target==='tool'?document.querySelector('.quick-mystic-single'):main;
   if(target==='profile'){
    const details=document.getElementById('personal-details');
    if(details)details.open=true;
    element=document.getElementById(field)||details;
   }
   element?.focus({preventScroll:true});
   if(target==='top')window.scrollTo({top:0,behavior:'auto'});
   else element?.scrollIntoView({behavior:changed?'auto':scrollBehavior(),block:target==='profile'?'center':'start'});
  });
 };
 const enterFold=()=>setTab('read',{target:'form'});
 const viewReading=()=>setTab('read',{target:'reading'});
 const focusProfile=(field='reading-name')=>setTab('read',{target:'profile',field});
 const chooseNav=item=>item.tool?setTab('read',{tool:item.tool,target:'tool'}):item.id==='read'?enterFold():setTab(item.id);
 const mergeHistory=(remote=null)=>setHistory(previous=>[...(remote===null?previous.filter(item=>!item._local):remote.map(item=>({...item,_local:false}))),...loadLocalHistory()]);

 const refreshHistory=async(force=false,signal)=>{
  const request=++historyRequest.current;
  if(!dbReady&&!force){mergeHistory();setHistoryLoading(false);return;}
  setHistoryLoading(true);
  try{
   const result=await api('/api/readings?limit=12',{signal,timeoutMs:12000});
   if(request===historyRequest.current&&!signal?.aborted)mergeHistory(result.readings||[]);
  }catch{
   if(request===historyRequest.current&&!signal?.aborted)mergeHistory();
  }finally{
   if(request===historyRequest.current&&!signal?.aborted)setHistoryLoading(false);
  }
 };

 useEffect(()=>{
  applyPageMetadata(tab);
  if(location.hash==='#daily-horoscopes'||location.hash==='#reviews')window.history.replaceState(null,'',pages[tab]?.path||'/');
 },[tab]);
 useEffect(()=>{
  const changed=()=>{
   navigation.current++;currentTab.current=tabFromLocation(location);currentTool.current='';
   updateTab(currentTab.current);setQuickTool('');
   requestAnimationFrame(()=>document.getElementById('reading-content')?.focus({preventScroll:true}));
  };
  addEventListener('popstate',changed);addEventListener('hashchange',changed);
  return()=>{removeEventListener('popstate',changed);removeEventListener('hashchange',changed);};
 },[]);
 useEffect(()=>{
  const controller=new AbortController();
  (async()=>{
   const health=await api('/api/health',{signal:controller.signal,timeoutMs:8000}).catch(()=>null);
   if(controller.signal.aborted)return;
   const state=health?.database||'device-local';
   setDbState(state);setDbReady(state==='connected');
   if(state!=='connected'){setHistoryLoading(false);return;}
   await Promise.all([
    refreshHistory(true,controller.signal),
    api('/api/profile',{signal:controller.signal,timeoutMs:12000}).then(result=>{
     if(!controller.signal.aborted&&!formEdited.current&&result.profile)setForm(current=>restoreProfile(current,result.profile));
    }).catch(()=>{})
   ]);
  })();
  return()=>controller.abort();
 },[]);

 const saveProfile=async()=>{
  if(profilePending.current)return;
  try{checkTextLimits(form);}catch(e){setError(e.message);return;}
  formEdited.current=true;profilePending.current=true;setProfileSaving(true);setProfileStatus('');setError('');
  try{
   const profile=saveLocalProfile({name:form.name,gender:form.gender,birthday:form.birthday,natal:form.natal,preferredSpread:form.spread});
   setProfileStatus('Profile remembered on this device.');
   try{
    const result=await api('/api/profile',{method:'PUT',body:JSON.stringify(profile),timeoutMs:12000});
    if(result.database==='connected'){setDbState('connected');setDbReady(true);setProfileStatus('Profile remembered and synced.');}
   }catch{ /* The device copy is already saved. */ }
  }catch{setError('Your browser could not remember these details. You can still use them for this reading.');}
  finally{profilePending.current=false;setProfileSaving(false);}
 };

 const generate=async()=>{
  if(generation.current||profilePending.current)return;
  try{checkTextLimits(form);}catch(e){setError(e.message);return;}
  formEdited.current=true;generation.current=true;
  const origin=navigation.current;
  let working=form;
  const messages=[];
  setLoading(true);setReading(null);setUnseenReading(false);setProfileStatus('');setError('');setNotice('');
  try{
   if(working.birthInfluence!==false&&working.natal?.enabled){
    const {calculateNatal}=await import('../../server/src/tarot/natal.js');
    const chart=calculateNatal(working);
    if(chart.status!=='ready'){
     working={...working,natal:{...working.natal,enabled:false}};
     messages.push('Full birth-chart details are incomplete, so this reading uses the personal symbolism you already provided.');
    }
   }
   let result;
   try{
    result=await api('/api/readings/generate',{method:'POST',timeoutMs:20000,body:JSON.stringify({persist:Boolean(working.persist),personalInfluence:working.birthInfluence!==false,profile:{name:working.name,gender:working.gender,birthday:working.birthday,natal:working.natal,preferredSpread:working.spread},question:working.question,spread:working.spread,focus:working.focus,need:working.need,reversals:working.reversals==='yes'})});
    if(result.database==='connected'){setDbState('connected');setDbReady(true);}
   }catch(e){
    if(e.status&&e.status<500&&e.status!==429)throw e;
    const {generateLocalReading}=await import('./lib/localFallback.js');
    result=generateLocalReading(working);
    setDbState('device-local');setDbReady(false);
    messages.push('Your reading was prepared on this device.');
   }
   if(working.persist&&!result.persisted){
    try{saveLocalReading(result);result={...result,localSaved:true};}
    catch{messages.push('Your reading is ready, but this browser could not save it.');}
   }
   if(result.persisted){void refreshHistory(true);messages.push('Reading saved to Past Readings.');}
   else if(result.localSaved){mergeHistory();messages.push('Reading saved to Past Readings on this device.');}
   setReading(result);setNotice(messages.join(' '));
   if(navigation.current===origin&&currentTab.current==='read'&&!currentTool.current)viewReading();
   else setUnseenReading(true);
  }catch(e){
   setError(e.status?e.message:'Your reading could not be completed. Please try again.');
  }finally{generation.current=false;setLoading(false);}
 };

 const toggleFavorite=async item=>{
  historyRequest.current++;setHistoryLoading(false);
  if(item._local){
   const local=toggleLocalFavorite(item.localId);
   setHistory(previous=>[...previous.filter(entry=>!entry._local),...local]);return;
  }
  const result=await api('/api/readings/item/'+item._id,{method:'PATCH',body:JSON.stringify({favorite:!item.favorite})});
  setHistory(previous=>previous.map(entry=>entry._id===item._id?{...entry,favorite:result.reading.favorite}:entry));
 };
 const deleteReading=async item=>{
  historyRequest.current++;setHistoryLoading(false);
  if(item._local){
   const local=deleteLocalReading(item.localId);
   setHistory(previous=>[...previous.filter(entry=>!entry._local),...local]);return;
  }
  await api('/api/readings/item/'+item._id,{method:'DELETE'});
  setHistory(previous=>previous.filter(entry=>entry._id!==item._id));
 };

 return <div className="app-shell">
  <a className="skip-link" href="#reading-content" onClick={event=>{event.preventDefault();const main=document.getElementById('reading-content');main?.focus({preventScroll:true});main?.scrollIntoView({behavior:'auto',block:'start'});}}>Skip to content</a>
  <TopNavigation items={navItems} activeId={quickTool==='card'?'card':quickTool==='match'?'match':tab} onChoose={chooseNav} onHome={()=>setTab('read')} onProfile={()=>focusProfile()} onDeck={()=>setTab('deck')}/>


  {!['fortune','dream'].includes(tab)&&<header className={`hero fold-hero ${tab!=='read'||quickTool?'hero-compact':''}`}><HeroDecor/><div className="side-whisper side-whisper-left">LOOK<br/>DEEPER.<br/>YOU<br/>ALREADY<br/>KNOW.</div><div className="side-whisper side-whisper-right">SOME<br/>QUESTIONS<br/>FIND<br/>YOU.</div><div className="hero-copy"><p>FRACTURE PRESENTS · THE SHADOW DECK</p><h1><span className="sr-only">The Fold</span><span className="title-wordmark" aria-hidden="true"/></h1><div className="hero-tagline">Truth lives in the shadows.</div><span>Seventy-eight cards. One honest question.<br/> A reading built around the pattern beneath the surface.</span><MoonDivider/><div className={`runtime-badge ${dbState==='checking'?'checking':'ok'}`} role="status"><i/>{dbState==='checking'?'PREPARING YOUR READING':dbState==='device-local'?'READY WHEN YOU ARE':'ORACLE ONLINE'}</div></div></header>}

  {!['fortune','dream'].includes(tab)&&<nav className="tabs mockup-tabs" aria-label="Reading navigation"><button className={tab==='read'&&!quickTool?'active':''} onClick={enterFold}> <NavIcon name="eye"/>Begin reading</button><button onClick={()=>setTab('fortune')}> <NavIcon name="fortune"/>Fortune teller</button></nav>}

  <main id="reading-content" tabIndex="-1">
  {tab==='read'&&!quickTool&&<aside className="support-invitation"><div><strong>Help The Fold grow.</strong><span>Discover the independent work behind the magic.</span></div><PageLink href="/support" onNavigate={()=>setTab('support')}><NavIcon name="support"/>Support The Fold<NavIcon name="arrow"/></PageLink></aside>}
  <QuickMysticTools profile={form} mode={quickTool} onClose={enterFold} onStartReading={enterFold} onAddBirthDate={()=>focusProfile('reading-birthday')}/>
  {unseenReading&&reading&&<div className="notice-banner reading-ready-notice" role="status"><span>Your tarot reading is ready.</span><button className="secondary-button" onClick={viewReading}>View my reading</button></div>}
  {loading&&(tab!=='read'||quickTool)&&<div className="notice-banner" role="status">Your tarot reading is being prepared.</div>}
  {error&&(tab!=='read'||quickTool)&&<div className="error-banner reading-ready-notice" role="alert"><span>{error}</span><button className="secondary-button" onClick={enterFold}>Return to reading</button></div>}
  <PageBoundary key={tab}><Suspense fallback={<PageLoading label={pages[tab]?.label||'your page'}/>}>
  {tab==='reviews'&&<Reviews/>}
  {tab==='fortune'&&<FortuneTeller/>}
  {tab==='dream'&&<DreamJournal value={dreamDraft} onChange={setDreamDraft}/>}
  {tab==='support'&&<Support onReviews={()=>setTab('reviews')}/>}
  {tab==='daily'&&<DailyHoroscopes value={form} onChange={changeForm} onBirthChart={()=>setTab('natal')}/>}
  {tab==='natal'&&<BirthChartPage value={form} onChange={changeForm} onUseInReading={()=>{changeForm(f=>({...f,birthInfluence:true}));enterFold();}}/>}
  {tab==='deck'&&<DeckGallery/>}
  {tab==='learn'&&<KnowledgeGuide profile={form}/>}
  </Suspense></PageBoundary>
  {notice&&tab==='read'&&!quickTool&&<div className="notice-banner" role="status">{notice}</div>}

  {tab==='read'&&!quickTool&&<><div ref={formRef} tabIndex="-1" className="two-col reading-form-anchor mockup-grid"><div className="panel-shell panel-shell-left"><ReadingForm value={form} onChange={changeForm} onSubmit={generate} onSaveProfile={saveProfile} loading={loading} profileSaving={profileSaving} profileStatus={profileStatus} dbReady={dbReady} dbState={dbState} error={error}/></div><div className="panel-shell panel-shell-right"><RitualGuide onDeck={()=>setTab('deck')}/></div></div><div ref={readingRef} tabIndex="-1" className="reading-anchor">{reading&&<PageBoundary key={reading.readingId}><Suspense fallback={<PageLoading label="your reading"/>}><ReadingView reading={reading}/></Suspense></PageBoundary>}</div></>}

  {tab==='history'&&<HistoryPanel history={history} dbReady={dbReady} loading={historyLoading} onStartReading={enterFold} onToggleFavorite={toggleFavorite} onDelete={deleteReading}/>}
  {pages[tab]&&!['support','fortune'].includes(tab)&&!quickTool&&<section className="seo-intro"><h2>{pages[tab].heading}</h2><p>{pages[tab].text}</p></section>}
  {tab==='read'&&!quickTool&&<section className="reading-faqs" aria-labelledby="faq-heading"><div className="section-kicker">A little clarity before the cards</div><h2 id="faq-heading">Your tarot questions, answered.</h2>{readingFaqs.map(item=><details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}<p className="faq-next">Explore <PageLink href="/tarot-deck" onNavigate={()=>setTab('deck')}>all 78 tarot cards</PageLink> or visit our <PageLink href="/tarot-astrology-numerology" onNavigate={()=>setTab('learn')}>tarot, astrology and numerology guide</PageLink>.</p></section>}
  </main>
  <footer className="mockup-footer"><nav className="footer-page-links" aria-label="Explore The Fold">{Object.entries(pages).map(([id,page])=><PageLink key={id} href={page.path} onNavigate={()=>setTab(id)}>{page.label}</PageLink>)}</nav><span>FRACTURE</span><span>A DEEPER YOU AWAITS</span><span>TRUTH LIVES HERE</span><small className="developer-credit">David Northrop · Developer of FRACTURE<br/>© 2026 · All rights reserved</small></footer>
 </div>
}
