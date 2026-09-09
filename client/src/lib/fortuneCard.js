import {fortuneDate} from './fortunes.js';

export const fortuneCardSize={width:1000,height:1500};
const frameUrl='/assets/the-fold/fortune-card-ornate.webp';
let framePromise;

function loadFrame() {
 if(!framePromise)framePromise=new Promise((resolve,reject)=>{
  const frame=new Image();
  frame.onload=()=>resolve(frame);
  frame.onerror=()=>reject(new Error('The card artwork could not be loaded'));
  frame.src=frameUrl;
 }).catch(error=>{framePromise=null;throw error;});
 return framePromise;
}

// Keep every message within the artwork's clean parchment area.
export function layoutFortuneCard(ctx,fortune) {
 const maxWidth=670;
 for(let bodySize=38;bodySize>=28;bodySize-=2){
  const lines=[];let y=262;
  const add=(value,size,lineHeight,gap=0,family='Georgia, serif',color='#382717')=>{
   const font=`${size}px ${family}`;ctx.font=font;
   const parts=[];let line='';
   for(const word of value.split(/\s+/)){
    const candidate=line?`${line} ${word}`:word;
    if(line&&ctx.measureText(candidate).width>maxWidth){parts.push(line);line=word;}else line=candidate;
   }
   if(line)parts.push(line);
   for(const text of parts){lines.push({text,y,size,font,color});y+=lineHeight;}
   y+=gap;
  };
  add('THE FOLD',50,61,12);
  add(fortune.mode==='yesno'?'THE TELLER’S VERDICT':'A FORTUNE FOR YOU',21,29,32,'sans-serif','#806137');
  add(fortune.title,48,58,26);
  add(fortune.message,bodySize,bodySize*1.42,25);
  add(fortune.whisper,28,39,34,'Georgia, serif','#77512c');
  add('YOUR LUCKY NUMBER',20,28,5,'sans-serif','#806137');
  add(String(fortune.luckyNumber).padStart(2,'0'),70,80,23);
  add(fortuneDate(fortune.issuedAt),22,30,8);
  add('A little theatre. Your future is yours.',20,28,8);
  add('enterthefold.io/fortune-teller',20,28,0,'sans-serif','#806137');
  if(y<=1210)return lines;
 }
 throw new Error('The fortune is too long for this card');
}

// The same ornate frame is used on the page and in the downloadable keepsake.
export function drawFortuneCard(ctx,fortune,frame) {
 const {width,height}=fortuneCardSize;
 ctx.drawImage(frame,0,0,width,height);
 ctx.textAlign='center';ctx.textBaseline='top';
 const lines=layoutFortuneCard(ctx,fortune);
 for(const line of lines){ctx.font=line.font;ctx.fillStyle=line.color;ctx.fillText(line.text,width/2,line.y);}
 return lines;
}

export async function createFortuneImage(fortune) {
 const frame=await loadFrame();
 const canvas=document.createElement('canvas');
 canvas.width=fortuneCardSize.width;canvas.height=fortuneCardSize.height;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Image export unavailable');
 drawFortuneCard(ctx,fortune,frame);
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Image export failed')),'image/png'));
}
