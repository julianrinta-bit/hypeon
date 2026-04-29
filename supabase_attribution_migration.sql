-- Lead Attribution System Migration — Run in Supabase SQL Editor
-- Tables: visitor_sessions, visitor_events
-- Alters: analysis_jobs (add session_id), profiles (add first-touch attribution columns)
-- RLS: enabled on both new tables with anon INSERT + service_role SELECT/UPDATE policies

-- ============================================================
-- 1. CREATE TABLE: visitor_sessions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.visitor_sessions (
  id                uuid          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to authenticated user if they eventually sign in / already signed in
  user_id           uuid          NULL REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Anonymous visitor fingerprint (set by client, e.g. crypto.randomUUID stored in localStorage)
  visitor_id        text          NOT NULL,

  -- UTM parameters
  utm_source        text          NULL,
  utm_medium        text          NULL,
  utm_campaign      text          NULL,
  utm_content       text          NULL,
  utm_term          text          NULL,

  -- Ad click IDs
  fbclid            text          NULL,
  gclid             text          NULL,

  -- Traffic source context
  referrer          text          NULL,
  landing_page      text          NULL,

  -- Device / browser fingerprint (coarse — no fingerprinting PII)
  device_type       text          NULL,  -- 'mobile' | 'tablet' | 'desktop'
  os                text          NULL,
  browser           text          NULL,
  screen_width      smallint      NULL,
  screen_height     smallint      NULL,

  -- Locale
  language          text          NULL,
  timezone          text          NULL,

  -- Geo (resolved server-side from IP, not stored raw)
  country_code      text          NULL,
  region            text          NULL,
  city              text          NULL,

  -- Behavioral signals
  is_returning      boolean       NOT NULL DEFAULT false,
  page_views        smallint      NOT NULL DEFAULT 1,
  max_scroll_pct    smallint      NOT NULL DEFAULT 0,   -- 0–100
  time_on_site_s    integer       NOT NULL DEFAULT 0,

  -- Conversion tracking
  converted         boolean       NOT NULL DEFAULT false,
  converted_at      timestamptz   NULL,
  promo_code        text          NULL,

  -- Timestamps
  created_at        timestamptz   NOT NULL DEFAULT now(),
  updated_at        timestamptz   NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.visitor_sessions IS
  'One row per anonymous or authenticated visit. Created on first page load, updated on subsequent events within the same session.';

COMMENT ON COLUMN public.visitor_sessions.visitor_id IS
  'Client-generated UUID stored in localStorage. Survives page reloads, does not survive clearing browser storage.';

COMMENT ON COLUMN public.visitor_sessions.max_scroll_pct IS
  'Maximum scroll depth reached during the session, expressed as a percentage (0–100).';

-- ============================================================
-- 2. CREATE TABLE: visitor_events
-- ============================================================

CREATE TABLE IF NOT EXISTS public.visitor_events (
  id            bigint        PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  session_id    uuid          NOT NULL REFERENCES public.visitor_sessions(id) ON DELETE CASCADE,
  event_type    text          NOT NULL,  -- e.g. 'page_view' | 'cta_click' | 'form_submit' | 'scroll_depth'
  event_data    jsonb         NULL,
  created_at    timestamptz   NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.visitor_events IS
  'Granular event stream tied to a visitor_session. Cascade-deletes when the parent session is removed.';

COMMENT ON COLUMN public.visitor_events.event_type IS
  'Enum-style text: page_view, cta_click, form_start, form_submit, scroll_depth, video_play, promo_applied, conversion.';

-- ============================================================
-- 3. ALTER TABLE: analysis_jobs — add session_id
-- ============================================================

ALTER TABLE public.analysis_jobs
  ADD COLUMN IF NOT EXISTS session_id uuid NULL
    REFERENCES public.visitor_sessions(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.analysis_jobs.session_id IS
  'Links a submitted audit job back to the visitor session that originated it. Nullable — historical jobs predate the attribution system.';

-- ============================================================
-- 4. ALTER TABLE: profiles — add first-touch attribution columns
-- ============================================================
-- profiles.id is the PK (uuid) and matches auth.users.id
-- Existing columns: id, email, channel_url, created_at, goal,
--   last_active_at, production_level, publishing_frequency, region

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_utm_source    text NULL,
  ADD COLUMN IF NOT EXISTS first_utm_medium    text NULL,
  ADD COLUMN IF NOT EXISTS first_utm_campaign  text NULL,
  ADD COLUMN IF NOT EXISTS first_utm_content   text NULL,
  ADD COLUMN IF NOT EXISTS first_referrer      text NULL,
  ADD COLUMN IF NOT EXISTS first_country       text NULL,
  ADD COLUMN IF NOT EXISTS first_device_type   text NULL,
  ADD COLUMN IF NOT EXISTS first_language      text NULL;

COMMENT ON COLUMN public.profiles.first_utm_source   IS 'UTM source from the very first visit that led to account creation.';
COMMENT ON COLUMN public.profiles.first_utm_medium   IS 'UTM medium from the very first visit.';
COMMENT ON COLUMN public.profiles.first_utm_campaign IS 'UTM campaign from the very first visit.';
COMMENT ON COLUMN public.profiles.first_utm_content  IS 'UTM content variant from the very first visit.';
COMMENT ON COLUMN public.profiles.first_referrer     IS 'HTTP referrer URL from the very first visit.';
COMMENT ON COLUMN public.profiles.first_country      IS 'Country code resolved on first visit (ISO 3166-1 alpha-2).';
COMMENT ON COLUMN public.profiles.first_device_type  IS 'Device type on first visit: mobile | tablet | desktop.';
COMMENT ON COLUMN public.profiles.first_language     IS 'Browser language on first visit (e.g. en-US).';

-- ============================================================
-- 5. INDEXES
-- ============================================================

-- visitor_sessions
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_visitor_id
  ON public.visitor_sessions (visitor_id);

CREATE INDEX IF NOT EXISTS idx_visitor_sessions_user_id
  ON public.visitor_sessions (user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_visitor_sessions_utm_source
  ON public.visitor_sessions (utm_source)
  WHERE utm_source IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_visitor_sessions_created_at
  ON public.visitor_sessions (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_visitor_sessions_converted
  ON public.visitor_sessions (converted, converted_at DESC)
  WHERE converted = true;

-- visitor_events
CREATE INDEX IF NOT EXISTS idx_visitor_events_session_id
  ON public.visitor_events (session_id);

CREATE INDEX IF NOT EXISTS idx_visitor_events_event_type
  ON public.visitor_events (event_type);

CREATE INDEX IF NOT EXISTS idx_visitor_events_created_at
  ON public.visitor_events (created_at DESC);

-- analysis_jobs — the new FK column
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_session_id
  ON public.analysis_jobs (session_id)
  WHERE session_id IS NOT NULL;

-- ============================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================

-- visitor_sessions ----------------------------------------

ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;

-- Anon and authenticated users can INSERT their own session
CREATE POLICY "visitor_sessions_anon_insert"
  ON public.visitor_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only service_role can SELECT all sessions (analytics, admin)
CREATE POLICY "visitor_sessions_service_role_select"
  ON public.visitor_sessions
  FOR SELECT
  TO service_role
  USING (true);

-- Only service_role can UPDATE sessions (e.g. mark converted, update geo)
CREATE POLICY "visitor_sessions_service_role_update"
  ON public.visitor_sessions
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can SELECT and UPDATE their own session
-- (allows client-side enrichment of session with user_id after login)
CREATE POLICY "visitor_sessions_owner_select"
  ON public.visitor_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "visitor_sessions_owner_update"
  ON public.visitor_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- visitor_events ------------------------------------------

ALTER TABLE public.visitor_events ENABLE ROW LEVEL SECURITY;

-- Anon and authenticated users can INSERT events
CREATE POLICY "visitor_events_anon_insert"
  ON public.visitor_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only service_role can SELECT events (reporting, debugging)
CREATE POLICY "visitor_events_service_role_select"
  ON public.visitor_events
  FOR SELECT
  TO service_role
  USING (true);

-- ============================================================
-- 7. UPDATED_AT AUTO-MAINTENANCE (trigger on visitor_sessions)
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_visitor_sessions_updated_at
  BEFORE UPDATE ON public.visitor_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- END OF MIGRATION
-- ============================================================
