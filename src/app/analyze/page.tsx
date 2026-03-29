import type { Metadata } from 'next';
import AnalyzeClient from '@/components/analyze/AnalyzeClient';

export const metadata: Metadata = {
  title: 'YouTube Channel Analyzer — Free Channel Audit | Hype On Media',
  description:
    'Get a free in-depth YouTube channel analysis from the team behind 5B+ views. Six-axis scoring: content strategy, titles, thumbnails, engagement, growth, and monetization. No OAuth, no credit card.',
  metadataBase: new URL('https://hypeon.media'),
  alternates: {
    canonical: '/analyze',
  },
  openGraph: {
    title: 'YouTube Channel Analyzer — Free Channel Audit',
    description:
      'See what YouTube really sees in your channel. Free expert analysis by the team behind 5B+ views. No OAuth. No credit card. Just paste your URL.',
    type: 'website',
    url: 'https://hypeon.media/analyze',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Channel Analyzer — Free Channel Audit',
    description:
      'Free in-depth channel analysis by the team behind 5B+ YouTube views. Six axes. Scored. Actionable.',
  },
};

export default function AnalyzePage() {
  return <AnalyzeClient />;
}
