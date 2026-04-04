# AI Media Buyer Dashboard

## What
Protected dashboard at hypeon.media/ads (password gate) showing:
1. Live ad performance (spend, clicks, CTR, CPC per creative per geo)
2. AI recommendations (pause/scale/reallocate decisions)
3. Action log (what the AI decided and why)
4. Cron: every 4 hours, reads Meta API, stores snapshots, AI decides

## Tech
- Next.js page at /ads (hypeon-website)
- Password gate (simple, no Supabase auth — just a code like "hypeon2026")
- Server actions calling Meta Insights API directly (token from env)
- Supabase table: ad_performance_snapshots
- Cron script on alpha server (PM2)
- 21st.dev Magic MCP for premium components
- Design: match existing hypeon dark theme (#0A0A0C, #c8ff2e)

## Pages
1. /ads → password gate
2. /ads/dashboard → main view (after auth)
   - Campaign overview card
   - Performance table (per ad, per ad set)
   - Trend sparklines (last 7 days)
   - AI recommendations panel
   - Action log

## API Endpoints (server actions)
- getAdPerformance() → calls Meta Insights API
- getSnapshots() → reads from Supabase
- executeAction(action) → pause/activate/budget change via Meta API
