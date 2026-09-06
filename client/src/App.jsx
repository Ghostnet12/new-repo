import { useEffect, useMemo, useState } from 'react';
import { api } from './lib/api.js';
import { getClientId } from './lib/clientId.js';
import ReadingForm from './components/ReadingForm.jsx';
import ReadingView from './components/ReadingView.jsx';
import DeckGallery from './components/DeckGallery.jsx';
import HistoryPanel from './components/HistoryPanel.jsx';

const initialForm = { name:'', gender:'', birthday:'', spread:'three', focus:'general', need:'clarity', reversals:'yes', question:'' };
export default function App() {
  const clientId = useMemo(getClientId, []);
  const [tab, setTab] = useState('read'); const [form, setForm] = useState(initialForm); const [deck, setDeck] = useState([]); const [reading, setReading] = useState(null); const [history, setHistory] = useState([]); const [dbReady, setDbReady] = useState(false); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  useEffect(() => { (async()=>{ try { const [health, deckData] = await Promise.all([api('/api/health'), api('/api/deck')]); setDbReady(health.database === 'connected'); setDeck(deckData.cards); if (health.database === 'connected') { const h = await api(`/api/readings/${clientId}?limit=12`); setHistory(h.readings); const p = await api(`/api/profiles/${clientId}`).catch(()=>null); if (p?.profile) setForm(f => ({...f, ...p.profile, spread:p.profile.preferredSpread || f.spread})); } } catch(e){ setError(e.message); } })(); }, [clientId]);
  const generate = async () => { setLoading(true); setError(''); try { const result = await api('/api/readings/generate',{method:'POST',body:JSON.stringify({clientId, profile:{name:form.name,gender:form.gender,birthday:form.birthday,preferredSpread:form.spread}, question:form.question, spread:form.spread, focus:form.focus, need:form.need, reversals:form.reversals==='yes'})}); setReading(result); setDbReady(result.database === 'connected'); if (result.persisted) { const h=await api(`/api/readings/${clientId}?limit=12`); setHistory(h.readings); } setTab('read'); } catch(e){setError(e.message);} finally{setLoading(false);} };
  return <div className="app-shell">
    <header className="hero"><div className="ornament">✦ ☾ ✧ ♱ ✧ ☽ ✦</div><p>FRACTURE · THE SHADOW DECK</p><h1>The Complete 78</h1><span>React experience · Express reading engine · MongoDB persistence · Node runtime</span></header>
    <nav className="tabs"><button className={tab==='read'?'active':''} onClick={()=>setTab('read')}>Reading</button><button className={tab==='deck'?'active':''} onClick={()=>setTab('deck')}>Full Deck</button><button className={tab==='history'?'active':''} onClick={()=>setTab('history')}>History</button></nav>
    {error && <div className="error-banner">{error}</div>}
    {tab==='read' && <><div className="two-col"><ReadingForm value={form} onChange={setForm} onSubmit={generate} loading={loading} dbReady={dbReady}/><section className="panel architecture-card"><div className="section-kicker">MERN runtime</div><h2>Built to Grow</h2><p>Readings are generated on the server. The browser handles presentation and card reveals. MongoDB stores profiles and reading history when connected.</p><ul><li>78-card server-owned deck data</li><li>Major/Minor, suit, rank, court and reversal analysis</li><li>Guest mode if the database is unavailable</li><li>Mobile-first gothic UI</li><li>API validation, rate limits and security headers</li></ul></section></div><ReadingView reading={reading}/></>}
    {tab==='deck' && <DeckGallery deck={deck}/>} {tab==='history' && <HistoryPanel history={history} dbReady={dbReady}/>}<footer>FRACTURE Shadow Deck · MERN Architecture v2</footer>
  </div>;
}
