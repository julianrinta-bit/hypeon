import RevealOnScroll from '@/components/ui/RevealOnScroll';
import ParallaxBgNumber from '@/components/ui/ParallaxBgNumber';

export default function Process() {
  return (
    <section className="process section" id="process">
      <ParallaxBgNumber number="03.5" />
      <div className="container">
        <RevealOnScroll>
          <p className="section-number"><span>03.5</span> — Process</p>
        </RevealOnScroll>
        <RevealOnScroll>
          <div className="process-header">
            <h2 className="process-title">How we work</h2>
            <p className="process-subtitle" style={{ color: 'var(--white-60)', fontSize: '1rem', lineHeight: 1.7, marginTop: '1rem', maxWidth: '500px' }}>From audit to scale — six steps, zero guesswork.</p>
          </div>
        </RevealOnScroll>
        <RevealOnScroll stagger>
          <div className="process-steps">
            <div className="process-step">
              <div className="process-step-left">
                <span className="process-step-number">01</span>
                <div className="process-step-line" aria-hidden="true"></div>
              </div>
              <div className="process-step-content">
                <h3 className="process-step-title">Channel Audit</h3>
                <p className="process-step-desc">We analyze your content, audience, and performance. You receive a detailed report within 48 hours.</p>
              </div>
            </div>
            <div className="process-step">
              <div className="process-step-left">
                <span className="process-step-number">02</span>
                <div className="process-step-line" aria-hidden="true"></div>
              </div>
              <div className="process-step-content">
                <h3 className="process-step-title">Strategy Sprint</h3>
                <p className="process-step-desc">Two-week deep dive: positioning, format development, content architecture, thumbnail systems.</p>
              </div>
            </div>
            <div className="process-step">
              <div className="process-step-left">
                <span className="process-step-number">03</span>
                <div className="process-step-line" aria-hidden="true"></div>
              </div>
              <div className="process-step-content">
                <h3 className="process-step-title">Production Setup</h3>
                <p className="process-step-desc">We build your content pipeline — scripts, briefs, templates, publishing workflow.</p>
              </div>
            </div>
            <div className="process-step">
              <div className="process-step-left">
                <span className="process-step-number">04</span>
                <div className="process-step-line" aria-hidden="true"></div>
              </div>
              <div className="process-step-content">
                <h3 className="process-step-title">Launch &amp; Test</h3>
                <p className="process-step-desc">First batch of optimized content goes live. We measure everything from day one.</p>
              </div>
            </div>
            <div className="process-step">
              <div className="process-step-left">
                <span className="process-step-number">05</span>
                <div className="process-step-line" aria-hidden="true"></div>
              </div>
              <div className="process-step-content">
                <h3 className="process-step-title">Optimize</h3>
                <p className="process-step-desc">Weekly analysis. What performs gets scaled. What doesn&rsquo;t gets cut. No sacred cows.</p>
              </div>
            </div>
            <div className="process-step">
              <div className="process-step-left">
                <span className="process-step-number">06</span>
              </div>
              <div className="process-step-content">
                <h3 className="process-step-title">Scale</h3>
                <p className="process-step-desc">Expand to new formats, languages, and markets. Your channel becomes a revenue machine.</p>
              </div>
            </div>
          </div>
        </RevealOnScroll>
        <a href="#contact" className="section-cta-inline" data-magnetic="">Start with step one — it&rsquo;s free</a>
      </div>
    </section>
  );
}
