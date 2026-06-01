// Server Component — no 'use client'
import Hero from '@/components/landing/Hero';
import CredibilityStrip from '@/components/landing/CredibilityStrip';
import Showreel from '@/components/landing/Showreel';
import UseCases from '@/components/landing/UseCases';
import Channels from '@/components/landing/Channels';
import AnalyticsDashboard from '@/components/landing/AnalyticsDashboard';
import Services from '@/components/landing/Services';
import Different from '@/components/landing/Different';
import Guarantee from '@/components/landing/Guarantee';
import Testimonials from '@/components/landing/Testimonials';
import ContentProduction from '@/components/landing/ContentProduction';
import LatestInsight from '@/components/landing/LatestInsight';
import ContactForm from '@/components/landing/ContactForm';

export default function LandingPage() {
  return (
    <main id="main-content">
      <Hero />
      <CredibilityStrip />
      <Showreel />
      <UseCases />
      <Channels />
      <AnalyticsDashboard />
      <Services />
      <Different />
      <Guarantee />
      <Testimonials />
      <ContentProduction />
      <LatestInsight />
      <ContactForm />
    </main>
  );
}
