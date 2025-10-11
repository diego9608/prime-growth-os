// Validate environment variables at build time
// TODO: Uncomment after configuring env vars in Netlify
// import './lib/env-validator.js'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // SSR configuration - NO output: 'export'
  // Enable image optimization
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
}

export default nextConfig