/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@goalmills/ui', '@goalmills/types'],
  images: {
    domains: ['media.api-sports.io', 'i.imgur.com', 'apiv3.apifootball.com', 'ui-avatars.com', 'crests.football-data.org', 'flagcdn.com', 'images.unsplash.com', "randomuser.me", 'picsum.photos'],
  },

};

module.exports = nextConfig;
