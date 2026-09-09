import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import { TEXT_LIMIT, TEXT_LIMIT_LABEL } from '../../../server/src/validation/limits.js';
import { dreamMoods, dreamResearch, newDreamDraft } from '../../../shared/dreams.js';
import NavIcon from './NavIcon.jsx';
import './DreamJournal.css';

const dreamInput = value => ({ text: value.text, mood: value.mood, context: value.context });
const dateLabel = value => {
  const date = new Date(value);
  return Number.isFinite(+date) ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Saved dream';
};

export default function DreamJournal({ value, onChange }) {
  const [pending, setPending] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [feedbackArea, setFeedbackArea] = useState('form');
  const [entries, setEntries] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const alive = useRef(false), action = useRef(''), requests = useRef(new Set()), listSequence = useRef(0);
  const inputRef = useRef(null), reflectionRef = useRef(null), journalRef = useRef(null), confirmRef = useRef(null), listRequest = useRef(null), confirmTrigger = useRef(null);
  const requestController = () => { const controller = new AbortController(); requests.current.add(controller); return controller; };

  async function loadEntries(nextPage = 1) {
    listRequest.current?.abort();
    const sequence = ++listSequence.current;
    const controller = requestController();
    listRequest.current = controller;
    setListLoading(true); setListError('');
    try {
      const result = await api(`/api/dreams?page=${nextPage}`, { signal: controller.signal, timeoutMs: 12000 });
      if (!alive.current || controller.signal.aborted || sequence !== listSequence.current) return;
      setEntries(previous => nextPage === 1 ? result.entries : [...previous, ...result.entries.filter(entry => !previous.some(item => item.entryId === entry.entryId))]);
      setPage(result.page); setHasMore(result.hasMore);
    } catch (failure) {
      if (alive.current && !controller.signal.aborted && sequence === listSequence.current) setListError(failure.message);
    } finally {
      requests.current.delete(controller);
      if (alive.current && sequence === listSequence.current) setListLoading(false);
    }
  }

  useEffect(() => {
    alive.current = true;
    void loadEntries();
    return () => {
      alive.current = false; listSequence.current++;
      for (const controller of requests.current) controller.abort();
      requests.current.clear();
    };
  }, []);

  const focus = (ref, scroll = true) => requestAnimationFrame(() => {
    if (!alive.current) return;
    ref.current?.focus({ preventScroll: true });
    if (scroll) ref.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
  });

  useEffect(() => { if (confirm) focus(confirmRef); }, [confirm]);
  const cancelConfirm = () => {
    const isRemoval = confirm?.type === 'remove';
    setConfirm(null); focus(isRemoval ? confirmTrigger : inputRef, !isRemoval);
  };

  const change = (field, next) => {
    setError(''); setNotice(''); setConfirm(null);
    onChange(current => ({ ...current, [field]: next, reflection: null, saved: false }));
  };
  const valid = () => {
    if (value.text.trim().length >= 20) return true;
    setFeedbackArea('form'); setError('Add a little more detail—at least 20 characters.'); focus(inputRef, false); return false;
  };
  async function perform(label, operation) {
    if (action.current) return;
    const controller = requestController();
    if (label !== 'explore') { listSequence.current++; listRequest.current?.abort(); setListLoading(false); }
    setFeedbackArea(label === 'remove' ? 'journal' : 'form');
    action.current = label; setPending(label); setError(''); setNotice(''); setConfirm(null);
    try { await operation(controller.signal); }
    catch (failure) { if (alive.current && !controller.signal.aborted) setError(failure.message); }
    finally {
      requests.current.delete(controller); action.current = '';
      if (alive.current) { setPending(''); if (label !== 'explore') void loadEntries(); }
    }
  }
  const explore = event => {
    event.preventDefault();
    if (!valid()) return;
    void perform('explore', async signal => {
      const result = await api('/api/dreams/reflect', { method: 'POST', body: JSON.stringify(dreamInput(value)), signal, timeoutMs: 28000 });
      if (!alive.current || signal.aborted) return;
      onChange(current => ({ ...current, reflection: result.reflection, saved: false }));
      setNotice('Your reflection is ready.'); focus(reflectionRef);
    });
  };
  const save = () => {
    if (action.current || !valid()) return;
    const entryId = value.entryId || crypto.randomUUID();
    onChange(current => ({ ...current, entryId }));
    void perform('save', async signal => {
      const result = await api('/api/dreams', { method: 'POST', body: JSON.stringify({ ...dreamInput(value), entryId, reflection: value.reflection }), signal, timeoutMs: 16000 });
      if (!alive.current || signal.aborted) return;
      onChange(current => ({ ...current, entryId: result.entry.entryId, saved: true }));
      setNotice('Saved to your journal.');
    });
  };
  const replaceDraft = entry => {
    onChange(entry ? { entryId: entry.entryId, text: entry.text, mood: entry.mood || '', context: entry.context || '', reflection: entry.reflection || null, saved: true } : newDreamDraft());
    setConfirm(null); setError(''); setFeedbackArea('form'); setNotice(entry ? 'Your saved dream is open above.' : 'A fresh page for your next dream.'); focus(inputRef);
  };
  const open = entry => {
    if (action.current) return;
    if ((value.text.trim() || value.context.trim()) && !value.saved) setConfirm({ type: 'replace', entry });
    else replaceDraft(entry);
  };
  const remove = entry => void perform('remove', async signal => {
    await api(`/api/dreams/${entry.entryId}`, { method: 'DELETE', signal, timeoutMs: 12000 });
    if (!alive.current || signal.aborted) return;
    if (value.entryId === entry.entryId) onChange(current => ({ ...current, entryId: null, saved: false }));
    setEntries(previous => previous.filter(item => item.entryId !== entry.entryId));
    setNotice('Removed from your journal.'); focus(journalRef, false);
  });
  const reflection = value.reflection;

  return <section className="dream-page" aria-labelledby="dream-title">
    <header className="dream-hero">
      <img src="/assets/the-fold/dream-journal.webp" width="1672" height="941" alt="An antique journal opens into violet mist and a doorway overlooking a moonlit sea" fetchPriority="high"/>
      <div className="dream-hero-copy"><p className="dream-eyebrow">Between sleep and waking</p><h1 id="dream-title">The Dream<br/>Journal</h1><p>Some dreams linger.<br/>Give yours a place to unfold.</p></div>
    </header>

    <div className="dream-workspace">
      <form className="dream-panel dream-form" onSubmit={explore} aria-busy={Boolean(pending)}>
        <h2>Tell us your dream.</h2>
        <label className="sr-only" htmlFor="dream-text">What do you remember?</label>
        <textarea ref={inputRef} id="dream-text" value={value.text} onChange={event => change('text', event.target.value)} disabled={Boolean(pending)} maxLength={TEXT_LIMIT} minLength={20} required rows="7" placeholder="I was walking through a familiar house, but every door opened onto the sea…" aria-describedby="dream-text-count dream-privacy"/>
        <span className="dream-count" id="dream-text-count">{value.text.length.toLocaleString()}/{TEXT_LIMIT_LABEL}</span>
        <fieldset className="dream-feelings" disabled={Boolean(pending)}><legend>How did it feel? <span>(optional)</span></legend><div>
          {dreamMoods.map(mood => <button type="button" key={mood} aria-pressed={value.mood === mood} onClick={() => change('mood', value.mood === mood ? '' : mood)}>{mood}</button>)}
        </div></fieldset>
        <label className="dream-context-label" htmlFor="dream-context">Anything on your mind lately? <span>(optional)</span></label>
        <textarea id="dream-context" value={value.context} onChange={event => change('context', event.target.value)} disabled={Boolean(pending)} maxLength={TEXT_LIMIT} rows="2" placeholder="Changes, memories, or something unresolved…" aria-describedby="dream-context-count dream-privacy"/>
        <span className="dream-count" id="dream-context-count">{value.context.length.toLocaleString()}/{TEXT_LIMIT_LABEL}</span>
        <div className="dream-actions"><button className="dream-primary" type="submit" disabled={Boolean(pending)}><NavIcon name="dream"/>{pending === 'explore' ? 'Exploring your dream…' : 'Explore your dream'}</button><button className="dream-secondary" type="button" onClick={save} disabled={Boolean(pending) || value.saved}>{pending === 'save' ? 'Saving…' : value.saved ? 'Saved to journal' : 'Save to journal'}</button></div>
        <p className="dream-small" id="dream-privacy">Explore sends your dream, feeling and note to our AI provider, Groq. Saving is optional and separate. <a href="https://console.groq.com/docs/your-data" target="_blank" rel="noreferrer">About your data</a></p>
        {feedbackArea === 'form' && error && <p className="dream-feedback is-error" role="alert">{error}</p>}
        {feedbackArea === 'form' && notice && <p className="dream-feedback" role="status">{notice}</p>}
      </form>

      <aside className="dream-panel dream-reflection" ref={reflectionRef} tabIndex="-1" aria-labelledby="dream-reflection-title" aria-busy={pending === 'explore'}>
        <p className="dream-eyebrow">{reflection ? reflection.mode === 'ai' ? 'Your dream, explored' : 'A guided reflection' : 'Start with what you felt'}</p>
        <h2 id="dream-reflection-title">{reflection ? reflection.title : 'A moment to reflect.'}</h2>
        {pending === 'explore' ? <div className="dream-wait" role="status"><NavIcon name="dream"/><p>Considering the details you shared…</p><span>Your writing will stay here.</span></div> : reflection ? <>
          <p className="dream-small dream-source-note">{reflection.message}</p>
          <p className="dream-summary">{reflection.summary}</p>
          <div className="dream-themes"><p className="dream-eyebrow">Possible themes to explore</p>{reflection.themes.map((theme, index) => <div className="dream-theme" key={index}><h3>{theme.label}</h3>{theme.detail && <blockquote>{theme.detail}</blockquote>}<p>{theme.observation}</p><p className="dream-question">{theme.question}</p></div>)}</div>
          <div className="dream-practice"><h3>A small reflection</h3><p>{reflection.practice}</p><p className="dream-question">{reflection.question}</p></div>
        </> : <>
          <div className="dream-prompts"><p>What stayed with you?</p><p>What felt familiar?</p><p>What surprised you?</p></div>
          <div className="dream-associations"><NavIcon name="dream"/><p>Your own associations<br/>are the starting point.</p></div>
        </>}
        <p className="dream-small dream-limit-note">Possibilities for reflection, not a diagnosis or a prediction. A dream cannot prove a hidden memory or what someone else thinks.</p>
      </aside>
    </div>

    <section className="dream-journal" aria-labelledby="dream-journal-title">
      <div className="dream-journal-heading"><h2 id="dream-journal-title" ref={journalRef} tabIndex="-1">Your journal</h2><button className="dream-secondary" type="button" onClick={() => open(null)} disabled={Boolean(pending)}><NavIcon name="plus"/>New dream</button></div>
      <p className="dream-small">Saved privately online for this browser. Other people using this browser can open it. Clearing site data can remove your access.</p>
      {feedbackArea === 'journal' && error && <p className="dream-feedback is-error" role="alert">{error}</p>}
      {feedbackArea === 'journal' && notice && <p className="dream-feedback" role="status">{notice}</p>}
      {confirm && <div className="dream-confirm" ref={confirmRef} tabIndex="-1" onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); cancelConfirm(); } }} role="group" aria-label={confirm.type === 'remove' ? 'Confirm dream removal' : 'Unsaved dream'}>
        <p>{confirm.type === 'remove' ? 'Remove this dream from your journal?' : 'You have unsaved changes. Replace them with another dream?'}</p>
        <div><button type="button" className="dream-secondary" onClick={cancelConfirm}>{confirm.type === 'remove' ? 'Keep dream' : 'Keep writing'}</button><button type="button" className="dream-secondary" onClick={() => confirm.type === 'remove' ? remove(confirm.entry) : replaceDraft(confirm.entry)}>{confirm.type === 'remove' ? 'Remove dream' : confirm.entry ? 'Open saved dream' : 'Start a new dream'}</button></div>
      </div>}
      {listError && <div className="dream-feedback is-error" role="alert"><p>{listError}</p><button type="button" className="dream-secondary" onClick={() => loadEntries(page || 1)} disabled={listLoading || Boolean(pending)}>Try loading again</button></div>}
      {!entries.length && !listLoading && !listError && <div className="dream-empty"><NavIcon name="dream"/><p>Your next remembered dream belongs here.</p><span>Write above, then choose Save to journal.</span></div>}
      <div className="dream-entries">{entries.map(entry => <article className="dream-entry" key={entry.entryId}>
        <button type="button" className="dream-entry-open" onClick={() => open(entry)} disabled={Boolean(pending)} aria-label={`Open dream: ${entry.title}`}><span className="dream-entry-moon"><NavIcon name="dream"/></span><span className="dream-entry-copy"><strong>{entry.title}</strong><span>{entry.mood ? `${entry.mood} · ` : ''}{dateLabel(entry.createdAt)}</span></span><NavIcon name="arrow"/></button>
        <button type="button" className="dream-entry-remove" onClick={event => { confirmTrigger.current = event.currentTarget; setConfirm({ type: 'remove', entry }); }} disabled={Boolean(pending)} aria-label={`Remove dream: ${entry.title}`}>Remove</button>
      </article>)}</div>
      {listLoading && <p className="dream-small" role="status">Opening your journal…</p>}
      {hasMore && !listLoading && <button className="dream-secondary" type="button" onClick={() => loadEntries(page + 1)} disabled={Boolean(pending)}>More dreams</button>}
    </section>

    <details className="dream-research"><summary>What research can—and cannot—tell us</summary><p>These studies inform our approach. They do not validate any individual AI interpretation or a universal dictionary of dream symbols.</p><div>{dreamResearch.map(source => <article key={source.id}><h3>{source.title}</h3><p>{source.text}</p><a href={source.url} target="_blank" rel="noreferrer">{source.citation}<span className="sr-only"> (opens in a new tab)</span></a></article>)}</div></details>
    <p className="dream-closing">Explore possibilities. Keep your own meaning.</p>
  </section>;
}
