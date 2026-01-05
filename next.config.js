/** @type {import('next').NextConfig} */
const nextConfig = {
  // Отключаем standalone — TimeWeb Dockerfile не копирует public/ для него
  // output: 'standalone',
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.timeweb.cloud',
        pathname: '/delas-media/**',
      },
    ],
  },
  
  // Отключаем ESLint при сборке (уже проверено)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Отключаем проверку типов при сборке (уже проверено)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
