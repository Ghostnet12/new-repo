export default function ReadingForm({ value, onChange, onSubmit, onSaveProfile, loading, profileSaving, profileStatus, dbReady, dbState, error }) {
  const set = (key) => (e) => onChange({ ...value, [key]: e.target.value });
  const setChecked = (key) => (e) => onChange({ ...value, [key]: e.target.checked });
  const dbLabel = dbReady ? 'connected' : dbState === 'not-configured' ? 'not configured on this deployment' : dbState === 'disconnected' ? 'connection failed — retry available' : dbState === 'checking' ? 'checking connection…' : 'currently unavailable';
  return <section className="panel form-panel">
    <div className="section-kicker">Personalized reading</div><h2>Enter the Querent</h2>
    <p className="muted">Name and birthday are optional. MongoDB is <b>{dbLabel}</b>. Tarot readings still work even when saving is unavailable.</p>
    <div className="form-grid">
      <label className="full"><span>Name</span><input value={value.name} onChange={set('name')} placeholder="Name (optional)" maxLength={50}/></label>
      <label><span>Gender</span><select value={value.gender} onChange={set('gender')}><option value="">Prefer not to say</option><option>Woman</option><option>Man</option><option>Non-binary</option><option>Other</option></select></label>
      <label><span>Birthday</span><input type="date" value={value.birthday} onChange={set('birthday')} /></label>
      <label><span>Spread</span><select value={value.spread} onChange={set('spread')}><option value="three">Three Veils · 3</option><option value="shadow">Shadow Compass · 5</option><option value="love">Black Rose · 5</option><option value="career">Iron Key · 5</option><option value="celtic">Celtic Cross · 10</option></select></label>
      <label><span>Focus</span><select value={value.focus} onChange={set('focus')}><option value="general">General</option><option value="love">Love / relationship</option><option value="career">Career / money</option><option value="decision">A decision</option><option value="healing">Healing / closure</option><option value="growth">Personal growth</option></select></label>
      <label><span>Need most</span><select value={value.need} onChange={set('need')}><option value="clarity">Clarity</option><option value="direction">Direction</option><option value="closure">Closure</option><option value="courage">Courage</option><option value="understanding">Understanding</option></select></label>
      <label><span>Reversals</span><select value={value.reversals} onChange={set('reversals')}><option value="yes">Enabled</option><option value="no">Upright only</option></select></label>
      <label className="full"><span>Question / intention</span><input value={value.question} onChange={set('question')} maxLength={180} placeholder="What do I most need to understand right now?" /></label>
      <div className="full profile-save-row">
        <button className="secondary-button" type="button" disabled={loading || profileSaving} onClick={onSaveProfile}>{profileSaving ? 'Saving profile…' : 'Save Profile'}</button>
        <small className="muted" role="status" aria-live="polite">{profileStatus || 'Saves your name, gender, birthday and preferred spread to MongoDB immediately.'}</small>
      </div>
      <label className="full save-toggle"><input type="checkbox" checked={Boolean(value.persist)} disabled={loading} onChange={setChecked('persist')}/><span><b>Also save this reading</b><small>{dbReady ? 'Stores this reading in MongoDB. Your browser keeps the anonymous access token.' : 'You can select this now. The app will retry MongoDB when you generate the reading; if saving fails, the reading still appears normally.'}</small></span></label>
    </div>
    <button className="primary-button" type="button" disabled={loading || profileSaving} onClick={onSubmit}>{loading ? 'Shuffling…' : '☾ Shuffle the Full 78-Card Deck'}</button>
    <p className="muted" role="status" aria-live="polite">{loading ? 'Drawing and interpreting your cards…' : 'After you tap Shuffle, the page will jump directly to your reading.'}</p>
    {error && <div className="error-banner">{error}</div>}
  </section>;
}
