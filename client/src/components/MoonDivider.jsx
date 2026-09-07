export default function MoonDivider({ compact = false }) {
  return <div className={`moon-divider ${compact ? 'compact' : ''}`} aria-hidden="true" />;
}
