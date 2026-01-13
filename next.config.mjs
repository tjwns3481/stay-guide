/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  experimental: {
    outputFileTracingExcludes: {
      '*': [],
    },
  },
  outputFileTracing: false,
};

export default nextConfig;
