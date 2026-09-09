export const musicTracks = Array.from({ length: 6 }, (_, index) => `/assets/music/moonlit-${String(index + 1).padStart(2, '0')}.m4a`);

export function createAmbientPlayer(audio, { tracks = musicTracks, enabled = true, active = true, onState = () => {}, random = Math.random } = {}) {
  let wanted = enabled, disposed = false, request = 0, current = '', bag = [], state = 'off';
  let attached = false, resumeAt = 0;
  const failed = new Set();
  const report = next => { state = next; if (!disposed) onState(next); };
  audio.preload = 'none';
  audio.volume = 0.7; // The files themselves are quiet, including on iOS.
  audio.muted = !active || !wanted;
  const silence = (release = false) => {
    audio.muted = true;
    audio.pause();
    if (release) {
      if (attached && Number.isFinite(audio.currentTime)) resumeAt = audio.currentTime;
      attached = false;
      audio.removeAttribute('src');
      audio.load();
    }
  };
  const restorePosition = () => {
    if (!active || !wanted || !attached || !resumeAt) return;
    try { audio.currentTime = resumeAt; resumeAt = 0; } catch { /* Retry when metadata is ready. */ }
  };
  const choose = () => {
    if (!bag.length) {
      bag = tracks.filter(track => !failed.has(track));
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      if (bag.length > 1 && bag[bag.length - 1] === current) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
    }
    return bag.pop();
  };
  const play = () => {
    if (!wanted || disposed) return;
    if (!active) { report('suspended'); return; }
    if (!current) {
      current = choose();
      if (!current) { report('error'); return; }
    }
    if (!attached) {
      audio.src = current;
      attached = true;
      restorePosition();
    }
    const token = ++request;
    audio.muted = false;
    report('starting');
    Promise.resolve(audio.play()).then(() => {
      if (disposed || !wanted || !active) { silence(); return; }
      if (token === request) report('playing');
    }).catch(error => {
      if (disposed || !wanted || !active || token !== request) return;
      if (error.name === 'NotAllowedError' || error.name === 'AbortError') report('blocked');
      else skip();
    });
  };
  const advance = () => {
    if (!wanted || disposed || !active) return;
    ++request;
    const next = choose();
    if (!next) { report('error'); return; }
    current = next;
    resumeAt = 0;
    audio.src = current;
    attached = true;
    play();
  };
  const skip = () => {
    if (!wanted || disposed || !active || failed.has(current)) return;
    failed.add(current);
    bag = bag.filter(track => !failed.has(track));
    advance();
  };
  const paused = () => { if (!disposed && active && wanted && state === 'playing' && audio.paused && !audio.ended) report('blocked'); };
  const guardPlayback = () => { if (disposed || !wanted || !active) silence(); };
  audio.addEventListener('ended', advance);
  audio.addEventListener('error', skip);
  audio.addEventListener('pause', paused);
  audio.addEventListener('play', guardPlayback);
  audio.addEventListener('playing', guardPlayback);
  audio.addEventListener('loadedmetadata', restorePosition);
  return {
    start: play,
    retry: () => { if (active && wanted && state === 'blocked') play(); },
    setActive: value => {
      value = Boolean(value);
      if (disposed || active === value) return;
      active = value;
      if (!active) {
        ++request;
        if (wanted && (state === 'playing' || state === 'starting')) report('suspended');
        // Release the media source before mobile browsers suspend the page.
        silence(true);
      } else if (wanted && state === 'suspended') play();
    },
    toggle: () => {
      if (disposed) return false;
      if (wanted && (state === 'playing' || state === 'starting' || state === 'suspended')) {
        wanted = false; ++request; report('off'); silence();
      } else {
        wanted = true;
        if (state === 'error') { failed.clear(); bag = []; current = ''; attached = false; resumeAt = 0; }
        play();
      }
      return wanted;
    },
    destroy: () => {
      disposed = true; wanted = false; ++request;
      audio.removeEventListener('ended', advance);
      audio.removeEventListener('error', skip);
      audio.removeEventListener('pause', paused);
      audio.removeEventListener('play', guardPlayback);
      audio.removeEventListener('playing', guardPlayback);
      audio.removeEventListener('loadedmetadata', restorePosition);
      silence(true);
    }
  };
}

export function bindAmbientPageLifecycle(player, { pageDocument = document, pageWindow = window } = {}) {
  let pageHidden = false;
  const sync = () => player.setActive(!pageHidden && pageDocument.visibilityState !== 'hidden');
  const hide = () => { pageHidden = true; player.setActive(false); };
  const show = () => { pageHidden = false; sync(); };
  pageDocument.addEventListener('visibilitychange', sync);
  pageWindow.addEventListener('pagehide', hide);
  pageWindow.addEventListener('pageshow', show);
  sync();
  return () => {
    pageDocument.removeEventListener('visibilitychange', sync);
    pageWindow.removeEventListener('pagehide', hide);
    pageWindow.removeEventListener('pageshow', show);
  };
}
