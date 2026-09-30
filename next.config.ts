import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/submissao/:path*',
        destination: '/bymoto/submissao/:path*',
        permanent: false,
      },
      {
        source: '/banco/:path*',
        destination: '/bymoto/banco/:path*',
        permanent: false,
      },
      {
        source: '/metas/:path*',
        destination: '/bymoto/metas/:path*',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
