export default function HistoryPanel({ history, dbReady, onToggleFavorite, onDelete }) {
  return <section className="panel history-panel"><div className="section-kicker">Saved history</div><h2>Past Readings</h2>
    {!dbReady && <p className="muted">Cloud sync is unavailable, so saved readings are kept on this device. MongoDB entries will appear here whenever the database is connected.</p>}
    {!history.length && <p className="muted">No saved readings yet. Turn on “Also save this reading” before you shuffle.</p>}
    <div className="history-list">{history.map(r => <article key={r._id || r.localId}><div className="history-top"><div><b>{r.spreadName}</b><small>{new Date(r.createdAt).toLocaleString()} · {r._local ? 'This device' : 'MongoDB'}</small></div><div className="history-actions"><button type="button" onClick={()=>onToggleFavorite(r)} aria-label={r.favorite?'Remove favorite':'Mark favorite'}>{r.favorite?'★':'☆'}</button><button type="button" className="danger" onClick={()=>onDelete(r)}>Delete</button></div></div><span>{r.question || 'General reading'}</span></article>)}</div>
  </section>;
}
