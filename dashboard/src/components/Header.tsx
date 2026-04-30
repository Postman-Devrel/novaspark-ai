import "./Header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand">
          <span className="logo">⚡</span>
          <div>
            <span className="brand-name">NovaSpark AI</span>
            <span className="brand-tag">Agent HQ</span>
          </div>
        </div>
        <div className="header-right">
          <span className="tagline">Igniting Ideas, Automating Everything</span>
          <div className="platform-badge">
            <span className="dot online" />
            Astro AI
          </div>
        </div>
      </div>
    </header>
  );
}
