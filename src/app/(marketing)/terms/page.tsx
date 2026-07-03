import type { Metadata } from 'next';
import LegalTabs from '@/components/legal/LegalTabs';

export const metadata: Metadata = {
  title: 'Terms of Service — Hype On Media',
  description: 'Terms and conditions for using the Hype On Media website and services.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <>
      {/* Dark hero with tabs */}
      <header className="legal-v2-hero">
        <div className="legal-v2-hero-inner">
          <div className="legal-v2-eyebrow">Legal</div>
          <h1 className="legal-v2-h1">Policies</h1>
          <p className="legal-v2-subtitle">
            Outright Publishing LLC dba Hype On Media · Delaware, USA · hello@hypeon.media
          </p>
          <LegalTabs active="terms" />
        </div>
      </header>

      {/* White body: 2-col prose + sticky sidebar */}
      <div className="legal-v2-body" id="legal-content" role="tabpanel" aria-label="Terms of Service">
        <div className="legal-v2-body-inner">
          {/* Prose */}
          <article className="legal-v2-article prose">
            <div className="legal-v2-date">Last updated: March 2026</div>

            <h2>1. Introduction</h2>
            <p>
              These Terms of Service govern your use of hypeon.media and any services provided by{' '}
              <strong>Outright Publishing LLC</strong>, doing business as{' '}
              <strong>Hype On Media</strong>, registered in Delaware, USA.
            </p>
            <p>By accessing this website or engaging our services, you agree to be bound by these Terms.</p>

            <h2>2. Services</h2>
            <p>
              Hype On Media is a YouTube management agency. Our services include channel strategy,
              content production, audience growth, analytics, and optimization. Specific deliverables,
              timelines, and fees are defined in individual service agreements.
            </p>

            <h2>3. Free Audit</h2>
            <p>
              We offer a free YouTube channel audit through our website. Submitting your information
              does not create a binding obligation on either party. The audit does not constitute a
              commitment to provide paid services.
            </p>

            <h2>4. Eligibility</h2>
            <p>
              You must be at least 18 years old and have the legal capacity to enter into agreements
              to use our services.
            </p>

            <h2>5. User Conduct</h2>
            <p>When using this website, you agree not to:</p>
            <ul>
              <li>Submit false, misleading, or fraudulent information</li>
              <li>Attempt unauthorized access to any part of the website or its systems</li>
              <li>Use the website for any unlawful purpose</li>
              <li>Interfere with the proper functioning of the website</li>
              <li>Scrape or extract data without written permission</li>
            </ul>

            <h2>6. Intellectual Property</h2>
            <p>
              All content on this website is the property of Outright Publishing LLC or its licensors.
              You may not reproduce, distribute, or modify any content without prior written consent.
            </p>

            <h2>7. Client Work and Ownership</h2>
            <p>
              Ownership of deliverables is governed by individual service agreements. Unless otherwise
              specified, we retain ownership of our proprietary methodologies, frameworks, tools, and
              processes.
            </p>

            <h2>8. Confidentiality</h2>
            <p>
              We treat all client data, channel analytics, and business information as confidential.
              We will not disclose client information to third parties without consent, except as
              required by law.
            </p>

            <h2>9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Outright Publishing LLC shall not be
              liable for any indirect, incidental, special, or consequential damages arising from your
              use of this website or our services.
            </p>
            <p>
              We do not guarantee specific results from our services. YouTube channel performance
              depends on many factors outside our control.
            </p>

            <h2>10. Disclaimer of Warranties</h2>
            <p>
              This website and our services are provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
              warranties of any kind.
            </p>

            <h2>11. Third-Party Links</h2>
            <p>
              This website may contain links to third-party websites. We are not responsible for the
              content or terms of any third-party sites.
            </p>

            <h2>12. Modifications</h2>
            <p>
              We reserve the right to modify these Terms at any time. Material changes will be posted
              with a revised &ldquo;Last updated&rdquo; date. Continued use constitutes acceptance.
            </p>

            <h2>13. Governing Law</h2>
            <p>These Terms are governed by the laws of the State of Delaware, USA.</p>

            <h2>14. Contact</h2>
            <p>
              Outright Publishing LLC dba Hype On Media<br />
              Delaware, USA<br />
              <a href="mailto:hello@hypeon.media">hello@hypeon.media</a>
            </p>
          </article>

          {/* Sticky sidebar */}
          <aside className="legal-v2-sidebar">
            <div className="legal-v2-sidebar-nav">
              <div className="legal-v2-sidebar-nav-label">Quick links</div>
              <nav>
                <a href="/privacy" className="legal-v2-sidebar-link">Privacy Policy</a>
                <a href="/terms" className="legal-v2-sidebar-link active">Terms of Service</a>
              </nav>
            </div>
            <div className="legal-v2-sidebar-contact">
              <p>Questions about your data? We&apos;ll respond within 48 hours.</p>
              <a href="mailto:hello@hypeon.media" className="legal-v2-contact-btn">
                Contact us →
              </a>
            </div>
          </aside>
        </div>
      </div>

      {/* Dark footer strip */}
      <footer className="legal-v2-footer">
        <span className="legal-v2-footer-copy">Hype On Media · Outright Publishing LLC · © 2024–2026</span>
        <div className="legal-v2-footer-links">
          <a href="/privacy" className="legal-v2-footer-link">Privacy</a>
          <a href="/terms" className="legal-v2-footer-link">Terms</a>
        </div>
      </footer>
    </>
  );
}
