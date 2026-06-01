import { NextResponse } from 'next/server';

export const revalidate = 2592000; // 30 days

interface ChannelSeed {
  name: string;
  handle: string;
  channelId: string;
  fallbackSubs: string;
}

// Known channel IDs — pre-resolved to avoid extra search.list calls
const CHANNEL_SEEDS: ChannelSeed[] = [
  { name: 'BRIGHT SIDE', handle: '@BrightSideOfficial', channelId: 'UC4rlAVgAK0SGk-yTfe48Qpw', fallbackSubs: '44.6M' },
  { name: 'GENIAL', handle: '@genial.guru', channelId: 'UCddiUEpeqJcYeBxX1IVBKvQ', fallbackSubs: '32M' },
  { name: 'Crafty Panda', handle: '@CraftyPandaOfficial', channelId: 'UCWCGf-G0oTxnb-MWE4LBHYA', fallbackSubs: '19M' },
  { name: 'INCRÍVEL', handle: '@Incrivel', channelId: 'UCZpD3btCfWy-fXhZrOkSJfg', fallbackSubs: '18.4M' },
  { name: 'IDEAS EN 5 MINUTOS', handle: '@Ideasen5minutos', channelId: 'UCqdK-5wGOB2yU3KuGHi5HMw', fallbackSubs: '16.6M' },
  { name: 'SYMPA', handle: '@symaborni', channelId: 'UCDqKkMlAzX7FzTDpDxdoFsA', fallbackSubs: '7.55M' },
  { name: 'BRICO SYMPA', handle: '@BricoSympa', channelId: 'UCTjHIfOxBF0e-pMOEuABjnQ', fallbackSubs: '5.68M' },
  { name: 'Gotcha!', handle: '@Gotcha_official', channelId: 'UCa_aQvkIwEXBNSjyZLJWJow', fallbackSubs: '4.24M' },
  { name: 'FireSpike', handle: '@FireSpikeOfficial', channelId: 'UCUV5LCJB-jk2bQJO2UMaWFQ', fallbackSubs: '1.14M' },
  { name: 'Bamboo!', handle: '@bamboo.adventures', channelId: 'UCLTdlCIVGEd0GXKBehJgDRg', fallbackSubs: '340K' },
];

function formatSubs(count: string | number): string {
  const n = typeof count === 'string' ? parseInt(count, 10) : count;
  if (isNaN(n)) return String(count);
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

export interface ChannelData {
  name: string;
  handle: string;
  channelId: string;
  avatar: string;
  banner: string;
  subs: string;
  fallback: boolean;
}

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    // Return fallback data — no API key configured
    const fallback: ChannelData[] = CHANNEL_SEEDS.map(s => ({
      name: s.name,
      handle: s.handle,
      channelId: s.channelId,
      avatar: '',
      banner: '',
      subs: s.fallbackSubs,
      fallback: true,
    }));
    return NextResponse.json(fallback);
  }

  try {
    const ids = CHANNEL_SEEDS.map(s => s.channelId).join(',');
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${ids}&key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 2592000 } });

    if (!res.ok) {
      throw new Error(`YouTube API error: ${res.status}`);
    }

    const json = await res.json();
    const items: Record<string, any> = {};
    for (const item of json.items ?? []) {
      items[item.id] = item;
    }

    const channels: ChannelData[] = CHANNEL_SEEDS.map(seed => {
      const item = items[seed.channelId];
      if (!item) {
        return {
          name: seed.name,
          handle: seed.handle,
          channelId: seed.channelId,
          avatar: '',
          banner: '',
          subs: seed.fallbackSubs,
          fallback: true,
        };
      }
      const rawSubs = item.statistics?.subscriberCount;
      return {
        name: item.snippet?.title ?? seed.name,
        handle: seed.handle,
        channelId: seed.channelId,
        avatar: item.snippet?.thumbnails?.high?.url ?? '',
        banner: item.brandingSettings?.image?.bannerExternalUrl
          ? `${item.brandingSettings.image.bannerExternalUrl}=w1060`
          : '',
        subs: rawSubs ? formatSubs(rawSubs) : seed.fallbackSubs,
        fallback: false,
      };
    });

    return NextResponse.json(channels);
  } catch (err) {
    console.error('[/api/channels] YouTube fetch failed:', err);
    const fallback: ChannelData[] = CHANNEL_SEEDS.map(s => ({
      name: s.name,
      handle: s.handle,
      channelId: s.channelId,
      avatar: '',
      banner: '',
      subs: s.fallbackSubs,
      fallback: true,
    }));
    return NextResponse.json(fallback);
  }
}
