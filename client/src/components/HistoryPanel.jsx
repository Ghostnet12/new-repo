import NavIcon from './NavIcon.jsx';

export default function HistoryPanel({ history, dbReady, onToggleFavorite, onDelete }) {
  return <section className="panel history-panel" aria-labelledby="history-title">
    <div className="collection-heading"><div><div className="section-kicker">Your reading journal</div><h2 id="history-title">Past readings</h2></div><span className="collection-count">{history.length} saved</span></div>
    <p className="collection-intro">A question can look different with a little distance.</p>
    {!dbReady && <p className="history-storage"><NavIcon name="history" />Readings saved on this device stay in this browser.</p>}
    {!history.length ? <div className="history-empty"><NavIcon name="history" /><h3>Your first page is still unwritten.</h3><p>Choose “Keep this reading” before you draw the cards. Your saved questions will be here when you want to return.</p></div> :
      <div className="history-list">{history.map(r => <article key={r._id || r.localId}>
        <div className="history-top"><div><small><time dateTime={r.createdAt}>{new Date(r.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</time> · {r._local ? 'On this device' : 'Synced'}</small><h3>{r.spreadName}</h3></div>
          <div className="history-actions"><button type="button" className={r.favorite ? 'is-favorite' : ''} onClick={() => onToggleFavorite(r)} aria-label={r.favorite ? 'Remove favorite' : 'Mark favorite'} aria-pressed={Boolean(r.favorite)}><NavIcon name="reviews" /></button><button type="button" className="danger" onClick={() => onDelete(r)}>Delete</button></div>
        </div><p className="history-question">{r.question ? `“${r.question}”` : 'A general reading'}</p>
      </article>)}</div>}
  </section>;
}
