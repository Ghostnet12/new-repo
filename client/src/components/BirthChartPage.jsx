import {calculateNatal} from '../../../server/src/tarot/natal.js';
import NatalForm from './NatalForm.jsx';
import NatalChart from './NatalChart.jsx';

export default function BirthChartPage({value,onChange,onUseInReading}) {
 return <section className="panel knowledge-panel"><div className="section-kicker">Your birth sky</div><h2>Calculate Your Birth Chart</h2><NatalForm value={value} onChange={onChange} includeBirthday/><NatalChart chart={calculateNatal(value)}/><button className="secondary-button" onClick={onUseInReading}>Use these details in a reading</button></section>;
}
