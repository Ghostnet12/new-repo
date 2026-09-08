export const musicTracks = Array.from({ length: 6 }, (_, index) => `/assets/music/moonlit-${String(index + 1).padStart(2, '0')}.m4a`);

export function createAmbientPlayer(audio, { tracks = musicTracks, enabled = true, onState = () => {}, random = Math.random } = {}) {
  let wanted = enabled, disposed = false, request = 0, current = '', bag = [], state = 'off';
  const failed = new Set();
  const report = next => { state = next; if (!disposed) onState(next); };
  audio.preload = 'none';
  audio.volume = 0.7; // The files themselves are quiet, including on iOS.
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
    if (!current) {
      current = choose();
      if (!current) { report('error'); return; }
      audio.src = current;
    }
    const token = ++request;
    report('starting');
    Promise.resolve(audio.play()).then(() => {
      if (disposed || !wanted) { audio.pause(); return; }
      if (token === request) report('playing');
    }).catch(error => {
      if (disposed || !wanted || token !== request) return;
      if (error.name === 'NotAllowedError' || error.name === 'AbortError') report('blocked');
      else skip();
    });
  };
  const advance = () => {
    if (!wanted || disposed) return;
    ++request;
    const next = choose();
    if (!next) { report('error'); return; }
    current = next;
    audio.src = current;
    play();
  };
  const skip = () => {
    if (!wanted || disposed || failed.has(current)) return;
    failed.add(current);
    bag = bag.filter(track => !failed.has(track));
    advance();
  };
  const paused = () => { if (wanted && state === 'playing' && !audio.ended) report('blocked'); };
  audio.addEventListener('ended', advance);
  audio.addEventListener('error', skip);
  audio.addEventListener('pause', paused);
  return {
    start: play,
    retry: () => { if (wanted && state === 'blocked') play(); },
    toggle: () => {
      if (wanted && (state === 'playing' || state === 'starting')) {
        wanted = false; ++request; report('off'); audio.pause();
      } else {
        wanted = true;
        if (state === 'error') { failed.clear(); bag = []; current = ''; }
        play();
      }
      return wanted;
    },
    destroy: () => {
      disposed = true; wanted = false; ++request;
      audio.removeEventListener('ended', advance);
      audio.removeEventListener('error', skip);
      audio.removeEventListener('pause', paused);
      audio.pause(); audio.removeAttribute('src'); audio.load();
    }
  };
}
