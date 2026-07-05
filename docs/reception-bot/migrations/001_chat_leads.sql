create table public.chat_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  handle text,
  channel_id text,
  channel_name text,
  subscriber_count integer,
  purpose text check (purpose is null or purpose in ('ad_revenue','lead_gen','brand','other')),
  conversation jsonb,
  session_id text,
  visitor_id text,
  ip_address text,
  created_at timestamptz not null default now()
);
create unique index chat_leads_email_handle_dedup on public.chat_leads (lower(email), lower(coalesce(handle,'')));
create index chat_leads_email_idx on public.chat_leads (lower(email));
create index chat_leads_created_at_idx on public.chat_leads (created_at desc);
alter table public.chat_leads enable row level security;
create policy "anon_insert_only" on public.chat_leads for insert to anon with check (true);
