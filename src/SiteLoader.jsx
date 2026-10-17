export default function SiteLoader() {
  return <div className="gc-loader" role="status" aria-live="polite" aria-label="Loading Games and Connect">
    <div className="gc-loader-mark" aria-hidden="true">
      <span className="gc-loader-orbit" />
      <img src="/assets/games-connect/brand-logo-v2.png" alt="" width="128" height="128" />
    </div>
    <p className="gc-loader-tagline" aria-hidden="true">Play. Travel. Connect.</p>
    <div className="gc-loader-track" aria-hidden="true"><span /></div>
    <span className="gc-loader-label">Getting things ready</span>
  </div>;
}
