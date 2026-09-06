import { useEffect, useState } from 'react';
import { api } from './lib/api.js';
import ReadingForm from './components/ReadingForm.jsx';
import ReadingView from './components/ReadingView.jsx';
import DeckGallery from './components/DeckGallery.jsx';
import HistoryPanel from './components/HistoryPanel.jsx';

const initialForm = { name:'', gender:'', birthday:'', spread:'three', focus:'general', need:'clarity', reversals:'yes', question:'', persist:false };
export default function App() {
  const [tab, setTab] = useState('read'); const [form, setForm] = useState(initialForm); const [deck, setDeck] = useState([]); const [reading, setReading] = useState(null); const [history, setHistory] = useState([]); const [dbReady, setDbReady] = useState(false); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const refreshHistory = async () => { const h = await api('/api/readings?limit=12'); setHistory(h.readings || []); };
  useEffect(() => { (async()=>{ try { const [health, deckData] = await Promise.all([api('/api/health'), api('/api/deck')]); const connected = health.database === 'connected'; setDbReady(connected); setDeck(deckData.cards); if (connected) { await refreshHistory(); const p = await api('/api/profile').catch(()=>null); if (p?.profile) setForm(f => ({...f, name:p.profile.name || '', gender:p.profile.gender || '', birthday:p.profile.birthday || '', spread:p.profile.preferredSpread || f.spread})); } } catch(e){ setError(e.message); } })(); }, []);
  const generate = async () => { setLoading(true); setError(''); try { const wantsSave = Boolean(form.persist && dbReady); const result = await api('/api/readings/generate',{method:'POST',body:JSON.stringify({persist:wantsSave, profile:{name:form.name,gender:form.gender,birthday:form.birthday,preferredSpread:form.spread}, question:form.question, spread:form.spread, focus:form.focus, need:form.need, reversals:form.reversals==='yes'})}); setReading(result); setDbReady(result.database === 'connected'); if (result.persisted) await refreshHistory(); if (wantsSave && !result.persisted) setError('The reading was generated, but it could not be saved. You can still use it normally.'); setTab('read'); } catch(e){setError(e.message);} finally{setLoading(false);} };
  const toggleFavorite = async item => { try { const r = await api(`/api/readings/item/${item._id}`,{method:'PATCH',body:JSON.stringify({favorite:!item.favorite})}); setHistory(h => h.map(x => x._id===item._id ? {...x,favorite:r.reading.favorite} : x)); } catch(e){setError(e.message);} };
  const deleteReading = async item => { try { await api(`/api/readings/item/${item._id}`,{method:'DELETE'}); setHistory(h => h.filter(x => x._id!==item._id)); } catch(e){setError(e.message);} };
  return <div className="app-shell">
    <header className="hero"><div className="ornament">✦ ☾ ✧ ♱ ✧ ☽ ✦</div><p>FRACTURE · THE SHADOW DECK</p><h1>The Complete 78</h1><span>React experience · Express reading engine · MongoDB persistence · Node runtime</span></header>
    <nav className="tabs"><button className={tab==='read'?'active':''} onClick={()=>setTab('read')}>Reading</button><button className={tab==='deck'?'active':''} onClick={()=>setTab('deck')}>Full Deck</button><button className={tab==='history'?'active':''} onClick={()=>setTab('history')}>History</button></nav>
    {error && <div className="error-banner">{error}</div>}
    {tab==='read' && <><div className="two-col"><ReadingForm value={form} onChange={setForm} onSubmit={generate} loading={loading} dbReady={dbReady}/><section className="panel architecture-card"><div className="section-kicker">MERN runtime</div><h2>Built to Grow</h2><p>Readings are generated on the server. The browser handles presentation and card reveals. MongoDB storage is optional and explicitly chosen per reading.</p><ul><li>78-card server-owned deck data</li><li>Major/Minor, suit, rank, court and reversal analysis</li><li>Guest mode if the database is unavailable</li><li>Anonymous history token is never stored raw in MongoDB</li><li>First-party card artwork</li><li>Mobile-first gothic UI</li><li>API validation, rate limits and security headers</li></ul></section></div><ReadingView reading={reading}/></>}
    {tab==='deck' && <DeckGallery deck={deck}/>} {tab==='history' && <HistoryPanel history={history} dbReady={dbReady} onToggleFavorite={toggleFavorite} onDelete={deleteReading}/>}<footer>FRACTURE Shadow Deck · MERN Architecture v2</footer>
  </div>;
}
