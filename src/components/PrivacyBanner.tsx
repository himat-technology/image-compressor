export function PrivacyBanner() {
  return (
    <aside className="privacy-banner" aria-label="Privacy guarantees">
      <div>
        <p className="eyebrow">Privacy</p>
        <h2>100% Browser-Local Processing</h2>
        <p>
          Zero server uploads. Your photos and assets never leave your device.
          Images are decoded, resized, and compressed in browser memory using
          HTML Canvas APIs.
        </p>
      </div>
      <ul className="privacy-list">
        <li>Zero Server Uploads</li>
        <li>No cloud processing</li>
        <li>No analytics on image bytes</li>
        <li>Object URLs revoked on remove</li>
      </ul>
    </aside>
  );
}
