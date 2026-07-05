import { pickVariant } from './variation-selector';
import { matchFAQ } from './faq-matcher';
import { resolveHandle } from './youtube-resolver';
import { isUnavailable, increment } from './circuit-breaker';
import { sendLeadNotification } from './notifier';
import { getSupabaseAdmin } from '@/lib/supabase';
import {
  FLOW_RESPONSES,
  CAPTURE_REPERTOIRE,
  FALLBACK_REPERTOIRE,
  UNAVAILABLE_RESPONSES,
  PURPOSE_BUTTONS,
} from '@/lib/data/reception-bot-responses';
import type { BotRequest, BotResponse, BotMessage, BotStateId, ConversationContext, PurposeValue } from './types';

function sanitize(input: string | null): string {
  if (!input) return '';
  return input.replace(/<[^>]*>/g, '').trim().slice(0, 500);
}

function fmt(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
}

function formatSubs(count: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(count);
}

async function saveLead(
  email: string,
  context: ConversationContext,
  conversation: unknown[],
  ip: string,
): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = getSupabaseAdmin() as any;
    await supabase.from('chat_leads').insert({
      email,
      handle: context.handle?.replace(/^@/, '') || null,
      channel_id: context.channelId || null,
      channel_name: context.channelName || null,
      subscriber_count: context.subscriberCount ?? null,
      purpose: context.purpose || null,
      conversation: conversation,
      session_id: context.sessionId || null,
      visitor_id: context.visitorId || null,
      ip_address: ip || null,
    });
    increment();
  } catch (err) {
    console.error('[state-machine] saveLead error:', err);
  }
}

export async function step(
  req: BotRequest,
  ip: string,
): Promise<BotResponse> {
  const { stateId, context } = req;
  const input = sanitize(req.input);
  const { sessionId, turn } = context;

  if (stateId === 'UNAVAILABLE' || isUnavailable()) {
    const msg = pickVariant(UNAVAILABLE_RESPONSES, sessionId, turn);
    return {
      ok: true,
      stateId: 'UNAVAILABLE',
      messages: [{ text: msg }],
      context: { ...context, turn: turn + 1 },
    };
  }

  if (stateId === 'INIT') {
    const messages: BotMessage[] = [
      { text: FLOW_RESPONSES.OPENING[0] },
    ];

    if (input && input.length > 0) {
      const faqMatch = matchFAQ(input);
      if (faqMatch) {
        const answer = pickVariant(faqMatch.variants, sessionId, turn + 1);
        messages.unshift({ text: answer });
      }
    }

    return {
      ok: true,
      stateId: 'AWAIT_PURPOSE',
      messages,
      buttons: PURPOSE_BUTTONS,
      context: { ...context, turn: turn + 1 },
    };
  }

  if (stateId === 'AWAIT_PURPOSE') {
    const validPurposes: PurposeValue[] = ['ad_revenue', 'lead_gen', 'brand', 'other'];
    const resolvedPurpose: PurposeValue = validPurposes.includes(input as PurposeValue)
      ? (input as PurposeValue)
      : 'other';

    if (!validPurposes.includes(input as PurposeValue) && input.length > 0) {
      const faqMatch = matchFAQ(input);
      if (faqMatch) {
        const answer = pickVariant(faqMatch.variants, sessionId, turn + 1);
        const capture = pickVariant(CAPTURE_REPERTOIRE, sessionId, turn + 2);
        return {
          ok: true,
          stateId: 'AWAIT_PURPOSE',
          messages: [{ text: answer }, { text: capture }],
          buttons: PURPOSE_BUTTONS,
          context: { ...context, turn: turn + 1 },
        };
      }
      // No FAQ match on free text: serve the universal fallback and stay in
      // AWAIT_PURPOSE. A purpose button is the ONLY way to advance to AWAIT_HANDLE.
      const fallback = pickVariant(FALLBACK_REPERTOIRE, sessionId, turn + 1);
      return {
        ok: true,
        stateId: 'AWAIT_PURPOSE',
        messages: [{ text: fallback }],
        buttons: PURPOSE_BUTTONS,
        context: { ...context, turn: turn + 1 },
      };
    }

    const ackVariants = FLOW_RESPONSES.PURPOSE_ACK[resolvedPurpose] ?? FLOW_RESPONSES.PURPOSE_ACK.other;
    const ack = pickVariant(ackVariants, sessionId, turn);

    return {
      ok: true,
      stateId: 'AWAIT_HANDLE',
      messages: [{ text: ack }],
      context: { ...context, purpose: resolvedPurpose, turn: turn + 1 },
    };
  }

  if (stateId === 'AWAIT_HANDLE') {
    if (!input || input.length === 0) {
      const req2 = pickVariant(FLOW_RESPONSES.HANDLE_REQUEST, sessionId, turn);
      return {
        ok: true,
        stateId: 'AWAIT_HANDLE',
        messages: [{ text: req2 }],
        context: { ...context, turn: turn + 1 },
      };
    }

    const handleRaw = input.startsWith('@') ? input : `@${input}`;
    const handleClean = handleRaw.replace(/^@/, '');
    if (!/^[a-zA-Z0-9._-]{1,100}$/.test(handleClean)) {
      const reprompt = pickVariant(FLOW_RESPONSES.CHANNEL_NOT_FOUND, sessionId, turn);
      return {
        ok: true,
        stateId: 'AWAIT_HANDLE',
        messages: [{ text: reprompt }],
        context: { ...context, turn: turn + 1 },
      };
    }

    const channelInfo = await resolveHandle(handleClean);

    if (!channelInfo) {
      const notFound = pickVariant(FLOW_RESPONSES.CHANNEL_NOT_FOUND, sessionId, turn);
      return {
        ok: true,
        stateId: 'AWAIT_HANDLE',
        messages: [{ text: notFound }],
        context: { ...context, handle: `@${handleClean}`, turn: turn + 1 },
      };
    }

    const found = pickVariant(FLOW_RESPONSES.CHANNEL_FOUND, sessionId, turn);
    const msg = fmt(found, {
      channelName: channelInfo.channelName,
      subs: channelInfo.formattedSubs,
    });

    return {
      ok: true,
      stateId: 'AWAIT_EMAIL',
      messages: [{ text: msg }],
      context: {
        ...context,
        handle: `@${handleClean}`,
        channelId: channelInfo.channelId,
        channelName: channelInfo.channelName,
        subscriberCount: channelInfo.subscriberCount,
        turn: turn + 1,
      },
    };
  }

  if (stateId === 'AWAIT_EMAIL') {
    if (!input || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input) || input.length > 200) {
      const invalid = pickVariant(FLOW_RESPONSES.EMAIL_INVALID, sessionId, turn);
      return {
        ok: true,
        stateId: 'AWAIT_EMAIL',
        messages: [{ text: invalid }],
        context: { ...context, turn: turn + 1 },
      };
    }

    const email = input.toLowerCase().trim();

    await saveLead(email, context, [], ip);

    sendLeadNotification({
      email,
      handle: context.handle,
      channelName: context.channelName,
      subscriberCount: context.subscriberCount,
      purpose: context.purpose,
      sessionId: context.sessionId,
    }).catch(() => {});

    const doneVariants = context.handle
      ? FLOW_RESPONSES.DONE
      : FLOW_RESPONSES.DONE_NO_HANDLE;
    const doneTpl = pickVariant(doneVariants, sessionId, turn);
    const doneMsg = fmt(doneTpl, {
      email,
      handle: context.handle ?? '',
    });

    return {
      ok: true,
      stateId: 'DONE',
      messages: [{ text: doneMsg, cta: true }],
      context: { ...context, turn: turn + 1 },
    };
  }

  // Fallback for any unhandled state
  const fallback = pickVariant(FALLBACK_REPERTOIRE, sessionId, turn);
  return {
    ok: true,
    stateId: stateId as BotStateId,
    messages: [{ text: fallback }],
    context: { ...context, turn: turn + 1 },
  };
}

// Suppress unused import warning — formatSubs is kept for future use
void formatSubs;
