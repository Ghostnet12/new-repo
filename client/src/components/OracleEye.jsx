import { useEffect, useRef, useState } from 'react';

const ANSWERS = [
  'YES', 'NO', 'LIKELY', 'UNLIKELY', 'NOT YET', 'THE PATH IS OPEN',
  'LOOK DEEPER', 'TRUST YOUR FIRST INSTINCT', 'SIGNS POINT TO YES',
  'THE SHADOWS SAY NO', 'UNCLEAR — ASK AGAIN', 'WAIT FOR THE PATH TO CHANGE'
];

export default function OracleEye() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [listening, setListening] = useState(false);
  const [permissionNeeded, setPermissionNeeded] = useState(false);
  const lastShake = useRef(0);

  const reveal = () => {
    if (!question.trim()) return;
    setAnswer(ANSWERS[Math.floor(Math.random() * ANSWERS.length)]);
    if (navigator.vibrate) navigator.vibrate([35, 35, 55]);
  };

  const enableMotion = async () => {
    try {
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        const result = await DeviceMotionEvent.requestPermission();
        if (result !== 'granted') return;
      }
      setListening(true);
      setPermissionNeeded(false);
    } catch { setPermissionNeeded(true); }
  };

  useEffect(() => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') setPermissionNeeded(true);
    else setListening(true);
  }, []);

  useEffect(() => {
    if (!listening) return;
    const onMotion = event => {
      const a = event.accelerationIncludingGravity || event.acceleration;
      if (!a) return;
      const magnitude = Math.sqrt((a.x || 0) ** 2 + (a.y || 0) ** 2 + (a.z || 0) ** 2);
      const now = Date.now();
      if (magnitude > 22 && now - lastShake.current > 1100) {
        lastShake.current = now;
        reveal();
      }
    };
    window.addEventListener('devicemotion', onMotion, { passive:true });
    return () => window.removeEventListener('devicemotion', onMotion);
  }, [listening, question]);

  return <aside className={`oracle-eye-widget ${answer ? 'has-answer' : ''}`} aria-label="Ask the Eye yes or no oracle">
    <div className="oracle-liquid" aria-hidden="true"><span className="oracle-eye-shape"><i /></span><b>{answer || '?'}</b></div>
    <div className="oracle-eye-copy">
      <strong>ASK THE EYE</strong>
      <input value={question} onChange={e=>{setQuestion(e.target.value);setAnswer('');}} maxLength="180" placeholder="Ask a yes or no question" aria-label="Ask a yes or no question" />
      <small>{answer ? 'The Eye has answered.' : 'Shake your phone to reveal the answer.'}</small>
      {permissionNeeded && <button type="button" onClick={enableMotion}>Enable Shake</button>}
      <button type="button" className="oracle-tap-fallback" disabled={!question.trim()} onClick={reveal}>Reveal without shaking</button>
    </div>
  </aside>;
}
