import RevealOnScroll from '@/components/ui/RevealOnScroll';
import ParallaxBgNumber from '@/components/ui/ParallaxBgNumber';

export default function Guarantee() {
  return (
    <section className="section" id="guarantee">
      <ParallaxBgNumber number="05" />
      <div className="container">
        <RevealOnScroll>
          <p className="eyebrow"><span>05</span> — Our guarantee</p>
        </RevealOnScroll>
        <RevealOnScroll>
          <div className="guarantee-box">
            <h2 className="guarantee-title">
              If we don&rsquo;t hit your targets,<br />your next month is on us.
            </h2>
            <p className="guarantee-text">
              On select engagements, we agree on performance targets before we start. From month two onward, if we don&rsquo;t hit the agreed targets, you get a full credit toward your next month of work — effectively free. No questions, no fine print.
            </p>
            <p className="guarantee-text" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--white-30)', letterSpacing: '0.05em' }}>
              Available on select engagements. Terms agreed before kickoff.
            </p>
            <div className="guarantee-badge">◆ Performance credit guarantee</div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
