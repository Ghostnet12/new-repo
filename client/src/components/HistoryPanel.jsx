export default function HistoryPanel({ history, dbReady, onToggleFavorite, onDelete }) {
  return <section className="panel history-panel"><div className="section-kicker">Anonymous private history</div><h2>Past Readings</h2>
    {!dbReady && <p className="muted">Connect MongoDB Atlas to persist readings. Guest readings still work without a database.</p>}
    {dbReady && !history.length && <p className="muted">No saved readings yet. Saving is opt-in from the Reading tab.</p>}
    <div className="history-list">{history.map(r => <article key={r._id}><div className="history-top"><div><b>{r.spreadName}</b><small>{new Date(r.createdAt).toLocaleString()}</small></div><div className="history-actions"><button type="button" onClick={()=>onToggleFavorite(r)} aria-label={r.favorite?'Remove favorite':'Mark favorite'}>{r.favorite?'★':'☆'}</button><button type="button" className="danger" onClick={()=>onDelete(r)}>Delete</button></div></div><span>{r.question || 'General reading'}</span></article>)}</div>
  </section>;
}
