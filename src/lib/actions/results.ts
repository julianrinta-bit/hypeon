'use server';

import { createClient } from '@supabase/supabase-js';

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }
  return _supabase;
}

// ── Types ───────────────────────────────────────────────────────────────────

export interface TeaserScore {
  key: string;
  label: string;
  value: number;
  visible: boolean; // true for top 3, false for blurred
}

// ── Outlier types ────────────────────────────────────────────────────────────

export interface OutlierVideo {
  title: string;
  percent_above_avg?: number;
  percent_below_avg?: number;
  explanation: string;
}

export interface OutliersData {
  overperformers: OutlierVideo[];
  underperformers: OutlierVideo[];
}

// ── Weighted scores ──────────────────────────────────────────────────────────

export interface WeightedScores {
  composite_score?: number;
  [key: string]: number | undefined;
}

// ── Deep dive types ──────────────────────────────────────────────────────────

export interface HookRewrite {
  original_hook: string;
  rewritten_hook: string;
  improvement_rationale: string;
}

export interface HookMasteryContent {
  rewrites: HookRewrite[];
}

export interface TitleAlternative {
  original_title: string;
  alternatives: string[];
  predicted_improvement: string;
}

export interface TitleLaboratoryContent {
  alternatives: TitleAlternative[];
}

export interface CompetitorBreakdown {
  competitor_name: string;
  video_title: string;
  key_takeaway: string;
  applicable_to_user: string;
  structure_analysis: string;
}

export interface CompetitorPlaybookContent {
  breakdowns: CompetitorBreakdown[];
}

export interface ContentGap {
  topic: string;
  priority: number;
  difficulty: string;
  content_angle: string;
  estimated_monthly_views: number;
}

export interface ContentGapsContent {
  gaps: ContentGap[];
}

export interface DeepDives {
  hook_mastery: HookMasteryContent | null;
  title_laboratory: TitleLaboratoryContent | null;
  competitor_playbook: CompetitorPlaybookContent | null;
  content_gaps: ContentGapsContent | null;
}

export interface TeaserData {
  channelName: string;
  channelThumbnail: string | null;
  overallGrade: string;
  scores: TeaserScore[];
  insight: string; // First sentence of recommendation
  fullRecommendationLength: number; // So we can show "... and X more insights"
  analyzedAt: string;
  recommendation: string;
  weightedScores: WeightedScores | null;
  outliers: OutliersData | null;
  deepDives: DeepDives;
  expiresAt: string; // ISO string: completed_at + 24h
  userEmail: string | null; // For watermark — from profiles table
}

export type TeaserResult =
  | { found: true; data: TeaserData }
  | { found: false; reason: 'not_found' | 'not_ready' | 'expired' };

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
  const { data: job } = await getSupabase()
    .from('analysis_jobs')
    .select('id, status, channel_id, completed_at, user_id')
    .eq('public_id', publicId)
    .maybeSingle();

  if (!job) {
    return { found: false, reason: 'not_found' };
  }

  if (job.status !== 'complete') {
    return { found: false, reason: 'not_ready' };
  }

  // 24-hour expiry check
  if (job.completed_at) {
    const completedAt = new Date(job.completed_at as string);
    const expiresAt = new Date(completedAt.getTime() + 24 * 60 * 60 * 1000);
    if (new Date() > expiresAt) {
      return { found: false, reason: 'expired' };
    }
  }

  // Fetch the analysis results (including new fields)
  const { data: analysis } = await getSupabase()
    .from('analyses')
    .select(`
      id,
      overall_grade,
      score_content_consistency,
      score_title_quality,
      score_thumbnail_patterns,
      score_engagement_health,
      score_growth_trajectory,
      score_outlier_detection,
      recommendation,
      weighted_scores,
      outliers,
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
  const { data: channel } = await getSupabase()
    .from('channels')
    .select('name, thumbnail_url')
    .eq('id', job.channel_id)
    .single();

  // Fetch user email for watermark (from auth.users via service role)
  let userEmail: string | null = null;
  if (job.user_id) {
    const { data: authUser } = await getSupabase().auth.admin.getUserById(
      job.user_id as string
    );
    userEmail = authUser?.user?.email ?? null;
  }

  // Fetch deep dives (4 module types)
  const { data: deepDiveRows } = await getSupabase()
    .from('deep_dives')
    .select('module_type, content')
    .eq('analysis_id', analysis.id);

  // Parse deep dive modules
  const deepDives: DeepDives = {
    hook_mastery: null,
    title_laboratory: null,
    competitor_playbook: null,
    content_gaps: null,
  };

  if (deepDiveRows) {
    for (const row of deepDiveRows) {
      const content = typeof row.content === 'string'
        ? JSON.parse(row.content)
        : row.content;

      switch (row.module_type) {
        case 'hook_mastery':
          deepDives.hook_mastery = content as HookMasteryContent;
          break;
        case 'title_laboratory':
          deepDives.title_laboratory = content as TitleLaboratoryContent;
          break;
        case 'competitor_playbook':
          deepDives.competitor_playbook = content as CompetitorPlaybookContent;
          break;
        case 'content_gaps':
          deepDives.content_gaps = content as ContentGapsContent;
          break;
      }
    }
  }

  // Build scores array, sorted by value (highest first)
  const scoreEntries = Object.entries(SCORE_META)
    .map(([key, label]) => ({
      key,
      label,
      value: (analysis as Record<string, unknown>)[key] as number ?? 0,
      visible: false,
    }))
    .sort((a, b) => b.value - a.value);

  // TODO: For production, top 3 visible, bottom 3 blurred
  // For now, all visible for testing
  scoreEntries.forEach((score) => {
    score.visible = true;
  });

  // TODO: For production, only first sentence visible
  // For now, full recommendation for testing
  const fullRec = analysis.recommendation || '';
  const firstSentence = fullRec; // Show everything for testing
  const recSentences = fullRec.split(/[.!?]\s+/).filter(Boolean).length;

  // Parse JSONB fields (may already be objects or may be strings)
  const weightedScores: WeightedScores | null = analysis.weighted_scores
    ? (typeof analysis.weighted_scores === 'string'
        ? JSON.parse(analysis.weighted_scores)
        : analysis.weighted_scores) as WeightedScores
    : null;

  const outliers: OutliersData | null = analysis.outliers
    ? (typeof analysis.outliers === 'string'
        ? JSON.parse(analysis.outliers)
        : analysis.outliers) as OutliersData
    : null;

  // Compute expiresAt (completed_at + 24h, or fallback to created_at + 24h)
  const baseTime = job.completed_at
    ? new Date(job.completed_at as string)
    : new Date(analysis.created_at as string);
  const expiresAt = new Date(baseTime.getTime() + 24 * 60 * 60 * 1000).toISOString();

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
      recommendation: fullRec,
      weightedScores,
      outliers,
      deepDives,
      expiresAt,
      userEmail,
    },
  };
}
