import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import { signs } from '../../../server/src/tarot/knowledge.js';
import { buildDailyHoroscope, calendarDay, dailyFocus } from '../../../server/src/tarot/horoscope.js';
import { validBirthDate } from '../../../server/src/tarot/interpretation.js';
import { TEXT_LIMIT } from '../../../server/src/validation/limits.js';
import { dailyNeeds } from '../../../server/src/tarot/dailyPersonalization.js';
import MoonDivider from './MoonDivider.jsx';
import '../styles/horoscopes.css';

export default function DailyHoroscopes({value,onChange,onBirthChart}) {
  const [selection,setSelection]=useState('profile');
  const [clock,setClock]=useState(()=>new Date());
  const [reading,setReading]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [personalizing,setPersonalizing]=useState(false);
  const personalRequest=useRef(null);
  const timeZone=useMemo(()=>Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC',[]);
  const day=calendarDay(timeZone,clock);
  const input=useMemo(()=>({
    profile:{name:value.name,gender:value.gender,birthday:value.birthday,natal:value.natal},
    sign:selection,focus:value.focus,need:value.need||'clarity',context:value.question||'',timeZone
  }),[value.name,value.gender,value.birthday,value.natal,value.focus,value.need,value.question,selection,timeZone]);
  const requestKey=JSON.stringify(input);

  useEffect(()=>{
    const update=()=>setClock(new Date());
    const timer=setInterval(update,60_000);
    document.addEventListener('visibilitychange',update);
    return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',update);};
  },[]);

  useEffect(()=>{
    const controller=new AbortController();
    personalRequest.current?.abort();personalRequest.current=null;setPersonalizing(false);
    setLoading(true);setError('');setReading(null);
    const current=JSON.parse(requestKey);
    if(current.profile.birthday&&!validBirthDate(current.profile.birthday)) {
      setError('Please enter a valid birth date between 1900 and today.');setLoading(false);
      return()=>controller.abort();
    }
    const timer=setTimeout(async()=>{
      try {
        const result=await api('/api/horoscopes/daily',{method:'POST',body:requestKey,signal:controller.signal});
        if(!controller.signal.aborted) setReading(result);
      } catch(err) {
        if(controller.signal.aborted) return;
        if(err.status&&err.status<500&&err.status!==429) setError(err.message);
        else {
          try {setReading(buildDailyHoroscope(current,{source:{mode:'calculated',status:'offline',message:'The live connection is unavailable. This original Fold reflection was calculated on your device.'}}));}
          catch {setError('The daily reading could not load. Please check your birth details and try again.');}
        }
      } finally {if(!controller.signal.aborted) setLoading(false);}
    },350);
    return()=>{clearTimeout(timer);controller.abort();personalRequest.current?.abort();personalRequest.current=null;};
  },[requestKey,day]);

  const createPersonalReading=async()=>{
    if(personalRequest.current||loading||!reading?.perspective.hasDetails) return;
    const controller=new AbortController();personalRequest.current=controller;
    setPersonalizing(true);setError('');
    try {
      const result=await api('/api/horoscopes/daily',{method:'POST',body:JSON.stringify({...input,personalize:true}),signal:controller.signal,timeoutMs:45000});
      if(!controller.signal.aborted) setReading(result);
    } catch(err) {
      if(!controller.signal.aborted) setError(err.status===429?'Please wait a moment before trying another personal reading.':'Your overview is still here. The personal reading could not finish; please try again shortly.');
    } finally {
      if(personalRequest.current===controller) {personalRequest.current=null;setPersonalizing(false);}
    }
  };

  const set=key=>event=>onChange({...value,[key]:event.target.value});
  const prettyDay=new Intl.DateTimeFormat(undefined,{dateStyle:'full',timeZone:'UTC'}).format(new Date(`${day}T12:00:00Z`));
  const publisher=reading?.source.mode==='publisher'||reading?.source.mode==='rewritten';
  const perspective=reading?.perspective;
  const firstName=value.name?.trim().split(/\s+/)[0];
  const greeting=firstName&&firstName.length<=50?`${firstName}, `:'';
  return <section className="panel knowledge-panel daily-panel" aria-labelledby="daily-title">
    <header className="daily-heading">
      <div><p className="section-kicker">A little clarity for today</p><h2 id="daily-title">Daily Horoscopes</h2><p className="daily-intro">Read the day. Find your own way through it.</p></div>
      <div className="daily-date"><span aria-hidden="true">☉</span><time dateTime={day}>{prettyDay}</time><small>{timeZone.replaceAll('_',' ')} · refreshes each day</small></div>
    </header>
    <div className="daily-layout">
      <aside className="daily-settings" aria-label="Personalize your daily horoscope">
        <h3>Your place in the sky</h3>
        <p>Bring your birth details and what is happening in your life. The reading will connect the two.</p>
        <label><span>Name <small>(optional)</small></span><input autoComplete="name" maxLength={TEXT_LIMIT} value={value.name} onChange={set('name')} placeholder="Your name"/></label>
        <label><span>Birth date <small>(optional)</small></span><input type="date" min="1900-01-01" max={new Date().toISOString().slice(0,10)} value={value.birthday} onChange={set('birthday')}/></label>
        <label><span>Read for</span><select value={selection} onChange={e=>setSelection(e.target.value)}><option value="profile">My birth details</option>{signs.map(sign=><option key={sign.name} value={sign.name.toLowerCase()}>{sign.symbol} {sign.name}</option>)}</select></label>
        <label><span>Today's focus</span><select value={value.focus} onChange={set('focus')}>{Object.entries(dailyFocus).map(([key,item])=><option key={key} value={key}>{item.label}</option>)}</select></label>
        <label><span>What would help most?</span><select value={value.need||'clarity'} onChange={set('need')}>{Object.entries(dailyNeeds).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
        <label className="daily-context"><span>What's on your mind today? <small>(optional)</small></span><textarea rows={5} maxLength={TEXT_LIMIT} value={value.question||''} onChange={set('question')} placeholder="For example: I want to ask for more responsibility at work, but I keep putting off the conversation." aria-describedby="daily-context-count"/><small id="daily-context-count">{(value.question||'').length.toLocaleString()} / 25,000 characters</small></label>
        <button className="secondary-button" onClick={onBirthChart}>Add time & birthplace <span aria-hidden="true">↗</span></button>
        <p className="daily-small">Birth time and place add your Moon, rising sign and chart connections. A date alone gives an approximate Sun sign.</p>
        {selection!=='profile'&&<p className="daily-small">You are exploring a sign. Choose “My birth details” to return to your personal chart and numerology.</p>}
        <button type="button" className="primary-button daily-create" disabled={loading||personalizing||!perspective?.hasDetails} onClick={createPersonalReading} aria-describedby="daily-ai-note">{personalizing?'Writing your personal reading…':'Create my personal reading'}</button>
        <p className="daily-small daily-ai-note" id="daily-ai-note">This sends your note, chosen focus, and calculated chart themes to Qwen via Groq. Your profile’s name, birth date, and birthplace fields are excluded. Your note is used for this request and is not added to shared horoscope storage. <a href="https://console.groq.com/docs/your-data" target="_blank" rel="noreferrer">Groq data information</a>.</p>
        <div className="daily-settings-note"><span aria-hidden="true">✧</span><p>Take what helps you see clearly.<br/>Your next step is still yours.</p></div>
      </aside>
      <div className="daily-content" aria-busy={loading||personalizing}>
        {loading&&<div className="daily-loading" role="status"><span aria-hidden="true">☾</span><p>Reading the day's sky…</p></div>}
        {error&&<p role="alert" className="error-banner">{error}</p>}
        {personalizing&&<p className="daily-personal-status" role="status">Connecting your situation with your personal details…</p>}
        {reading&&!loading&&<>
          <div className="daily-source-state"><i className={perspective?.mode==='ai'||publisher?'connected':''} aria-hidden="true"/><span>{perspective?.mode==='ai'?'Your personal daily reading':perspective?.hasDetails?'Your personal overview':publisher?'Dated publisher horoscope':'Original Fold reflection'}</span></div>
          <p className="daily-source-message">{perspective?.message||reading.source.message}</p>
          {reading.chartMessage&&<p className="notice-banner">{reading.chartMessage} This reading uses the available date-based layers.</p>}
          {!reading.sign&&<p className="daily-small">Add a birth date to include zodiac and numerology connections. You can still explore your situation and chosen focus without one.</p>}
          <article className="daily-lead">
            <div className="daily-sign-mark" aria-hidden="true">{reading.sign?.symbol||'☉'}</div>
            <p className="section-kicker">{reading.sign?.name||'The shared sky'}{reading.sign?` · ${reading.basis}`:''}</p>
            <h3>{perspective?.hasDetails?`${greeting}your day in focus`:reading.source.mode==='rewritten'?`${reading.sign?.name}: your day ahead`:reading.headline}</h3>
            <p>{perspective?.theme||reading.overview}</p>
            <MoonDivider/>
          </article>
          {publisher&&<div className="daily-attribution">Daily source: <a href={reading.source.url} target="_blank" rel="noreferrer">{reading.source.name}</a> · <time dateTime={reading.source.date}>{reading.source.date}</time>{perspective?.mode==='ai'?' · Personally interpreted with AI in The Fold’s voice':reading.source.mode==='rewritten'?' · Retold with AI in The Fold’s voice':''}</div>}
          {!publisher&&<p className="daily-small">{reading.source.message} {perspective?.mode==='ai'?'Your personal interpretation uses the calculated sky and the details you supplied.':''}</p>}
          {reading.source.original&&<details className="daily-source-story"><summary>Read today’s publisher horoscope</summary><p>{reading.source.original}</p></details>}
          <div className="daily-sky-strip" aria-label="Today's calculated sky">
            <div><small>Sun</small><b>{reading.sky.sun.sign}</b><span>{reading.sky.sun.degree}° {reading.sky.sun.minute}′</span></div>
            <div><small>Moon</small><b>{reading.sky.moon.sign}</b><span>{reading.sky.moon.degree}° {reading.sky.moon.minute}′</span></div>
            <div><small>Moon phase</small><b>{reading.sky.phase}</b><span>12:00 UTC snapshot</span></div>
          </div>
          <div className="daily-explanation"><p className="section-kicker">What this means for you</p><h3>{reading.focus.label}</h3><p>{perspective?.meaning||reading.focus.text}</p></div>
          <div className="daily-action"><span aria-hidden="true">✦</span><div><h4>Your next small step</h4><p>{perspective?.action||reading.focus.action}</p></div></div>
          {!!perspective?.connections.length&&<section className="daily-personal" aria-labelledby="daily-personal-title"><p className="section-kicker">The details behind your reading</p><h3 id="daily-personal-title">Why this connects to you</h3><div className="daily-layer-grid">{perspective.connections.map(connection=><article key={connection.id}><h4>{connection.label}</h4><p>{connection.text}</p></article>)}</div></section>}
          <blockquote className="daily-question"><span>A question to carry with you</span><p>{perspective?.question||reading.question}</p></blockquote>
          {reading.layers.length>0&&<details className="daily-method"><summary>Explore all your chart & numerology details</summary><div className="daily-layer-grid">{reading.layers.map(layer=><article key={layer.id||layer.title}><h4>{layer.title}</h4><p>{layer.text}</p>{layer.calculation&&<small>{layer.calculation}</small>}</article>)}</div></details>}
          <details className="daily-method"><summary>Sources & how this reading is made</summary><p>{reading.method}</p><p>The general Fold theme follows the daily Moon sign. Your personal reading connects your chosen focus, what you need, and your note with the available chart and numerology details. “Why this connects to you” shows the details used. Missing birth information is never filled in by guessing. Browsing a sign leaves out your birth-chart and numerology layers.</p><p>{publisher?'The publisher supplies the dated sign horoscope. Its interpretation and The Fold’s astronomical snapshot are distinct sources.':'No publisher text was used for this reading.'} Original Fold explanations are written from the site’s symbolic reference material.</p><p>Calculations: <a href="https://github.com/cosinekitty/astronomy" target="_blank" rel="noreferrer">Astronomy Engine</a>. Zodiac conventions: <a href="https://www.astro.com/astrowiki/en/Zodiac" target="_blank" rel="noreferrer">Astrodienst</a>. The shared publisher horoscope never includes your profile or note. When you choose “Create my personal reading,” a separate Qwen request uses your note, focus, and calculated themes. Your profile’s name, birth date, birth time, and birthplace fields are excluded from that AI request. Personal answers are not placed in the shared daily cache.</p><div className="daily-planet-table"><table><caption>Positions at {reading.sky.instant.replace('T',' ').replace('.000Z',' UTC')}</caption><thead><tr><th>Planet</th><th>Position</th><th>Motion</th></tr></thead><tbody>{reading.sky.planets.map(planet=><tr key={planet.name}><td>{planet.name}</td><td>{planet.label}</td><td>{planet.motion}</td></tr>)}</tbody></table></div></details>
        </>}
      </div>
    </div>
  </section>;
}
