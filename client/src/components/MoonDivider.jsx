export default function MoonDivider({ compact = false }) {
  return <div className={`moon-divider ${compact ? 'compact' : ''}`} aria-hidden="true">
    <span className="moon-line" />
    <span className="moon-phase">☾</span>
    <span className="moon-phase">◐</span>
    <span className="moon-phase moon-full">●</span>
    <span className="moon-phase">◑</span>
    <span className="moon-phase">☽</span>
    <span className="moon-line" />
  </div>;
}
