export interface ChannelInfo {
  channelId: string;
  channelName: string;
  subscriberCount: number;
  formattedSubs: string;
}

function formatSubs(count: number): string {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(count);
}

export async function resolveHandle(handle: string): Promise<ChannelInfo | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  // Normalize handle — strip leading @
  const cleanHandle = handle.replace(/^@/, '');

  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forHandle=${encodeURIComponent(cleanHandle)}&key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 3600 } } as RequestInit);
    if (!res.ok) return null;

    const data = await res.json() as {
      items?: Array<{
        id: string;
        snippet: { title: string };
        statistics: { subscriberCount?: string };
      }>;
    };

    const item = data.items?.[0];
    if (!item) return null;

    const count = parseInt(item.statistics.subscriberCount ?? '0', 10);

    return {
      channelId: item.id,
      channelName: item.snippet.title,
      subscriberCount: count,
      formattedSubs: formatSubs(count),
    };
  } catch {
    return null;
  }
}
