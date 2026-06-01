export default function Footer() {
  return (
    <footer className="footer-v2">
      <div className="container">
        <div className="footer-top">
          <div>
            <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="footer-wordmark-v2">Hype On Media</div>
            </a>
            <div className="footer-tagline-v2">YouTube, Engineered.</div>
          </div>
          <div className="footer-locations">
            <div className="footer-loc">
              <span className="footer-loc-flag">🇺🇸</span>
              <div>
                <div className="footer-loc-country">United States</div>
                <div className="footer-loc-note">Operating as Hype On Media</div>
              </div>
            </div>
            <div className="footer-loc">
              <span className="footer-loc-flag">🇦🇪</span>
              <div>
                <div className="footer-loc-country">United Arab Emirates</div>
                <div className="footer-loc-note">Hype On Media FZCO</div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-legal-v2">
            <span>&copy; 2026 Outright Publishing LLC</span>
            <span className="footer-dot">&middot;</span>
            <a href="/privacy">Privacy</a>
            <span className="footer-dot">&middot;</span>
            <a href="/terms">Terms</a>
          </div>
          <div className="footer-social-v2">
            <a
              href="https://www.linkedin.com/company/100785335/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-btn-v2"
              aria-label="LinkedIn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 11.001-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
              </svg>
            </a>
            <a
              href="mailto:hello@hypeon.media"
              className="footer-social-btn-v2 footer-social-btn-v2--text"
            >
              hello@hypeon.media
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
