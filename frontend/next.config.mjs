/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Prefer a server-only proxy target so the browser can call same-origin /api/v1
    // (avoids CORS). Fall back to NEXT_PUBLIC_API_URL, then local backend.
    const apiTarget =
      process.env.API_PROXY_TARGET ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:4000/api/v1';

    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
