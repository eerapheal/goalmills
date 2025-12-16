/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@goalmills/ui', '@goalmills/types'],
  images: {
    domains: ['media.api-sports.io', 'apiv3.apifootball.com', 'crests.football-data.org', 'flagcdn.com', 'images.unsplash.com', "randomuser.me", 'picsum.photos'],
  },

};

module.exports = nextConfig;
