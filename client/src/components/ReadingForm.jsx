export default function ReadingForm({ value, onChange, onSubmit, loading, dbReady }) {
  const set = (key) => (e) => onChange({ ...value, [key]: e.target.value });
  return <section className="panel form-panel">
    <div className="section-kicker">Personalized reading</div><h2>Enter the Querent</h2>
    <p className="muted">Name and birthday are optional. MongoDB persistence is <b>{dbReady ? 'online' : 'guest-only'}</b>.</p>
    <div className="form-grid">
      <label className="full"><span>Name</span><input value={value.name} onChange={set('name')} placeholder="Name (optional)" /></label>
      <label><span>Gender</span><select value={value.gender} onChange={set('gender')}><option value="">Prefer not to say</option><option>Woman</option><option>Man</option><option>Non-binary</option><option>Other</option></select></label>
      <label><span>Birthday</span><input type="date" value={value.birthday} onChange={set('birthday')} /></label>
      <label><span>Spread</span><select value={value.spread} onChange={set('spread')}><option value="three">Three Veils · 3</option><option value="shadow">Shadow Compass · 5</option><option value="love">Black Rose · 5</option><option value="career">Iron Key · 5</option><option value="celtic">Celtic Cross · 10</option></select></label>
      <label><span>Focus</span><select value={value.focus} onChange={set('focus')}><option value="general">General</option><option value="love">Love / relationship</option><option value="career">Career / money</option><option value="decision">A decision</option><option value="healing">Healing / closure</option><option value="growth">Personal growth</option></select></label>
      <label><span>Need most</span><select value={value.need} onChange={set('need')}><option value="clarity">Clarity</option><option value="direction">Direction</option><option value="closure">Closure</option><option value="courage">Courage</option><option value="understanding">Understanding</option></select></label>
      <label><span>Reversals</span><select value={value.reversals} onChange={set('reversals')}><option value="yes">Enabled</option><option value="no">Upright only</option></select></label>
      <label className="full"><span>Question / intention</span><input value={value.question} onChange={set('question')} placeholder="What do I most need to understand right now?" /></label>
    </div>
    <button className="primary-button" type="button" disabled={loading} onClick={onSubmit}>{loading ? 'Shuffling…' : '☾ Shuffle the Full 78-Card Deck'}</button>
  </section>;
}
