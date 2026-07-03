// Server Component — no 'use client'
import Hero from '@/components/landing/Hero';
import Ticker from '@/components/landing/Ticker';
import StatsProof from '@/components/landing/StatsProof';
import Video from '@/components/landing/Video';
import WhatWeMake from '@/components/landing/WhatWeMake';
import Services from '@/components/landing/Services';
import Team from '@/components/landing/Team';
import ClientPortal from '@/components/landing/ClientPortal';
import Testimonials from '@/components/landing/Testimonials';
import LatestInsight from '@/components/landing/LatestInsight';
import FAQ from '@/components/landing/FAQ';
import ContactForm from '@/components/landing/ContactForm';

export default function LandingPage() {
  return (
    <main id="main-content">
      <Hero />
      <Ticker />
      <StatsProof />
      <Video />
      <WhatWeMake />
      <Services />
      <Team />
      <ClientPortal />
      <Testimonials />
      <LatestInsight />
      <FAQ />
      <ContactForm />
    </main>
  );
}
