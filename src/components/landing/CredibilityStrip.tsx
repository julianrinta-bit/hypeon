const ITEMS = [
  'Forbes Featured',
  '20+ Play Buttons',
  '50+ Channels Built',
  '15 Languages',
  'Since 2015',
  '$4M+/mo Revenue Managed',
];

export default function CredibilityStrip() {
  // Duplicate for seamless infinite marquee
  const loop = [...ITEMS, ...ITEMS];

  return (
    <div className="cred-strip" aria-label="Credentials">
      <div className="cred-track" aria-hidden="true">
        {loop.map((item, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 32 }}>
            <span className="cred-item">{item}</span>
            <span className="cred-sep">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
