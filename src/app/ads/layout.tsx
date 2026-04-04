import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check cookie only on dashboard sub-routes, not on the gate itself
  // (The gate page lives directly under /ads — this layout wraps both /ads and /ads/dashboard)
  // We allow the gate page through; it handles its own logic.
  // The dashboard page explicitly requires the cookie — protection is in the dashboard page.
  return <>{children}</>;
}
