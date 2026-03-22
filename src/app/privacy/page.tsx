import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — Hype On Media',
  description: 'How Hype On Media FZCO collects, uses, and protects your personal data.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <main id="main-content" className="legal-page">
      <h1>Privacy Policy</h1>
      <p className="legal-updated">Last updated: March 2026</p>

      <h2>1. Who We Are</h2>
      <p>
        This website is operated by <strong>Hype On Media FZCO</strong>, a company registered in
        Dubai, United Arab Emirates. We are a YouTube management agency that helps brands and
        creators scale their channels through data-driven strategy, production, and optimization.
      </p>
      <p>
        For any questions about this policy or your personal data, contact us
        at <a href="mailto:hello@hypeon.media">hello@hypeon.media</a>.
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
        We do not collect sensitive personal data (race, religion, health, biometrics) and we do
        not purchase data from third-party brokers.
      </p>

      <h2>3. How We Use Your Data</h2>
      <p>The personal data you submit is used for the following purposes:</p>
      <ul>
        <li><strong>Lead qualification</strong> — assessing whether our services are a good fit for your channel</li>
        <li><strong>Service delivery</strong> — communicating about audits, proposals, and ongoing work</li>
        <li><strong>Marketing communications</strong> — sending relevant updates about our services, only with your consent</li>
      </ul>
      <p>
        We do not sell, rent, or share your personal data with third parties for their own
        marketing purposes.
      </p>

      <h2>4. Legal Basis for Processing</h2>
      <p>We process your data based on:</p>
      <ul>
        <li><strong>Consent</strong> — you actively submit the contact form</li>
        <li><strong>Legitimate interest</strong> — responding to business inquiries and delivering requested services</li>
        <li><strong>Contractual necessity</strong> — when processing is required to fulfill a service agreement</li>
      </ul>

      <h2>5. Data Storage and Security</h2>
      <p>
        Form submissions are stored in <strong>Supabase</strong>, a cloud-hosted database platform
        with encryption at rest and in transit. Access to the database is restricted to authorized
        personnel only. We implement reasonable technical and organizational measures to protect
        your data against unauthorized access, alteration, or destruction.
      </p>

      <h2>6. Third-Party Services</h2>
      <p>This website uses the following third-party services that may process data:</p>
      <ul>
        <li>
          <strong>YouTube embeds (Google)</strong> — We embed YouTube videos on certain pages. When
          you interact with an embed, Google may collect data according to
          the <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>.
        </li>
        <li>
          <strong>Analytics</strong> — We may use privacy-focused analytics to understand site
          traffic (pages visited, referral sources). If analytics are active, they do not track
          individual users or use advertising cookies.
        </li>
        <li>
          <strong>Supabase</strong> — Cloud database for form submissions.
          See <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase Privacy Policy</a>.
        </li>
      </ul>

      <h2>7. Cookies</h2>
      <p>
        This website uses <strong>essential cookies only</strong> to ensure core site
        functionality (such as remembering your cookie consent preference). We do not use
        advertising or tracking cookies.
      </p>
      <p>
        If we add analytics in the future, any analytics cookies will be clearly disclosed and
        will require your consent before being set.
      </p>

      <h2>8. Data Retention</h2>
      <p>
        We retain your personal data for as long as the business relationship exists, plus any
        additional period required by applicable law. If you request deletion and there is no
        legal obligation to retain your data, we will erase it within 30 days.
      </p>

      <h2>9. Your Rights</h2>
      <p>
        Regardless of your location, we respect the following rights aligned with GDPR standards,
        as we serve clients in the European Union and globally:
      </p>
      <ul>
        <li><strong>Access</strong> — request a copy of the personal data we hold about you</li>
        <li><strong>Rectification</strong> — request correction of inaccurate data</li>
        <li><strong>Erasure</strong> — request deletion of your data ("right to be forgotten")</li>
        <li><strong>Data portability</strong> — request your data in a structured, machine-readable format</li>
        <li><strong>Restriction</strong> — request that we limit processing of your data</li>
        <li><strong>Objection</strong> — object to processing based on legitimate interest</li>
        <li><strong>Withdraw consent</strong> — withdraw consent at any time without affecting the lawfulness of prior processing</li>
      </ul>
      <p>
        To exercise any of these rights, email us
        at <a href="mailto:hello@hypeon.media">hello@hypeon.media</a>. We will respond within
        30 days.
      </p>

      <h2>10. International Transfers</h2>
      <p>
        Your data may be processed outside the UAE, including in regions where our cloud
        infrastructure providers operate. We ensure that any transfers are protected by
        appropriate safeguards, including standard contractual clauses where applicable.
      </p>

      <h2>11. Children</h2>
      <p>
        Our services are not directed at individuals under 18 years of age. We do not knowingly
        collect personal data from children. If you believe we have inadvertently collected data
        from a minor, please contact us and we will promptly delete it.
      </p>

      <h2>12. Changes to This Policy</h2>
      <p>
        We may update this policy from time to time. Material changes will be posted on this page
        with a revised "Last updated" date. We encourage you to review this page periodically.
      </p>

      <h2>13. Contact</h2>
      <p>
        Hype On Media FZCO<br />
        Dubai, United Arab Emirates<br />
        <a href="mailto:hello@hypeon.media">hello@hypeon.media</a>
      </p>

      <p style={{ marginTop: '3rem' }}>
        <Link href="/">← Back to home</Link>
      </p>
    </main>
  )
}
