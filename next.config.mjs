/** @type {import('next').NextConfig} */
const nextConfig = {
  // 모바일 가이드북 페이지 SSR 최적화
  experimental: {
    ppr: true, // Partial Prerendering (Next.js 14+)
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

export default nextConfig;
