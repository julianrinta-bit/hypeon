import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import { step } from '@/lib/reception-bot/state-machine';
import { isUnavailable } from '@/lib/reception-bot/circuit-breaker';
import { UNAVAILABLE_RESPONSES } from '@/lib/data/reception-bot-responses';

const ContextSchema = z.object({
  sessionId: z.string().min(1).max(200),
  visitorId: z.string().max(200).optional(),
  turn: z.number().min(0).max(1000),
  purpose: z.enum(['ad_revenue', 'lead_gen', 'brand', 'other'] as const).optional(),
  handle: z.string().max(200).optional(),
  channelId: z.string().max(200).optional(),
  channelName: z.string().max(200).optional(),
  subscriberCount: z.number().min(0).optional(),
});

const RequestSchema = z.object({
  stateId: z.enum(['INIT', 'AWAIT_PURPOSE', 'AWAIT_HANDLE', 'AWAIT_EMAIL', 'UNAVAILABLE'] as const),
  input: z.string().max(500).nullable(),
  context: ContextSchema,
  botTrap: z.string().max(200).optional(),
});

function unavailableResponse(): NextResponse {
  return NextResponse.json(
    {
      ok: true,
      stateId: 'UNAVAILABLE',
      messages: [{ text: UNAVAILABLE_RESPONSES[0] }],
      buttons: undefined,
      context: { sessionId: '', turn: 0 },
    },
    { status: 200 },
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  const burst = checkRateLimit(`chat:burst:${ip}`, { maxRequests: 5, windowMs: 10_000 });
  if (!burst.allowed) {
    return NextResponse.json(
      {
        ok: true,
        stateId: 'UNAVAILABLE',
        messages: [{ text: 'You are sending messages too quickly. Please wait a moment.' }],
        context: { sessionId: '', turn: 0 },
      },
      { status: 429 },
    );
  }

  const perMin = checkRateLimit(`chat:min:${ip}`, { maxRequests: 20, windowMs: 60_000 });
  if (!perMin.allowed) {
    return NextResponse.json(
      {
        ok: true,
        stateId: 'UNAVAILABLE',
        messages: [{ text: 'You have reached the message limit for this session.' }],
        context: { sessionId: '', turn: 0 },
      },
      { status: 429 },
    );
  }

  const perHour = checkRateLimit(`chat:hour:${ip}`, { maxRequests: 60, windowMs: 3_600_000 });
  if (!perHour.allowed) {
    return NextResponse.json(
      {
        ok: true,
        stateId: 'UNAVAILABLE',
        messages: [{ text: 'You have reached the hourly limit. Please try again later.' }],
        context: { sessionId: '', turn: 0 },
      },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data = parsed.data;

  if (data.botTrap && data.botTrap.length > 0) {
    return NextResponse.json({
      ok: true,
      stateId: 'DONE',
      messages: [{ text: 'Done. The team will be in touch.', cta: true }],
      context: data.context,
    });
  }

  if (isUnavailable()) {
    return unavailableResponse();
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await step(data as any, ip);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[chat/route] unhandled error:', err);
    return unavailableResponse();
  }
}
