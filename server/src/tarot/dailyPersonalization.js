// Shared by the browser fallback and server. This module performs no network or storage work.
export const dailyNeeds = {
  clarity:'Clarity', direction:'A next step', closure:'Closure', courage:'Courage', understanding:'Understanding'
};
const focusQuestions = {
  general:'Which part of your day would feel easier if you named what you need?',
  love:'What do you want this person to understand, and what do you still need to ask them?',
  career:'What would make your next work conversation more useful and specific?',
  decision:'Which missing fact would help you compare your options fairly?',
  healing:'What can you set down today, and what support would make that possible?',
  growth:'What is one familiar response you want to try differently this time?'
};

export function buildDailyPerspective(input, reading) {
  const facts=reading.layers.map((layer,index)=>({id:layer.id||`layer-${index}`,label:layer.title,meaning:layer.text}));
  const focusKey=input.focus||'general';
  const hasDetails=Boolean(input.context?.trim()||focusKey!=='general'||(input.need&&input.need!=='clarity')||
    ((input.sign||'profile')==='profile'&&facts.some(fact=>['sun','birth-moon','life-path'].includes(fact.id))));
  const selected=facts.find(fact=>fact.id==='focus-planet')||facts.find(fact=>fact.id==='birth-moon')||facts.find(fact=>fact.id==='sun');
  const second=facts.find(fact=>fact.id==='personal-day')||facts.find(fact=>fact.id==='life-path');
  const connections=[selected,second].filter(Boolean).map(fact=>({id:fact.id,label:fact.label,text:fact.meaning}));
  const theme=reading.source.reflection?.theme||reading.overview;
  return {
    mode:'guided',status:hasDetails?'ready':'needs_context',hasDetails,
    theme:hasDetails?`For your focus on ${reading.focus.label.toLowerCase()}, start here: ${theme}`:theme,
    meaning:hasDetails?`${selected?`${selected.label} gives this reflection a personal starting point. ${selected.meaning} `:''}${reading.focus.text}`:
      (reading.source.reflection?.meaning||reading.focus.text),
    action:hasDetails?reading.focus.action:(reading.source.reflection?.action||reading.focus.action),
    question:focusQuestions[focusKey]||focusQuestions.general,
    connections,facts,
    message:hasDetails?'Your available details are reflected below. Choose “Create my personal reading” to connect them with what is on your mind.':
      'Add your birth date, choose a focus, or tell us what is on your mind for a more personal reading.'
  };
}
