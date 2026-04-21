'use server';

import { getSupabaseAdmin } from '@/lib/supabase';

export interface JobStatus {
  status: string;
  errorMessage: string | null;
}

export type StatusResult =
  | { found: true; data: JobStatus }
  | { found: false };

export async function fetchJobStatus(publicId: string): Promise<StatusResult> {
  const { data } = await getSupabaseAdmin()
    .from('analysis_jobs')
    .select('status, error_message')
    .eq('public_id', publicId)
    .maybeSingle();

  if (!data) {
    return { found: false };
  }

  return {
    found: true,
    data: { status: data.status, errorMessage: data.error_message },
  };
}
