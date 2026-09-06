export default function HistoryPanel({ history, dbReady }) {
  return <section className="panel history-panel"><div className="section-kicker">MongoDB reading history</div><h2>Past Readings</h2>
    {!dbReady && <p className="muted">Connect MongoDB Atlas to persist readings across sessions. The app still works in guest mode.</p>}
    {dbReady && !history.length && <p className="muted">No saved readings yet.</p>}
    <div className="history-list">{history.map(r => <article key={r._id}><div><b>{r.spreadName}</b><small>{new Date(r.createdAt).toLocaleString()}</small></div><span>{r.question || 'General reading'}</span></article>)}</div>
  </section>;
}
