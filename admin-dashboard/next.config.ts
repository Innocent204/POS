import type { NextConfig } from "next";

const API_URL = process.env.API_URL || 'http://165.227.119.71/api/v1';

const nextConfig: NextConfig = {
  experimental: {
    turbo: undefined,
  },
  images: {
    localPatterns: [
      {
        pathname: '/**',
        search: '',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
