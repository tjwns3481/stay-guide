/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: false,
  },
  images: {
    remotePatterns: [
      // Supabase Storage
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      // Clerk 프로필 이미지
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      // 일반적인 이미지 호스팅 (사용자 직접 입력 URL 대응)
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.imgix.net',
      },
    ],
  },
}

// Bundle analyzer 조건부 활성화
let exportedConfig = nextConfig

if (process.env.ANALYZE === 'true') {
  try {
    const withBundleAnalyzer = require('@next/bundle-analyzer')({
      enabled: true,
    })
    exportedConfig = withBundleAnalyzer(nextConfig)
  } catch (e) {
    console.warn('@next/bundle-analyzer not installed, skipping bundle analysis')
  }
}

module.exports = exportedConfig
