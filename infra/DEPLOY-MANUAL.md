# Manual Deployment Steps

These steps must be run manually on the DigitalOcean server (alpha / 167.172.246.198).

## Task 1.1.9 — Run leads migration

Run the contents of `migrations/001_leads.sql` in the Supabase SQL Editor.
Verify: `SELECT count(*) FROM leads;` should return 0.

## Task 1.1.10 — Initial server setup

1. Verify Node.js version: `ssh alpha "node -v"` (must be v24.x)
   - If not: `ssh alpha "nvm install 24 && nvm alias default 24"`

2. Push code: `git push origin main`

3. Clone on server:
   ```bash
   ssh alpha "cd /opt && git clone git@github.com:julianrinta-bit/hypeon-website.git hypeon-website"
   ```

4. Create `.env.local` on server (replace placeholders with real Supabase values):
   ```bash
   ssh alpha "cat > /opt/hypeon-website/.env.local << 'EOF'
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   EOF"
   ssh alpha "chmod 600 /opt/hypeon-website/.env.local"
   ```

5. Verify swap (if RAM < 2GB):
   ```bash
   ssh alpha "free -h"
   # If no swap:
   ssh alpha "sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile"
   ssh alpha "echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab"
   ```

6. Build and start:
   ```bash
   ssh alpha "cd /opt/hypeon-website && npm ci && npm run build && pm2 start ecosystem.config.js && pm2 save"
   ```

7. Verify:
   ```bash
   ssh alpha "curl -s -o /dev/null -w '%{http_code}' http://localhost:3100"   # Must return 200
   ssh alpha "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000"   # Orbit: 200 or 302
   ```

## Task 1.1.11 — nginx reverse proxy

1. Copy the nginx config:
   ```bash
   ssh alpha "sudo tee /etc/nginx/sites-available/hypeon.media" < infra/nginx-hypeon.media.conf
   ssh alpha "sudo ln -sf /etc/nginx/sites-available/hypeon.media /etc/nginx/sites-enabled/"
   ssh alpha "sudo nginx -t && sudo nginx -s reload"
   ```

2. Verify Orbit still works: `ssh alpha "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000"`

## Task 1.1.12 — DNS + SSL

1. In Namecheap DNS, set:
   - A record: `@` -> `167.172.246.198` (TTL: 300)
   - A record: `www` -> `167.172.246.198` (TTL: 300)

2. Wait for propagation: `dig hypeon.media +short` (should return 167.172.246.198)

3. Run certbot:
   ```bash
   ssh alpha "sudo certbot --nginx -d hypeon.media -d www.hypeon.media"
   ```

4. Verify SSL renewal: `ssh alpha "sudo certbot renew --dry-run"`

5. Final check: `curl -I https://hypeon.media` (should return HTTP/2 200)
