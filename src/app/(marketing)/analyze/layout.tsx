/**
 * /analyze custom layout.
 *
 * Inherits from root layout:   ScrollProgress, CustomCursor, Nav
 * REMOVED vs root layout:      Footer (page has its own minimal footer)
 *                               StickyMobileCTA (conflicts with page's form)
 * KEPT from root layout:       ExitIntentModal (conversion tool)
 *
 * Root layout still wraps this — we override only the children wrapper.
 * We use suppressHydrationWarning on the slot to avoid issues with
 * client-side particle/animation differences.
 */

export default function AnalyzeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div id="analyze-layout" suppressHydrationWarning>
      {children}
    </div>
  );
}
