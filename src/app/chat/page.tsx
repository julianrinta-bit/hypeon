import type { Metadata } from 'next';
import ChatClient from '@/components/chat/ChatClient';

export const metadata: Metadata = {
  title: 'Chat — Hype On Media',
  description: 'Ask our channel advisor anything about growing your YouTube channel.',
  robots: { index: false },
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function ChatPage({ searchParams }: Props) {
  const params = await searchParams;
  const initialQ = typeof params.q === 'string' ? params.q.trim() : '';

  return <ChatClient initialQ={initialQ} />;
}
