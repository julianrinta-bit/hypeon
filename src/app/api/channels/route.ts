import { NextResponse } from 'next/server';

export const revalidate = 2592000; // 30 days

interface ChannelSeed {
  name: string;
  handle: string;
  channelId: string;
  fallbackSubs: string;
}

// Known channel IDs — pre-resolved to avoid extra search.list calls
// Order: FireSpike first, then alternate colors so no two yellow banners are adjacent
const CHANNEL_SEEDS: ChannelSeed[] = [
  { name: 'Fire Spike!', handle: '@firespikeoriginal', channelId: 'UCkIrwXDtY_BSkqBKXCG_uSw', fallbackSubs: '1.14M' },
  { name: 'BRIGHT SIDE', handle: '@BrightSideOfficial', channelId: 'UC4rlAVgAK0SGk-yTfe48Qpw', fallbackSubs: '44.6M' },
  { name: 'Crafty Panda', handle: '@CraftyPandaOfficial', channelId: 'UC03RvJoIhm_fMwlUpm9ZvFw', fallbackSubs: '19M' },
  { name: 'GENIAL', handle: '@genialbrightsidespanish', channelId: 'UCbrd1vu4_7qIE6IPV_dA-OA', fallbackSubs: '32M' },
  { name: 'Blippi', handle: '@blippi', channelId: 'UC5PYHgAzJ1wLEidB58SK6Xw', fallbackSubs: '27.2M' },
  { name: 'INCRÍVEL', handle: '@Incrivel', channelId: 'UCIQPHl1WKKTt9KkWyo_JNig', fallbackSubs: '18.4M' },
  { name: 'IDEAS EN 5 MINUTOS', handle: '@Ideasen5minutos', channelId: 'UC_OLtzRJdg0MJfiqGWAAIHw', fallbackSubs: '16.6M' },
  { name: 'Gotcha!', handle: '@Gotcha_official', channelId: 'UCtxqQnLgj-1rAVtjpSgPS5A', fallbackSubs: '4.24M' },
  { name: 'SYMPA', handle: '@symaborni', channelId: 'UCt6IQpsggvn6zmalhPglSEA', fallbackSubs: '7.55M' },
  { name: 'BRICO SYMPA', handle: '@BricoSympa', channelId: 'UC9TJezP2M1ADmUYVl8hrQ2A', fallbackSubs: '5.68M' },
  { name: 'Bamboo!', handle: '@bamboo.adventures', channelId: 'UCumQ4bX4wm-JtH9BM9MBjlA', fallbackSubs: '340K' },
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
          ? `${item.brandingSettings.image.bannerExternalUrl}=w2120-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-v1`
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
