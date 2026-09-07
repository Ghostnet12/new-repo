import { useEffect, useRef, useState } from 'react';
import { api } from './lib/api.js';
import { deleteLocalReading, generateLocalReading, loadLocalHistory, loadLocalProfile, saveLocalProfile, saveLocalReading, toggleLocalFavorite } from './lib/localFallback.js';
import ReadingForm from './components/ReadingForm.jsx';
import ReadingView from './components/ReadingView.jsx';
import HistoryPanel from './components/HistoryPanel.jsx';

const initialForm = { name:'', gender:'', birthday:'', spread:'three', focus:'general', need:'clarity', reversals:'yes', question:'', persist:false };

export default function App() {
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

  useEffect(() => {
    const saved = loadLocalProfile();
    if (saved) setForm(f => ({ ...f, name:saved.name || '', gender:saved.gender || '', birthday:saved.birthday || '', spread:saved.preferredSpread || f.spread }));
    mergeHistory([]);
    (async () => {
      const health = await api('/api/health').catch(() => null);
      if (!health) {
        setDbState('device-local'); setDbReady(false);
        setNotice('The cloud path is quiet. The Fold has switched to its protected device oracle, so readings and local saves still work here.');
        return;
      }
      const status = health.database || 'unknown';
      setDbState(status); setDbReady(status === 'connected');
      if (status === 'connected') {
        try {
          const [h, p] = await Promise.all([api('/api/readings?limit=12'), api('/api/profile').catch(() => null)]);
          mergeHistory(h.readings || []);
          if (p?.profile) setForm(f => ({ ...f, name:p.profile.name || f.name, gender:p.profile.gender || f.gender, birthday:p.profile.birthday || f.birthday, spread:p.profile.preferredSpread || f.spread }));
        } catch { mergeHistory([]); }
      } else {
        setNotice('Cloud memory is unavailable right now. The Fold will keep saved readings on this device instead.');
      }
    })();
  }, []);

  const saveProfile = async () => {
    setProfileSaving(true); setProfileStatus(''); setError('');
    const profile = saveLocalProfile({ name:form.name, gender:form.gender, birthday:form.birthday, preferredSpread:form.spread });
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
    setLoading(true); setProfileStatus(''); setError(''); setNotice('');
    let result;
    let usedFallback = false;
    try {
      result = await api('/api/readings/generate', { method:'POST', body:JSON.stringify({ persist:Boolean(form.persist), profile:{ name:form.name, gender:form.gender, birthday:form.birthday, preferredSpread:form.spread }, question:form.question, spread:form.spread, focus:form.focus, need:form.need, reversals:form.reversals === 'yes' }) });
      const status = result.database || 'unknown';
      setDbState(status); setDbReady(status === 'connected');
    } catch {
      result = generateLocalReading(form);
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
      <div className="ornament">✦ ☾ ✧ ♱ ✧ ☽ ✦</div>
      <p>FRACTURE PRESENTS · THE SHADOW DECK</p>
      <h1>The Fold</h1>
      <div className="hero-tagline">Truth lives in the shadows.</div>
      <span>Seventy-eight cards. One honest question. A reading built around the pattern beneath the surface.</span>
      <div className={`runtime-badge ${dbReady ? 'ok' : 'warn'}`}>{dbReady ? 'ORACLE ONLINE' : 'DEVICE ORACLE ACTIVE'}</div>
    </header>
    <nav className="tabs">
      <button className={tab==='read'?'active':''} onClick={()=>setTab('read')}>Enter The Fold</button>
      <a className="tab-link" href="/deck.html">Shadow Deck</a>
      <button className={tab==='history'?'active':''} onClick={()=>setTab('history')}>Past Readings</button>
    </nav>
    {notice && <div className="notice-banner">{notice}</div>}
    {error && <div className="error-banner">{error}</div>}
    {tab==='read' && <><div className="two-col"><ReadingForm value={form} onChange={setForm} onSubmit={generate} onSaveProfile={saveProfile} loading={loading} profileSaving={profileSaving} profileStatus={profileStatus} dbReady={dbReady} dbState={dbState} error={error}/><section className="panel ritual-panel"><div className="section-kicker">Before the draw</div><h2>Open the Fold</h2><p className="ritual-intro">The strongest readings begin with a question that has some weight to it. You do not need perfect wording. You only need to know what keeps pulling at you.</p><ol className="ritual-steps"><li><span>01</span><div><b>Name the tension.</b><small>Love, money, a choice, closure, a fear, or something you cannot quite shake.</small></div></li><li><span>02</span><div><b>Choose the lens.</b><small>Your spread decides how deeply the deck cuts into the question.</small></div></li><li><span>03</span><div><b>Ask for direction, not permission.</b><small>The deck reads patterns and pressure points. It does not hand your choices away.</small></div></li><li><span>04</span><div><b>Draw the cards.</b><small>Reversals, birth-card layers and the full 78-card deck shape the final interpretation.</small></div></li></ol><div className="ritual-note">Ask about the pattern — not the verdict.</div></section></div><div ref={readingRef} className="reading-anchor"><ReadingView reading={reading}/></div></>}
    {tab==='history' && <HistoryPanel history={history} dbReady={dbReady} onToggleFavorite={toggleFavorite} onDelete={deleteReading}/>}<footer>THE FOLD · Shadow Deck by FRACTURE · Complete 78</footer>
  </div>;
}
