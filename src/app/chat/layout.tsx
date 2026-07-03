import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chat — Hype On Media',
  description: 'Talk to a Hype On Media channel advisor.',
};

/**
 * Minimal layout for /chat — outside (marketing) route group.
 * No Nav, no Footer, no ExitIntentModal.
 * Inherits root layout's <html>, fonts, pixel, noise, ScrollProgress.
 */
export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
