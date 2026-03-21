import RevealOnScroll from '@/components/ui/RevealOnScroll';

export default function Showreel() {
  return (
    <section className="showreel section" id="showreel">
      <div className="container">
        <RevealOnScroll>
          <p className="section-number"><span>—</span> Watch how we think</p>
        </RevealOnScroll>
        <RevealOnScroll>
          <div className="showreel-wrapper">
            <div className="showreel-embed">
              <iframe
                src="https://www.youtube-nocookie.com/embed/4rx33ktY-NA?rel=0&modestbranding=1&color=white"
                title="Hype On Media Showreel"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-presentation"
              ></iframe>
            </div>
            <p className="showreel-caption">Meet Chris from our strategy team — 4 min</p>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
