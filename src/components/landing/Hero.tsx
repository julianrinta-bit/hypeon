import RotatingText from '@/components/ui/RotatingText';
import ParallaxBgNumber from '@/components/ui/ParallaxBgNumber';

export default function Hero() {
  return (
    <section className="hero section" id="hero">
      <ParallaxBgNumber number="01" />
      <div className="container">
        <div className="hero-content">
          <p className="hero-tag">YouTube growth agency — Dubai</p>
          <h1 className="hero-headline">
            Your<br />
            <RotatingText /><br />
            is leaving money on the table.
          </h1>
          <div className="hero-sub">
            <p className="hero-sub-text">We turn underperforming channels into growth engines.</p>
            <p className="hero-stats-line">
              <strong>10</strong> years &nbsp;/&nbsp; <strong>50+</strong> channels &nbsp;/&nbsp; <strong>15</strong> languages &nbsp;/&nbsp; <strong>5 billion</strong> views
            </p>
            <div className="hero-cta-row">
              <a href="#contact" className="btn-primary magnetic">
                <span>Get a Channel Audit</span>
                <span className="arrow">&rarr;</span>
              </a>
              <a href="#work" className="btn-ghost">See how we think &rarr;</a>
            </div>
          </div>
        </div>
      </div>
      <div className="hero-scroll-hint" aria-hidden="true">
        <span>Scroll</span>
        <div className="scroll-line"></div>
      </div>
    </section>
  );
}
