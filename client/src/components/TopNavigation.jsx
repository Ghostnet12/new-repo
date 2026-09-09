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
      <PageLink href="/" className="mystic-brand" onNavigate={() => { setOpen(false); onHome(); }} aria-label="The Fold home">
        <img className="brand-eye" src="/icons/fold-eye-192.png" alt="" width="52" height="52" />
        <span className="brand-lockup"><b>THE FOLD</b><small>TRUTH LIVES IN THE SHADOWS</small></span>
      </PageLink>
      <nav className="mystic-nav-scroll" aria-label="Main navigation">
        <AmbientMusic />
        {items.map(item => {
          const props={className:activeId===item.id?'active':'', 'aria-current':activeId===item.id?'page':undefined};
          const content=<><NavIcon name={item.id}/><span>{item.label}</span></>;
          return item.tool?<button key={item.id} {...props} onClick={()=>choose(item)}>{content}</button>:<PageLink key={item.id} {...props} href={pages[item.id]?.path||'/history'} onNavigate={()=>choose(item)}>{content}</PageLink>;
        })}
      </nav>
      <div className="mystic-actions">
        <button className="profile-control" aria-label="Your information" title="Your information" onClick={() => { setOpen(false); onProfile(); }}><NavIcon name="profile" /></button>
        <button ref={triggerRef} className="menu-control" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="fold-menu" onClick={() => setOpen(value => !value)}><NavIcon name={open ? 'close' : 'menu'} /></button>
      </div>
      {open && <nav id="fold-menu" className="fold-menu" ref={menuRef} aria-label="Explore The Fold">
        <p className="menu-eyebrow">Find your way</p>
        {items.map(item => {
          const content=<><NavIcon name={item.id}/><span>{item.label}</span>{activeId===item.id&&<span className="menu-current">Current</span>}</>;
          return item.tool?<button key={item.id} onClick={()=>choose(item)}>{content}</button>:<PageLink key={item.id} href={pages[item.id]?.path||'/history'} aria-current={activeId===item.id?'page':undefined} onNavigate={()=>choose(item)}>{content}</PageLink>;
        })}
        <PageLink href="/tarot-deck" className="menu-deck" onNavigate={()=>{setOpen(false);onDeck();}}><NavIcon name="read"/><span>Explore the full deck</span><NavIcon name="arrow"/></PageLink>
      </nav>}
    </div>
  </header>;
}
