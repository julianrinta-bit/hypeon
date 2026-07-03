import Nav from '@/components/layout/Nav';
import ConditionalShell from '@/components/layout/ConditionalShell';
import ScrollToTop from '@/components/ui/ScrollToTop';
import ExitIntentModal from '@/components/landing/ExitIntentModal';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      {children}
      <ConditionalShell />
      <ScrollToTop />
      <ExitIntentModal />
    </>
  );
}
