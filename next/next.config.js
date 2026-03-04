/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/snapshots/:path*",
        destination: "/api/images/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
