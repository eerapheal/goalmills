/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@goalmills/ui', '@goalmills/types'],
  images: {
    domains: ['media.api-sports.io', 'flagcdn.com', 'images.unsplash.com', "randomuser.me", 'picsum.photos'],
  },

};

module.exports = nextConfig;
