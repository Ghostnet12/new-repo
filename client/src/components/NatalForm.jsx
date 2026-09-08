import { TEXT_LIMIT } from '../../../server/src/validation/limits.js';
import { useState } from 'react';
import { natalDefaults } from '../../../server/src/tarot/natal.js';
export default function NatalForm({value,onChange,includeBirthday=false}) {
 const natal={...natalDefaults,...value.natal};
 const [query,setQuery]=useState(''),[results,setResults]=useState([]),[searching,setSearching]=useState(false),[message,setMessage]=useState('');
 const set=(key,val)=>onChange({...value,natal:{...natal,[key]:val}});
 const search=async()=>{
  if(query.trim().length<2){setMessage('Enter at least two letters of the birthplace.');return;}
  setSearching(true);setMessage('');
  try {
   const {default:cityMap}=await import('city-timezones/data/cityMap.json');
   const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
   const words=[...new Set(normalize(query).split(/[\s,]+/).filter(Boolean))];
   const matches=cityMap.filter(c=>words.every(w=>normalize(`${c.city} ${c.city_ascii} ${c.province} ${c.country} ${c.iso2}`).includes(w))).sort((a,b)=>b.pop-a.pop);
   setResults(matches.slice(0,12));setMessage(matches.length?`${matches.length} matching places. Choose the correct city and region.${matches.length>12?' Showing 12; add a region to narrow the results.':''}`:'No match in this city list. You can enter coordinates and a time zone manually below.');
  } catch {setMessage('The city list could not load. Try again or enter the location manually.');}
  finally{setSearching(false);}
 };
 return <fieldset className="natal-inputs"><legend>Birth chart details</legend>
  <label className="natal-check"><input type="checkbox" checked={natal.enabled} onChange={e=>set('enabled',e.target.checked)}/><span>Include my natal chart</span></label>
  <p className="symbolism-note">Your birth time and birthplace unlock the Moon, rising sign, planets, houses and aspects. Use the local clock time recorded at birth.</p>
  {natal.enabled&&<>
   {includeBirthday&&<label><span>Birth date</span><input type="date" min="1900-01-01" max={new Date().toISOString().slice(0,10)} value={value.birthday} onChange={e=>onChange({...value,birthday:e.target.value})}/></label>}
   <div className="natal-fields"><label><span>Local birth time</span><input type="time" value={natal.time} onChange={e=>set('time',e.target.value)}/></label><label><span>Time accuracy</span><select value={natal.timeAccuracy} onChange={e=>set('timeAccuracy',e.target.value)}><option value="exact">From birth record</option><option value="approximate">Approximate time</option><option value="unknown">I don’t know</option></select></label></div>
   <label><span>Search birthplace</span><input maxLength={TEXT_LIMIT} value={query} onChange={e=>{setQuery(e.target.value);setResults([]);setMessage('');}} placeholder="City, region or country" onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();search();}}}/></label>
   <button className="secondary-button" type="button" disabled={searching} onClick={search}>{searching?'Finding places…':'Find birthplace'}</button>
   {message&&<p role="status" className="symbolism-note">{message}</p>}
   {results.length>0&&<ul className="place-results">{results.map((c,i)=><li key={`${c.city}-${c.lat}-${c.lng}-${i}`}><button type="button" onClick={()=>{onChange({...value,natal:{...natal,place:`${c.city}, ${c.province}, ${c.country}`,latitude:String(c.lat),longitude:String(c.lng),timezone:c.timezone}});setResults([]);setMessage('Birthplace selected. Check the region and time zone below.');}}>{c.city} · {c.province} · {c.country}<small>{c.timezone}</small></button></li>)}</ul>}
   {natal.place&&<p className="selected-place"><b>Selected birthplace:</b> {natal.place}<br/>{natal.latitude}, {natal.longitude} · {natal.timezone}</p>}
   <details><summary>Location & clock-change details</summary><p className="symbolism-note">Search uses city-center coordinates. You can enter more precise coordinates and the birthplace’s IANA time zone here. Historical daylight-saving offsets are applied to your date.</p>
    <label><span>Birthplace label</span><input value={natal.place} maxLength={TEXT_LIMIT} onChange={e=>set('place',e.target.value)}/></label>
    <div className="natal-fields"><label><span>Latitude · north positive</span><input type="number" step="any" min="-89.9999" max="89.9999" value={natal.latitude} onChange={e=>set('latitude',e.target.value)}/></label><label><span>Longitude · east positive</span><input type="number" step="any" min="-180" max="180" value={natal.longitude} onChange={e=>set('longitude',e.target.value)}/></label></div>
    <label><span>Time zone</span><input value={natal.timezone} maxLength={TEXT_LIMIT} placeholder="America/Chicago" onChange={e=>set('timezone',e.target.value)}/></label>
    <label><span>Clock-change handling</span><select value={natal.disambiguation} onChange={e=>set('disambiguation',e.target.value)}><option value="reject">Ask if the clock time occurred twice</option><option value="earlier">First occurrence</option><option value="later">Second occurrence</option></select></label>
   </details>
   <p className="symbolism-note">An approximate time can change the rising sign and houses. If you do not know the time, turn off the natal chart to continue with the other reading layers. City data: <a href="https://github.com/kevinroberts/city-timezones" target="_blank" rel="noreferrer">city-timezones</a>.</p>
  </>}
 </fieldset>;
}
