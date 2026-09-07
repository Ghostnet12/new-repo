export default function HeroDecor() {
  return <div className="hero-cosmos" aria-hidden="true">
    <div className="cosmic-wash cosmic-wash-a" />
    <div className="cosmic-wash cosmic-wash-b" />
    <div className="star-field">
      {Array.from({ length:18 }, (_, i) => <span className="star" key={i} />)}
    </div>
    <div className="shooting-star shooting-star-a" />
    <div className="shooting-star shooting-star-b" />
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
  </div>;
}
