/** @type {import('next').NextConfig} */
if (!process.env.NEXT_PRIVATE_WORKER_CONCURRENCY) {
  process.env.NEXT_PRIVATE_WORKER_CONCURRENCY = '2';
}

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@goalmills/ui', '@goalmills/types'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'randomuser.me' },
      { protocol: 'https', hostname: 'i.imgur.com' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/signin',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/admin/:path*',
        destination: '/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
