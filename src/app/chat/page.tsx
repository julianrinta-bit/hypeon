import type { Metadata } from 'next';
import ChatClient from '@/components/chat/ChatClient';

export const metadata: Metadata = {
  title: 'Chat — Hype On Media',
  description: 'Ask our channel advisor anything about growing your YouTube channel.',
  robots: { index: false },
};

export default function ChatPage() {
  return <ChatClient />;
}
