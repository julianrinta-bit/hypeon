import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — Hype On Media',
  description: 'Terms and conditions for using the Hype On Media website and services.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <main id="main-content" className="legal-page">
      <Link href="/" className="legal-back">&larr; Back</Link>
      <h1>Terms of Service</h1>
      <p className="legal-updated">Last updated: March 2026</p>

      <h2>1. Introduction</h2>
      <p>
        These Terms of Service ("Terms") govern your use of the website at hypeon.media and any
        services provided by <strong>Hype On Media FZCO</strong> ("Company," "we," "us," or "our"),
        a company registered in Dubai, United Arab Emirates.
      </p>
      <p>
        By accessing this website or engaging our services, you agree to be bound by these Terms.
        If you do not agree, please do not use the website.
      </p>

      <h2>2. Services</h2>
      <p>
        Hype On Media is a YouTube management agency. Our services include channel strategy,
        content production, audience growth, analytics, and optimization. Specific deliverables,
        timelines, and fees are defined in individual service agreements with each client.
      </p>

      <h2>3. Free Audit</h2>
      <p>
        We offer a free YouTube channel audit through our website. Submitting your information
        for a free audit does not create a binding obligation on either party. The audit is
        provided at our discretion as an introductory assessment. It does not constitute a
        commitment to provide paid services, nor does it obligate you to purchase anything.
      </p>

      <h2>4. Eligibility</h2>
      <p>
        You must be at least 18 years old and have the legal capacity to enter into agreements
        to use our services. By using this website, you represent that you meet these requirements.
      </p>

      <h2>5. User Conduct</h2>
      <p>When using this website, you agree not to:</p>
      <ul>
        <li>Submit false, misleading, or fraudulent information</li>
        <li>Attempt to gain unauthorized access to any part of the website or its systems</li>
        <li>Use the website for any unlawful purpose</li>
        <li>Interfere with the proper functioning of the website</li>
        <li>Scrape, crawl, or extract data from the website without written permission</li>
      </ul>

      <h2>6. Intellectual Property</h2>
      <p>
        All content on this website — including text, graphics, logos, images, videos, and
        software — is the property of Hype On Media FZCO or its licensors and is protected by
        applicable intellectual property laws.
      </p>
      <p>
        You may not reproduce, distribute, modify, or create derivative works from any content
        on this website without our prior written consent. Limited personal, non-commercial use
        (such as bookmarking or sharing links) is permitted.
      </p>

      <h2>7. Client Work and Ownership</h2>
      <p>
        Ownership of deliverables produced during a client engagement is governed by the
        individual service agreement between Hype On Media and the client. Unless otherwise
        specified in writing, we retain ownership of our proprietary methodologies, frameworks,
        tools, and processes.
      </p>

      <h2>8. Confidentiality</h2>
      <p>
        We treat all client data, channel analytics, and business information shared with us as
        confidential. We will not disclose client information to third parties without consent,
        except as required by law.
      </p>

      <h2>9. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by applicable law, Hype On Media FZCO shall not be
        liable for any indirect, incidental, special, consequential, or punitive damages arising
        from your use of this website or our services.
      </p>
      <p>
        Our total liability for any claim arising from these Terms or your use of the website
        shall not exceed the amount you have paid us in the twelve (12) months preceding the
        claim, or one hundred US dollars (USD 100), whichever is greater.
      </p>
      <p>
        We do not guarantee specific results from our services. YouTube channel performance
        depends on many factors outside our control, including platform algorithm changes, market
        conditions, and content quality.
      </p>

      <h2>10. Disclaimer of Warranties</h2>
      <p>
        This website and our services are provided "as is" and "as available" without warranties
        of any kind, whether express, implied, or statutory. We disclaim all warranties,
        including implied warranties of merchantability, fitness for a particular purpose, and
        non-infringement.
      </p>

      <h2>11. Third-Party Links</h2>
      <p>
        This website may contain links to third-party websites or services. We are not
        responsible for the content, privacy practices, or terms of any third-party sites. Your
        use of third-party sites is at your own risk.
      </p>

      <h2>12. Modifications</h2>
      <p>
        We reserve the right to modify these Terms at any time. Material changes will be posted
        on this page with a revised "Last updated" date. Your continued use of the website after
        changes are posted constitutes acceptance of the modified Terms.
      </p>

      <h2>13. Governing Law and Jurisdiction</h2>
      <p>
        These Terms are governed by and construed in accordance with the laws of the United Arab
        Emirates. Any disputes arising from these Terms shall be subject to the exclusive
        jurisdiction of the courts of Dubai, UAE.
      </p>

      <h2>14. Severability</h2>
      <p>
        If any provision of these Terms is found to be invalid or unenforceable, the remaining
        provisions shall continue in full force and effect.
      </p>

      <h2>15. Contact</h2>
      <p>
        For questions about these Terms, contact us at:<br />
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
