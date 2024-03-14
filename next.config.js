/** @type {import('next').NextConfig} */
const nextConfig = {

    typescript: {
        ignoreBuildErrors: true,
      },
      eslint: {
        ignoreDuringBuilds: true,
      },

      images: {
        remotePatterns: [
          {
            protocol: "https",
            hostname: "images.unsplash.com",
            pathname: "**",
          },
        ],
      },
    };
    
module.exports = nextConfig;
