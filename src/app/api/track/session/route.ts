import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, max_scroll_pct, time_on_site_s } = body;

    if (!session_id || typeof max_scroll_pct !== 'number' || typeof time_on_site_s !== 'number') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    await getSupabaseAdmin()
      .from('visitor_sessions')
      .update({
        max_scroll_pct: Math.min(100, Math.max(0, Math.round(max_scroll_pct))),
        time_on_site_s: Math.max(0, Math.round(time_on_site_s)),
      })
      .eq('id', session_id);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
