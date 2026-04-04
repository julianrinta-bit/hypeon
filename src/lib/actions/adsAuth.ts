'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAds(formData: FormData) {
  const password = formData.get('password') as string;
  const expected = process.env.ADS_DASHBOARD_PASSWORD ?? 'hypeon2026';

  if (password !== expected) {
    return { error: 'Invalid password' };
  }

  const cookieStore = await cookies();
  cookieStore.set('ads_auth', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  redirect('/ads/dashboard');
}
