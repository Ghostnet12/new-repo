const spreads = {
  three: ['3 Card Reading', 'Past · Present · Future'],
  shadow: ['Shadow Compass', '5 cards · Find the hidden pattern'],
  love: ['Black Rose', '5 cards · Love & connection'],
  career: ['Iron Key', '5 cards · Work & direction'],
  celtic: ['Celtic Cross', '10 cards · The complete picture']
};

export default function ReadingForm({ value, onChange, onSubmit, onSaveProfile, loading, profileSaving, profileStatus, dbReady, dbState, error }) {
  const set = key => event => onChange({ ...value, [key]: event.target.value });
  const memoryLabel = dbReady ? 'cloud + device memory' : dbState === 'checking' ? 'checking memory…' : 'device memory';
  const selectedSpread = spreads[value.spread] || spreads.three;

  return <section className="panel form-panel">
    <div className="section-kicker">Begin your reading</div>
    <h2>Your Information</h2>
    <form onSubmit={event => { event.preventDefault(); onSubmit(); }}>
      <div className="form-grid mockup-form-grid">
        <label className="full"><span>Name</span><input autoComplete="name" value={value.name} onChange={set('name')} placeholder="Enter your name" maxLength={50} /></label>
        <label><span>Gender <em>(optional)</em></span><select value={value.gender} onChange={set('gender')}><option value="">Select</option><option>Woman</option><option>Man</option><option>Non-binary</option><option>Other</option></select></label>
        <label><span>Birth Date <em>(optional)</em></span><input type="date" min="1900-01-01" max={new Date().toISOString().slice(0, 10)} autoComplete="bday" value={value.birthday} onChange={set('birthday')} /></label>

        <label className="full question-field"><span>Your Question</span><textarea value={value.question} onChange={set('question')} maxLength={500} placeholder="What would you like to know?" aria-label="Your Question" aria-describedby="question-count" /><small className="char-count" id="question-count">{value.question.length}/500</small></label>

        <label className="full spread-field"><span>Choose a Spread</span>
          <div className="spread-control">
            <svg className="spread-icon" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="11" y="4" width="22" height="31" rx="2" /><path d="m7 9-4 1 4 27 20-3M22 13l4 7-4 7-4-7z" /></svg>
            <div className="spread-copy" aria-hidden="true"><b>{selectedSpread[0]}</b><small>{selectedSpread[1]}</small></div>
            <svg className="select-chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m4 7 6 6 6-6" /></svg>
            <select aria-label="Choose a Spread" value={value.spread} onChange={set('spread')}>{Object.entries(spreads).map(([key, [name, detail]]) => <option key={key} value={key}>{name} · {detail}</option>)}</select>
          </div>
        </label>

        <button type="button" className="full oracle-toggle-row" aria-pressed={value.reversals === 'yes'} onClick={() => onChange({ ...value, reversals: value.reversals === 'yes' ? 'no' : 'yes' })}>
          <span className={`oracle-switch ${value.reversals === 'yes' ? 'on' : ''}`} aria-hidden="true"><i /></span>
          <span className="oracle-toggle-copy"><b>Include Reversed Cards</b><small>Shows hidden energies and blockages</small></span>
        </button>
        <button type="button" className="full oracle-toggle-row" aria-pressed={value.birthInfluence !== false} onClick={() => onChange({ ...value, birthInfluence: value.birthInfluence === false })}>
          <span className={`oracle-switch ${value.birthInfluence !== false ? 'on' : ''}`} aria-hidden="true"><i /></span>
          <span className="oracle-toggle-copy"><b>Include Personal Symbolism</b><small>Connects your birth card, approximate Sun sign and numerology</small></span>
        </button>
        <p className="full symbolism-note">Name and birth date are optional. Name numerology uses the name entered; a full birth name gives the traditional Expression basis. Gender never assigns personality traits. Birth-date astrology is an approximate Sun-sign reading.</p>
      </div>

      <button className="primary-button draw-button" type="submit" disabled={loading || profileSaving}>
        <svg viewBox="0 0 52 34" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M2 17S12 3 26 3s24 14 24 14-10 14-24 14S2 17 2 17Z" /><circle cx="26" cy="17" r="9" fill="currentColor" /><circle cx="29" cy="14" r="2.4" fill="#eccc8c" stroke="none" /></svg>
        <span>{loading ? 'THE DECK IS TURNING…' : 'DRAW THE CARDS'}</span>
      </button>
      <div className="lift-veil-label">LIFT EVERY VEIL</div>
      <p className={`muted draw-status ${loading ? '' : 'sr-only'}`} role="status" aria-live="polite">{loading ? 'Drawing, orienting and interpreting your cards…' : 'Every draw uses the complete 78-card Shadow Deck.'}</p>

      <details className="reading-options">
        <summary>Personalize & remember this reading</summary>
        <div className="form-grid">
          <label><span>Focus</span><select value={value.focus} onChange={set('focus')}><option value="general">General</option><option value="love">Love / relationship</option><option value="career">Career / money</option><option value="decision">A decision</option><option value="healing">Healing / closure</option><option value="growth">Personal growth</option></select></label>
          <label><span>Need most</span><select value={value.need} onChange={set('need')}><option value="clarity">Clarity</option><option value="direction">Direction</option><option value="closure">Closure</option><option value="courage">Courage</option><option value="understanding">Understanding</option></select></label>
          <label className="full save-toggle"><input type="checkbox" checked={Boolean(value.persist)} disabled={loading} onChange={event => onChange({ ...value, persist: event.target.checked })} /><span><b>Keep this reading</b><small>{dbReady ? 'Save to private history with a device fallback.' : 'Save this reading on this device.'}</small></span></label>
          <div className="full profile-save-row"><button className="secondary-button" type="button" disabled={loading || profileSaving} onClick={onSaveProfile}>{profileSaving ? 'Remembering…' : 'Remember My Profile'}</button><small className="muted" role="status" aria-live="polite">{profileStatus || `Memory mode: ${memoryLabel}.`}</small></div>
        </div>
      </details>
    </form>
    {error && <div className="error-banner" role="alert">{error}</div>}
  </section>;
}
