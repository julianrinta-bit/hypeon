# Hype On Media — Reception Bot — Implementation Plan (2026-07-04)

## Architecture

The reception bot is a deterministic, stateless conversation engine that guides website visitors through a lead-capture flow.

### Key Components

- **State Machine** (`src/lib/reception-bot/state-machine.ts`): Pure logic layer. No AI. Takes a BotRequest with current stateId + context, performs transition, returns BotResponse. States: INIT → AWAIT_PURPOSE → AWAIT_HANDLE → AWAIT_EMAIL → DONE | UNAVAILABLE.
- **API Route** (`src/app/api/chat/route.ts`): Rate-limited Next.js route. Validates input with Zod, runs state machine, returns JSON.
- **Client UI** (`src/components/chat/ChatClient.tsx`): Stateless client. Holds stateId + context locally, sends them back each turn. Renders bubbles, purpose buttons, and email input.
- **YouTube Resolver** (`src/lib/reception-bot/youtube-resolver.ts`): Validates and resolves @handles via YouTube Data API v3.
- **Circuit Breaker** (`src/lib/reception-bot/circuit-breaker.ts`): Daily cap (200 leads/day UTC). Seeds from Supabase on startup.
- **Notifier** (`src/lib/reception-bot/notifier.ts`): Fire-and-forget Resend email on lead capture.
- **Variation Selector** (`src/lib/reception-bot/variation-selector.ts`): Deterministic variant picker using sessionId + turn hash.
- **FAQ Matcher** (`src/lib/reception-bot/faq-matcher.ts`): Keyword-based FAQ matching.
- **Static Responses** (`src/lib/data/reception-bot-responses.ts`): All copy variants, FAQ entries, flow responses.

### Database
Table: `public.chat_leads` in Supabase. RLS: anon insert only. Dedup index on (lower(email), lower(coalesce(handle,''))).

### Security
- Rate limiting: burst (5/10s), per-minute (20/min), per-hour (60/hr)
- Honeypot field: botTrap
- Input sanitization: strip HTML, max 500 chars
- Zod schema validation on all inputs
- Circuit breaker: 200 leads/day cap

### Deploy Checklist
1. Run migration SQL in Supabase dashboard
2. Verify YOUTUBE_API_KEY, RESEND_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env.local and DO env
3. Deploy to DigitalOcean via PM2
4. Smoke test: open /chat, go through full flow
