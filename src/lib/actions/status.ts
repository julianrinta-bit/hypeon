'use server';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export interface JobStatus {
  status: string;
  errorMessage: string | null;
}

export type StatusResult =
  | { found: true; data: JobStatus }
  | { found: false };

export async function fetchJobStatus(publicId: string): Promise<StatusResult> {
  const { data, error } = await supabase
    .from('analysis_jobs')
    .select('status, error_message')
    .eq('public_id', publicId)
    .maybeSingle();

  if (error || !data) {
    return { found: false };
  }

  return {
    found: true,
    data: { status: data.status, errorMessage: data.error_message },
  };
}
