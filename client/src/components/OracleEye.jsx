import QuickMysticTools from './QuickMysticTools.jsx';
import { loadLocalProfile } from '../lib/localFallback.js';

export default function OracleEye(){
  const profile = loadLocalProfile() || {};
  const startReading = () => {
    document.querySelector('.reading-form-anchor')?.scrollIntoView({ behavior:'smooth', block:'start' });
  };
  return <div className="hero-quick-tools"><QuickMysticTools profile={profile} onStartReading={startReading}/></div>;
}
