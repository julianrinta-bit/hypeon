import RevealOnScroll from '@/components/ui/RevealOnScroll';
import ParallaxBgNumber from '@/components/ui/ParallaxBgNumber';

export default function Different() {
  return (
    <section className="different section" id="different">
      <ParallaxBgNumber number="05" />
      <div className="container">
        <RevealOnScroll>
          <p className="section-number"><span>05</span> — How we&rsquo;re different</p>
        </RevealOnScroll>
        <div className="different-layout">
          <RevealOnScroll className="different-left reveal">
            <h2 className="different-quote">
              We didn&rsquo;t learn YouTube<br />
              from a course.<br /><br />
              We learned it scaling<br />
              <em>50+ channels</em> across<br />
              <em>15 languages</em><br />
              to <em>5 billion views.</em>
            </h2>
          </RevealOnScroll>
          <RevealOnScroll className="different-right reveal reveal-delay-2">
            <p className="different-text">
              Our team spent a decade inside the engine rooms of some of the largest content operations on the internet — hundreds of millions of subscribers, thousands of videos per month, formats that hit 100M+ views individually.
            </p>
            <p className="different-text">
              In 2022, we cut production costs 60%+ using AI systems we built ourselves — a full year before the rest of the industry discovered ChatGPT.
            </p>
            <ul className="different-features">
              <li>Every AI output reviewed by a senior strategist</li>
              <li>A named human accountable for your account</li>
              <li>Tools built from a decade of production knowledge</li>
              <li>The speed of automation with the taste of experience</li>
            </ul>
            <div className="different-pull-quote">
              <strong>&ldquo;AI handles the volume. Humans handle the judgment. And humans are accountable for every decision.&rdquo;</strong>
            </div>
          </RevealOnScroll>
        </div>
        <a href="#contact" className="section-cta-inline" data-magnetic="">Experience the difference. Free audit</a>
      </div>
    </section>
  );
}
