import { getSupabaseAdmin } from '@/lib/supabase';

const DAILY_CAP = 200;
let dailyCount = 0;
let lastResetDate = new Date().toISOString().slice(0, 10);

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function checkAndResetIfNewDay(): void {
  const today = todayUTC();
  if (today !== lastResetDate) {
    dailyCount = 0;
    lastResetDate = today;
  }
}

export function isUnavailable(): boolean {
  checkAndResetIfNewDay();
  return dailyCount >= DAILY_CAP;
}

export function increment(): void {
  checkAndResetIfNewDay();
  dailyCount++;
}

async function seedCount(): Promise<void> {
  try {
    const today = todayUTC();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = getSupabaseAdmin() as any;
    const { count } = await supabase
      .from('chat_leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00Z`);
    if (typeof count === 'number') {
      dailyCount = count;
      lastResetDate = today;
    }
  } catch {
    // safe degradation
  }
}

if (typeof setInterval !== 'undefined') {
  seedCount();
  setInterval(() => {
    checkAndResetIfNewDay();
    if (dailyCount < DAILY_CAP) {
      seedCount();
    }
  }, 60_000);
}
