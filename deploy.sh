#!/bin/bash
# deploy.sh — Run on the DigitalOcean server (alpha)
# Usage: ssh alpha "cd /opt/hypeon-website && bash deploy.sh"
set -e

echo "=== Hype On Media — Deploy ==="

cd /opt/hypeon-website
git pull origin main
npm ci
npm run build

pm2 reload hypeon-website --update-env

echo "=== Testing local response ==="
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3100)
if [ "$STATUS" = "200" ]; then
  echo "OK — localhost:3100 returns 200"
else
  echo "FAIL — localhost:3100 returns $STATUS"
  exit 1
fi

echo "=== Verifying Orbit is unaffected ==="
ORBIT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$ORBIT_STATUS" = "200" ] || [ "$ORBIT_STATUS" = "302" ]; then
  echo "OK — Orbit at localhost:3000 returns $ORBIT_STATUS"
else
  echo "WARNING — Orbit at localhost:3000 returns $ORBIT_STATUS"
fi

echo "=== Deploy complete ==="
