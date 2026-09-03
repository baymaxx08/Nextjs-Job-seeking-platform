/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl.replace(/\/$/, '')}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${apiUrl.replace(/\/$/, '')}/uploads/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;