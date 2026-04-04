'use server';

import { headers } from 'next/headers';
import { checkRateLimit } from '@/lib/rate-limit';

// ── Types ───────────────────────────────────────────────────────────────────

export type PainPattern =
  | 'ghost_audience'
  | 'leaky_funnel'
  | 'treadmill'
  | 'dormant_giant'
  | 'view_rich_sub_poor'
  | 'healthy';

export type ChannelSnapshot = {
  channelId: string;
  name: string;
  handle: string;
  thumbnail: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  publishedAt: string;
  // Derived — legacy
  channelAgeMonths: number;
  videosPerMonth: number;
  viewsPerSubscriber: number;
  paceLabel: 'Prolific' | 'Steady' | 'Sporadic' | 'Dormant';
  recencyLabel: 'Active' | 'Slowing' | 'Inactive';
  // Derived — new metrics
  contentLeverage: number;
  contentLeverageFormatted: string;
  subscriberConversion: number;
  uploadVelocityPerMonth: number;
  totalVideos: number;
  channelAgeFormatted: string;
  // Pain detection
  painPattern: PainPattern;
  painLabel: string;
  painValue: string;
  painSubLabel: string;
  // Expert insights
  insightDiagnosis: string;
  insightQuestion: string;
};

export type SnapshotResult =
  | { snapshot: ChannelSnapshot }
  | { error: string };

// ── URL parsing ─────────────────────────────────────────────────────────────

type ParsedChannel =
  | { type: 'handle'; value: string }
  | { type: 'id'; value: string }
  | { type: 'username'; value: string };

function parseChannelUrl(input: string): ParsedChannel | null {
  const raw = input.trim();

  // @handle directly
  if (raw.startsWith('@')) {
    return { type: 'handle', value: raw.slice(1) };
  }

  // UC... channel ID directly
  if (/^UC[A-Za-z0-9_-]{20,}$/.test(raw)) {
    return { type: 'id', value: raw };
  }

  try {
    const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    const path = url.pathname;

    // /@handle
    const handleMatch = path.match(/^\/@([A-Za-z0-9_.-]+)/);
    if (handleMatch) return { type: 'handle', value: handleMatch[1] };

    // /channel/UCxxxxxxx
    const idMatch = path.match(/\/channel\/(UC[A-Za-z0-9_-]+)/);
    if (idMatch) return { type: 'id', value: idMatch[1] };

    // /c/customname or /user/username
    const customMatch = path.match(/\/(?:c|user)\/([A-Za-z0-9_.-]+)/);
    if (customMatch) return { type: 'username', value: customMatch[1] };
  } catch {
    // Not a valid URL — try as bare handle/username
    if (/^[A-Za-z0-9_.-]+$/.test(raw)) {
      return { type: 'username', value: raw };
    }
  }

  return null;
}

// ── Derived metric helpers ──────────────────────────────────────────────────

function getPaceLabel(videosPerMonth: number): ChannelSnapshot['paceLabel'] {
  if (videosPerMonth > 8) return 'Prolific';
  if (videosPerMonth >= 4) return 'Steady';
  if (videosPerMonth >= 1) return 'Sporadic';
  return 'Dormant';
}

function getRecencyLabel(lastUploadDaysAgo: number): ChannelSnapshot['recencyLabel'] {
  if (lastUploadDaysAgo <= 7) return 'Active';
  if (lastUploadDaysAgo <= 30) return 'Slowing';
  return 'Inactive';
}

function formatMetricNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1_000)}K`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatChannelAge(months: number): string {
  if (months >= 24) return `${(months / 12).toFixed(1)} years`;
  if (months >= 12) return `${Math.floor(months / 12)} year`;
  return `${months} months`;
}

function generateInsights(
  pattern: PainPattern,
  subscriberCount: number,
  contentLeverageFormatted: string,
  subscriberConversion: number,
  uploadVelocityPerMonth: number,
  totalVideos: number,
  channelAgeFormatted: string,
): { insightDiagnosis: string; insightQuestion: string } {
  const subscriberFormatted = formatMetricNumber(subscriberCount);
  const conversionDivisor = subscriberConversion > 0 ? Math.round(subscriberConversion) : 0;

  switch (pattern) {
    case 'ghost_audience':
      return {
        insightDiagnosis: `${totalVideos} uploads reaching ${contentLeverageFormatted} views each — with ${subscriberFormatted} subscribers, most of your audience has gone silent.`,
        insightQuestion: `Whether it's the algorithm, your upload schedule, or your content format — that's what the full human audit answers.`,
      };

    case 'leaky_funnel':
      return {
        insightDiagnosis: `${contentLeverageFormatted} views per upload is strong reach. But at 1 subscriber per ${formatMetricNumber(conversionDivisor)} views, your content isn't building a community.`,
        insightQuestion: `Is it your CTAs, your channel page, or your content niche? That's what the full human audit answers.`,
      };

    case 'treadmill':
      return {
        insightDiagnosis: `${uploadVelocityPerMonth} uploads per month is serious commitment. At ${contentLeverageFormatted} views each, the effort isn't translating to traction.`,
        insightQuestion: `Is it your titles, your thumbnails, or your niche targeting? That's what the full human audit answers.`,
      };

    case 'dormant_giant':
      return {
        insightDiagnosis: `${totalVideos} uploads over ${channelAgeFormatted} — that's dedication. At ${subscriberFormatted} subscribers, your growth hasn't matched your consistency.`,
        insightQuestion: `Whether it's positioning, content format, or discoverability — that's what the full human audit answers.`,
      };

    case 'view_rich_sub_poor':
      return {
        insightDiagnosis: `${contentLeverageFormatted} views per video proves your content connects. But ${subscriberFormatted} subscribers means viewers aren't staying.`,
        insightQuestion: `What's stopping viewers from subscribing — your CTAs, your content arc, or your niche? That's what the full human audit answers.`,
      };

    case 'healthy':
    default: {
      const question = `What specific moves would accelerate your growth from here — that's what the full human audit answers.`;
      if (subscriberCount > 500_000) {
        return {
          insightDiagnosis: `${contentLeverageFormatted} views per upload with ${subscriberFormatted} subscribers — strong foundation. The question is what's next.`,
          insightQuestion: question,
        };
      }
      if (subscriberCount >= 50_000) {
        return {
          insightDiagnosis: `${totalVideos} uploads averaging ${contentLeverageFormatted} views — solid traction. The gap between where you are and where you could be is what matters.`,
          insightQuestion: question,
        };
      }
      return {
        insightDiagnosis: `${channelAgeFormatted} in, ${subscriberFormatted} subscribers, averaging ${contentLeverageFormatted} views — you have signal. The audit finds what to amplify.`,
        insightQuestion: question,
      };
    }
  }
}

function detectPain(
  subscriberCount: number,
  viewCount: number,
  videoCount: number,
  channelAgeMonths: number,
  uploadVelocityPerMonth: number,
): { pattern: PainPattern; label: string; value: string; subLabel: string } {
  const viewsPerVideo = videoCount > 0 ? viewCount / videoCount : 0;
  const viewsPerSub = subscriberCount > 0 ? viewCount / subscriberCount : 0;

  // 1. ghost_audience
  if (subscriberCount > 100_000 && viewsPerVideo < subscriberCount * 0.02) {
    const pct = ((viewsPerVideo / subscriberCount) * 100).toFixed(1);
    return {
      pattern: 'ghost_audience',
      label: 'Audience Reach',
      value: `${pct}% of your subs`,
      subLabel: "most of your audience isn't seeing your videos",
    };
  }

  // 2. leaky_funnel
  if (viewsPerSub > 500 && subscriberCount < viewCount / 200) {
    const viewsPerSubRounded = Math.round(viewsPerSub);
    return {
      pattern: 'leaky_funnel',
      label: 'Growth Efficiency',
      value: `1 sub per ${viewsPerSubRounded} views`,
      subLabel: "your views aren't converting to a community",
    };
  }

  // 3. treadmill
  if (uploadVelocityPerMonth > 12 && viewsPerVideo < 1000) {
    return {
      pattern: 'treadmill',
      label: 'Effort vs. Return',
      value: `${uploadVelocityPerMonth.toFixed(0)}/mo → ${formatMetricNumber(Math.round(viewsPerVideo))} avg views`,
      subLabel: "high output, low traction — something's off",
    };
  }

  // 4. dormant_giant
  const years = channelAgeMonths / 12;
  if (channelAgeMonths > 60 && subscriberCount < (channelAgeMonths / 12) * 1000) {
    const subsPerYear = Math.round(subscriberCount / years);
    return {
      pattern: 'dormant_giant',
      label: 'Growth Pace',
      value: `${formatMetricNumber(subsPerYear)}/yr avg`,
      subLabel: `${years.toFixed(0)} years of content, still building momentum`,
    };
  }

  // 5. view_rich_sub_poor
  if (viewsPerVideo > 50_000 && subscriberCount < 50_000) {
    return {
      pattern: 'view_rich_sub_poor',
      label: 'Conversion Gap',
      value: `${formatMetricNumber(Math.round(viewsPerVideo))} views/vid but ${formatMetricNumber(subscriberCount)} subs`,
      subLabel: "your content reaches — but doesn't stick",
    };
  }

  // 6. healthy (default)
  return {
    pattern: 'healthy',
    label: 'Channel Maturity',
    value: formatChannelAge(channelAgeMonths),
    subLabel: 'your full growth trajectory is in the audit',
  };
}

// ── YouTube API call ────────────────────────────────────────────────────────

const YT_BASE = 'https://www.googleapis.com/youtube/v3/channels';

async function fetchYouTubeChannel(
  apiKey: string,
  params: Record<string, string>
): Promise<Record<string, unknown> | null> {
  const qs = new URLSearchParams({ part: 'snippet,statistics,contentDetails', key: apiKey, ...params });
  const res = await fetch(`${YT_BASE}?${qs}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json() as { items?: unknown[] };
  if (!json.items?.length) return null;
  return json.items[0] as Record<string, unknown>;
}

// We need the latest video upload date to compute recency.
// We only need one result — maxResults=1 per the uploads playlist.
async function fetchLastUploadDate(
  apiKey: string,
  uploadsPlaylistId: string
): Promise<Date | null> {
  const qs = new URLSearchParams({
    part: 'contentDetails',
    playlistId: uploadsPlaylistId,
    maxResults: '1',
    key: apiKey,
  });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${qs}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const json = await res.json() as { items?: Array<{ contentDetails?: { videoPublishedAt?: string } }> };
  const published = json.items?.[0]?.contentDetails?.videoPublishedAt;
  return published ? new Date(published) : null;
}

// ── Main action ─────────────────────────────────────────────────────────────

export async function fetchChannelSnapshot(channelUrl: string): Promise<SnapshotResult> {
  // 1. Rate limit — 10/IP/hour (generous: no cost, just reading public API)
  const headersList = await headers();
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    'unknown';
  const rateCheck = checkRateLimit(`snap:${ip}`, { maxRequests: 10, windowMs: 3_600_000 });
  if (!rateCheck.allowed) {
    const mins = Math.ceil(rateCheck.retryAfterMs / 60_000);
    return { error: `Too many requests. Try again in ${mins} minute${mins === 1 ? '' : 's'}.` };
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return { error: 'YouTube API not configured.' };
  }

  // 2. Parse the URL
  const parsed = parseChannelUrl(channelUrl);
  if (!parsed) {
    return { error: 'Channel not found. Check the URL and try again.' };
  }

  // 3. Try API lookups in order of parsed type, with fallbacks
  let item: Record<string, unknown> | null = null;

  if (parsed.type === 'handle') {
    item = await fetchYouTubeChannel(apiKey, { forHandle: parsed.value });
    if (!item) {
      // Some channels registered before handles — try username fallback
      item = await fetchYouTubeChannel(apiKey, { forUsername: parsed.value });
    }
  } else if (parsed.type === 'id') {
    item = await fetchYouTubeChannel(apiKey, { id: parsed.value });
  } else {
    // username
    item = await fetchYouTubeChannel(apiKey, { forUsername: parsed.value });
    if (!item) {
      item = await fetchYouTubeChannel(apiKey, { forHandle: parsed.value });
    }
  }

  if (!item) {
    return { error: 'Channel not found. Check the URL and try again.' };
  }

  // 4. Extract raw fields
  const snippet = item.snippet as Record<string, unknown>;
  const statistics = item.statistics as Record<string, unknown>;
  const contentDetails = item.contentDetails as Record<string, unknown> | undefined;

  const channelId = item.id as string;
  const name = snippet.title as string;
  const handle = (snippet.customUrl as string | undefined) ?? '';
  const thumbnail =
    (snippet.thumbnails as Record<string, { url: string }> | undefined)?.default?.url ?? '';
  const publishedAt = snippet.publishedAt as string;

  const subscriberCount = parseInt(statistics.subscriberCount as string, 10) || 0;
  const videoCount = parseInt(statistics.videoCount as string, 10) || 0;
  const viewCount = parseInt(statistics.viewCount as string, 10) || 0;

  // 5. Derived metrics
  const publishedDate = new Date(publishedAt);
  const now = new Date();
  const msPerMonth = 1000 * 60 * 60 * 24 * 30.44;
  const channelAgeMonths = Math.max(
    1,
    Math.floor((now.getTime() - publishedDate.getTime()) / msPerMonth)
  );

  const videosPerMonth = videoCount / channelAgeMonths;
  const viewsPerSubscriber = subscriberCount > 0
    ? Math.round(viewCount / subscriberCount)
    : 0;

  // 6. Recency — fetch last upload date from uploads playlist
  const uploadsPlaylistId = (contentDetails as Record<string, unknown> | undefined)
    ?.relatedPlaylists
    ? ((contentDetails as Record<string, unknown>).relatedPlaylists as Record<string, string>)
        ?.uploads
    : undefined;

  let lastUploadDaysAgo = 999;
  if (uploadsPlaylistId) {
    const lastUpload = await fetchLastUploadDate(apiKey, uploadsPlaylistId);
    if (lastUpload) {
      lastUploadDaysAgo = Math.floor(
        (now.getTime() - lastUpload.getTime()) / (1000 * 60 * 60 * 24)
      );
    }
  }

  // New derived metrics
  const contentLeverage = videoCount > 0 ? Math.round(viewCount / videoCount) : 0;
  const contentLeverageFormatted = formatMetricNumber(contentLeverage);
  const subscriberConversion = subscriberCount > 0 ? viewCount / subscriberCount : 0;
  const uploadVelocityPerMonth = Math.round(videosPerMonth * 10) / 10;
  const channelAgeFormatted = formatChannelAge(channelAgeMonths);
  const pain = detectPain(subscriberCount, viewCount, videoCount, channelAgeMonths, uploadVelocityPerMonth);
  const insights = generateInsights(
    pain.pattern,
    subscriberCount,
    contentLeverageFormatted,
    subscriberConversion,
    uploadVelocityPerMonth,
    videoCount,
    channelAgeFormatted,
  );

  const snapshot: ChannelSnapshot = {
    channelId,
    name,
    handle: handle.startsWith('@') ? handle : handle ? `@${handle}` : '',
    thumbnail,
    subscriberCount,
    videoCount,
    viewCount,
    publishedAt,
    channelAgeMonths,
    videosPerMonth: uploadVelocityPerMonth,
    viewsPerSubscriber,
    paceLabel: getPaceLabel(videosPerMonth),
    recencyLabel: getRecencyLabel(lastUploadDaysAgo),
    // New metrics
    contentLeverage,
    contentLeverageFormatted,
    subscriberConversion,
    uploadVelocityPerMonth,
    totalVideos: videoCount,
    channelAgeFormatted,
    painPattern: pain.pattern,
    painLabel: pain.label,
    painValue: pain.value,
    painSubLabel: pain.subLabel,
    // Expert insights
    insightDiagnosis: insights.insightDiagnosis,
    insightQuestion: insights.insightQuestion,
  };

  // Log scan to Supabase for prospect tracking (fire-and-forget, don't block)
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && supabaseKey) {
      fetch(`${supabaseUrl}/rest/v1/channel_scans`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Content-Profile': 'public',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          channel_id: snapshot.channelId,
          channel_name: snapshot.name,
          handle: snapshot.handle,
          subscriber_count: snapshot.subscriberCount,
          video_count: snapshot.videoCount,
          view_count: snapshot.viewCount,
          content_leverage: snapshot.contentLeverage,
          subscriber_conversion: snapshot.subscriberConversion,
          pain_pattern: snapshot.painPattern,
          insight_diagnosis: snapshot.insightDiagnosis,
          scanned_at: new Date().toISOString(),
          ip: ip,
        }),
      }).catch(() => {}); // silent — never block the user
    }
  } catch {} // silent

  return { snapshot };
}
