/* === Footer v2 ===
   Design: dark bg #0A0A0C, logo+copyright left, social links right.
   Matches Hype On Media Landing v2.dc.html footer section.
*/
export default function Footer() {
  return (
    <footer className="footer-v2">
      <div className="footer-v2-inner">
        {/* Left: logo + copyright */}
        <div className="footer-v2-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/hypeon-logo.png" alt="" width={20} height={20} style={{ objectFit: 'contain' }} />
          <span className="footer-v2-copy">Hype On Media · Outright Publishing LLC · © 2024–2026</span>
        </div>

        {/* Right: links */}
        <div className="footer-v2-links">
          <a
            href="https://www.linkedin.com/company/100785335/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-v2-link"
          >
            LinkedIn
          </a>
          <a
            href="https://youtube.com/@hypeonmedia"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-v2-link"
          >
            YouTube
          </a>
          <a href="/privacy" className="footer-v2-link">Privacy</a>
          <a href="/terms" className="footer-v2-link">Terms</a>
        </div>
      </div>
    </footer>
  );
}
