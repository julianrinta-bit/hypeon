import type { Metadata } from 'next';
import LegalTabs from '@/components/legal/LegalTabs';

export const metadata: Metadata = {
  title: 'Privacy Policy — Hype On Media',
  description: 'How Hype On Media collects, uses, and protects your personal data.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
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
          <LegalTabs active="privacy" />
        </div>
      </header>

      {/* White body: 2-col prose + sticky sidebar */}
      <div className="legal-v2-body" id="legal-content" role="tabpanel" aria-label="Privacy Policy">
        <div className="legal-v2-body-inner">
          {/* Prose */}
          <article className="legal-v2-article prose">
            <div className="legal-v2-date">Last updated: March 2026</div>

            <h2>1. Who We Are</h2>
            <p>
              This website is operated by <strong>Outright Publishing LLC</strong>, doing business as{' '}
              <strong>Hype On Media</strong>, a company registered in Delaware, USA. We are a YouTube
              management agency that helps brands and creators scale their channels through data-driven
              strategy, production, and optimization.
            </p>
            <p>
              For any questions about this policy or your personal data, contact us at{' '}
              <a href="mailto:hello@hypeon.media">hello@hypeon.media</a>.
            </p>

            <h2>2. Data We Collect</h2>
            <p>We collect only the information you voluntarily provide through our contact form:</p>
            <ul>
              <li><strong>Name</strong> — to address you personally</li>
              <li><strong>Email address</strong> — to respond to your inquiry</li>
              <li><strong>YouTube channel URL</strong> — to evaluate your channel for a potential audit</li>
              <li><strong>Message</strong> — to understand your needs and goals</li>
            </ul>
            <p>
              We do not collect sensitive personal data and we do not purchase data from third-party
              brokers.
            </p>

            <h2>3. How We Use Your Data</h2>
            <ul>
              <li>Lead qualification — assessing whether our services are a good fit</li>
              <li>Service delivery — communicating about audits, proposals, and ongoing work</li>
              <li>Marketing communications — sending relevant updates, only with your consent</li>
            </ul>
            <p>We do not sell, rent, or share your personal data with third parties for their own marketing purposes.</p>

            <h2>4. Legal Basis for Processing</h2>
            <ul>
              <li><strong>Consent</strong> — you actively submit the contact form</li>
              <li><strong>Legitimate interest</strong> — responding to business inquiries</li>
              <li><strong>Contractual necessity</strong> — when required to fulfill a service agreement</li>
            </ul>

            <h2>5. Data Storage and Security</h2>
            <p>
              Form submissions are stored in <strong>Supabase</strong>, a cloud-hosted database platform
              with encryption at rest and in transit. Access is restricted to authorized personnel only.
            </p>

            <h2>6. Third-Party Services</h2>
            <ul>
              <li>
                <strong>YouTube embeds (Google)</strong> — When you interact with an embed, Google may
                collect data per their{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>
              </li>
              <li><strong>Supabase</strong> — Cloud database for form submissions</li>
            </ul>

            <h2>7. Cookies</h2>
            <p>
              This website uses <strong>essential cookies only</strong> to ensure core site
              functionality. We do not use advertising or tracking cookies.
            </p>

            <h2>8. Data Retention</h2>
            <p>
              We retain your personal data for as long as the business relationship exists. If you
              request deletion and there is no legal obligation to retain your data, we will erase
              it within 30 days.
            </p>

            <h2>9. Your Rights</h2>
            <ul>
              <li><strong>Access</strong> — request a copy of the personal data we hold</li>
              <li><strong>Rectification</strong> — request correction of inaccurate data</li>
              <li><strong>Erasure</strong> — request deletion (&ldquo;right to be forgotten&rdquo;)</li>
              <li><strong>Data portability</strong> — request your data in a machine-readable format</li>
              <li><strong>Restriction</strong> — request that we limit processing</li>
              <li><strong>Objection</strong> — object to processing based on legitimate interest</li>
              <li><strong>Withdraw consent</strong> — at any time, without affecting prior processing</li>
            </ul>
            <p>
              To exercise any right, email{' '}
              <a href="mailto:hello@hypeon.media">hello@hypeon.media</a>. We respond within 30 days.
            </p>

            <h2>10. International Transfers</h2>
            <p>
              Your data may be processed outside the US. We ensure transfers are protected by
              appropriate safeguards, including standard contractual clauses where applicable.
            </p>

            <h2>11. Children</h2>
            <p>
              Our services are not directed at individuals under 18. We do not knowingly collect
              data from children.
            </p>

            <h2>12. Changes to This Policy</h2>
            <p>
              Material changes will be posted on this page with a revised &ldquo;Last updated&rdquo; date.
            </p>

            <h2>13. Contact</h2>
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
                <a href="/privacy" className="legal-v2-sidebar-link active">Privacy Policy</a>
                <a href="/terms" className="legal-v2-sidebar-link">Terms of Service</a>
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
