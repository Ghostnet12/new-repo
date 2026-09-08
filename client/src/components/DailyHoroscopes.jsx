import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { signs } from '../../../server/src/tarot/knowledge.js';
import { buildDailyHoroscope, calendarDay, dailyFocus } from '../../../server/src/tarot/horoscope.js';
import { validBirthDate } from '../../../server/src/tarot/interpretation.js';
import { TEXT_LIMIT } from '../../../server/src/validation/limits.js';
import MoonDivider from './MoonDivider.jsx';
import '../styles/horoscopes.css';

export default function DailyHoroscopes({value,onChange,onBirthChart}) {
  const [selection,setSelection]=useState('profile');
  const [clock,setClock]=useState(()=>new Date());
  const [reading,setReading]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const timeZone=useMemo(()=>Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC',[]);
  const day=calendarDay(timeZone,clock);
  const input=useMemo(()=>({
    profile:{name:value.name,gender:value.gender,birthday:value.birthday,natal:value.natal},
    sign:selection,focus:value.focus,timeZone
  }),[value.name,value.gender,value.birthday,value.natal,value.focus,selection,timeZone]);
  const requestKey=JSON.stringify(input);

  useEffect(()=>{
    const update=()=>setClock(new Date());
    const timer=setInterval(update,60_000);
    document.addEventListener('visibilitychange',update);
    return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',update);};
  },[]);

  useEffect(()=>{
    const controller=new AbortController();
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
    return()=>{clearTimeout(timer);controller.abort();};
  },[requestKey,day]);

  const set=key=>event=>onChange({...value,[key]:event.target.value});
  const prettyDay=new Intl.DateTimeFormat(undefined,{dateStyle:'full',timeZone:'UTC'}).format(new Date(`${day}T12:00:00Z`));
  const publisher=reading?.source.mode==='publisher'||reading?.source.mode==='rewritten';
  return <section className="panel knowledge-panel daily-panel" aria-labelledby="daily-title">
    <header className="daily-heading">
      <div><p className="section-kicker">A little clarity for today</p><h2 id="daily-title">Daily Horoscopes</h2><p className="daily-intro">Read the day. Find your own way through it.</p></div>
      <div className="daily-date"><span aria-hidden="true">☉</span><time dateTime={day}>{prettyDay}</time><small>{timeZone.replaceAll('_',' ')} · refreshes each day</small></div>
    </header>
    <div className="daily-layout">
      <aside className="daily-settings" aria-label="Personalize your daily horoscope">
        <h3>Your place in the sky</h3>
        <p>These details are shared with your readings and birth chart.</p>
        <label><span>Name <small>(optional)</small></span><input autoComplete="name" maxLength={TEXT_LIMIT} value={value.name} onChange={set('name')} placeholder="Your name"/></label>
        <label><span>Birth date <small>(optional)</small></span><input type="date" min="1900-01-01" max={new Date().toISOString().slice(0,10)} value={value.birthday} onChange={set('birthday')}/></label>
        <label><span>Read for</span><select value={selection} onChange={e=>setSelection(e.target.value)}><option value="profile">My birth details</option>{signs.map(sign=><option key={sign.name} value={sign.name.toLowerCase()}>{sign.symbol} {sign.name}</option>)}</select></label>
        <label><span>Today's focus</span><select value={value.focus} onChange={set('focus')}>{Object.entries(dailyFocus).map(([key,item])=><option key={key} value={key}>{item.label}</option>)}</select></label>
        <button className="secondary-button" onClick={onBirthChart}>Add time & birthplace <span aria-hidden="true">↗</span></button>
        <p className="daily-small">Birth time and place add your Moon, rising sign and chart connections. A date alone gives an approximate Sun sign.</p>
        {selection!=='profile'&&<p className="daily-small">You are exploring a sign. Choose “My birth details” to return to your personal chart and numerology.</p>}
        <div className="daily-settings-note"><span aria-hidden="true">✧</span><p>Take what helps you see clearly.<br/>Your next step is still yours.</p></div>
      </aside>
      <div className="daily-content" aria-busy={loading}>
        {loading&&<div className="daily-loading" role="status"><span aria-hidden="true">☾</span><p>Reading the day's sky…</p></div>}
        {error&&<p role="alert" className="error-banner">{error}</p>}
        {reading&&!loading&&<>
          <div className="daily-source-state"><i className={publisher?'connected':''} aria-hidden="true"/><span>{publisher?'Dated publisher horoscope':'Original Fold reflection'}</span></div>
          <p className="daily-source-message">{reading.source.message}</p>
          {reading.chartMessage&&<p className="notice-banner">{reading.chartMessage} This reading uses the available date-based layers.</p>}
          {!reading.sign&&<p className="daily-small">This is a general sky reading. Add your birth date or choose a zodiac sign to make it more specific.</p>}
          <article className="daily-lead">
            <div className="daily-sign-mark" aria-hidden="true">{reading.sign?.symbol||'☉'}</div>
            <p className="section-kicker">{reading.sign?.name||'The shared sky'}{reading.sign?` · ${reading.basis}`:''}</p>
            <h3>{reading.source.mode==='rewritten'?`${reading.sign?.name}: your day ahead`:reading.headline}</h3>
            <p>{reading.source.reflection?.theme||reading.overview}</p>
            <MoonDivider/>
          </article>
          {publisher&&<div className="daily-attribution">Horoscope source: <a href={reading.source.url} target="_blank" rel="noreferrer">{reading.source.name}</a> · <time dateTime={reading.source.date}>{reading.source.date}</time>{reading.source.mode==='rewritten'?' · Retold with AI in The Fold’s voice':''}</div>}
          {reading.source.original&&<details className="daily-source-story"><summary>Read today’s publisher horoscope</summary><p>{reading.source.original}</p></details>}
          <div className="daily-sky-strip" aria-label="Today's calculated sky">
            <div><small>Sun</small><b>{reading.sky.sun.sign}</b><span>{reading.sky.sun.degree}° {reading.sky.sun.minute}′</span></div>
            <div><small>Moon</small><b>{reading.sky.moon.sign}</b><span>{reading.sky.moon.degree}° {reading.sky.moon.minute}′</span></div>
            <div><small>Moon phase</small><b>{reading.sky.phase}</b><span>12:00 UTC snapshot</span></div>
          </div>
          <div className="daily-explanation"><p className="section-kicker">What this means in real life</p><h3>{reading.focus.label}</h3><p>{reading.source.reflection?.meaning||`Use this theme as a prompt: ${reading.question}`}</p><p>{reading.focus.text}</p></div>
          <div className="daily-action"><span aria-hidden="true">✦</span><div><h4>One thing to try today</h4><p>{reading.source.reflection?.action||reading.focus.action}</p></div></div>
          {reading.layers.length>0&&<section className="daily-personal" aria-labelledby="daily-personal-title"><p className="section-kicker">How it connects to you</p><h3 id="daily-personal-title">Your personal layers</h3><div className="daily-layer-grid">{reading.layers.map(layer=><article key={layer.title}><h4>{layer.title}</h4><p>{layer.text}</p>{layer.calculation&&<small>{layer.calculation}</small>}</article>)}</div></section>}
          <blockquote className="daily-question"><span>Carry this question with you</span><p>{reading.question}</p></blockquote>
          <details className="daily-method"><summary>Sources & how this reading is made</summary><p>{reading.method}</p><p>The general Fold theme follows the daily Moon sign. Your selected focus shapes the practical prompt. With complete birth details, calculated chart connections and numerology add separate personal reflections. Browsing another sign uses that sign’s themes.</p><p>{publisher?'The publisher supplies the dated sign horoscope. Its interpretation and The Fold’s astronomical snapshot are distinct sources.':'No publisher text was used for this reading.'} Original Fold explanations are written from the site’s symbolic reference material.</p><p>Calculations: <a href="https://github.com/cosinekitty/astronomy" target="_blank" rel="noreferrer">Astronomy Engine</a>. Zodiac conventions: <a href="https://www.astro.com/astrowiki/en/Zodiac" target="_blank" rel="noreferrer">Astrodienst</a>. Your birth information is not sent to a horoscope publisher or the shared AI retelling service.</p><div className="daily-planet-table"><table><caption>Positions at {reading.sky.instant.replace('T',' ').replace('.000Z',' UTC')}</caption><thead><tr><th>Planet</th><th>Position</th><th>Motion</th></tr></thead><tbody>{reading.sky.planets.map(planet=><tr key={planet.name}><td>{planet.name}</td><td>{planet.label}</td><td>{planet.motion}</td></tr>)}</tbody></table></div></details>
        </>}
      </div>
    </div>
  </section>;
}
