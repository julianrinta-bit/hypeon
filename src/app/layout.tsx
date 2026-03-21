import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

// Outfit from Fontshare — download woff2 files to public/fonts/
// and reference them here. If not yet downloaded, use Fontshare link
// as fallback in <head> (task 1.2 will finalize).

export const metadata: Metadata = {
  title: 'Hype On Media — YouTube. Engineered.',
  description:
    '5B+ organic views. $4M+/month revenue built. 50+ channels scaled across 15 languages. We turn underperforming YouTube channels into growth engines.',
  metadataBase: new URL('https://hypeon.media'),
  openGraph: {
    title: 'Hype On Media — YouTube. Engineered.',
    description:
      '5B+ organic views. $4M+/month revenue built. 50+ channels scaled.',
    type: 'website',
    url: 'https://hypeon.media',
    images: ['/og-image.jpg'],
  },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${ibmPlexMono.variable}`}
    >
      <head>
        {/* Fontshare Outfit — will be replaced with next/font/local once woff2 downloaded */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=outfit@300,400,500,600&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#09090b" />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div className="noise" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
