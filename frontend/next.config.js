/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:5000/api/:path*',
      },
    ];
  },
};

// Start the Express backend in the same Node process if not in build phase and not already started
const isBuildPhase = process.env.npm_lifecycle_event === 'build' || process.env.NEXT_PHASE === 'phase-production-build';
if (typeof window === 'undefined' && !isBuildPhase && !global.__backend_server_started) {
  global.__backend_server_started = true;
  try {
    const path = require('path');
    const backendPath = path.resolve(__dirname, '../backend/index.js');
    const { startServer } = require(backendPath);
    startServer(5000);
  } catch (err) {
    console.warn('[AI Studio] Backend startup in next.config.js:', err.message);
  }
}

module.exports = nextConfig;
