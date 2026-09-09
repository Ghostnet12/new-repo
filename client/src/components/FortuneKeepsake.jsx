import {useEffect,useRef,useState} from 'react';
import {canShareFortune,shareFortune} from '../lib/fortuneShare.js';
import NavIcon from './NavIcon.jsx';

export default function FortuneKeepsake({image,fortune}) {
 const [shareAvailable]=useState(()=>canShareFortune(image.file));
 const [sharing,setSharing]=useState(false),[preview,setPreview]=useState(false);
 const pending=useRef(false),active=useRef(true),previewRef=useRef(null);
 const appleMobile=/iPhone|iPad|iPod/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1);
 const label=appleMobile?'Save to Photos':shareAvailable?'Save or share card':'Save card image';
 useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
 useEffect(()=>{
  if(!preview)return;
  previewRef.current?.focus({preventScroll:true});
  previewRef.current?.scrollIntoView({behavior:'auto',block:'nearest'});
 },[preview]);
 const save=async()=>{
  if(pending.current)return;
  pending.current=true;setSharing(true);
  const result=await shareFortune(image.file);
  if(!active.current)return;
  pending.current=false;setSharing(false);
  if(result==='preview')setPreview(true);
  // A resolved share doesn't tell us which app was chosen or whether Photos saved it.
 };

 return <div className="fortune-keep">
  <h3>Keep a little of the magic.</h3>
  <button type="button" className="fortune-save" onClick={save} disabled={sharing} aria-describedby="fortune-save-help"><NavIcon name="share"/>{sharing?'Sharing menu open…':label}</button>
  <p id="fortune-save-help">{shareAvailable?(appleMobile?'Choose “Save Image” in the sharing menu to add your card to Photos.':'Choose where to save or share your card in your device’s menu.'):'Open your card image, then touch and hold it for saving options.'}</p>
  <div className="fortune-keep-links">
   <button type="button" onClick={()=>setPreview(value=>!value)} aria-expanded={preview} aria-controls="fortune-image-preview">{preview?'Hide card image':'View card image'}</button>
   <a href={image.url} download={image.filename}><NavIcon name="download"/>Download PNG</a>
  </div>
  {preview&&<figure id="fortune-image-preview" className="fortune-image-preview" ref={previewRef} tabIndex="-1" aria-labelledby="fortune-preview-help">
   <figcaption id="fortune-preview-help">{appleMobile?'Touch and hold the image below, then choose “Save to Photos” or “Save Image” if offered.':'Touch and hold the image for saving options, or use Download PNG to keep the full-size card.'}</figcaption>
   <img src={image.url} width="1000" height="1500" alt={`Your keepsake fortune card: ${fortune.title}. ${fortune.message} ${fortune.whisper} Lucky number ${fortune.luckyNumber}.`}/>
  </figure>}
 </div>;
}
