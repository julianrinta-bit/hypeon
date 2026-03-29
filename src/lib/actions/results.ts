'use server';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ── Types ───────────────────────────────────────────────────────────────────

export interface TeaserScore {
  key: string;
  label: string;
  value: number;
  visible: boolean; // true for top 3, false for blurred
}

export interface TeaserData {
  channelName: string;
  channelThumbnail: string | null;
  overallGrade: string;
  scores: TeaserScore[];
  insight: string; // First sentence of recommendation
  fullRecommendationLength: number; // So we can show "... and X more insights"
  analyzedAt: string;
}

export type TeaserResult =
  | { found: true; data: TeaserData }
  | { found: false; reason: 'not_found' | 'not_ready' };

// ── Score metadata ──────────────────────────────────────────────────────────

const SCORE_META: Record<string, string> = {
  score_content_consistency: 'Content Consistency',
  score_title_quality: 'Title Quality',
  score_thumbnail_patterns: 'Thumbnail Patterns',
  score_engagement_health: 'Engagement Health',
  score_growth_trajectory: 'Growth Trajectory',
  score_outlier_detection: 'Outlier Detection',
};

// ── Fetch teaser data ───────────────────────────────────────────────────────

export async function fetchTeaserData(publicId: string): Promise<TeaserResult> {
  // First check if the job exists and is complete
  const { data: job } = await supabase
    .from('analysis_jobs')
    .select('id, status, channel_id')
    .eq('public_id', publicId)
    .maybeSingle();

  if (!job) {
    return { found: false, reason: 'not_found' };
  }

  if (job.status !== 'complete') {
    return { found: false, reason: 'not_ready' };
  }

  // Fetch the analysis results
  const { data: analysis } = await supabase
    .from('analyses')
    .select(`
      overall_grade,
      score_content_consistency,
      score_title_quality,
      score_thumbnail_patterns,
      score_engagement_health,
      score_growth_trajectory,
      score_outlier_detection,
      recommendation,
      created_at
    `)
    .eq('job_id', job.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!analysis) {
    return { found: false, reason: 'not_ready' };
  }

  // Fetch channel info
  const { data: channel } = await supabase
    .from('channels')
    .select('name, thumbnail_url')
    .eq('id', job.channel_id)
    .single();

  // Build scores array, sorted by value (highest first)
  const scoreEntries = Object.entries(SCORE_META)
    .map(([key, label]) => ({
      key,
      label,
      value: (analysis as Record<string, unknown>)[key] as number ?? 0,
      visible: false,
    }))
    .sort((a, b) => b.value - a.value);

  // Top 3 visible, bottom 3 blurred
  scoreEntries.forEach((score, i) => {
    score.visible = i < 3;
  });

  // Extract first sentence of recommendation as the insight
  const fullRec = analysis.recommendation || '';
  const firstSentence = fullRec.match(/^[^.!?]+[.!?]/)?.[0] || fullRec.slice(0, 120);
  const recSentences = fullRec.split(/[.!?]\s+/).filter(Boolean).length;

  return {
    found: true,
    data: {
      channelName: channel?.name || 'Your Channel',
      channelThumbnail: channel?.thumbnail_url || null,
      overallGrade: analysis.overall_grade || 'N/A',
      scores: scoreEntries,
      insight: firstSentence,
      fullRecommendationLength: recSentences,
      analyzedAt: analysis.created_at,
    },
  };
}
