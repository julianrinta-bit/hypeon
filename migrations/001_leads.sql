CREATE TABLE IF NOT EXISTS leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  service_interest text NOT NULL CHECK (service_interest IN ('youtube', 'creative', 'products', 'unsure')),
  channel_url text,
  name text NOT NULL,
  email text NOT NULL,
  message text,
  created_at timestamptz DEFAULT now(),
  honeypot text,
  ip_address inet
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- No SELECT policy = no reads via anon key
-- Inserts happen server-side with service role key
COMMENT ON TABLE leads IS 'Hype On Media — contact form submissions from hypeon.media';
