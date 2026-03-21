export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-left">
            <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}><div className="footer-wordmark">HYPE ON MEDIA</div></a>
            <div className="footer-tagline">YouTube. Engineered.</div>
          </div>
          <div className="footer-right">
            <a href="/blog" className="footer-domain" style={{ textDecoration: 'none', color: 'inherit' }}>Blog</a>
            <span className="footer-domain">hypeon.media</span>
            <span className="footer-copy">&copy; 2024–2026 Hype On Media FZCO</span>
            <div className="footer-social">
              <a href="https://linkedin.com/company/hypeonmedia" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M4.94 2.5A1.94 1.94 0 013 4.44C3 5.5 3.87 6.38 4.94 6.38s1.94-.88 1.94-1.94A1.94 1.94 0 004.94 2.5zM3.25 7.88h3.38V17.5H3.25V7.88zm5.63 0h3.24v1.31h.05a3.55 3.55 0 013.2-1.75c3.42 0 4.05 2.25 4.05 5.18V17.5h-3.38v-3.44c0-1.56-.03-3.56-2.17-3.56-2.17 0-2.5 1.7-2.5 3.44V17.5H8.88V7.88z"/></svg>
              </a>
              <a href="https://youtube.com/@hypeonmedia" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M19.15 4.84a2.5 2.5 0 00-1.76-1.77C15.95 2.5 10 2.5 10 2.5s-5.95 0-7.39.57A2.5 2.5 0 00.85 4.84 26.2 26.2 0 00.28 10a26.2 26.2 0 00.57 5.16 2.5 2.5 0 001.76 1.77c1.44.57 7.39.57 7.39.57s5.95 0 7.39-.57a2.5 2.5 0 001.76-1.77A26.2 26.2 0 0019.72 10a26.2 26.2 0 00-.57-5.16zM8.05 13.02V6.98L13.2 10l-5.15 3.02z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
