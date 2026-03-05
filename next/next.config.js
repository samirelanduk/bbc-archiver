/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/snapshots/:path*",
        destination: "http://nginx:80/snapshots/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
