import { useRef } from 'react';
import { TEXT_LIMIT, TEXT_LIMIT_LABEL } from '../../../server/src/validation/limits.js';
import NatalForm from './NatalForm.jsx';
import NavIcon from './NavIcon.jsx';

const spreads = [
  { id: 'three', name: 'Three-card reading', count: '03', detail: 'Past · Present · Future' },
  { id: 'shadow', name: 'Shadow Compass', count: '05', detail: 'The pattern beneath it all' },
  { id: 'love', name: 'Black Rose', count: '05', detail: 'Love & connection' },
  { id: 'career', name: 'Iron Key', count: '05', detail: 'Work & direction' },
  { id: 'celtic', name: 'Celtic Cross', count: '10', detail: 'Explore the complete picture' }
];
const starters = [
  { label: 'A relationship', question: 'What do I need to understand about this connection?' },
  { label: 'A decision', question: 'What am I overlooking as I make this decision?' },
  { label: 'A new chapter', question: 'What am I ready to leave behind, and what comes next?' }
];

export default function ReadingForm({ value, onChange, onSubmit, onSaveProfile, loading, profileSaving, profileStatus, dbReady, error }) {
  const questionRef = useRef(null);
  const set = key => event => onChange({ ...value, [key]: event.target.value });
  return <section className="panel form-panel" aria-labelledby="reading-form-title">
    <div className="section-kicker">A moment for yourself</div>
    <h2 id="reading-form-title">Your reading begins here.</h2>
    <p className="form-intro">Bring a question. Leave a little room for discovery.</p>
    <form onSubmit={event => { event.preventDefault(); onSubmit(); }} aria-busy={loading}>
      <fieldset className="reading-fieldset" disabled={loading}>
        <legend className="step-heading"><span>01</span>Your question</legend>
        <label className="question-field primary-question">
          <span className="sr-only">Your Question</span>
          <textarea ref={questionRef} id="reading-question" value={value.question} onChange={set('question')} maxLength={TEXT_LIMIT} placeholder="What's been on your mind?" aria-describedby="question-hint question-count" />
        </label>
        <div className="question-caption"><small id="question-hint">A few honest words are enough.</small><small className="char-count" id="question-count">{value.question.length.toLocaleString()} / {TEXT_LIMIT_LABEL}</small></div>
        {!value.question && <div className="question-starters" aria-label="Question inspiration">{starters.map(starter => <button key={starter.label} type="button" onClick={() => { onChange({ ...value, question: starter.question }); questionRef.current?.focus(); }}>{starter.label}<NavIcon name="plus" /></button>)}</div>}
      </fieldset>

      <fieldset className="reading-fieldset spread-fieldset" disabled={loading}>
        <legend className="step-heading"><span>02</span>Choose your spread</legend>
        <div className="spread-choices">
          {spreads.map(spread => <label className={`spread-choice ${value.spread === spread.id ? 'is-selected' : ''}`} key={spread.id}>
            <input type="radio" name="spread" value={spread.id} checked={value.spread === spread.id} onChange={set('spread')} />
            <span className="spread-count" aria-hidden="true">{spread.count}</span>
            <span className="spread-choice-copy"><b>{spread.name}</b><small>{spread.detail}</small><span className="sr-only">{Number(spread.count)} cards</span></span>
            <span className="choice-check" aria-hidden="true"><NavIcon name="check" /></span>
          </label>)}
        </div>
      </fieldset>

      <div className="reading-settings">
        <button type="button" className="oracle-toggle-row" disabled={loading} aria-pressed={value.reversals === 'yes'} onClick={() => onChange({ ...value, reversals: value.reversals === 'yes' ? 'no' : 'yes' })}>
          <span className="oracle-toggle-copy"><b>Include reversed cards</b><small>Explore what may be hidden or held back.</small></span>
          <span className={`oracle-switch ${value.reversals === 'yes' ? 'on' : ''}`} aria-hidden="true"><i /></span>
        </button>
        <details id="personal-details" className="personal-details">
          <summary><span><NavIcon name="profile" /><b>Make it personal</b><small>Optional</small></span><NavIcon name="plus" /></summary>
          <div className="personal-details-content">
            <p>Your name and birth details add personal symbolism to the reading.</p>
            <div className="quick-personalize">
              <label htmlFor="reading-name">Name<input id="reading-name" autoComplete="name" value={value.name} onChange={set('name')} placeholder="Your name" maxLength={TEXT_LIMIT} disabled={loading} /></label>
              <label htmlFor="reading-birthday">Birth date<input id="reading-birthday" type="date" min="1900-01-01" max={new Date().toISOString().slice(0, 10)} autoComplete="bday" value={value.birthday} onChange={set('birthday')} disabled={loading} /></label>
            </div>
            <button type="button" className="oracle-toggle-row" disabled={loading} aria-pressed={value.birthInfluence !== false} onClick={() => onChange({ ...value, birthInfluence: value.birthInfluence === false })}>
              <span className="oracle-toggle-copy"><b>Use personal symbolism</b><small>Include these details in your interpretation.</small></span>
              <span className={`oracle-switch ${value.birthInfluence !== false ? 'on' : ''}`} aria-hidden="true"><i /></span>
            </button>
          </div>
        </details>
      </div>

      <label className="save-toggle save-reading-toggle"><input type="checkbox" checked={Boolean(value.persist)} disabled={loading} onChange={event => onChange({ ...value, persist: event.target.checked })} /><span><b>Keep this reading</b><small>{dbReady ? 'Save it to your private Past Readings.' : 'Save it to Past Readings on this device.'}</small></span><NavIcon name="history" /></label>
      {error && <div className="error-banner" role="alert">{error}</div>}
      <button className="primary-button draw-button" type="submit" disabled={loading || profileSaving}>
        <NavIcon name="eye" /><span>{loading ? 'Drawing your cards…' : 'Draw the cards'}</span><NavIcon name="arrow" />
      </button>
      <p className="draw-status" role="status" aria-live="polite">{loading ? 'Drawing, orienting and interpreting your cards…' : '78 cards. A reading shaped around you.'}</p>

      <details className="reading-options simplified-options">
        <summary>Fine-tune your reading</summary>
        <div className="form-grid">
          <label><span>Focus</span><select value={value.focus} onChange={set('focus')} disabled={loading}><option value="general">General</option><option value="love">Love / relationship</option><option value="career">Career / money</option><option value="decision">A decision</option><option value="healing">Healing / closure</option><option value="growth">Personal growth</option></select></label>
          <label><span>Need most</span><select value={value.need} onChange={set('need')} disabled={loading}><option value="clarity">Clarity</option><option value="direction">Direction</option><option value="closure">Closure</option><option value="courage">Courage</option><option value="understanding">Understanding</option></select></label>
          <label className="full"><span>Gender <em>(optional)</em></span><select value={value.gender} onChange={set('gender')} disabled={loading}><option value="">Prefer not to say</option><option>Woman</option><option>Man</option><option>Non-binary</option><option>Other</option></select></label>
          <div className="full"><details className="birth-details"><summary>Add full birth-chart details</summary><NatalForm value={value} onChange={onChange}/></details></div>
          <div className="full profile-save-row"><button className="secondary-button" type="button" disabled={loading || profileSaving} onClick={onSaveProfile}>{profileSaving ? 'Remembering…' : 'Remember my profile'}</button><small className="muted" role="status" aria-live="polite">{profileStatus || 'Remember your details for next time.'}</small></div>
        </div>
      </details>
    </form>
  </section>;
}
