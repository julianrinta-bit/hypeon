module.exports = {
  apps: [
    {
      name: 'hypeon-website',
      cwd: '/opt/hypeon-website',
      script: 'node_modules/.bin/next',
      args: 'start -p 3100',
      interpreter: '/root/.nvm/versions/node/v24.0.0/bin/node', // adjust path after nvm install; run `nvm which 24` to confirm
      env: {
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1',
      },
      max_memory_restart: '512M',
      exp_backoff_restart_delay: 100,
    },
  ],
};
