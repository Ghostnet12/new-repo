export default function ReadingForm({ value, onChange, onSubmit, onSaveProfile, loading, profileSaving, profileStatus, dbReady, dbState, error }) {
  const set = (key) => (e) => onChange({ ...value, [key]: e.target.value });
  const setChecked = (key) => (e) => onChange({ ...value, [key]: e.target.checked });
  const memoryLabel = dbReady ? 'cloud + device memory' : dbState === 'checking' ? 'checking memory…' : 'device memory';
  const toggleReversals = () => onChange({ ...value, reversals: value.reversals === 'yes' ? 'no' : 'yes' });
  const birthInfluence = Boolean(value.birthday);

  return <section className="panel form-panel">
    <div className="section-kicker">Begin your reading</div>
    <h2>Your Information</h2>
    <div className="form-grid mockup-form-grid">
      <label className="full"><span>Name</span><input value={value.name} onChange={set('name')} placeholder="Enter your name" maxLength={50}/></label>
      <label><span>Gender <em>(optional)</em></span><select value={value.gender} onChange={set('gender')}><option value="">Select</option><option>Woman</option><option>Man</option><option>Non-binary</option><option>Other</option></select></label>
      <label><span>Birth Date <em>(optional)</em></span><input type="date" value={value.birthday} onChange={set('birthday')} /></label>

      <label className="full question-field"><span>Your Question</span><textarea value={value.question} onChange={set('question')} maxLength={180} placeholder="What would you like to know?"/><small className="char-count">{value.question.length}/180</small></label>

      <label className="full"><span>Choose a Spread</span><select value={value.spread} onChange={set('spread')}><option value="three">3 Card Reading · Past · Present · Future</option><option value="shadow">Shadow Compass · 5 cards</option><option value="love">Black Rose · 5 cards</option><option value="career">Iron Key · 5 cards</option><option value="celtic">Celtic Cross · 10 cards</option></select></label>

      <div className="full lens-row">
        <label><span>Focus</span><select value={value.focus} onChange={set('focus')}><option value="general">General</option><option value="love">Love / relationship</option><option value="career">Career / money</option><option value="decision">A decision</option><option value="healing">Healing / closure</option><option value="growth">Personal growth</option></select></label>
        <label><span>Need most</span><select value={value.need} onChange={set('need')}><option value="clarity">Clarity</option><option value="direction">Direction</option><option value="closure">Closure</option><option value="courage">Courage</option><option value="understanding">Understanding</option></select></label>
      </div>

      <button type="button" className="full oracle-toggle-row" aria-pressed={value.reversals === 'yes'} onClick={toggleReversals}>
        <span className={`oracle-switch ${value.reversals === 'yes' ? 'on' : ''}`}><i /></span>
        <span className="oracle-toggle-copy"><b>Include Reversed Cards</b><small>Shows hidden energies and blockages</small></span>
      </button>

      <div className="full oracle-toggle-row passive" aria-label={birthInfluence ? 'Birth card influence active' : 'Birth card influence inactive until birth date is entered'}>
        <span className={`oracle-switch ${birthInfluence ? 'on' : ''}`}><i /></span>
        <span className="oracle-toggle-copy"><b>Include Birth Card Influence</b><small>{birthInfluence ? 'Your personal archetype will shape the reading' : 'Add a birth date to activate your personal archetype'}</small></span>
      </div>

      <label className="full save-toggle"><input type="checkbox" checked={Boolean(value.persist)} disabled={loading} onChange={setChecked('persist')}/><span><b>Keep this reading</b><small>{dbReady ? 'Save to private history with a device fallback.' : 'Save this reading on this device.'}</small></span></label>

      <div className="full profile-save-row">
        <button className="secondary-button" type="button" disabled={loading || profileSaving} onClick={onSaveProfile}>{profileSaving ? 'Remembering…' : 'Remember My Profile'}</button>
        <small className="muted" role="status" aria-live="polite">{profileStatus || `Memory mode: ${memoryLabel}.`}</small>
      </div>
    </div>

    <button className="primary-button draw-button" type="button" disabled={loading || profileSaving} onClick={onSubmit}>{loading ? 'THE DECK IS TURNING…' : '◉  DRAW THE CARDS'}</button>
    <div className="lift-veil-label">LIFT EVERY VEIL</div>
    <p className="muted draw-status" role="status" aria-live="polite">{loading ? 'Drawing, orienting and interpreting your cards…' : 'Every draw uses the complete 78-card Shadow Deck.'}</p>
    {error && <div className="error-banner">{error}</div>}
  </section>;
}
