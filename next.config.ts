import type { NextConfig } from 'next'

// Velite build integration (Turbopack-compatible)
// Must use top-level import pattern — webpack plugin does NOT work with --turbo
// clean: false avoids race condition where Turbopack resolves modules
// before velite finishes re-writing files after cleaning
const isDev = process.argv.indexOf('dev') !== -1
const isBuild = process.argv.indexOf('build') !== -1
if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
  process.env.VELITE_STARTED = '1'
  import('velite').then(m => m.build({ watch: isDev, clean: false }))
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },
}

export default nextConfig
