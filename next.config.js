/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.timeweb.cloud',
        pathname: '/delas-media/**',
      },
    ],
  },
}

module.exports = nextConfig

