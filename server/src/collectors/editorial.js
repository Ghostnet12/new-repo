// A distinct serial or rearranged ending is not enough for a paid keepsake.
// This mechanical check supports, but cannot replace, an editorial reading.
const normalise=value=>value.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function assessCollectorWriting(manifest){
 const messages=new Map(),sentences=new Map(),titles=new Map();
 for(const card of manifest.cards){
  for(const [map,value] of [[messages,card.message],[titles,card.title]]){
   const key=normalise(value);map.set(key,(map.get(key)||0)+1);
  }
  const unique=new Set(card.message.split(/(?<=[.!?])\s+/).map(normalise).filter(s=>s.split(' ').length>=6));
  for(const key of unique)sentences.set(key,(sentences.get(key)||0)+1);
 }
 const repeated=map=>[...map.values()].filter(n=>n>1).length;
 const report={cards:manifest.cards.length,composed:manifest.composed===true,duplicateMessages:repeated(messages),repeatedSentences:repeated(sentences),repeatedTitles:repeated(titles)};
 return {...report,passes:report.cards>0&&!report.composed&&!report.duplicateMessages&&!report.repeatedSentences&&!report.repeatedTitles};
}
