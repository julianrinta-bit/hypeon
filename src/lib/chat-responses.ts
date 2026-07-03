/**
 * Chat keyword-matching responses.
 * Text copied LITERALLY from HypeOn Chat.dc.html lines 223-244 (getReply function).
 */

export interface ChatReply {
  text: string;
  cta: boolean;
}

export function getReply(q: string): ChatReply {
  const lower = q.toLowerCase();

  if (lower.includes('grow') || lower.includes('subscriber') || lower.includes('views')) {
    return {
      cta: true,
      text: "Growth on YouTube isn't about posting more — it's about posting smarter. Most channels we audit have the same issue: good content, poor packaging. Titles and thumbnails that don't match what buyers are searching for. We'd start with a full content audit to identify where you're losing clicks and watch-time. What's your current posting frequency?",
    };
  }

  if (lower.includes('monetize') || lower.includes('revenue') || lower.includes('money') || lower.includes('table')) {
    return {
      cta: true,
      text: "There are typically three revenue gaps we find: underperforming CPM (fixable with better audience targeting), missed affiliate/sponsorship opportunities, and no multi-language presence. Spanish alone adds 35–60% incremental revenue for most English channels. A free audit would tell you which of these applies to your channel specifically.",
    };
  }

  if (lower.includes('wrong') || lower.includes('problem') || lower.includes('issue') || lower.includes('bad')) {
    return {
      cta: true,
      text: "The most common issues we see: inconsistent publishing cadence, thumbnails designed for the creator instead of the viewer, titles that don't match search intent, and no clear content architecture. Any of those ring a bell? Share your channel URL and we'll tell you exactly what we'd fix first.",
    };
  }

  if (lower.includes('cost') || lower.includes('price') || lower.includes('how much')) {
    return {
      cta: false,
      text: "The channel audit is completely free — no strings attached. Paid engagements start with a Strategy Sprint (two weeks), then move into a monthly retainer covering production, optimization, and reporting. We give you a specific proposal after the audit, based on your channel's size and goals. No generic packages.",
    };
  }

  if (lower.includes('strategy') || lower.includes('content') || lower.includes('plan')) {
    return {
      cta: true,
      text: "A real YouTube strategy has three layers: content architecture (what to make), packaging systems (how to present it), and distribution cadence (when to post). Most channels nail one, ignore the other two. We build all three as a single operating system. Want us to look at yours?",
    };
  }

  if (lower.includes('language') || lower.includes('spanish') || lower.includes('translat') || lower.includes('local')) {
    return {
      cta: true,
      text: "Multi-language expansion is the most underused lever in YouTube. Spanish channels typically reach 500M+ native speakers and generate CPMs 30–50% of English — but the volume makes up for it. We've scaled content across 15 languages. The math almost always works in your favour.",
    };
  }

  // Fallback
  return {
    cta: true,
    text: "That's a great question. The honest answer is: it depends on your channel's specific situation — and we'd rather give you accurate advice than a generic answer. A free audit takes 48 hours and gives you a detailed breakdown of exactly what we'd do. Want to start there?",
  };
}
