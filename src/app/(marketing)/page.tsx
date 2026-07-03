// Server Component — no 'use client'
import Hero from '@/components/landing/Hero';
import Ticker from '@/components/landing/Ticker';
import Video from '@/components/landing/Video';
import StatsProof from '@/components/landing/StatsProof';
import Services from '@/components/landing/Services';
import WhyHypeOn from '@/components/landing/WhyHypeOn';
import WhatWeMake from '@/components/landing/WhatWeMake';
import Team from '@/components/landing/Team';
import ClientPortal from '@/components/landing/ClientPortal';
import Testimonials from '@/components/landing/Testimonials';
import FAQ from '@/components/landing/FAQ';
import LatestInsight from '@/components/landing/LatestInsight';
import ContactForm from '@/components/landing/ContactForm';

export default function LandingPage() {
  return (
    <main id="main-content">
      {/* 1. Hero — dark bg */}
      <Hero />
      {/* 2. Ticker — dark marquee bar */}
      <Ticker />
      {/* 3. Video — white bg, BEFORE metrics */}
      <Video />
      {/* 4. StatsProof — cream bg, id="proof" */}
      <StatsProof />
      {/* 5. Services — white bg, id="services" */}
      <Services />
      {/* 6. WhyHypeOn — cream bg, 2x2 feat-cards + testimonial */}
      <WhyHypeOn />
      {/* 7. WhatWeMake — dark bg, content type cards */}
      <WhatWeMake />
      {/* 8. Team — dark bg */}
      <Team />
      {/* 9. ClientPortal — cream bg */}
      <ClientPortal />
      {/* 10. Testimonials — cream bg */}
      <Testimonials />
      {/* 11. FAQ — white bg, id="faq" */}
      <FAQ />
      {/* 12. LatestInsight — dark bg, id="blog" */}
      <LatestInsight />
      {/* 13. ContactForm — dark bg, id="contact" */}
      <ContactForm />
    </main>
  );
}
