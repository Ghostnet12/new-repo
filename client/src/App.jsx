import { calculateNatal, natalDefaults } from '../../server/src/tarot/natal.js';
import NatalForm from './components/NatalForm.jsx';
import NatalChart from './components/NatalChart.jsx';
import { validBirthDate } from '../../server/src/tarot/interpretation.js';
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

const initialForm = { name:'', gender:'', birthday:'', natal:{...natalDefaults}, birthInfluence:true, spread:'three', focus:'general', need:'clarity', reversals:'yes', question:'', persist:false };

export default function App() {
  const formRef = useRef(null);
  const readingRef = useRef(null);
  const [tab, setTab] = useState('read');
  const [form, setForm] = useState(initialForm);
  const [reading, setReading] = useState(null);
  const [history, setHistory] = useState([]);
  const [dbReady, setDbReady] = useState(false);
  const [dbState, setDbState] = useState('checking');
  const [loading, setLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileStatus, setProfileStatus] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const mergeHistory = (remote = []) => {
    const local = loadLocalHistory();
    const remoteTagged = (remote || []).map(x => ({ ...x, _local: false }));
    setHistory([...remoteTagged, ...local]);
  };

  const refreshHistory = async (forceRemote = false) => {
    if (!dbReady && !forceRemote) { mergeHistory([]); return; }
    try { const h = await api('/api/readings?limit=12'); mergeHistory(h.readings || []); }
    catch { mergeHistory([]); }
  };

  const enterFold = () => {
    setTab('read');
    requestAnimationFrame(() => setTimeout(() => formRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 50));
  };

  useEffect(() => {
    const saved = loadLocalProfile();
    if (saved) setForm(f => ({ ...f, name:saved.name || '', gender:saved.gender || '', birthday:saved.birthday || '', natal:{...natalDefaults,...saved.natal}, spread:saved.preferredSpread || f.spread }));
    mergeHistory([]);
    (async () => {
      const health = await api('/api/health').catch(() => null);
      if (!health) {
        setDbState('device-local'); setDbReady(false);
        return;
      }
      const status = health.database || 'unknown';
      setDbState(status); setDbReady(status === 'connected');
      if (status === 'connected') {
        try {
          const [h, p] = await Promise.all([api('/api/readings?limit=12'), api('/api/profile').catch(() => null)]);
          mergeHistory(h.readings || []);
          if (p?.profile) setForm(f => ({ ...f, name:p.profile.name || f.name, gender:p.profile.gender || f.gender, birthday:p.profile.birthday || f.birthday, natal:p.profile.natal ? {...natalDefaults,...p.profile.natal} : f.natal, spread:p.profile.preferredSpread || f.spread }));
        } catch { mergeHistory([]); }
      }
    })();
  }, []);

  const saveProfile = async () => {
    setProfileSaving(true); setProfileStatus(''); setError('');
    const profile = saveLocalProfile({ name:form.name, gender:form.gender, birthday:form.birthday, natal:form.natal, preferredSpread:form.spread });
    setProfileStatus('Remembered on this device.');
    try {
      const result = await api('/api/profile', { method:'PUT', body:JSON.stringify(profile) });
      const status = result.database || 'connected';
      setDbState(status); setDbReady(status === 'connected');
      setProfileStatus(status === 'connected' ? 'Remembered on this device and synced to cloud memory.' : 'Remembered on this device. Cloud memory is unavailable.');
    } catch {
      setDbReady(false);
      setProfileStatus('Remembered on this device. Cloud memory is unavailable.');
    } finally { setProfileSaving(false); }
  };

  const generate = async () => {
    if (form.birthday && !validBirthDate(form.birthday)) { setError('Please enter a valid birth date between 1900 and today.'); return; }
    if (form.birthInfluence !== false && form.natal?.enabled) { const chart=calculateNatal(form); if(chart.status!=='ready') {setError(chart.message); return;} }
    setLoading(true); setProfileStatus(''); setError(''); setNotice('');
    let result;
    let usedFallback = false;
    try {
      result = await api('/api/readings/generate', { method:'POST', body:JSON.stringify({ persist:Boolean(form.persist), personalInfluence:form.birthInfluence !== false, profile:{ name:form.name, gender:form.gender, birthday:form.birthday, natal:form.natal, preferredSpread:form.spread }, question:form.question, spread:form.spread, focus:form.focus, need:form.need, reversals:form.reversals === 'yes' }) });
      const status = result.database || 'unknown';
      setDbState(status); setDbReady(status === 'connected');
    } catch (err) {
      if (err.status && err.status < 500 && err.status !== 429) {setError(err.message);setLoading(false);return;}
      try {result = generateLocalReading(form);} catch {setError('The reading could not be completed. Please check the birth details and try again.');setLoading(false);return;}
      usedFallback = true;
      setDbState('device-local'); setDbReady(false);
      setNotice('The Fold switched to its protected device oracle for this reading. Nothing was interrupted.');
    }

    if (form.persist) {
      if (!result.persisted) {
        saveLocalReading(result);
        result = { ...result, localSaved:true };
      }
      if (result.persisted) await refreshHistory(true); else mergeHistory([]);
    }

    setReading(result);
    if (!usedFallback && form.persist && !result.persisted) setNotice('Your reading was completed and remembered on this device. Cloud memory was unavailable.');
    setTab('read');
    requestAnimationFrame(() => setTimeout(() => readingRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 50));
    setLoading(false);
  };

  const toggleFavorite = async item => {
    if (item._local) {
      const locals = toggleLocalFavorite(item.localId);
      setHistory(h => [...h.filter(x => !x._local), ...locals]);
      return;
    }
    try {
      const r = await api(`/api/readings/item/${item._id}`, { method:'PATCH', body:JSON.stringify({ favorite:!item.favorite }) });
      setHistory(h => h.map(x => x._id === item._id ? { ...x, favorite:r.reading.favorite } : x));
    } catch (e) { setError(e.message); }
  };

  const deleteReading = async item => {
    if (item._local) {
      const locals = deleteLocalReading(item.localId);
      setHistory(h => [...h.filter(x => !x._local), ...locals]);
      return;
    }
    try { await api(`/api/readings/item/${item._id}`, { method:'DELETE' }); setHistory(h => h.filter(x => x._id !== item._id)); }
    catch (e) { setError(e.message); }
  };

  return <div className="app-shell">
    <header className="hero fold-hero">
      <HeroDecor />
      <div className="side-whisper side-whisper-left">LOOK<br/>DEEPER.<br/>YOU<br/>ALREADY<br/>KNOW.</div>
      <div className="side-whisper side-whisper-right">SOME<br/>QUESTIONS<br/>FIND<br/>YOU.</div>
      <div className="hero-copy">
        <p>FRACTURE PRESENTS · THE SHADOW DECK</p>
        <h1><span className="sr-only">The Fold</span><span className="title-wordmark" aria-hidden="true" /></h1>
        <div className="hero-tagline">Truth lives in the shadows.</div>
        <span>Seventy-eight cards. One honest question.<br/> A reading built around the pattern beneath the surface.</span>
        <MoonDivider />
        <div className={`runtime-badge ${dbState === 'checking' ? 'checking' : 'ok'}`} role="status"><i aria-hidden="true" />{dbState === 'checking' ? 'CONNECTING TO THE ORACLE' : dbState === 'device-local' ? 'DEVICE ORACLE ACTIVE' : 'ORACLE ONLINE'}</div>
      </div>
    </header>

    <nav className="tabs mockup-tabs" aria-label="Reading navigation">
      <button className={tab==='read'?'active':''} aria-current={tab==='read' ? 'page' : undefined} onClick={enterFold}><span className="tab-icon fold-sigil" aria-hidden="true" /> Enter The Fold</button>
      <button className={tab==='history'?'active':''} aria-current={tab==='history' ? 'page' : undefined} onClick={()=>setTab('history')}><svg className="tab-icon" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M20 9C14 5 8 5 3 7v27c6-3 12-2 17 1 5-3 11-4 17-1V7c-5-2-11-2-17 2Zm0 0v26" /></svg> Past Readings</button>
    </nav>

    <nav className="explore-nav" aria-label="Explore The Fold">
      <button aria-current={tab==='deck'?'page':undefined} onClick={()=>setTab('deck')}>Full Deck · 78 Cards</button>
      <button aria-current={tab==='natal'?'page':undefined} onClick={()=>setTab('natal')}>Birth Chart</button>
      <button aria-current={tab==='learn'?'page':undefined} onClick={()=>setTab('learn')}>Tarot, Astrology & Numerology</button>
    </nav>
    {tab==='natal' && <section className="panel knowledge-panel"><div className="section-kicker">Your birth sky</div><h2>Calculate Your Birth Chart</h2><NatalForm value={form} onChange={setForm} includeBirthday/><NatalChart chart={calculateNatal(form)}/><button className="secondary-button" onClick={()=>{setForm(f=>({...f,birthInfluence:true}));enterFold();}}>Use these details in a reading</button></section>}
    {tab==='deck' && <DeckGallery deck={localDeck}/>}
    {tab==='learn' && <KnowledgeGuide profile={form}/>}
    {notice && <div className="notice-banner">{notice}</div>}
    {error && <div className="error-banner">{error}</div>}

    {tab==='read' && <>
      <div ref={formRef} className="two-col reading-form-anchor mockup-grid">
        <div className="panel-shell panel-shell-left">
          <ReadingForm value={form} onChange={setForm} onSubmit={generate} onSaveProfile={saveProfile} loading={loading} profileSaving={profileSaving} profileStatus={profileStatus} dbReady={dbReady} dbState={dbState} error={error}/>
        </div>
        <div className="panel-shell panel-shell-right">
          <section className="panel ritual-panel">
            <div className="section-kicker">Before the draw</div>
            <h2>Open the Fold</h2>
            <p className="ritual-intro">The strongest readings begin with a question that has some weight to it. You do not need perfect wording. You only need to know what keeps pulling at you.</p>
            <ol className="ritual-steps">
              <li><span>01</span><div><b>Name the tension.</b><small>Love, money, a choice, closure, a fear, or something you cannot quite shake.</small></div></li>
              <li><span>02</span><div><b>Choose the lens.</b><small>Your spread decides how deeply the deck cuts into the question.</small></div></li>
              <li><span>03</span><div><b>Ask for direction, not permission.</b><small>The deck reads patterns and pressure points. It does not hand your choices away.</small></div></li>
              <li><span>04</span><div><b>Draw the cards.</b><small>Reversals, birth-card layers and the full 78-card deck shape the final interpretation.</small></div></li>
            </ol>
            <div className="ritual-note">Ask about the pattern —<br/>not the verdict.</div>
            <div className="ritual-deck-preview">
              <div className="ritual-card-stack" role="img" aria-label="The Fold Shadow Deck: gold celestial card backs on violet velvet" />
              <p className="ritual-awaits">THE<br/>SHADOW DECK<br/>AWAITS<br/><span>✧</span></p>
            </div>
          </section>
        </div>
      </div>
      <div ref={readingRef} className="reading-anchor"><ReadingView reading={reading}/></div>
    </>}

    {tab==='history' && <HistoryPanel history={history} dbReady={dbReady} onToggleFavorite={toggleFavorite} onDelete={deleteReading}/>} 

    <footer className="mockup-footer"><span>FRACTURE</span><span>A DEEPER YOU AWAITS</span><span>TRUTH LIVES HERE</span><small className="developer-credit">David Northrop · Developer of FRACTURE<br/>© 2026 · All rights reserved</small></footer>
  </div>;
}
