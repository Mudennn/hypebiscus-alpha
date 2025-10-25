import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'arweave.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.degencdn.com/ipfs',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.jup.ag',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
