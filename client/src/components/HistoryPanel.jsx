export default function HistoryPanel({ history, dbReady, onToggleFavorite, onDelete }) {
  return <section className="panel history-panel"><div className="section-kicker">Reading memory</div><h2>Past Readings</h2>
    {!dbReady && <p className="muted">Cloud memory is quiet right now, so kept readings remain safely on this device.</p>}
    {!history.length && <p className="muted">No kept readings yet. Turn on “Keep this reading” before you enter the Fold.</p>}
    <div className="history-list">{history.map(r => <article key={r._id || r.localId}><div className="history-top"><div><b>{r.spreadName}</b><small>{new Date(r.createdAt).toLocaleString()} · {r._local ? 'Device memory' : 'Cloud memory'}</small></div><div className="history-actions"><button type="button" onClick={()=>onToggleFavorite(r)} aria-label={r.favorite?'Remove favorite':'Mark favorite'}>{r.favorite?'★':'☆'}</button><button type="button" className="danger" onClick={()=>onDelete(r)}>Delete</button></div></div><span>{r.question || 'General reading'}</span></article>)}</div>
  </section>;
}
