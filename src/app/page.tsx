// Server Component — no 'use client'
import Hero from '@/components/landing/Hero';
import Ticker from '@/components/landing/Ticker';
import TrustStrip from '@/components/landing/TrustStrip';
import CredibilityStrip from '@/components/landing/CredibilityStrip';
import Showreel from '@/components/landing/Showreel';
import AnalyticsDashboard from '@/components/landing/AnalyticsDashboard';
import Services from '@/components/landing/Services';
import Process from '@/components/landing/Process';
import Work from '@/components/landing/Work';
import Testimonials from '@/components/landing/Testimonials';
import Different from '@/components/landing/Different';
import About from '@/components/landing/About';
import FAQ from '@/components/landing/FAQ';
import ContactForm from '@/components/landing/ContactForm';

export default function LandingPage() {
  return (
    <main id="main-content">
      <Hero />
      <Ticker />
      <TrustStrip />
      <CredibilityStrip />
      <Showreel />
      <AnalyticsDashboard />
      <div className="container"><div className="divider" /></div>
      <Services />
      <div className="container"><div className="divider" /></div>
      <Process />
      <div className="container"><div className="divider" /></div>
      <Work />
      <div className="container"><div className="divider" /></div>
      <Testimonials />
      <div className="container"><div className="divider" /></div>
      <Different />
      <div className="container"><div className="divider" /></div>
      <About />
      <div className="container"><div className="divider" /></div>
      <FAQ />
      <div className="container"><div className="divider" /></div>
      <ContactForm />
    </main>
  );
}
