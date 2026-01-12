/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@goalmills/ui', '@goalmills/types'],
  images: {
    domains: ['media.api-sports.io', "img.youtube.com", 'res.cloudinary.com', 'africaeyenews.ng', "apiv2.allsportsapi.com", 'i.imgur.com', 'apiv3.apifootball.com', 'ui-avatars.com', 'crests.football-data.org', 'flagcdn.com', 'images.unsplash.com', "randomuser.me", 'picsum.photos'],
  },

  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  }
};

module.exports = nextConfig;
