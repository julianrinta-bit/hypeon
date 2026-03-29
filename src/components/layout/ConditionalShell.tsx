'use client';

/**
 * ConditionalShell — wraps layout elements that should NOT appear on certain pages.
 *
 * Currently excluded routes:
 *   /analyze — has its own minimal footer; StickyMobileCTA conflicts with the form.
 */

import { usePathname } from 'next/navigation';
import Footer from '@/components/layout/Footer';
import StickyMobileCTA from '@/components/landing/StickyMobileCTA';

const EXCLUDED_ROUTES = ['/analyze'];

export default function ConditionalShell() {
  const pathname = usePathname();
  const isExcluded = EXCLUDED_ROUTES.some(route => pathname === route || pathname?.startsWith(route + '/'));

  if (isExcluded) return null;

  return (
    <>
      <Footer />
      <StickyMobileCTA />
    </>
  );
}
