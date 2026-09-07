import { useEffect, useRef, useState } from 'react';
import { api } from './lib/api.js';
import { deleteLocalReading, generateLocalReading, loadLocalHistory, loadLocalProfile, localDeck, saveLocalProfile, saveLocalReading, toggleLocalFavorite } from './lib/localFallback.js';
import ReadingForm from './components/ReadingForm.jsx';
import ReadingView from './components/ReadingView.jsx';
import DeckGallery from './components/DeckGallery.jsx';
import HistoryPanel from './components/HistoryPanel.jsx';

const initialForm = { name:'', gender:'', birthday:'', spread:'three', focus:'general', need:'clarity', reversals:'yes', question:'', persist:false };

export default function App() {
  const readingRef = useRef(null);
  const [tab, setTab] = useState('read');
  const [form, setForm] = useState(initialForm);
  const [deck, setDeck] = useState(localDeck);
  const [reading, setReading] = useState(null);
  const [history, setHistory] = useState([]);
  const [dbReady, setDbReady] = useState(false);
  const [dbState, setDbState] = useState('checking');
  const [loading, setLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileStatus, setProfileStatus] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [apiVersion, setApiVersion] = useState('checking');

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

  useEffect(() => {
    const saved = loadLocalProfile();
    if (saved) setForm(f => ({ ...f, name:saved.name || '', gender:saved.gender || '', birthday:saved.birthday || '', spread:saved.preferredSpread || f.spread }));
    mergeHistory([]);
    (async () => {
      const deckData = await api('/api/deck').catch(() => null);
      if (deckData?.cards?.length === 78) setDeck(deckData.cards);
      const health = await api('/api/health').catch(() => null);
      if (!health) {
        setDbState('device-local'); setDbReady(false); setApiVersion('device-fallback');
        setNotice('Server connection is unavailable, so the deck is running in protected device mode. Shuffle and saves still work on this device.');
        return;
      }
      const status = health.database || 'unknown';
      setDbState(status); setDbReady(status === 'connected'); setApiVersion(health.apiVersion || 'legacy');
      if (status === 'connected') {
        try {
          const [h, p] = await Promise.all([api('/api/readings?limit=12'), api('/api/profile').catch(() => null)]);
          mergeHistory(h.readings || []);
          if (p?.profile) setForm(f => ({ ...f, name:p.profile.name || f.name, gender:p.profile.gender || f.gender, birthday:p.profile.birthday || f.birthday, spread:p.profile.preferredSpread || f.spread }));
        } catch { mergeHistory([]); }
      } else {
        setNotice('Cloud persistence is unavailable right now. Device-local saving is active automatically.');
      }
    })();
  }, []);

  const saveProfile = async () => {
    setProfileSaving(true); setProfileStatus(''); setError('');
    const profile = saveLocalProfile({ name:form.name, gender:form.gender, birthday:form.birthday, preferredSpread:form.spread });
    setProfileStatus('Profile saved on this device.');
    try {
      const result = await api('/api/profile', { method:'PUT', body:JSON.stringify(profile) });
      const status = result.database || 'connected';
      setDbState(status); setDbReady(status === 'connected');
      setProfileStatus(status === 'connected' ? 'Profile saved on this device and synced to MongoDB.' : 'Profile saved on this device. Cloud sync is unavailable.');
    } catch (e) {
      setDbReady(false);
      setProfileStatus(`Profile saved on this device. Cloud sync is unavailable (${e.message}).`);
    } finally { setProfileSaving(false); }
  };

  const generate = async () => {
    setLoading(true); setProfileStatus(''); setError(''); setNotice('');
    let result;
    let usedFallback = false;
    try {
      result = await api('/api/readings/generate', { method:'POST', body:JSON.stringify({ persist:Boolean(form.persist), profile:{ name:form.name, gender:form.gender, birthday:form.birthday, preferredSpread:form.spread }, question:form.question, spread:form.spread, focus:form.focus, need:form.need, reversals:form.reversals === 'yes' }) });
      const status = result.database || 'unknown';
      setDbState(status); setDbReady(status === 'connected'); setApiVersion(result.apiVersion || apiVersion);
    } catch (e) {
      result = generateLocalReading(form);
      usedFallback = true;
      setDbState('device-local'); setDbReady(false); setApiVersion(result.apiVersion);
      setNotice(`Server request failed (${e.message}), so this reading was generated securely on your device instead.`);
    }

    if (form.persist) {
      if (!result.persisted) {
        saveLocalReading(result);
        result = { ...result, localSaved:true };
      }
      if (result.persisted) await refreshHistory(true); else mergeHistory([]);
    }

    setReading(result);
    if (!usedFallback && form.persist && !result.persisted) setNotice('The reading was generated normally and saved on this device. MongoDB cloud saving was unavailable.');
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
    <header className="hero">
      <div className="ornament">✦ ☾ ✧ ♱ ✧ ☽ ✦</div><p>FRACTURE · THE SHADOW DECK</p><h1>The Complete 78</h1>
      <span>Vercel reading engine · MongoDB Atlas · resilient device fallback · 78 individual 4K card assets</span>
      <div className={`runtime-badge ${dbReady ? 'ok' : 'warn'}`}>AUTONOMOUS FIX 3.1 · API {apiVersion} · {dbReady ? 'MongoDB connected' : 'device fallback ready'}</div>
    </header>
    <nav className="tabs"><button className={tab==='read'?'active':''} onClick={()=>setTab('read')}>Reading</button><button className={tab==='deck'?'active':''} onClick={()=>setTab('deck')}>Full Deck</button><button className={tab==='history'?'active':''} onClick={()=>setTab('history')}>History</button></nav>
    {notice && <div className="notice-banner">{notice}</div>}
    {error && <div className="error-banner">{error}</div>}
    {tab==='read' && <><div className="two-col"><ReadingForm value={form} onChange={setForm} onSubmit={generate} onSaveProfile={saveProfile} loading={loading} profileSaving={profileSaving} profileStatus={profileStatus} dbReady={dbReady} dbState={dbState} error={error}/><section className="panel architecture-card"><div className="section-kicker">Resilient runtime</div><h2>Built to Keep Working</h2><p>The server is preferred for readings and MongoDB sync, but the experience no longer stops when either is unavailable.</p><ul><li>Canonical 78-card reading logic</li><li>Server-first cryptographic shuffle</li><li>Secure browser cryptographic fallback</li><li>Profile and reading device-local fallback</li><li>MongoDB synchronization whenever available</li><li>Individual first-party 4K card assets</li></ul></section></div><div ref={readingRef} className="reading-anchor"><ReadingView reading={reading}/></div></>}
    {tab==='deck' && <DeckGallery deck={deck}/>} {tab==='history' && <HistoryPanel history={history} dbReady={dbReady} onToggleFavorite={toggleFavorite} onDelete={deleteReading}/>}<footer>FRACTURE Shadow Deck · Autonomous Runtime 3.1</footer>
  </div>;
}
