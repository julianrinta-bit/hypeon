import MobileMenu from './MobileMenu';

export default function Nav() {
  return (
    <>
      <nav className="nav" role="navigation" aria-label="Main navigation">
        <a href="/" className="nav-logo" aria-label="Hype On Media home">
          <span className="nav-logo-slash">//</span>
          <span className="nav-logo-text">HYPE ON</span>
        </a>
        <ul className="nav-links">
          <li><a href="/#proof">Proof</a></li>
          <li><a href="/#services">Services</a></li>
          <li><a href="/#work">Work</a></li>
          <li><a href="/#about">About</a></li>
          <li><a href="/blog">Blog</a></li>
        </ul>
        <a href="/#contact" className="nav-cta magnetic">Get a free audit</a>
        <MobileMenu />
      </nav>
    </>
  );
}
