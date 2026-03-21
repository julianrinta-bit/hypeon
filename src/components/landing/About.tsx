import RevealOnScroll from '@/components/ui/RevealOnScroll';
import ParallaxBgNumber from '@/components/ui/ParallaxBgNumber';

export default function About() {
  return (
    <section className="about section" id="about">
      <ParallaxBgNumber number="06" />
      <div className="container">
        <RevealOnScroll>
          <p className="section-number"><span>06</span> — About</p>
        </RevealOnScroll>
        <div className="about-layout">
          <RevealOnScroll className="about-left reveal">
            <div className="about-fact">
              <div className="about-fact-value">Dubai, UAE</div>
              <div className="about-fact-label">Headquarters</div>
            </div>
            <div className="about-fact">
              <div className="about-fact-value">6 countries</div>
              <div className="about-fact-label">Operations history</div>
            </div>
            <div className="about-fact">
              <div className="about-fact-value">4 languages</div>
              <div className="about-fact-label">Native fluency</div>
            </div>
            <div className="about-fact">
              <div className="about-fact-value">Since 2015</div>
              <div className="about-fact-label">In digital media</div>
            </div>
          </RevealOnScroll>
          <RevealOnScroll className="about-right reveal reveal-delay-1">
            <h2 className="about-title">Built on a decade of results, not a deck of promises.</h2>
            <p className="about-body">
              We built this agency after spending a decade scaling content operations that most agencies cannot imagine — 50+ channels, 15 languages, content factories producing thousands of videos per month across every major market.
            </p>
            <p className="about-body">
              That experience is not available on the open market. It was built inside organizations that operate under strict NDAs — which is why you will not find logos on this page. We are happy to discuss our approach on a call.
            </p>
            <p className="about-body">
              We work in 4 native languages. We have led teams of 100+. And we have been deploying AI to cut costs and multiply output since 2022 — before it was fashionable.
            </p>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
