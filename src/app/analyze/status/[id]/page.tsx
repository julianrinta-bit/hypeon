import StatusClient from '@/components/analyze/StatusClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StatusPage({ params }: Props) {
  const { id } = await params;
  return <StatusClient publicId={id} />;
}

export const metadata = {
  title: 'Analysis in Progress — Hype On Media',
  description: 'Your YouTube channel audit is being prepared by our expert system.',
  robots: 'noindex',
};
