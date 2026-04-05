import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, IBM_Plex_Mono, Outfit } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import ScrollProgress from '@/components/layout/ScrollProgress';
import CustomCursor from '@/components/layout/CustomCursor';
import Nav from '@/components/layout/Nav';
import ConditionalShell from '@/components/layout/ConditionalShell';
import ExitIntentModal from '@/components/landing/ExitIntentModal';
import CookieConsent from '@/components/layout/CookieConsent';
import ScrollToTop from '@/components/ui/ScrollToTop';

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

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-outfit',
  display: 'swap',
});

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
      className={`${plusJakarta.variable} ${ibmPlexMono.variable} ${outfit.variable}`}
    >
      <head>
        <meta name="theme-color" content="#0A0A0C" />
      </head>
      <body>
        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '2028344087893649');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{display:'none'}}
            src="https://www.facebook.com/tr?id=2028344087893649&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* Microsoft Clarity — session recordings + heatmaps (project: w6a931m2k9) */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","w6a931m2k9");`}
        </Script>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ScrollProgress />
        <div className="noise" aria-hidden="true" />
        <CustomCursor />
        <Nav />
        {children}
        <ConditionalShell />
        <ScrollToTop />
        <ExitIntentModal />
        <CookieConsent />
      </body>
    </html>
  );
}
