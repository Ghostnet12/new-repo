export default function ReadingForm({ value, onChange, onSubmit, onSaveProfile, loading, profileSaving, profileStatus, dbReady, dbState, error }) {
  const set = (key) => (e) => onChange({ ...value, [key]: e.target.value });
  const setChecked = (key) => (e) => onChange({ ...value, [key]: e.target.checked });
  const memoryLabel = dbReady ? 'cloud + device memory' : dbState === 'checking' ? 'checking memory…' : 'device memory';
  return <section className="panel form-panel">
    <div className="section-kicker">The threshold</div><h2>Step Into the Fold</h2>
    <p className="muted">Name and birthday are optional. Birthday can deepen the reading with zodiac, birth-card and life-path layers. Your current memory mode is <b>{memoryLabel}</b>.</p>
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
        <button className="secondary-button" type="button" disabled={loading || profileSaving} onClick={onSaveProfile}>{profileSaving ? 'Remembering…' : 'Remember My Profile'}</button>
        <small className="muted" role="status" aria-live="polite">{profileStatus || 'Kept on this device and synced to cloud memory whenever it is available.'}</small>
      </div>
      <label className="full save-toggle"><input type="checkbox" checked={Boolean(value.persist)} disabled={loading} onChange={setChecked('persist')}/><span><b>Keep this reading</b><small>{dbReady ? 'Adds this reading to your private reading history and keeps a device fallback.' : 'Keeps this reading on this device while cloud memory is unavailable.'}</small></span></label>
    </div>
    <button className="primary-button" type="button" disabled={loading || profileSaving} onClick={onSubmit}>{loading ? 'The deck is turning…' : '☾ Enter the Fold · Shuffle 78'}</button>
    <p className="muted" role="status" aria-live="polite">{loading ? 'Drawing, orienting and interpreting your cards…' : 'Every draw uses the complete 78-card Shadow Deck; reversals are included when enabled.'}</p>
    {error && <div className="error-banner">{error}</div>}
  </section>;
}
