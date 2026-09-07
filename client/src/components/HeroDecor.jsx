export default function HeroDecor() {
  return <div className="hero-cosmos" aria-hidden="true">
    <div className="cosmic-wash cosmic-wash-a" />
    <div className="cosmic-wash cosmic-wash-b" />
    <div className="cosmic-wash cosmic-wash-c" />
    <div className="star-field">
      {Array.from({ length:24 }, (_, i) => <span className="star" key={i} />)}
    </div>
    <div className="celestial-ring celestial-ring-outer" />
    <div className="celestial-ring celestial-ring-inner" />
    <div className="moon-phase-row">
      <span>◐</span><span>◒</span><span>◑</span><b>●</b><span>◐</span><span>◓</span><span>◑</span>
    </div>
    <div className="mystic-eye-sigil">
      <span className="eye-arc eye-arc-top" />
      <span className="eye-arc eye-arc-bottom" />
      <span className="eye-iris"><span className="eye-pupil" /></span>
      <span className="eye-ray eye-ray-a" />
      <span className="eye-ray eye-ray-b" />
      <span className="eye-ray eye-ray-c" />
      <span className="eye-ray eye-ray-d" />
    </div>
    <span className="hero-rune rune-a">☾</span>
    <span className="hero-rune rune-b">✦</span>
    <span className="hero-rune rune-c">☽</span>
    <span className="hero-rune rune-d">✧</span>
    <div className="mountain-silhouette mountain-left" />
    <div className="mountain-silhouette mountain-right" />
  </div>;
}
