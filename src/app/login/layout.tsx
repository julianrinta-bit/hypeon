import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Client Portal — Hype On Media',
  description: 'Secure login for Hype On Media clients.',
  robots: { index: false, follow: false },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
