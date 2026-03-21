import RevealOnScroll from '@/components/ui/RevealOnScroll';
import ParallaxBgNumber from '@/components/ui/ParallaxBgNumber';

export default function Work() {
  return (
    <section className="work section" id="work">
      <ParallaxBgNumber number="04" />
      <div className="container">
        <RevealOnScroll>
          <p className="section-number"><span>04</span> — Work</p>
        </RevealOnScroll>
        <RevealOnScroll>
          <div className="work-header">
            <h2 className="work-title">Here is how we think — applied to real brands you can verify.</h2>
          </div>
        </RevealOnScroll>
        <RevealOnScroll stagger>
          <div className="work-grid">
            <div className="work-card">
              <div className="work-card-tag">DTC Cookware &middot; YouTube Growth Audit</div>
              <h3 className="work-card-title">Channel repositioning from lifestyle to conversion-first content architecture</h3>
              <p className="work-card-desc">Premium cookware brand with strong product-market fit but zero YouTube strategy. We rebuilt their content system around purchase intent.</p>
            </div>
            <div className="work-card">
              <div className="work-card-tag">Fintech &middot; Content Strategy</div>
              <h3 className="work-card-title">90-day YouTube launch roadmap from zero to first 10K subscribers</h3>
              <p className="work-card-desc">Personal finance app entering a saturated space. We mapped the content gaps competitors ignored and built a launch system around them.</p>
            </div>
            <div className="work-card">
              <div className="work-card-tag">Beauty DTC &middot; Format Development</div>
              <h3 className="work-card-title">Quiz-to-YouTube pipeline turning product education into acquisition engine</h3>
              <p className="work-card-desc">Personalized haircare brand with a strong quiz funnel. We extended it into YouTube, turning education content into the top-of-funnel driver.</p>
            </div>
            <div className="work-card">
              <div className="work-card-tag">Real Estate &middot; Organic + Paid</div>
              <h3 className="work-card-title">YouTube as primary lead channel with organic authority and paid amplification</h3>
              <p className="work-card-desc">Regional real estate company spending on portals. We shifted budget to YouTube as the primary lead channel with measurable attribution.</p>
            </div>
          </div>
        </RevealOnScroll>
        <a href="#contact" className="section-cta-inline" data-magnetic="">Want this thinking applied to yours?</a>
      </div>
    </section>
  );
}
