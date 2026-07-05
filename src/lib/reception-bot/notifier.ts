const LEAD_NOTIFICATION_EMAIL = 'admin@hypeon.media';

export interface LeadData {
  email: string;
  handle?: string;
  channelName?: string;
  subscriberCount?: number;
  purpose?: string;
  sessionId?: string;
}

export async function sendLeadNotification(lead: LeadData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('[notifier] No RESEND_API_KEY — skipping notification for', lead.email);
    return;
  }

  const subLine = lead.subscriberCount
    ? new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(lead.subscriberCount) + ' subscribers'
    : 'subscribers unknown';

  const purposeLabel: Record<string, string> = {
    ad_revenue: 'Ad revenue',
    lead_gen: 'Lead generation',
    brand: 'Brand / awareness',
    other: 'Other',
  };

  const lines = [
    'New chat lead from Hype On Media website.',
    '',
    `Email: ${lead.email}`,
    lead.handle ? `Handle: @${lead.handle.replace(/^@/, '')}` : 'Handle: not provided',
    lead.channelName ? `Channel: ${lead.channelName}` : '',
    lead.subscriberCount != null ? `Subscribers: ${subLine}` : '',
    lead.purpose ? `Purpose: ${purposeLabel[lead.purpose] ?? lead.purpose}` : '',
    lead.sessionId ? `Session: ${lead.sessionId}` : '',
  ].filter(Boolean).join('\n');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'Hype On Media Bot <noreply@hypeon.media>',
        to: [LEAD_NOTIFICATION_EMAIL],
        subject: `New lead: ${lead.email}${lead.channelName ? ` — ${lead.channelName}` : ''}`,
        text: lines,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { message?: string };
      console.error('[notifier] Resend error:', body);
    }
  } catch (err) {
    console.error('[notifier] Network error:', err);
  }
}
