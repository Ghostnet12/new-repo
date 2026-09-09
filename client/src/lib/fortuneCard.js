import {fortuneDate} from './fortunes.js';

// This renders the keepsake document, not the fortune-teller artwork.
export function drawFortuneCard(ctx,fortune) {
 const width=1000,height=1400;
 ctx.fillStyle='#efe2c6';ctx.fillRect(0,0,width,height);
 ctx.strokeStyle='#9b7444';ctx.lineWidth=3;ctx.strokeRect(38,38,924,1324);
 ctx.lineWidth=1;ctx.strokeRect(50,50,900,1300);
 ctx.textAlign='center';ctx.textBaseline='top';
 const text=(value,y,size,family='Georgia',color='#35261e')=>{
  ctx.fillStyle=color;ctx.font=`${size}px ${family}`;ctx.fillText(value,width/2,y);
 };
 const paragraph=(value,y,size,lineHeight,maxWidth=760)=>{
  ctx.font=`${size}px Georgia`;ctx.fillStyle='#35261e';
  const words=value.split(/\s+/);const lines=[];let line='';
  for(const word of words){const candidate=line?`${line} ${word}`:word;if(line&&ctx.measureText(candidate).width>maxWidth){lines.push(line);line=word;}else line=candidate;}
  if(line)lines.push(line);
  lines.forEach((part,i)=>ctx.fillText(part,width/2,y+i*lineHeight));
  return y+lines.length*lineHeight;
 };
 const rule=y=>{ctx.beginPath();ctx.moveTo(135,y);ctx.lineTo(865,y);ctx.stroke();};
 text('THE FOLD',110,58);text('THE FORTUNE TELLER',194,24,'sans-serif','#715337');
 text(`FORTUNE ${fortune.id.replaceAll('-',' ').toUpperCase()}`,259,17,'sans-serif','#715337');
 rule(309);
 let y=paragraph(fortune.title,360,52,65);
 y=paragraph(fortune.message,y+42,36,55);
 y=paragraph(fortune.whisper,y+42,30,43);
 rule(y+35);
 text('YOUR LUCKY NUMBER',y+72,22,'sans-serif','#715337');
 text(String(fortune.luckyNumber).padStart(2,'0'),y+115,64);
 text(fortuneDate(fortune.issuedAt),1190,24);
 text('A little theatre. Your future is yours.',1240,23);
 text('enterthefold.io/fortune-teller',1290,22,'sans-serif','#715337');
}

export async function createFortuneImage(fortune) {
 const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=1400;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Image export unavailable');
 drawFortuneCard(ctx,fortune);
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Image export failed')),'image/png'));
}
