import RevealOnScroll from '@/components/ui/RevealOnScroll';
import ParallaxBgNumber from '@/components/ui/ParallaxBgNumber';

export default function Different() {
  return (
    <section className="section" id="different">
      <ParallaxBgNumber number="04" />
      <div className="container">
        <RevealOnScroll>
          <p className="eyebrow"><span>04</span> — How we&rsquo;re different</p>
        </RevealOnScroll>
        <div className="different-grid">
          <RevealOnScroll>
            <h2 className="different-statement">
              A human always <em>responds.</em><br />
              A human always <em>reviews.</em><br />
              A human always <em>decides.</em>
            </h2>
          </RevealOnScroll>
          <RevealOnScroll>
            <p className="different-body">
              Our team spent a decade inside the engine rooms of some of the largest content operations on the internet — hundreds of millions of subscribers, thousands of videos per month, formats that hit 100M+ views individually.
            </p>
            <p className="different-body">
              We built proprietary systems that cut production costs 70% while maintaining quality. Every output is reviewed by a senior strategist. Every decision has a name behind it.
            </p>
            <ul className="features">
              <li>Every output reviewed by a senior strategist</li>
              <li>A named human accountable for your account</li>
              <li>Proprietary systems built from a decade of production data</li>
              <li>The speed of expert systems with the taste of experience</li>
            </ul>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
