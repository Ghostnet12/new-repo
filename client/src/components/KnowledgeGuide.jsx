import { useState } from 'react';
import { signs, numbers, elements, modalities, planets, houses, aspects, tarotLessons, sources } from '../../../server/src/tarot/knowledge.js';
import { personalContext } from '../../../server/src/tarot/interpretation.js';
import { cards, zodiacMajor } from '../../../server/src/tarot/deck.js';

export function PersonalLayers({ personal }) {
  if (personal?.enabled === false) return <p className="muted">Personal symbolism is switched off. Your reading uses the cards, question and chosen focus.</p>;
  if (!personal?.layers?.length) return <p className="muted">Enter a name or birth date in Your Information to see your personal connections here. Both are optional.</p>;
  return <div className="knowledge-grid">{personal.layers.map(layer=><article className="knowledge-card" key={layer.kind}><h3>{layer.title}</h3><p>{layer.text}</p>{layer.calculation&&<p className="calculation">{layer.calculation}</p>}{layer.note&&<small>{layer.note}</small>}</article>)}</div>;
}
export default function KnowledgeGuide({ profile }) {
  const [topic,setTopic] = useState('tarot');
  const personal=personalContext(profile, profile.birthInfluence !== false);
  return <section className="panel knowledge-panel">
    <div className="section-kicker">The Fold library</div><h2>Understand Your Reading</h2>
    <p className="guide-intro">Learn the language behind the cards, signs and numbers. These are symbolic traditions for reflection, not scientifically established ways to predict events or define a person.</p>
    <details className="personal-guide" open><summary>Your personal connections</summary><PersonalLayers personal={personal}/></details>
    <nav className="guide-tabs" aria-label="Learning topics">{['tarot','astrology','zodiac','numerology'].map(key=><button key={key} aria-current={topic===key?'page':undefined} className={topic===key?'active':''} onClick={()=>setTopic(key)}>{key[0].toUpperCase()+key.slice(1)}</button>)}</nav>
    {topic==='tarot'&&<><h3>Reading the cards</h3><div className="knowledge-grid">{tarotLessons.map(([title,text])=><Lesson key={title} title={title} text={text}/>)}</div></>}
    {topic==='astrology'&&<>
      <h3>A chart has more than one layer</h3><p>A planet describes a symbolic function, a sign describes a style, and a house describes an area of life. Aspects describe relationships between planetary positions. A complete interpretation brings these together; a Sun sign alone is only an introduction.</p>
      <Lesson title="What this site can calculate" text="Your date supplies an approximate tropical Sun sign and its traditional element, modality and tarot correspondence. A precise natal chart needs birth date, exact birth time, location and a reliable ephemeris. The Fold does not currently calculate Moon or rising signs, houses, aspects or transits. The explanations below teach those concepts without assigning invented placements to you."/>
      <Lesson title="Different traditions" text="Western tropical astrology anchors its zodiac to the equinoxes. Sidereal traditions use a different reference and can produce different signs for the same birth. House systems also differ. Neither a sign label nor a difficult aspect is a verdict about your character or relationships."/>
      <h3>The planets and luminaries</h3><div className="knowledge-grid">{planets.map(([title,text])=><Lesson key={title} title={title} text={text}/>)}</div>
      <h3>The twelve houses</h3><p>The rising sign is the sign ascending at the eastern horizon at birth. It helps establish the chart’s orientation. House boundaries depend on time, place and the house system selected.</p><div className="knowledge-grid">{houses.map((text,i)=><Lesson key={text} title={`House ${i+1}`} text={text}/>)}</div>
      <h3>Major aspects</h3><div className="knowledge-grid">{aspects.map(([title,text])=><Lesson key={title} title={title} text={text}/>)}</div>
    </>}
    {topic==='zodiac'&&<>
      <h3>The twelve signs</h3><p>Dates below are approximate tropical calendar ranges. The Sun changes signs at a specific moment that varies by year; birthdays near a boundary need an exact chart. Read these as themes you can explore, not traits you must have.</p>
      <div className="knowledge-grid sign-grid">{signs.map(sign=><article className={`knowledge-card ${personal.zodiac===sign.name?'personal-match':''}`} key={sign.name}><h3><span aria-hidden="true">{sign.symbol}</span> {sign.name}</h3><small>{sign.dates} · {sign.element} · {sign.modality}</small><p><b>Theme:</b> {sign.theme}. {sign.practice}</p><p><b>Ruler:</b> {sign.ruler}</p><p><b>Tarot connection:</b> {cards[zodiacMajor[sign.name]].name}</p><p>{elements[sign.element].meaning} {modalities[sign.modality]}</p></article>)}</div>
      <h3>Elements and modalities</h3><div className="knowledge-grid">{Object.entries(elements).map(([title,item])=><Lesson key={title} title={title} text={`${item.meaning} ${item.practice}`}/>)}{Object.entries(modalities).map(([title,text])=><Lesson key={title} title={title} text={text}/>)}</div>
    </>}
    {topic==='numerology'&&<>
      <h3>Numbers as reflective themes</h3><p>The Fold uses a stated Pythagorean-style convention. A number is a symbolic prompt, not a score, diagnosis or limit on your future. Different schools can produce different results.</p>
      <div className="knowledge-grid">
        <Lesson title="Life path · your birth date" text="Reduce month, day and year separately, keeping 11, 22 and 33 at each stage. Add those results and reduce again with the same rule. For October 22, 1980: month 1 + day 22 + year 9 = 32, then 3 + 2 = 5. Your personal panel shows the working for your date."/>
        <Lesson title="Name number · the name you enter" text="Letters cycle through 1–9: A=1 through I=9, J=1 through R=9, and S=1 through Z=8. The Fold totals the letters and reduces the result, preserving 11, 22 and 33. Traditional Expression readings use a full birth name; if you enter only a first name, this is a reflection on that entered name. Spaces, hyphens and apostrophes are ignored, and common Latin accents are normalized. Other scripts are not calculated here."/>
        <Lesson title="Master numbers" text="11, 22 and 33 are retained in this convention. They are not better numbers or evidence of special status. The reflective themes are inspiration, building and service; each still benefits from ordinary boundaries and practical action."/>
        <Lesson title="Other numerology concepts" text="Birthday numbers focus on the day of birth. Soul Urge traditions use vowels, while Personality numbers use consonants; treatment of Y can vary. Personal-year systems combine birth-date components with a calendar year and also differ in timing conventions. These are educational concepts here, not additional values secretly calculated for your reading."/>
      </div><h3>The number meanings</h3><div className="knowledge-grid">{Object.values(numbers).map(item=><Lesson key={item.number} title={`${item.number} · ${item.title}`} text={item.practice}/>)}</div>
    </>}
    <details className="guide-sources"><summary>Sources & reading conventions</summary><p>Original explanations prepared for The Fold. The references below document practitioner traditions; they are not scientific validation. The knowledge base was reviewed September 7, 2026.</p><ul>{sources.map(([title,url])=><li key={url}><a href={url} target="_blank" rel="noreferrer">{title}</a></li>)}</ul><p>Your name is used to address you and, when enabled, for name numerology. Your date supplies the birth-based layers. Gender does not determine card meanings, personality, compatibility or who a court card represents. Your question and chosen focus guide the reflection prompts; the site does not claim to know unspoken facts.</p></details>
  </section>;
}
function Lesson({title,text}) {return <article className="knowledge-card"><h3>{title}</h3><p>{text}</p></article>;}
