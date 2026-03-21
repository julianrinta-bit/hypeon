'use client';
import { useRef, useEffect, useCallback } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import ParallaxBgNumber from '@/components/ui/ParallaxBgNumber';

const GOLD_SHADES = [
  '#FFD300','#FFCE00','#FFC800','#FFC200','#FFBC00',
  '#FFB600','#FFB000','#FFAA00','#FFA400','#FF9E00',
  '#FF9800','#FF9200','#FF8C00','#FF8600','#FF8000',
];

const BAR_HEIGHTS = ['25%', '35%', '45%', '58%', '72%', '95%'];

export default function AnalyticsDashboard() {
  const gridRef = useRef<HTMLDivElement>(null);
  const sparklinePathRef = useRef<SVGPathElement>(null);
  const sparklineAreaRef = useRef<SVGPathElement>(null);
  const revenueChartRef = useRef<HTMLDivElement>(null);
  const dotsGridRef = useRef<HTMLDivElement>(null);
  const playBtnsRef = useRef<HTMLDivElement>(null);
  const segmentsBarRef = useRef<HTMLDivElement>(null);
  const costAfterRef = useRef<HTMLDivElement>(null);
  const costBadgeRef = useRef<HTMLSpanElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const rafsRef = useRef<number[]>([]);
  const hasAnimatedRef = useRef(false);
  const reduced = useReducedMotion();

  const addTimeout = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timeoutsRef.current.push(id);
  }, []);

  const countUp = useCallback((el: Element, target: number, duration: number) => {
    const start = performance.now();
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(eased * target));
      if (t < 1) {
        const id = requestAnimationFrame(tick);
        rafsRef.current.push(id);
      } else {
        el.textContent = String(target);
      }
    }
    const id = requestAnimationFrame(tick);
    rafsRef.current.push(id);
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    // Build dynamic elements
    const dotsGrid = dotsGridRef.current;
    if (dotsGrid && dotsGrid.children.length === 0) {
      for (let i = 0; i < 54; i++) {
        const d = document.createElement('div');
        d.className = 'analytics-dot';
        d.dataset.index = String(i);
        dotsGrid.appendChild(d);
      }
    }

    const playBtns = playBtnsRef.current;
    if (playBtns && playBtns.children.length === 0) {
      for (let i = 0; i < 20; i++) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'playbtn-icon');
        svg.setAttribute('viewBox', '0 0 28 20');
        svg.setAttribute('data-index', String(i));
        svg.innerHTML = '<rect x="0" y="0" width="28" height="20" rx="4" fill="rgba(240,240,236,0.2)"/><polygon points="11,5 11,15 20,10" fill="#09090b"/>';
        playBtns.appendChild(svg);
      }
    }

    const segmentsBar = segmentsBarRef.current;
    if (segmentsBar && segmentsBar.children.length === 0) {
      for (let i = 0; i < 15; i++) {
        const seg = document.createElement('div');
        seg.className = 'segment';
        seg.dataset.index = String(i);
        seg.dataset.color = GOLD_SHADES[i];
        segmentsBar.appendChild(seg);
      }
    }

    function animateCounters() {
      const counters = grid!.querySelectorAll('[data-count]');
      counters.forEach((el) => {
        const target = parseInt(el.getAttribute('data-count') || '0', 10);
        if (reduced) {
          el.textContent = String(target);
        } else {
          countUp(el, target, 1500);
        }
      });
    }

    function animateViews() {
      const path = sparklinePathRef.current;
      const area = sparklineAreaRef.current;
      if (!path || !area) return;
      if (!reduced) {
        path.classList.add('animated');
        addTimeout(() => { area.classList.add('visible'); }, 200);
      } else {
        path.style.strokeDashoffset = '0';
        area.style.opacity = '1';
      }
    }

    function animateRevenue() {
      const bars = revenueChartRef.current?.querySelectorAll('.analytics-bar');
      if (!bars) return;
      bars.forEach((bar, i) => {
        const delay = reduced ? 0 : i * 100;
        addTimeout(() => {
          (bar as HTMLElement).style.height = (bar as HTMLElement).dataset.h || '0';
        }, delay);
      });
    }

    function animateDots() {
      const dots = dotsGridRef.current?.querySelectorAll('.analytics-dot');
      if (!dots) return;
      dots.forEach((dot, i) => {
        const delay = reduced ? 0 : i * 40;
        addTimeout(() => { dot.classList.add('lit'); }, delay);
      });
    }

    function animatePlayBtns() {
      const icons = playBtnsRef.current?.querySelectorAll('.playbtn-icon');
      if (!icons) return;
      icons.forEach((icon, i) => {
        const delay = reduced ? 0 : i * 120;
        addTimeout(() => { icon.classList.add('lit'); }, delay);
      });
    }

    function animateSegments() {
      const segs = segmentsBarRef.current?.querySelectorAll('.segment');
      if (!segs) return;
      segs.forEach((seg, i) => {
        const delay = reduced ? 0 : i * 65;
        addTimeout(() => {
          (seg as HTMLElement).style.background = (seg as HTMLElement).dataset.color || '';
          seg.classList.add('filled');
        }, delay);
      });
    }

    function animateCost() {
      const afterBar = costAfterRef.current;
      const badge = costBadgeRef.current;
      if (!afterBar || !badge) return;
      if (!reduced) {
        afterBar.style.width = '100%';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            afterBar.style.width = '40%';
          });
        });
      } else {
        afterBar.style.width = '40%';
        afterBar.style.transition = 'none';
      }
      badge.classList.add('visible');
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          grid!.classList.add('visible');
          animateCounters();
          animateViews();
          animateRevenue();
          animateDots();
          animatePlayBtns();
          animateSegments();
          animateCost();
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    obs.observe(grid);

    return () => {
      obs.disconnect();
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
      rafsRef.current.forEach(cancelAnimationFrame);
      rafsRef.current = [];
    };
  }, [reduced, countUp, addTimeout]);

  return (
    <section className="proof section" id="proof">
      <ParallaxBgNumber number="02" />
      <div className="container">
        <RevealOnScroll>
          <p className="section-number"><span>02</span> — Proof</p>
        </RevealOnScroll>

        <div className="analytics-grid" id="analyticsGrid" ref={gridRef}>

          {/* Card 1: Views — HERO (spans 2 cols) */}
          <div className="analytics-card analytics-card--hero" data-card="views">
            <div>
              <div className="analytics-card__header">
                <span className="analytics-card__label">Organic Views</span>
                <span className="analytics-card__badge">Lifetime</span>
              </div>
              <div className="analytics-card__number"><span data-count="5">0</span>B+</div>
            </div>
            <div className="analytics-card__viz">
              <div className="sparkline-wrap">
                <svg viewBox="0 0 400 80" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(255,211,0,0.18)" />
                      <stop offset="100%" stopColor="rgba(255,211,0,0)" />
                    </linearGradient>
                  </defs>
                  <path className="sparkline-area" ref={sparklineAreaRef} d="M0,72 C20,72 40,70 60,68 C100,64 130,58 160,50 C200,40 240,30 280,20 C310,13 340,7 370,3 L400,0 L400,80 L0,80 Z" />
                  <path className="sparkline-path" id="sparkline" ref={sparklinePathRef} d="M0,72 C20,72 40,70 60,68 C100,64 130,58 160,50 C200,40 240,30 280,20 C310,13 340,7 370,3 L400,0" />
                </svg>
                <div className="sparkline-labels">
                  <span>2015</span>
                  <span>2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Revenue */}
          <div className="analytics-card" data-card="revenue">
            <div>
              <div className="analytics-card__header">
                <span className="analytics-card__label">Monthly Revenue</span>
                <span className="analytics-card__badge">Current</span>
              </div>
              <div className="analytics-card__number">$<span data-count="4">0</span>M+</div>
            </div>
            <div className="analytics-card__viz">
              <div className="bars-wrap" id="revenueChart" ref={revenueChartRef}>
                {BAR_HEIGHTS.map((h, i) => (
                  <div className="bar-col" key={i}>
                    <div className={`analytics-bar${i === BAR_HEIGHTS.length - 1 ? ' last' : ''}`} data-h={h}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Channels */}
          <div className="analytics-card" data-card="channels">
            <div>
              <div className="analytics-card__header">
                <span className="analytics-card__label">Channels Scaled</span>
                <span className="analytics-card__badge">Active</span>
              </div>
              <div className="analytics-card__number"><span data-count="50">0</span>+</div>
            </div>
            <div className="analytics-card__viz">
              <div className="dots-wrap" id="dotsGrid" ref={dotsGridRef}></div>
            </div>
          </div>

          {/* Card 4: Play Buttons */}
          <div className="analytics-card" data-card="playbuttons">
            <div>
              <div className="analytics-card__header">
                <span className="analytics-card__label">Play Buttons Earned</span>
                <span className="analytics-card__badge">Awards</span>
              </div>
              <div className="analytics-card__number"><span data-count="20">0</span>+</div>
            </div>
            <div className="analytics-card__viz">
              <div className="playbtns-wrap" id="playBtns" ref={playBtnsRef}></div>
            </div>
          </div>

          {/* Card 5: Languages */}
          <div className="analytics-card" data-card="languages">
            <div>
              <div className="analytics-card__header">
                <span className="analytics-card__label">Languages</span>
                <span className="analytics-card__badge">Global</span>
              </div>
              <div className="analytics-card__number"><span data-count="15">0</span></div>
            </div>
            <div className="analytics-card__viz">
              <div className="segments-wrap">
                <div className="segments-bar" id="segmentsBar" ref={segmentsBarRef}></div>
                <div className="segments-labels">
                  <span>EN</span>
                  <span>ES</span>
                  <span>FR</span>
                  <span>RU</span>
                  <span>PT</span>
                  <span>+10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 6: Cost Reduction */}
          <div className="analytics-card" data-card="cost">
            <div>
              <div className="analytics-card__header">
                <span className="analytics-card__label">Cost Reduction</span>
                <span className="analytics-card__badge">Efficiency</span>
              </div>
              <div className="analytics-card__number"><span data-count="60">0</span>%+</div>
            </div>
            <div className="analytics-card__viz">
              <div className="cost-wrap">
                <div className="cost-row">
                  <span className="cost-label">Before</span>
                  <div className="cost-bar-track">
                    <div className="cost-bar-fill before" id="costBefore">
                      <span className="cost-bar-amount">$$$</span>
                    </div>
                  </div>
                </div>
                <div className="cost-row">
                  <span className="cost-label">After</span>
                  <div className="cost-bar-track">
                    <div className="cost-bar-fill after" id="costAfter" ref={costAfterRef}>
                      <span className="cost-bar-amount">$</span>
                    </div>
                  </div>
                </div>
                <span className="cost-badge" id="costBadge" ref={costBadgeRef}>&minus;60%</span>
              </div>
            </div>
          </div>

        </div>

        {/* CRO: Inline CTA after Proof */}
        <a href="#contact" className="section-cta-inline" data-magnetic="">See what we&rsquo;d find in yours</a>
      </div>
    </section>
  );
}
