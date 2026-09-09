import { useEffect, useRef, useState } from 'react';
import { bindAmbientPageLifecycle, createAmbientPlayer } from '../lib/ambientPlayer.js';

const preferenceKey = 'fold-ambient-music';
export default function AmbientMusic() {
  const player = useRef(null);
  const control = useRef(null);
  const [state, setState] = useState('off');
  useEffect(() => {
    let enabled = true;
    try { enabled = localStorage.getItem(preferenceKey) !== 'off'; } catch { /* Playback works without storage. */ }
    const instance = createAmbientPlayer(new Audio(), { enabled, active: document.visibilityState !== 'hidden', onState: setState });
    player.current = instance;
    const unbindPageLifecycle = bindAmbientPageLifecycle(instance);
    const retry = event => {
      if (control.current?.contains(event.target) || event.defaultPrevented) return;
      if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return;
      instance.retry();
    };
    document.addEventListener('click', retry);
    document.addEventListener('keydown', retry);
    instance.start();
    return () => {
      document.removeEventListener('click', retry);
      document.removeEventListener('keydown', retry);
      unbindPageLifecycle();
      instance.destroy(); player.current = null;
    };
  }, []);
  const on = state === 'playing' || state === 'starting' || state === 'suspended';
  const label = state === 'blocked' ? 'Tap to play' : state === 'error' ? 'Tap to retry' : state === 'starting' ? 'Starting…' : state === 'suspended' ? 'Paused while away' : on ? 'On · Soft volume' : 'Off';
  return <div className="ambient-music">
    <button ref={control} type="button" className="ambient-control" role="switch" aria-checked={on} aria-label="Relaxing background music" title={`Music: ${label}`} onClick={() => {
      if (!player.current) return;
      const enabled = player.current.toggle();
      try { localStorage.setItem(preferenceKey, enabled ? 'on' : 'off'); } catch { /* Optional preference. */ }
    }}>
      <span className="ambient-label">Music<span className="sr-only">: {label}</span></span>
      <span className={`ambient-switch ${on ? 'is-on' : ''}`} aria-hidden="true"><i /></span>
    </button>
    <span className="sr-only" role="status">{state === 'blocked' ? 'Music is ready. Tap to start playback.' : state === 'error' ? 'Music could not load. Tap to retry.' : ''}</span>
  </div>;
}
