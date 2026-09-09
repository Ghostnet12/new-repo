import { useEffect, useRef, useState } from 'react';
import NavIcon from './NavIcon.jsx';
import AmbientMusic from './AmbientMusic.jsx';
import PageLink from './PageLink.jsx';
import {pages} from '../../../shared/pages.js';

export default function TopNavigation({ items, activeId, onChoose, onHome, onProfile, onDeck }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const scrollRef = useRef(null);
  const [edges,setEdges] = useState({left:false,right:false});

  useEffect(()=>{
    const scroll=scrollRef.current;
    const measure=()=>{
      setEdges({left:scroll.scrollLeft>2,right:scroll.scrollLeft+scroll.clientWidth<scroll.scrollWidth-2});
      document.documentElement.style.setProperty('--fold-header-height',`${rootRef.current.offsetHeight}px`);
    };
    const observer=new ResizeObserver(measure);
    observer.observe(scroll);observer.observe(rootRef.current);
    scroll.addEventListener('scroll',measure,{passive:true});measure();
    return()=>{observer.disconnect();scroll.removeEventListener('scroll',measure);};
  },[]);

  useEffect(()=>{
    setOpen(false);
    const scroll=scrollRef.current;
    const selected=scroll.querySelector('[aria-current="page"]');
    if(!selected)return;
    const bounds=scroll.getBoundingClientRect(),item=selected.getBoundingClientRect();
    const inset=scroll.querySelector('.ambient-music')?.offsetWidth||0;
    const delta=item.left<bounds.left+inset?item.left-bounds.left-inset:item.right>bounds.right?item.right-bounds.right:0;
    if(delta)scroll.scrollBy({left:delta,behavior:'auto'});
  },[activeId]);

  const scrollNav=direction=>{
    const scroll=scrollRef.current;
    scroll.scrollBy({left:direction*Math.max(104,scroll.clientWidth-82),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  };

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector('a, button')?.focus();
    const dismiss = event => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const escape = event => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  const choose = item => { setOpen(false); onChoose(item); };
  return <header className="mystic-topbar" ref={rootRef} onBlur={event => {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <div className="topbar-inner">
      <PageLink href="/" className="mystic-brand" onNavigate={() => { setOpen(false); scrollRef.current?.scrollTo({left:0,behavior:'auto'}); onHome(); }} aria-label="The Fold home">
        <img className="brand-eye" src="/icons/fold-eye-192.png" alt="" width="52" height="52" />
        <span className="brand-lockup"><b>THE FOLD</b><small>TRUTH LIVES IN THE SHADOWS</small></span>
      </PageLink>
      <div className="navigation-rail">
      <nav className="mystic-nav-scroll" ref={scrollRef} aria-label="Main navigation">
        <AmbientMusic />
        {items.map(item => {
          const props={className:`${activeId===item.id?'active ':''}${['read','fortune','history'].includes(item.id)?'nav-primary':''}`, 'aria-current':activeId===item.id?'page':undefined};
          const content=<><NavIcon name={item.id}/><span>{item.label}</span></>;
          return item.tool?<button key={item.id} {...props} onClick={()=>choose(item)}>{content}</button>:<PageLink key={item.id} {...props} href={pages[item.id]?.path||'/history'} onNavigate={()=>choose(item)}>{content}</PageLink>;
        })}
      </nav>
      {(edges.left||edges.right)&&<div className="nav-scroll-controls" aria-label="Scroll navigation">
        <button type="button" disabled={!edges.left} onClick={()=>scrollNav(-1)} aria-label="Previous navigation items"><NavIcon name="arrow"/></button>
        <button type="button" disabled={!edges.right} onClick={()=>scrollNav(1)} aria-label="More navigation items"><NavIcon name="arrow"/></button>
      </div>}
      </div>
      <div className="mystic-actions">
        <button className="profile-control" aria-label="Your information" title="Your information" onClick={() => { setOpen(false); onProfile(); }}><NavIcon name="profile" /></button>
        <button ref={triggerRef} className="menu-control" aria-label={open ? 'Close explore menu' : 'Explore all features'} aria-expanded={open} aria-controls="fold-menu" onClick={() => setOpen(value => !value)}><NavIcon name={open ? 'close' : 'menu'} /><span>Explore</span></button>
      </div>
      {open && <nav id="fold-menu" className="fold-menu" ref={menuRef} aria-label="Explore The Fold">
        {[{label:'Start here',ids:['read','fortune','history']},{label:'Daily & personal',ids:['card','daily','natal','match']},{label:'Discover more',ids:['learn','reviews','support']}].map(group=><div className="menu-group" key={group.label}>
        <p className="menu-eyebrow">{group.label}</p>
        {items.filter(item=>group.ids.includes(item.id)).map(item => {
          const content=<><NavIcon name={item.id}/><span>{item.label}</span>{activeId===item.id&&<span className="menu-current">Current</span>}</>;
          return item.tool?<button key={item.id} aria-current={activeId===item.id?'page':undefined} onClick={()=>choose(item)}>{content}</button>:<PageLink key={item.id} href={pages[item.id]?.path||'/history'} aria-current={activeId===item.id?'page':undefined} onNavigate={()=>choose(item)}>{content}</PageLink>;
        })}
        </div>)}
        <PageLink href="/tarot-deck" className="menu-deck" onNavigate={()=>{setOpen(false);onDeck();}}><NavIcon name="read"/><span>Explore the full deck</span><NavIcon name="arrow"/></PageLink>
      </nav>}
    </div>
  </header>;
}
